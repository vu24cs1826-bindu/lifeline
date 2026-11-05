import { CATEGORIES } from "../models/EmergencyIncident.js";

const RESPONDER_TYPES = ["medical_responder", "volunteer", "organization", "any"];

// Words that make a report "possibly urgent". Used for human review only.
const URGENT_WORDS = [
  "unconscious", "not breathing", "bleeding", "heavy bleeding", "trapped", "collapsed", "chest pain",
  "seizure", "fire", "burning", "drowning", "attack", "weapon", "kidnap", "stroke", "overdose", "critical",
];

const KEYWORDS = {
  road_accident: ["accident", "crash", "collision", "hit by", "vehicle", "bike", "car ", "truck", "bus"],
  medical: ["injured", "pain", "unconscious", "breathing", "bleeding", "heart", "seizure", "stroke", "fever", "faint", "medical", "ambulance"],
  fire: ["fire", "smoke", "burning", "flames", "gas leak", "explosion"],
  personal_safety: ["followed", "harass", "threat", "attack", "unsafe", "assault", "kidnap", "stalk"],
  blood_requirement: ["blood", "donor", "transfusion", "platelet"],
  stranded: ["stranded", "stuck", "flood", "lost", "breakdown", "broke down", "no way home"],
  community_safety: ["streetlight", "pothole", "hazard", "dangerous road"],
};

export function fallbackClassify(description, userCategory = "other") {
  const text = ` ${description.toLowerCase()} `;
  let best = null;
  let bestHits = 0;
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    const hits = words.filter((w) => text.includes(w)).length;
    if (hits > bestHits) { best = cat; bestHits = hits; }
  }
  const suggestedCategory = best || userCategory || "other";
  const urgent = URGENT_WORDS.some((w) => text.includes(w));
  const missing = [];
  if (description.trim().split(/\s+/).length < 6) missing.push("More detail about what happened");
  if (!/\b(near|at|opposite|road|street|junction|college|hospital|nagar|colony)\b/.test(text)) missing.push("A landmark or exact place");
  if (/(injur|hurt|bleed|unconscious|pain)/.test(text) && !/\b(one|two|three|\d+)\b/.test(text)) missing.push("How many people are hurt");

  return {
    suggestedCategory,
    summary: description.trim().slice(0, 140),
    missingDetails: missing,
    suggestedResponder: suggestedCategory === "medical" || suggestedCategory === "road_accident" ? "medical_responder" : "volunteer",
    urgent,
    needsHumanReview: urgent,
    source: "fallback",
  };
}

// Checks the AI answer. Anything unexpected is dropped, never trusted.
export function validateAI(raw, userCategory) {
  if (!raw || typeof raw !== "object") return null;
  const cat = CATEGORIES.includes(raw.category) ? raw.category : null;
  if (!cat) return null;
  const strs = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === "string").map((x) => x.slice(0, 120)).slice(0, 6) : []);
  const urgent = raw.urgent === true;
  return {
    suggestedCategory: cat,
    summary: typeof raw.summary === "string" ? raw.summary.slice(0, 200) : "",
    missingDetails: strs(raw.missing_details),
    suggestedResponder: RESPONDER_TYPES.includes(raw.responder_type) ? raw.responder_type : "any",
    urgent,
    needsHumanReview: urgent || cat !== userCategory,
    source: "ai",
  };
}

const SYSTEM = `You help triage emergency reports for a community response app. Reply with ONLY a JSON object, no other text:
{"category": one of ${JSON.stringify(CATEGORIES)}, "summary": "one short sentence", "missing_details": ["short strings"], "responder_type": one of ${JSON.stringify(RESPONDER_TYPES)}, "urgent": true or false}
Rules: never give a medical diagnosis. Never say the report is false or unimportant. Mark urgent=true if life may be at risk.`;

export async function aiClassify(description, userCategory) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null; // caller uses the fallback

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-sonnet-5-5",
        max_tokens: 400,
        system: SYSTEM,
        messages: [{ role: "user", content: `Emergency report (user chose category "${userCategory}"):\n${description}` }],
      }),
    });
    if (!res.ok) throw new Error(`AI API status ${res.status}`);
    const data = await res.json();
    const text = (data.content || []).map((b) => b.text || "").join("").replace(/```json|```/g, "").trim();
    return validateAI(JSON.parse(text), userCategory);
  } catch (e) {
    console.error("AI classification failed, using fallback:", e.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
