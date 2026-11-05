import api from './axios';

export const intelligenceApi = {
  // Living Digital Twin
  getDigitalTwin: () => api.get('/intelligence/digital-twin'),

  // Situation Intelligence & Clustering
  getSituations: () => api.get('/intelligence/situations'),
  synthesizeClusters: () => api.post('/intelligence/clusters/synthesize'),
  moderateCluster: (id, payload) => api.patch(`/intelligence/clusters/${id}/moderate`, payload),

  // Predictive Risk Engine
  getPredictiveRisk: () => api.get('/intelligence/predictive-risk'),

  // Facilities & Resource Availability
  getFacilities: (params) => api.get('/intelligence/facilities', { params }),
  updateFacilityCapacity: (id, data) => api.patch(`/intelligence/facilities/${id}/capacity`, data),

  // Intelligent Resource Coordination
  getRecommendation: (incidentId) => api.post('/intelligence/coordination/recommend', { incidentId }),

  // Crisis Simulation Laboratory
  getSimulationScenarios: () => api.get('/intelligence/simulations'),
  runSimulation: (scenarioId, customParameters) => api.post('/intelligence/simulations/run', { scenarioId, customParameters }),

  // Prevention & Infrastructure Intelligence
  getPreventionIntelligence: () => api.get('/intelligence/prevention'),
  updateProposalStatus: (id, payload) => api.patch(`/intelligence/prevention/${id}/status`, payload),

  // IoT Environmental & River Sensors
  getIoTSensors: () => api.get('/intelligence/iot-sensors'),
  simulateSensorSpike: (id) => api.post(`/intelligence/iot-sensors/${id}/simulate-spike`),
  resetSensor: (id) => api.post(`/intelligence/iot-sensors/${id}/reset`),

  // Citizen Geofenced Alerts (WhatsApp & SMS)
  getBroadcasts: () => api.get('/intelligence/broadcasts'),
  sendBroadcast: (payload) => api.post('/intelligence/broadcasts', payload),

  // Smart Traffic Signal Preemption Corridor
  getTrafficCorridors: () => api.get('/intelligence/traffic-corridors'),
  preemptTrafficCorridor: (activate) => api.post('/intelligence/traffic-corridors/preempt', { activate }),
};

export const incidentApi = {
  getIncidents: () => api.get('/incidents'),
  getAvailable: () => api.get('/incidents/available'),
  getAssigned: () => api.get('/incidents/assigned'),
  getMine: () => api.get('/incidents/mine'),
  getIncident: (id) => api.get(`/incidents/${id}`),
  createIncident: (data) => api.post('/incidents', data),
  acceptIncident: (id) => api.post(`/incidents/${id}/accept`),
  declineIncident: (id, reason) => api.post(`/incidents/${id}/decline`, { reason }),
  updateStatus: (id, status, note) => api.patch(`/incidents/${id}/status`, { status, note }),
  postMessage: (id, text) => api.post(`/incidents/${id}/messages`, { text }),
  getMessages: (id) => api.get(`/incidents/${id}/messages`),
};

export const communityApi = {
  getVerified: () => api.get('/community'),
  getMine: () => api.get('/community/mine'),
  getModerationQueue: () => api.get('/community/moderation'),
  createReport: (formData) => api.post('/community', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  moderate: (id, status, note) => api.patch(`/community/${id}/moderate`, { status, note }),
};

export const donorApi = {
  getDonors: (params) => api.get('/donors', { params }),
  registerDonor: (data) => api.post('/donors', data),
  getRequests: () => api.get('/donors/requests'),
  createRequest: (data) => api.post('/donors/requests', data),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  setVerification: (id, status, note) => api.patch(`/admin/users/${id}/verification`, { status, note }),
  setSuspension: (id, suspend, reason) => api.patch(`/admin/users/${id}/suspension`, { suspend, reason }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
