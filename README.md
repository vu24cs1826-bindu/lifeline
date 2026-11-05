# LifeLine: The Intelligence Layer for a Safer World
> **"Every Second Matters. Intelligence Should Come Before Disaster."**

LifeLine is an AI-powered real-world intelligence and crisis prevention operating system. It transforms fragmented emergency response into proactive situational awareness, multi-source event clustering, explainable predictive risk modeling, living geospatial digital twin mapping, and crisis simulation.

---

## 📂 Included in this Repository

- **Full Project Source Code**:
  - `server/`: Node.js, Express, MongoDB Mongoose, Socket.IO, clustering & risk engines.
  - `client/`: React 19, Vite, Tailwind CSS v4, Leaflet GIS, Lucide React, and 17 dedicated product modules.
- **PowerPoint Presentation (8–10 Slides)**:
  - `LifeLine_Presentation.pptx`: Ready-to-present widescreen deck designed in dark emergency command center theme.
  - `generate_ppt.py`: Python script used to programmatically generate or customize the slides.
- **Cloud Deployment Configuration**:
  - `render.yaml`: 1-Click Render Blueprint configuration.
  - `DEPLOYMENT_RENDER.md`: Step-by-step guide for deploying full-stack to Render and MongoDB Atlas for free.

---

## 🌟 The 3 Core Startup Differentiators

1. **Multi-Report Situation Clustering Engine (DBSCAN + Spatio-Temporal Decay)**:
   - Fuses disconnected citizen SOS calls, verified road hazards, and sensor telemetry into evolving **Macro-Situation Clusters**.
   - Groups 5 separate citizen reports into 1 unified flood or collision event with an explainable confidence score. Never treats unverified reports as confirmed facts.

2. **Living Digital Twin & Explainable Predictive Risk Engine**:
   - Interactive GIS map modeling live incidents, verified civic hazards, hospital ICU bed telemetry, and dynamic risk sectors.
   - Evaluates a **Multi-Factor Dynamic Risk Model** (combining weather vulnerability, historical crash density, peak traffic friction, and infrastructure deficits) against a **Poisson Historical Baseline** with factor explainability.

3. **Crisis Simulation Laboratory ("Flight Simulator for Disaster Response")**:
   - Stress-tests city resilience against Category-3 Urban Deluges, Multi-Vehicle Highway Pileups, and Hospital ICU Saturation.
   - Projects step-by-step casualty arrival curves, ICU exhaustion milestones ($T_{\text{exhaustion}}$), and generates automated contingency diversion packages.

---

## 🏛️ The Product Modules

| Workspace Module | URL Path | Key Capability |
|---|---|---|
| **Public Intelligence Hub** | `/` | Real-time city threat pulse, 5 core questions, platform mission |
| **Citizen Safety Dashboard** | `/citizen` | Verified SOS dispatch with safety toggle, silent mode, local advisories |
| **Living Digital Twin GIS** | `/map` | CartoDB dark-matter interactive GIS with multi-layer toggles & popups |
| **Situation Intelligence** | `/incidents` | Spatio-temporal cluster synthesis, evidence sources, moderator review |
| **Predictive Risk Dashboard** | `/predictive-risk` | Multi-factor risk scoring, factor attribution breakdown, Poisson baseline |
| **Crisis Simulation Lab** | `/simulation` | Disaster scenario sandbox, timeline stepper, ICU exhaustion curves |
| **Resource Coordination** | `/coordination` | Multi-resource team synthesis (BLS + ALS + ICU Hospital) & conflict prevention |
| **Organization & Hospital** | `/organization` | Live bed and ICU telemetry sliders, oxygen reserves, blood inventory |
| **Responder Mission Portal** | `/responder` | Mission dispatch acceptance, coordinate reveal, status progression |
| **Administrator Command Center** | `/admin` | Executive KPIs, global cluster synthesis trigger, credential verification |
| **Community Hazard Portal** | `/community` | Geotagged civic report submission, infrastructure issue reporting |
| **Blood & Medical Network** | `/blood` | Live cold-storage blood counters, voluntary donor discovery, emergency requests |
| **Prevention Intelligence** | `/prevention` | Evidence-backed civil engineering proposals, harm reduction metrics |
| **Audit & Verification Trail** | `/audit` | Cryptographically-logged audit events with actor IP tracking |
| **IoT Sensor Telemetry** | `/iot-sensors` | Live water depth and environmental sensor telemetry |
| **Emergency Broadcast System**| `/broadcast` | CAP-compliant multi-channel public warning broadcast center |
| **Traffic Emergency Corridors**| `/traffic` | Dynamic green-light wave calculation for ambulances |

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Local MongoDB Server running at `mongodb://127.0.0.1:27017` or Atlas cluster

### 1. Backend Setup
```bash
cd server
npm install
npm run seed:admin         # Creates admin@example.com (Password: ChangeThisStrongPassword1)
npm run seed:demo          # Seeds demo citizen, medic, and volunteer accounts
npm run seed:intelligence  # Seeds realistic hospitals, risk zones, simulation scenarios, and clusters
npm run dev                # Starts Express & Socket.IO server on http://localhost:5000
```

### 2. Frontend Setup
In a second terminal:
```bash
cd client
npm install
npm run dev                # Starts Vite development server on http://localhost:5173
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🎭 Demo Credentials
On the login screen (`/login`), click any demo button to pre-fill credentials, then click **Sign In**:

| Persona | Credentials | Purpose |
|---|---|---|
| **Admin Commander** | `admin@example.com` / `ChangeThisStrongPassword1` | Command Center, Simulation Lab, Prevention |
| **Verified Medic** | `medic@demo.lifeline` / `DemoPass123` | Responder Mission Workspace, Accepting Dispatches |
| **Civilian Citizen** | `citizen@demo.lifeline` / `DemoPass123` | Citizen Safety Portal, Triggering Confirmed SOS |
| **Volunteer** | `volunteer@demo.lifeline` / `DemoPass123` | Community Support, Peripheral Triage, Blood Network |

---

## ☁️ Deploy to Render in 5 Minutes

See [`DEPLOYMENT_RENDER.md`](./DEPLOYMENT_RENDER.md) for full instructions.

1. Push this repository to GitHub.
2. In Render, select **New +** -> **Blueprint** and select this repo.
3. Supply your free MongoDB Atlas connection string.
4. Render builds and launches your full-stack app automatically!

---

## 📊 Presentation Deck

An 8–10 slide PowerPoint presentation is located in the root directory:
- **File**: `LifeLine_Presentation.pptx`
- To re-generate or modify:
  ```bash
  pip install python-pptx
  python generate_ppt.py
  ```
