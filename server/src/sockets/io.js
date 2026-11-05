// Small holder so any file can emit events without circular imports
let io = null;
export const setIO = (instance) => { io = instance; };
export const emitToUser = (id, event, payload) => io && io.to(`user:${id}`).emit(event, payload);
export const emitToRole = (role, event, payload) => io && io.to(`role:${role}`).emit(event, payload);
export const emitToIncident = (id, event, payload) => io && io.to(`incident:${id}`).emit(event, payload);
