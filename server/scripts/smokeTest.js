// End-to-end API check. Needs the server running and the admin seeded.
// Run:  npm run smoke
import "dotenv/config";

const BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`;
const stamp = Date.now();
let pass = 0, fail = 0;

async function call(method, path, token, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "content-type": "application/json", ...(token && { authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`PASS  ${name}`); } else { fail++; console.log(`FAIL  ${name} ${extra}`); }
}

const LAT = 16.3067, LNG = 80.4365;
const pw = "Password123";

let r = await call("GET", "/health");
check("health", r.status === 200);

r = await call("POST", "/auth/register", null, { name: "Smoke Citizen", email: `c${stamp}@t.com`, password: pw });
check("register citizen", r.status === 201 && r.data.user?.role === "citizen", JSON.stringify(r.data));
const citizen = r.data.token;

r = await call("POST", "/auth/register", null, { name: "Hacker", email: `h${stamp}@t.com`, password: pw, role: "admin" });
check("cannot self-register as admin", r.status === 400);

r = await call("POST", "/auth/login", null, { email: `c${stamp}@t.com`, password: "wrongpass1" });
check("wrong password rejected", r.status === 401);

r = await call("GET", "/admin/users", citizen);
check("citizen blocked from admin API", r.status === 403);

r = await call("POST", "/auth/register", null, { name: "Smoke Medic", email: `m${stamp}@t.com`, password: pw, role: "medical_responder", skills: ["first_aid", "cpr"] });
check("register medical responder (pending)", r.status === 201 && r.data.user?.verificationStatus === "pending");
const medic = r.data.token; const medicId = r.data.user?.id;

r = await call("PATCH", "/responders/me/availability", medic, { available: true });
check("unverified responder cannot go available", r.status === 403);

r = await call("POST", "/auth/login", null, { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
check("admin login", r.status === 200, "Did you run npm run seed:admin?");
const admin = r.data.token;

r = await call("PATCH", `/admin/users/${medicId}/verification`, admin, { status: "verified" });
check("admin verifies responder", r.status === 200);

r = await call("PATCH", "/responders/me/location", medic, { lat: LAT + 0.005, lng: LNG + 0.005 });
check("responder shares location", r.status === 200);
r = await call("PATCH", "/responders/me/availability", medic, { available: true });
check("verified responder goes available", r.status === 200);

r = await call("POST", "/incidents", citizen, { category: "medical", description: "Man collapsed near the bus stop, not breathing properly", lat: LAT, lng: LNG });
check("SOS without confirmation is refused", r.status === 400);

r = await call("POST", "/incidents", citizen, { category: "medical", description: "Man collapsed near the bus stop, not breathing properly", lat: LAT, lng: LNG, confirmed: true, shareLocation: false });
check("citizen creates incident", r.status === 201 && /^LL-/.test(r.data.incident?.incidentId || ""), JSON.stringify(r.data));
check("incident notice says official services NOT contacted", /NOT been contacted/.test(r.data.notice || ""));
check("medical responder was notified", r.data.notifiedCount >= 1, `notified=${r.data.notifiedCount}`);
const incId = r.data.incident?.id;

r = await call("GET", "/incidents/available", medic);
const seen = r.data.incidents?.find((i) => i.id === incId);
check("responder sees incident", !!seen);
check("responder sees only approximate location", seen?.locationApproximate === true && !seen?.reporter);

r = await call("POST", `/incidents/${incId}/accept`, medic);
check("responder accepts", r.status === 200 && r.data.incident?.status === "RESPONDER_ASSIGNED", JSON.stringify(r.data));
check("assigned responder sees exact location", r.data.incident?.locationApproximate === false);

r = await call("POST", `/incidents/${incId}/accept`, medic);
check("second accept is refused", r.status === 403 || r.status === 409);

r = await call("PATCH", `/incidents/${incId}/status`, citizen, { status: "RESOLVED" });
check("citizen cannot mark RESOLVED", r.status === 403);
r = await call("PATCH", `/incidents/${incId}/status`, medic, { status: "RESOLVED" });
check("cannot skip IN_PROGRESS", r.status === 409);
r = await call("PATCH", `/incidents/${incId}/status`, medic, { status: "IN_PROGRESS" });
check("responder sets IN_PROGRESS", r.status === 200);
r = await call("PATCH", `/incidents/${incId}/status`, medic, { status: "RESOLVED", note: "Patient handed to ambulance" });
check("responder resolves", r.status === 200 && r.data.incident?.status === "RESOLVED");
r = await call("PATCH", `/incidents/${incId}/status`, citizen, { status: "CLOSED" });
check("citizen closes", r.status === 200 && r.data.incident?.status === "CLOSED");

r = await call("GET", `/incidents/${incId}`, citizen);
const types = (r.data.incident?.timeline || []).map((t) => t.type);
check("timeline recorded", types.includes("REPORT_CREATED") && types.includes("RESPONDER_ASSIGNED") && types.includes("STATUS_CLOSED"), types.join(","));

r = await call("POST", "/ai/classify", citizen, { description: "Accident near the college bus stop, one person appears injured" });
check("AI/fallback classification returns a labelled suggestion", r.status === 200 && !!r.data.label);

r = await call("GET", "/admin/stats", admin);
check("admin stats", r.status === 200 && r.data.stats?.incidents >= 1);
r = await call("GET", "/admin/analytics", admin);
check("admin analytics", r.status === 200);
r = await call("GET", "/admin/audit-logs", admin);
check("audit logs recorded", r.status === 200 && r.data.logs?.length > 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
