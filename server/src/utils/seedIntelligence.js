import "dotenv/config";
import mongoose from "mongoose";
import Facility from "../models/Facility.js";
import RiskZone from "../models/RiskZone.js";
import SimulationScenario from "../models/SimulationScenario.js";
import PreventionProposal from "../models/PreventionProposal.js";
import SituationCluster from "../models/SituationCluster.js";
import EmergencyIncident from "../models/EmergencyIncident.js";
import CommunityReport from "../models/CommunityReport.js";
import BloodDonor from "../models/BloodDonor.js";
import User from "../models/User.js";
import ResponderProfile from "../models/ResponderProfile.js";
import { point } from "./geo.js";
import generateIncidentId from "./incidentId.js";

const lat = Number(process.env.DEMO_LAT || 16.3067);
const lng = Number(process.env.DEMO_LNG || 80.4365);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for Intelligence seeding...");

  const admin = await User.findOne({ role: "admin" });
  const citizen = await User.findOne({ email: "citizen@demo.lifeline" });
  const medic = await User.findOne({ email: "medic@demo.lifeline" });
  const volunteer = await User.findOne({ email: "volunteer@demo.lifeline" });

  // 1. Facilities
  console.log("Seeding Facilities & Hospital Beds...");
  await Facility.deleteMany({});
  const facilitiesData = [
    {
      facilityCode: "FAC-GGH-01",
      name: "Government General Hospital & Trauma Center",
      type: "hospital",
      location: point(lat + 0.008, lng + 0.005),
      address: "Collectorate Road, Guntur Central",
      phone: "+91 863 222 4500",
      operatingStatus: "operational",
      totalBeds: 450,
      availableBeds: 78,
      icuBedsTotal: 60,
      icuBedsAvailable: 14,
      oxygenCylindersAvailable: 120,
      ambulancesReady: 6,
      bloodInventory: { "A+": 25, "A-": 8, "B+": 32, "B-": 5, "AB+": 12, "AB-": 3, "O+": 40, "O-": 7 },
      specialties: ["trauma_resuscitation", "cardiology", "burn_unit", "neurosurgery"],
      traumaLevel: 1,
    },
    {
      facilityCode: "FAC-RMSH-02",
      name: "Ramesh Emergency & Super Specialty Center",
      type: "trauma_center",
      location: point(lat - 0.012, lng - 0.008),
      address: "Ring Road Junction, Guntur",
      phone: "+91 863 237 8888",
      operatingStatus: "high_capacity",
      totalBeds: 220,
      availableBeds: 24,
      icuBedsTotal: 40,
      icuBedsAvailable: 6,
      oxygenCylindersAvailable: 65,
      ambulancesReady: 4,
      bloodInventory: { "A+": 18, "A-": 4, "B+": 20, "B-": 2, "AB+": 8, "AB-": 1, "O+": 28, "O-": 4 },
      specialties: ["cardiac_icu", "interventional_radiology", "vascular_surgery"],
      traumaLevel: 2,
    },
    {
      facilityCode: "FAC-RCBB-03",
      name: "Red Cross Central Blood Bank & Storage",
      type: "blood_bank",
      location: point(lat + 0.015, lng - 0.004),
      address: "Old Club Road, Kothapet",
      phone: "+91 863 223 1200",
      operatingStatus: "operational",
      totalBeds: 0,
      availableBeds: 0,
      icuBedsTotal: 0,
      icuBedsAvailable: 0,
      oxygenCylindersAvailable: 0,
      ambulancesReady: 2,
      bloodInventory: { "A+": 45, "A-": 16, "B+": 60, "B-": 12, "AB+": 24, "AB-": 8, "O+": 75, "O-": 18 },
      specialties: ["component_separation", "platelet_apheresis", "cryoprecipitate"],
      traumaLevel: 4,
    },
    {
      facilityCode: "FAC-FIRE-04",
      name: "District Fire & Rapid Rescue Command Post",
      type: "fire_station",
      location: point(lat - 0.005, lng + 0.015),
      address: "Pattabhipuram Main Road",
      phone: "+91 863 101 0000",
      operatingStatus: "operational",
      totalBeds: 0,
      availableBeds: 0,
      icuBedsTotal: 0,
      icuBedsAvailable: 0,
      oxygenCylindersAvailable: 40,
      ambulancesReady: 3,
      bloodInventory: { "A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0, "O+": 0, "O-": 0 },
      specialties: ["hazmat_extraction", "hydraulic_cutting", "flood_rescue_boats"],
      traumaLevel: 3,
    },
    {
      facilityCode: "FAC-SHELTER-05",
      name: "Municipal Flood & Disaster Evacuation Shelter",
      type: "emergency_shelter",
      location: point(lat + 0.022, lng + 0.018),
      address: "B.R. Stadium Complex, Amaravati Road",
      phone: "+91 863 234 9900",
      operatingStatus: "operational",
      totalBeds: 600,
      availableBeds: 520,
      icuBedsTotal: 0,
      icuBedsAvailable: 0,
      oxygenCylindersAvailable: 25,
      ambulancesReady: 2,
      bloodInventory: { "A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0, "O+": 0, "O-": 0 },
      specialties: ["mass_accommodation", "field_kitchen", "emergency_power_backup"],
      traumaLevel: 4,
    },
  ];
  await Facility.insertMany(facilitiesData);

  // 2. Risk Zones
  console.log("Seeding Predictive Risk Zones...");
  await RiskZone.deleteMany({});
  const riskZonesData = [
    {
      zoneCode: "ZN-EXP-01",
      name: "Amaravati Expressway Flyover Junction",
      sector: "North Highway Corridor",
      center: point(lat + 0.018, lng + 0.01),
      radiusMeters: 1400,
      baselineRisk: 42,
      predictedRisk: 78,
      riskLevel: "severe",
      factors: {
        historicalIncidentDensity: 82,
        weatherVulnerability: 85,
        trafficCongestion: 75,
        infrastructureDeficit: 68,
        responseRemoteness: 40,
      },
      explainability: {
        primaryDriver: "Weather & Flood Susceptibility (Impact: 33% of total risk)",
        confidenceScore: 0.91,
        insights: [
          "Low elevation underpass creates 4.5x water pooling during precipitation > 30mm/hr.",
          "High-speed merge with poor high-mast illumination increases multi-vehicle collision probability.",
          "Current dynamic risk exceeds historical baseline by +36 points due to impending storm alerts.",
        ],
      },
      recommendedMitigations: [
        "Deploy automated gantry flood warning signage",
        "Pre-stage recovery crane and BLS ambulance unit at North Toll",
        "Clear lateral canal silt traps prior to peak monsoon hours",
      ],
      historicalIncidentCount: 26,
    },
    {
      zoneCode: "ZN-MKT-02",
      name: "Kothapet Commercial Bazaar & Transit Hub",
      sector: "Central Urban Core",
      center: point(lat - 0.006, lng - 0.007),
      radiusMeters: 1100,
      baselineRisk: 38,
      predictedRisk: 62,
      riskLevel: "elevated",
      factors: {
        historicalIncidentDensity: 65,
        weatherVulnerability: 42,
        trafficCongestion: 88,
        infrastructureDeficit: 55,
        responseRemoteness: 32,
      },
      explainability: {
        primaryDriver: "Peak Traffic Influx & Road Impedance (Impact: 28% of total risk)",
        confidenceScore: 0.86,
        insights: [
          "Narrow arterial alleys impede standard fire tender access times beyond 18 minutes.",
          "High pedestrian density overlapping with heavy freight vehicles during evening market hours.",
        ],
      },
      recommendedMitigations: [
        "Enforce strict peak-hour freight corridor restrictions",
        "Station two motorcycle first-responder paramedics in market square",
      ],
      historicalIncidentCount: 19,
    },
    {
      zoneCode: "ZN-IND-03",
      name: "Autonagar Industrial Logistics Zone",
      sector: "South-East Logistics Belt",
      center: point(lat - 0.02, lng + 0.025),
      radiusMeters: 1800,
      baselineRisk: 28,
      predictedRisk: 51,
      riskLevel: "moderate",
      factors: {
        historicalIncidentDensity: 45,
        weatherVulnerability: 30,
        trafficCongestion: 52,
        infrastructureDeficit: 62,
        responseRemoteness: 58,
      },
      explainability: {
        primaryDriver: "First Responder Transit Remoteness (Impact: 26% of total risk)",
        confidenceScore: 0.84,
        insights: [
          "Distance from tertiary trauma centers exceeds 11 km.",
          "Hazardous chemical and fuel transport transit frequency elevated on weekends.",
        ],
      },
      recommendedMitigations: [
        "Install automated industrial fire hydrant monitoring sensors",
        "Establish mutual-aid MoU with local refinery emergency brigade",
      ],
      historicalIncidentCount: 12,
    },
  ];
  await RiskZone.insertMany(riskZonesData);

  // 3. Crisis Simulation Scenarios
  console.log("Seeding Crisis Simulation Scenarios...");
  await SimulationScenario.deleteMany({});
  const scenariosData = [
    {
      scenarioId: "SIM-DELUGE-01",
      name: "Category-3 Extreme Urban Deluge & Drainage Breach",
      category: "urban_flooding",
      description: "Models a 95mm/hr torrential cloudburst over the central drainage basin, submerging key arterial causeways and testing emergency hospital triage diversion.",
      center: point(lat + 0.005, lng + 0.008),
      initialConditions: {
        precipitationMmPerHour: 95,
        ambientWindKmh: 48,
        trafficLoadFactor: 1.6,
        vulnerablePopulationCount: 18500,
      },
      assumptions: [
        "Saturated urban soil limit reached at T+45min; zero further percolation",
        "Low-level causeways rendered impassable when water depth exceeds 45cm",
        "Ambulance response times degrade linearly by 18% per kilometer of submerged route",
        "Hospital triage processing speed capped at 12 minutes per acute casualty",
      ],
      simulationSteps: [
        {
          tHours: 0,
          spreadRadiusKm: 1.2,
          projectedCasualties: 8,
          projectedDisplacedPeople: 120,
          hospitalBedUtilizationPercent: 44,
          icuSaturationPercent: 38,
          bloodDeficitUnits: 0,
          bottlenecks: ["Minor drainage backup at Collectorate low-bridge"],
          recommendedDispatches: [
            { resourceType: "Rapid Intervention Team", quantity: 3, targetZone: "Canal Sluice Gate", objective: "Open gravity relief valves" },
          ],
          evacuationRoutesStatus: [
            { route: "NH-16 Bypass Corridor", status: "open" },
            { route: "Collectorate Low-bridge", status: "congested" },
          ],
        },
        {
          tHours: 1,
          spreadRadiusKm: 2.8,
          projectedCasualties: 24,
          projectedDisplacedPeople: 750,
          hospitalBedUtilizationPercent: 68,
          icuSaturationPercent: 62,
          bloodDeficitUnits: 5,
          bottlenecks: ["Collectorate Low-bridge water level reaches 60cm - impassable for standard ambulances"],
          recommendedDispatches: [
            { resourceType: "High-Clearance 4x4 Ambulance", quantity: 4, targetZone: "North Ward", objective: "Divert all emergency calls via Elevated Flyover" },
          ],
          evacuationRoutesStatus: [
            { route: "NH-16 Bypass Corridor", status: "open" },
            { route: "Collectorate Low-bridge", status: "submerged" },
          ],
        },
        {
          tHours: 2,
          spreadRadiusKm: 4.2,
          projectedCasualties: 56,
          projectedDisplacedPeople: 2100,
          hospitalBedUtilizationPercent: 86,
          icuSaturationPercent: 82,
          bloodDeficitUnits: 14,
          bottlenecks: ["Government General Hospital Trauma Center approaching 85% capacity", "Critical O-negative supply dropping below 5 units"],
          recommendedDispatches: [
            { resourceType: "Mobile Blood Bank Dispatch", quantity: 2, targetZone: "Red Cross Depot", objective: "Mobilize pre-registered O-negative community donors" },
            { resourceType: "Inflatable Rescue Boats", quantity: 6, targetZone: "Kothapet Submerged Ward", objective: "Evacuate elderly care home" },
          ],
          evacuationRoutesStatus: [
            { route: "NH-16 Bypass Corridor", status: "congested" },
            { route: "Collectorate Low-bridge", status: "blocked" },
          ],
        },
        {
          tHours: 4,
          spreadRadiusKm: 6.1,
          projectedCasualties: 92,
          projectedDisplacedPeople: 4800,
          hospitalBedUtilizationPercent: 97,
          icuSaturationPercent: 96,
          bloodDeficitUnits: 32,
          bottlenecks: ["CRITICAL: District General Hospital ICU at 100% saturation", "Generator diesel supply critical at primary triage hub"],
          recommendedDispatches: [
            { resourceType: "Mutual Aid Patient Diversion", quantity: 1, targetZone: "Amaravati Tertiary Care", objective: "Execute regional trauma diversion protocol" },
            { resourceType: "Disaster Evacuation Shelter Setup", quantity: 2, targetZone: "B.R. Stadium", objective: "Admit 3,000 non-critical displaced citizens" },
          ],
          evacuationRoutesStatus: [
            { route: "NH-16 Bypass Corridor", status: "open" },
            { route: "Collectorate Low-bridge", status: "blocked" },
          ],
        },
      ],
      mitigationStrategy: {
        recommendedActionPlan: [
          "Pre-position 4x4 high-clearance medical transports at Flyover North 30 minutes before heavy rain onset",
          "Issue automated geofenced citizen alerts routing transit around Collectorate bridge",
          "Activate secondary trauma care center triage protocol at T+90min to avoid ICU bottleneck",
        ],
        preventedHarmScore: 78,
        contingencyNotes: "Implementation of early diversion protocol reduces projected peak casualties by 42% and prevents ICU overflow.",
      },
    },
    {
      scenarioId: "SIM-PILEUP-02",
      name: "Multi-Vehicle Chemical Tanker & Bus Collision on NH-16",
      category: "multi_vehicle_pileup",
      description: "Simulates an 8-vehicle chain collision involving a hazardous material fuel tanker and two passenger buses during morning fog, generating acute mass-casualty burn and trauma demand.",
      center: point(lat + 0.019, lng + 0.012),
      initialConditions: {
        precipitationMmPerHour: 5,
        ambientWindKmh: 12,
        trafficLoadFactor: 1.8,
        vulnerablePopulationCount: 4200,
      },
      assumptions: [
        "500-meter chemical hazard evacuation perimeter required immediately",
        "Burn and neuro-trauma stabilization required within Golden Hour (60 mins)",
        "Both highway lanes blocked requiring contraflow emergency routing",
      ],
      simulationSteps: [
        {
          tHours: 0,
          spreadRadiusKm: 0.5,
          projectedCasualties: 38,
          projectedDisplacedPeople: 200,
          hospitalBedUtilizationPercent: 55,
          icuSaturationPercent: 68,
          bloodDeficitUnits: 15,
          bottlenecks: ["Highway transit blocked; emergency vehicles forced into median ditch"],
          recommendedDispatches: [
            { resourceType: "Heavy Hydraulic Rescue Tender", quantity: 2, targetZone: "Highway Mile 14", objective: "Pneumatic extraction of trapped bus passengers" },
            { resourceType: "Burn Trauma Resuscitation Team", quantity: 4, targetZone: "GGH Trauma Unit", objective: "Prepare triage burn beds" },
          ],
          evacuationRoutesStatus: [
            { route: "NH-16 Highway North", status: "blocked" },
            { route: "Service Road Feeder", status: "congested" },
          ],
        },
        {
          tHours: 1,
          spreadRadiusKm: 0.8,
          projectedCasualties: 44,
          projectedDisplacedPeople: 350,
          hospitalBedUtilizationPercent: 78,
          icuSaturationPercent: 92,
          bloodDeficitUnits: 28,
          bottlenecks: ["Burn unit ICU beds fully occupied across primary hospital"],
          recommendedDispatches: [
            { resourceType: "Helicopter Air Ambulance", quantity: 1, targetZone: "State Capital Medical Center", objective: "Airlift 4 critical burn casualties" },
          ],
          evacuationRoutesStatus: [
            { route: "NH-16 Highway North", status: "blocked" },
            { route: "Service Road Feeder", status: "open" },
          ],
        },
      ],
      mitigationStrategy: {
        recommendedActionPlan: [
          "Deploy hydraulic heavy-cutting crews simultaneously with triage medics",
          "Immediately mobilize regional burn center airlift at T+15min",
          "Route peripheral traffic to Bypass Service corridor within 8 minutes of dispatch",
        ],
        preventedHarmScore: 82,
        contingencyNotes: "Rapid contraflow implementation prevents secondary pileups and guarantees ambulance transit within 14 minutes.",
      },
    },
  ];
  await SimulationScenario.insertMany(scenariosData);

  // 4. Prevention Proposals
  console.log("Seeding Prevention & Infrastructure Proposals...");
  await PreventionProposal.deleteMany({});
  const preventionData = [
    {
      proposalCode: "PREV-2026-001",
      title: "Automated Storm Surge Sluice & Gantry Alert System at Amaravati Underpass",
      category: "stormwater_drainage",
      location: point(lat + 0.018, lng + 0.01),
      address: "Amaravati Expressway Low-Level Junction, Guntur",
      priorityScore: 92,
      recurringIncidentCount: 34,
      evidenceSummary: "Aggregated 34 emergency water-logging events and 8 vehicle submergence incidents over past 18 months during monsoon cycles. Correlated with 14 citizen hazard reports.",
      contributingFactors: [
        "Inadequate 600mm stormwater drainage pipe throttles discharge into Krishna irrigation canal",
        "Blind dip curve conceals water depth until vehicle enters at speed",
        "Absence of dynamic electronic warning signs",
      ],
      proposedEngineeringAction: "Upgrade lateral stormwater culvert to 1400mm reinforced concrete box drain, install ultrasonic water-level sensors with automated illuminated barrier gates.",
      estimatedCostTier: "high_10L_to_50L",
      estimatedHarmReductionPercentage: 84,
      status: "under_civic_review",
      reviewNotes: "Municipal Engineering Board reviewed preliminary hydrology telemetry; site survey scheduled.",
    },
    {
      proposalCode: "PREV-2026-002",
      title: "High-Mast Optical Illumination & Roundabout Redesign at Ring Road",
      category: "traffic_redesign",
      location: point(lat - 0.012, lng - 0.008),
      address: "Ramesh Hospital Ring Road Crossroads",
      priorityScore: 85,
      recurringIncidentCount: 28,
      evidenceSummary: "28 high-impact night collisions recorded between 21:00 and 04:00 over the last 12 months. 68% attributed to darkness and high-speed perpendicular merges.",
      contributingFactors: [
        "Streetlight outages over 400m corridor pending cable replacement",
        "Oversized triangular island obscures sightlines for drivers exiting inner ring road",
      ],
      proposedEngineeringAction: "Erect 3 high-mast LED floodlight clusters, construct compact modern roundabout with rumble approach strips, install solar cat-eye markers.",
      estimatedCostTier: "medium_1L_to_10L",
      estimatedHarmReductionPercentage: 72,
      status: "budget_approved",
      reviewNotes: "Capital allocation sanctioned under Urban Road Safety Initiative 2026.",
    },
    {
      proposalCode: "PREV-2026-003",
      title: "Underground Pressurized Fire Hydrant Network in Kothapet Commercial Bazaar",
      category: "fire_hydrant_network",
      location: point(lat - 0.006, lng - 0.007),
      address: "Kothapet Textile & Wholesale Market Core",
      priorityScore: 78,
      recurringIncidentCount: 15,
      evidenceSummary: "15 electrical short-circuit and textile smoke hazard alerts. Fire tender response delayed by average 22 minutes due to impassable market alley widths.",
      contributingFactors: [
        "Alleyways narrower than 2.8 meters prevent standard 16-ton fire truck entry",
        "Overhead tangled electrical wiring poses electrocution risk during hose operations",
      ],
      proposedEngineeringAction: "Lay a 150mm dedicated underground ring hydrant network with 18 quick-coupling hose connections every 50 meters, backed by a 100,000L subterranean sump.",
      estimatedCostTier: "capital_civic_above_50L",
      estimatedHarmReductionPercentage: 90,
      status: "proposed",
      reviewNotes: "Drafted by LifeLine Prevention Intelligence engine based on spatial access impedance modeling.",
    },
  ];
  await PreventionProposal.insertMany(preventionData);

  // 5. Initial Incidents & Reports to immediately showcase the Clustering Engine
  console.log("Seeding sample Incidents & Reports for Situation Clustering demo...");
  if (citizen && medic) {
    const incA = await EmergencyIncident.create({
      incidentId: generateIncidentId(),
      reporter: citizen._id,
      category: "road_accident",
      description: "Severe collision between auto rickshaw and delivery truck near Collectorate flyover. Two passengers injured.",
      location: point(lat + 0.0075, lng + 0.006),
      address: "Collectorate Flyover North Approach",
      priority: "high",
      status: "ACKNOWLEDGED",
      shareLocation: true,
      timeline: [{ type: "REPORT_CREATED", message: "Accident reported with injuries", by: citizen._id }],
    });

    const incB = await EmergencyIncident.create({
      incidentId: generateIncidentId(),
      reporter: citizen._id,
      category: "medical",
      description: "Pedestrian struck near flyover slip road by speeding motorcycle. Unconscious and bleeding from forehead.",
      location: point(lat + 0.0082, lng + 0.0055),
      address: "Flyover Slip Road, opposite Bus Shelter",
      priority: "critical",
      status: "ACKNOWLEDGED",
      shareLocation: true,
      timeline: [{ type: "REPORT_CREATED", message: "Critical medical trauma reported", by: citizen._id }],
    });

    const reportA = await CommunityReport.create({
      reporter: citizen._id,
      category: "accident_prone_road",
      title: "Oil spill and debris scattered across flyover junction",
      description: "Large diesel slick from earlier truck collision making road extremely slippery for two-wheelers.",
      location: point(lat + 0.0078, lng + 0.0058),
      address: "Collectorate Flyover North",
      status: "verified",
      moderator: admin?._id,
    });

    // Create a pre-synthesized SituationCluster connecting them!
    await SituationCluster.deleteMany({});
    await SituationCluster.create({
      clusterId: "CL-2026-8041",
      title: "Corridor Collision, Trauma & Diesel Hazard Chain (3 reports)",
      category: "multi_vehicle_accident",
      severity: "critical",
      confidence: 0.94,
      center: point(lat + 0.0078, lng + 0.0058),
      radiusMeters: 750,
      incidentCount: 3,
      incidents: [incA._id, incB._id],
      communityReports: [reportA._id],
      evidenceSources: [
        { sourceType: "citizen_sos", count: 2, summary: "2 acute trauma emergency reports within 120m" },
        { sourceType: "community_hazard", count: 1, summary: "1 verified fuel slick hazard on feeder surface" },
      ],
      status: "developing",
      recommendedVerificationActions: [
        "Coordinate sand spreading crew to treat 80m diesel slick",
        "Direct second ambulance unit for concurrent casualty triage",
        "Alert Traffic Police for immediate flyover approach diversion",
      ],
      predictedImpact: "Cascading multi-vehicle risk elevated. Potential traffic gridlock extending 1.2 km on North Arterial.",
      firstObservedAt: new Date(Date.now() - 25 * 60 * 1000),
      lastObservedAt: new Date(),
    });
  }

  // 6. Blood Donors
  console.log("Seeding Blood Donors...");
  await BloodDonor.deleteMany({});
  const donorsData = [
    { user: citizen?._id, bloodGroup: "O+", city: "Guntur", location: point(lat + 0.004, lng + 0.002), available: true },
    { user: volunteer?._id, bloodGroup: "O-", city: "Guntur", location: point(lat - 0.008, lng + 0.012), available: true },
    { user: medic?._id, bloodGroup: "AB+", city: "Guntur", location: point(lat + 0.012, lng - 0.006), available: true },
  ].filter((d) => d.user);
  if (donorsData.length > 0) {
    await BloodDonor.insertMany(donorsData);
  }

  console.log("LifeLine Intelligence Layer successfully seeded with real-world geospatial and simulation data!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
