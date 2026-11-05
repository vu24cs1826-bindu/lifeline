import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// 14 Product Modules
import LandingPage from './pages/LandingPage';
import DigitalTwinExplorer from './pages/DigitalTwinExplorer';
import IncidentWorkspace from './pages/IncidentWorkspace';
import PredictiveRiskDashboard from './pages/PredictiveRiskDashboard';
import CrisisSimulationLab from './pages/CrisisSimulationLab';
import ResourceCoordination from './pages/ResourceCoordination';
import OrganizationDashboard from './pages/OrganizationDashboard';
import AdminCommandCenter from './pages/AdminCommandCenter';
import CitizenDashboard from './pages/CitizenDashboard';
import CommunityPortal from './pages/CommunityPortal';
import BloodNetwork from './pages/BloodNetwork';
import AnalyticsPrevention from './pages/AnalyticsPrevention';
import AuditWorkspace from './pages/AuditWorkspace';
import ResponderWorkspace from './pages/ResponderWorkspace';
import LoginPage from './pages/LoginPage';
import IoTSensorsPage from './pages/IoTSensorsPage';
import BroadcastPage from './pages/BroadcastPage';
import TrafficCorridorPage from './pages/TrafficCorridorPage';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  {/* Core Situation Intelligence */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/map" element={<DigitalTwinExplorer />} />
                  <Route path="/incidents" element={<IncidentWorkspace />} />
                  <Route path="/predictive-risk" element={<PredictiveRiskDashboard />} />

                  {/* Coordination & Simulation */}
                  <Route path="/simulation" element={<CrisisSimulationLab />} />
                  <Route path="/coordination" element={<ResourceCoordination />} />
                  <Route path="/organization" element={<OrganizationDashboard />} />
                  <Route path="/responder" element={<ResponderWorkspace />} />

                  {/* Civic & Administration */}
                  <Route path="/admin" element={<AdminCommandCenter />} />
                  <Route path="/citizen" element={<CitizenDashboard />} />
                  <Route path="/community" element={<CommunityPortal />} />
                  <Route path="/blood" element={<BloodNetwork />} />
                  <Route path="/prevention" element={<AnalyticsPrevention />} />
                  <Route path="/audit" element={<AuditWorkspace />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* Smart City Extension Features */}
                  <Route path="/iot-sensors" element={<IoTSensorsPage />} />
                  <Route path="/broadcast" element={<BroadcastPage />} />
                  <Route path="/traffic-corridor" element={<TrafficCorridorPage />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
