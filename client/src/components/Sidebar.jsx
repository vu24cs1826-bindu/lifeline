import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Globe,
  MapPin,
  Flame,
  AlertTriangle,
  Cpu,
  Sliders,
  Building2,
  ShieldCheck,
  UserCheck,
  FilePlus2,
  Droplet,
  TrendingUp,
  FileText,
  LifeBuoy,
  LogIn,
  Radio,
  MessageSquare,
  Activity,
} from 'lucide-react';

const MODULES = [
  {
    group: 'LIVE CITY MONITORING',
    items: [
      { name: 'Public Overview', path: '/', icon: Globe },
      { name: 'Live City Map', path: '/map', icon: MapPin, highlight: true },
      { name: 'Incident Clusters', path: '/incidents', icon: Flame, badge: 'Smart Fusion' },
      { name: 'Predictive Risk Zones', path: '/predictive-risk', icon: AlertTriangle },
    ],
  },
  {
    group: 'EMERGENCY PLANNING',
    items: [
      { name: 'Disaster Simulator', path: '/simulation', icon: Cpu, badge: 'Key Feature' },
      { name: 'Resource Dispatcher', path: '/coordination', icon: Sliders },
      { name: 'Hospital & Bed Capacity', path: '/organization', icon: Building2 },
      { name: 'Responder Workspace', path: '/responder', icon: LifeBuoy },
    ],
  },
  {
    group: 'CITIZEN & COMMUNITY',
    items: [
      { name: 'Citizen SOS Portal', path: '/citizen', icon: UserCheck },
      { name: 'Report Road Hazard', path: '/community', icon: FilePlus2 },
      { name: 'Blood Bank Network', path: '/blood', icon: Droplet },
      { name: 'Safety Improvements', path: '/prevention', icon: TrendingUp },
      { name: 'Admin Command Center', path: '/admin', icon: ShieldCheck, role: 'admin' },
      { name: 'System Audit Logs', path: '/audit', icon: FileText },
    ],
  },
  {
    group: 'SMART CITY EXTENSIONS',
    items: [
      { name: 'IoT Flood Sensors', path: '/iot-sensors', icon: Radio, badge: 'Live IoT' },
      { name: 'WhatsApp & SMS Alerts', path: '/broadcast', icon: MessageSquare, badge: 'SMS/WA' },
      { name: 'Ambulance Green Corridor', path: '/traffic-corridor', icon: Activity, badge: 'Signals' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 hidden md:block bg-[#090D16] border-r border-slate-800/80 min-h-[calc(100vh-53px)] p-3 text-xs overflow-y-auto">
      <div className="space-y-5">
        {MODULES.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {section.group}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-2 rounded-lg font-medium transition ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/40 text-cyan-400 border border-cyan-800/50 shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-400" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight bg-purple-950/80 text-purple-300 border border-purple-800/60">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
