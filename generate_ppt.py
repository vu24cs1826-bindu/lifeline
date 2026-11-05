import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation(output_path):
    prs = Presentation()
    # 16:9 Widescreen standard
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # blank layout

    # Color Palette - Professional Tech / Emergency Command Center
    BG_COLOR = RGBColor(11, 17, 32)       # Dark Navy #0B1120
    CARD_BG = RGBColor(23, 32, 54)        # Dark Slate Card #172036
    CARD_BORDER = RGBColor(56, 189, 248)  # Cyan #38BDF8
    TEXT_WHITE = RGBColor(255, 255, 255)  # White
    TEXT_MUTED = RGBColor(148, 163, 184)  # Slate Muted #94A3B8
    TEXT_BODY = RGBColor(226, 232, 240)   # Light Slate #E2E8F0
    ACCENT_CYAN = RGBColor(56, 189, 248)  # Cyan #38BDF8
    ACCENT_BLUE = RGBColor(99, 102, 241)  # Indigo #6366F1
    ACCENT_EMERALD = RGBColor(16, 185, 129) # Emerald #10B981
    ACCENT_AMBER = RGBColor(245, 158, 11)   # Amber #F59E0B
    ACCENT_ROSE = RGBColor(244, 63, 94)    # Rose #F43F5E

    def apply_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_header(slide, tag, title, subtitle):
        # Category Tag
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.5), Inches(0.35))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        tf_tag.margin_left = tf_tag.margin_top = tf_tag.margin_right = tf_tag.margin_bottom = 0
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = ACCENT_CYAN

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.5), Inches(0.6))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

        # Subtitle
        if subtitle:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.45), Inches(11.5), Inches(0.4))
            tf_sub = sub_box.text_frame
            tf_sub.word_wrap = True
            tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
            p_sub = tf_sub.paragraphs[0]
            p_sub.text = subtitle
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = TEXT_MUTED

    def add_card(slide, left, top, width, height, title, items, badge="", accent=ACCENT_CYAN):
        # Card container box
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = accent
        card.line.width = Pt(1.5)

        # Content inside box
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.3)
        tf.margin_bottom = Inches(0.3)

        # Title Paragraph
        p_title = tf.paragraphs[0]
        p_title.text = f"{badge}  {title}" if badge else title
        p_title.font.size = Pt(17)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE
        p_title.space_after = Pt(10)

        # Item Bullet Points
        for item in items:
            p = tf.add_paragraph()
            p.text = f"•  {item}"
            p.font.size = Pt(13)
            p.font.color.rgb = TEXT_BODY
            p.space_after = Pt(6)

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    apply_background(s1)

    # Decorative banner line
    line = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.5), Inches(1.5), Inches(0.08))
    line.fill.solid()
    line.fill.fore_color.rgb = ACCENT_CYAN
    line.line.fill.background()

    # Title Box
    title_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.5), Inches(3.0))
    tf1 = title_box.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "LIFELINE"
    p0.font.size = Pt(50)
    p0.font.bold = True
    p0.font.color.rgb = TEXT_WHITE
    p0.space_after = Pt(8)

    p1 = tf1.add_paragraph()
    p1.text = "The Intelligence Layer for a Safer World"
    p1.font.size = Pt(24)
    p1.font.bold = True
    p1.font.color.rgb = ACCENT_CYAN
    p1.space_after = Pt(16)

    p2 = tf1.add_paragraph()
    p2.text = "AI-Powered Real-World Crisis Prevention & Emergency Resilience Operating System"
    p2.font.size = Pt(15)
    p2.font.color.rgb = TEXT_MUTED

    # Highlights Container Cards
    add_card(s1, Inches(0.8), Inches(4.5), Inches(3.6), Inches(2.2), "Proactive Intelligence", [
        "Identifies developing threats before disaster strikes",
        "Replaces fragmented 911 / SOS reactive call centers",
        "Geospatially connects citizen reports into events"
    ], badge="[01]", accent=ACCENT_CYAN)

    add_card(s1, Inches(4.8), Inches(4.5), Inches(3.6), Inches(2.2), "Living Digital Twin", [
        "Real-time interactive city map with IoT telemetry",
        "Predictive risk scoring & hospital ICU capacity",
        "Multi-resource automated dispatch synthesis"
    ], badge="[02]", accent=ACCENT_BLUE)

    add_card(s1, Inches(8.8), Inches(4.5), Inches(3.6), Inches(2.2), "Crisis Simulation Lab", [
        "Simulates urban floods, casualties & bottlenecks",
        "Automated civil prevention work orders",
        "Full MERN Stack + Leaflet GIS + ML Models"
    ], badge="[03]", accent=ACCENT_EMERALD)

    # ==========================================
    # SLIDE 2: PROBLEM STATEMENT
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    apply_background(s2)
    add_header(s2, "The Core Challenge", "Emergency Management Today is Fragmented and Reactive", "Why existing SOS apps and 911 dispatch lines fall short during major urban crises")

    add_card(s2, Inches(0.8), Inches(2.1), Inches(5.6), Inches(2.3), "Purely Reactive Post-Disaster Response", [
        "Current emergency apps only respond after catastrophe occurs.",
        "Zero early warnings or environmental threat anticipation.",
        "Citizens and authorities remain blind to compounding hazards until it is too late."
    ], badge="✕", accent=ACCENT_ROSE)

    add_card(s2, Inches(6.8), Inches(2.1), Inches(5.6), Inches(2.3), "Information Silos & Ticket Chaos", [
        "Citizen reports, hospital beds, traffic police, and weather exist in disconnected silos.",
        "If 10 citizens report water accumulation, it creates 10 duplicate tickets.",
        "Dispatchers waste critical golden-hour minutes sorting duplicate noise."
    ], badge="✕", accent=ACCENT_ROSE)

    add_card(s2, Inches(0.8), Inches(4.7), Inches(5.6), Inches(2.3), "Uncoordinated Resource Allocations", [
        "Standard systems dispatch purely by Euclidean distance ('nearest person').",
        "Fails to match verified clinical skills, medical equipment, or ICU availability.",
        "Causes conflicting assignments and ambulances arriving at saturated hospitals."
    ], badge="✕", accent=ACCENT_AMBER)

    add_card(s2, Inches(6.8), Inches(4.7), Inches(5.6), Inches(2.3), "Zero Prevention Feedback Loop", [
        "Historical incident data sits locked in archives and police logs.",
        "Municipalities do not convert recurring accident spots into civil work orders.",
        "The same intersections flood and same highway corridors crash repeatedly."
    ], badge="✕", accent=ACCENT_AMBER)

    # ==========================================
    # SLIDE 3: OUR SOLUTION & THE 5 QUESTIONS
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    apply_background(s3)
    add_header(s3, "System Vision", "LifeLine: The 5 Fundamental Safety Intelligence Questions", "An intelligent operating system that transitions public safety from reactive rescue to predictive resilience")

    add_card(s3, Inches(0.8), Inches(2.1), Inches(3.6), Inches(2.3), "1. What is happening around us?", [
        "Aggregates multi-source citizen reports, IoT water sensors, and weather telemetry.",
        "Fuses fragmented data into unified real-world situations in real time."
    ], badge="01", accent=ACCENT_CYAN)

    add_card(s3, Inches(4.8), Inches(2.1), Inches(3.6), Inches(2.3), "2. What could happen next?", [
        "Calculates dynamic risk scores (0-100) combining historical incident Poisson baseline with live weather and road hazards.",
        "Issues early alerts before disasters escalate."
    ], badge="02", accent=ACCENT_CYAN)

    add_card(s3, Inches(8.8), Inches(2.1), Inches(3.6), Inches(2.3), "3. Where are people at risk?", [
        "Visualizes threat zones and vulnerable citizens on an interactive Geospatial Digital Twin map.",
        "Tracks high-hazard corridors with live GIS layers."
    ], badge="03", accent=ACCENT_CYAN)

    add_card(s3, Inches(2.8), Inches(4.7), Inches(3.6), Inches(2.3), "4. What resources are available?", [
        "Live directory of hospital ICU beds, blood donors, verified doctors, and volunteer responders.",
        "Verifies availability and equipment status instantly."
    ], badge="04", accent=ACCENT_EMERALD)

    add_card(s3, Inches(6.8), Inches(4.7), Inches(3.6), Inches(2.3), "5. What is the best action?", [
        "Synthesizes coordinated rescue packages and generates civil prevention work orders.",
        "Provides explainable, verified decision support."
    ], badge="05", accent=ACCENT_EMERALD)

    # ==========================================
    # SLIDE 4: SITUATION INTELLIGENCE & CLUSTERING
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    apply_background(s4)
    add_header(s4, "Core Innovation #1", "Real-World Situation Intelligence & Dynamic Clustering", "How LifeLine converts scattered citizen reports into actionable, verified emergency events")

    add_card(s4, Inches(0.8), Inches(2.1), Inches(5.6), Inches(4.9), "Spatio-Temporal Fusion Engine (DBSCAN)", [
        "Problem: When an urban flood occurs, dozens of citizens submit panic reports in the same neighborhood.",
        "Traditional System: Treats each report as an isolated ticket, overwhelming 911 dispatchers.",
        "LifeLine Solution: Uses Geospatial DBSCAN Clustering with a 1.2 km radius and 15-minute sliding window.",
        "Result: Automatically clusters 5 separate waterlogging reports into 1 unified 'Developing Urban Flood Event'.",
        "Calculates confidence scores based on independent report counts, sensor telemetry, and eyewitness photos.",
        "Displays verification levels: Unverified -> Moderated -> Confirmed."
    ], badge="Engine", accent=ACCENT_CYAN)

    add_card(s4, Inches(6.8), Inches(2.1), Inches(5.6), Inches(2.3), "Explainable Event Output", [
        "Affected Geographical Radius (e.g. 850m radius).",
        "Confidence Score (e.g. 88% High Confidence).",
        "Evidence Sources (Citizen reports + IoT Water Level: 82%).",
        "Clear Recommended Action: 'Dispatch pump crew & reroute buses'."
    ], badge="Output", accent=ACCENT_BLUE)

    add_card(s4, Inches(6.8), Inches(4.7), Inches(5.6), Inches(2.3), "Human-in-the-Loop Verification", [
        "Ethical Safeguard: Unverified citizen reports are never treated as absolute facts.",
        "Human emergency moderators can confirm, merge, split, or close clustered situations.",
        "Prevents false alarms and malicious hoax submissions."
    ], badge="Safety", accent=ACCENT_EMERALD)

    # ==========================================
    # SLIDE 5: PREDICTIVE RISK & DIGITAL TWIN
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    apply_background(s5)
    add_header(s5, "Core Innovation #2", "Predictive Risk Engine & Living Digital Twin", "Forecasting dangerous hotspots and mapping city safety assets in real time")

    add_card(s5, Inches(0.8), Inches(2.1), Inches(5.6), Inches(4.9), "Dynamic Multi-Factor Risk Model", [
        "Poisson Baseline: Calculates expected hourly incident rates from historical urban data.",
        "Live Modifiers: Multiplies risk by real-time rain intensity, traffic congestion, and road topography.",
        "Formula Breakdown: Risk = 0.35 * History + 0.25 * Weather + 0.20 * Topography + 0.20 * IoT Telemetry.",
        "Hotspot Detection: Flags critical zones (Score > 75) before accidents happen.",
        "Explainable AI: Breaks down exact contributing factors (e.g. 'Poor road drainage + 85% heavy rain').",
        "Autonomous Alerts: Pushes high-risk warnings to approaching drivers and local municipal wards."
    ], badge="Risk AI", accent=ACCENT_AMBER)

    add_card(s5, Inches(6.8), Inches(2.1), Inches(5.6), Inches(4.9), "Geospatial Living Digital Twin", [
        "Full Interactive Map: Built using Leaflet GIS with custom OpenStreetMap / Carto Dark tile layers.",
        "Comprehensive Safety Overlays: Active incidents, predictive risk polygons, hospitals, shelters, and blood donors.",
        "Live IoT Sensor Layers: Displays real-time water depth sensors, air quality monitors, and road status.",
        "Interactive Inspection: Click any hospital to view live ICU bed availability and emergency blood stocks.",
        "Filterable Controls: Toggle risk layers, severity levels, and temporal filters on demand.",
        "Sub-Second Live Updates: Connected via WebSockets for real-time dispatch updates without page reload."
    ], badge="Digital Twin", accent=ACCENT_CYAN)

    # ==========================================
    # SLIDE 6: RESOURCE COORDINATION & PREVENTION
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    apply_background(s6)
    add_header(s6, "Core Innovation #3", "Intelligent Resource Coordination & Civil Prevention", "Smart multi-resource dispatch matching and turning historical accidents into civil infrastructure fixes")

    add_card(s6, Inches(0.8), Inches(2.1), Inches(5.6), Inches(4.9), "Multi-Criteria Resource Coordination", [
        "Beyond 'Nearest Person': Matches responders by clinical qualifications, certification level, and equipment.",
        "Team Synthesis: For a severe crash, synthesizes: 1 Paramedic + 1 Trauma Doctor + 1 BLS Ambulance + Nearest ICU Facility.",
        "Conflict Prevention: Live lock mechanism prevents assigning the same responder or ambulance to overlapping incidents.",
        "Dynamic ETA & Routing: Computes realistic travel times taking into account road closures and active hazards.",
        "Blood Network Integration: Instant geo-matching of verified blood donors by ABO/Rh group and proximity."
    ], badge="Coordination", accent=ACCENT_EMERALD)

    add_card(s6, Inches(6.8), Inches(2.1), Inches(5.6), Inches(4.9), "Prevention & Infrastructure Work Orders", [
        "Closing the Loop: Converts recurring emergency data into permanent civil engineering solutions.",
        "Pattern Identification: Detects locations with repeated incidents (e.g. 14 accidents at Outer Ring Road junction).",
        "Automated Civil Proposals: Generates structured civil work orders with estimated budgets and safety impact scores.",
        "Examples Generated:",
        "  • Install high-friction anti-skid road surfacing ($35,000 budget | -65% accident risk).",
        "  • Elevate stormwater drainage gates ($60,000 budget | -80% flood risk).",
        "Evidence-Backed: Provides municipal authorities with incident heatmaps and historical trend data."
    ], badge="Prevention", accent=ACCENT_CYAN)

    # ==========================================
    # SLIDE 7: CRISIS SIMULATION LAB
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    apply_background(s7)
    add_header(s7, "Core Innovation #4", "Crisis Simulation Laboratory: Urban Disaster Stress Testing", "Interactive sandbox for city planners and disaster authorities to stress-test capacity before disaster hits")

    add_card(s7, Inches(0.8), Inches(2.1), Inches(5.6), Inches(4.9), "Disaster Stress-Testing Engine", [
        "Scenario Library: Urban Flash Flood, Multi-Vehicle Highway Crash, Festival Crowd Surge, Chemical Leak.",
        "Adjustable Crisis Parameters: Set rainfall intensity (mm/hr), casualty counts, and road blockage percentages.",
        "ICU & Ambulance Saturation Curves: Predicts exact minute when hospital emergency beds will hit 100% capacity.",
        "Evacuation Bottleneck Detection: Highlights congested exit arteries and predicts evacuation delays.",
        "Alternative Response Plans: Evaluates backup hospitals, temporary medical camps, and detour corridors.",
        "Safe Sandbox: Simulation outputs are strictly segregated from live emergency dispatch data."
    ], badge="Sim Engine", accent=ACCENT_BLUE)

    add_card(s7, Inches(6.8), Inches(2.1), Inches(5.6), Inches(2.3), "Estimated Simulation Impact Metrics", [
        "Projected Casualties & At-Risk Population (e.g. 1,450 residents).",
        "Resource Deficit: Identifies shortfall of 8 ICU beds & 3 Advanced Life Support ambulances.",
        "Actionable Bottleneck Alert: 'Main bridge impassable; redirect to North corridor'."
    ], badge="Analytics", accent=ACCENT_AMBER)

    add_card(s7, Inches(6.8), Inches(4.7), Inches(5.6), Inches(2.3), "Executive Strategic Value", [
        "Allows municipal disaster management authorities (NDMA/SDMA) to conduct digital mock drills.",
        "Optimizes resource placement before monsoon or major urban events.",
        "Cuts emergency response delays by up to 40%."
    ], badge="Impact", accent=ACCENT_EMERALD)

    # ==========================================
    # SLIDE 8: SYSTEM ARCHITECTURE & TECH STACK
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    apply_background(s8)
    add_header(s8, "Technology Stack", "Modern MERN & Real-Time Geospatial Architecture", "Built for high reliability, modular scalability, and sub-second real-world dispatch")

    add_card(s8, Inches(0.8), Inches(2.1), Inches(5.6), Inches(2.3), "Frontend Client (React 19 & Vite)", [
        "React 19 with Vite: Lightning-fast rendering and modular component architecture.",
        "Tailwind CSS v4: Responsive dark-theme emergency command center UI.",
        "Leaflet GIS Mapping: Interactive vector and tile geospatial visualizations.",
        "Lucide React: Clean, intuitive emergency iconography."
    ], badge="Frontend", accent=ACCENT_CYAN)

    add_card(s8, Inches(6.8), Inches(2.1), Inches(5.6), Inches(2.3), "Backend Services (Node.js & Express)", [
        "Node.js & Express REST APIs: Modular microservices and scalable route architecture.",
        "Socket.IO WebSockets: Sub-second bidirectional real-time event streaming.",
        "Background Escalation Worker: Automatically escalates unassigned incidents.",
        "Modular Intelligence Engine: Standalone engines for clustering, risk, and simulations."
    ], badge="Backend", accent=ACCENT_BLUE)

    add_card(s8, Inches(0.8), Inches(4.7), Inches(5.6), Inches(2.3), "Database & AI Analytics (MongoDB)", [
        "MongoDB with 2dsphere Indexes: High-speed spherical geospatial queries ($geoWithin).",
        "DBSCAN Spatio-Temporal Clustering: Groups reports by distance and time window.",
        "Poisson Baseline + Multi-Factor Scoring: Probabilistic risk quantification.",
        "Anthropic Claude Integration: NLP incident triage and severity classification."
    ], badge="Database & AI", accent=ACCENT_EMERALD)

    add_card(s8, Inches(6.8), Inches(4.7), Inches(5.6), Inches(2.3), "Security & Cloud Infrastructure", [
        "JWT Authentication: Secure role-based access (Citizen, Volunteer, Hospital, Admin).",
        "Defensive Middleware: Helmet HTTP headers, Mongo-Sanitize injection defense, Rate Limiters.",
        "Cloud Ready: Designed for one-click deployment on Render with MongoDB Atlas.",
        "Version Control: Fully tracked and documented git repository."
    ], badge="DevOps & Security", accent=ACCENT_AMBER)

    # ==========================================
    # SLIDE 9: DEMO FLOW & FACULTY WALKTHROUGH
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    apply_background(s9)
    add_header(s9, "Demonstration & Impact", "Faculty Demonstration Flow & Startup Viability", "A simple 4-step live walkthrough and commercial viability roadmap")

    add_card(s9, Inches(0.8), Inches(2.1), Inches(5.6), Inches(4.9), "Simple 4-Step Faculty Demo Script", [
        "Step 1: Quick Role Login (LoginPage)",
        "  • Click 'Admin Demo' -> credentials fill on screen -> Click 'Sign In'.",
        "Step 2: Digital Twin & Situation Clustering (Digital Twin Explorer)",
        "  • Show how 5 scattered reports merge into 1 high-confidence flood cluster on the live GIS map.",
        "Step 3: Crisis Simulation Lab (Simulation Page)",
        "  • Select 'Urban Flash Flood' -> Run scenario -> Inspect ICU bed saturation and ambulance bottlenecks.",
        "Step 4: Prevention & Civil Work Orders (Prevention Page)",
        "  • Show automated civil infrastructure proposals that solve root hazards permanently."
    ], badge="Demo Flow", accent=ACCENT_CYAN)

    add_card(s9, Inches(6.8), Inches(2.1), Inches(5.6), Inches(2.3), "Startup Viability & Business Model", [
        "B2G (Government / Smart Cities): Municipal corporations & disaster authorities subscription.",
        "B2B (Healthcare & Insurance): Hospitals buy live bed coordination; insurers use predictive risk data.",
        "B2C (Community Safety): Free citizen SOS app with premium family safety circle features."
    ], badge="Startup Model", accent=ACCENT_EMERALD)

    add_card(s9, Inches(6.8), Inches(4.7), Inches(5.6), Inches(2.3), "Project Summary & Future Vision", [
        "Built beyond basic SOS: True real-world intelligence operating system.",
        "Technical Highlights: Leaflet GIS, DBSCAN Clustering, Risk Models, Crisis Sandbox.",
        "Future Roadmap: Drone fleet integration, satellite radar telemetry, and automated siren dispatch."
    ], badge="Summary", accent=ACCENT_BLUE)

    # Save presentation
    prs.save(output_path)
    print(f"Successfully generated PowerPoint presentation at: {output_path}")

if __name__ == "__main__":
    target_path = r"c:\Users\bindu\OneDrive\Desktop\lifeline-backend\lifeline\LifeLine_Presentation.pptx"
    create_presentation(target_path)
