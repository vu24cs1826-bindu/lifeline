import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    if (!token) {
      if (socket) socket.disconnect();
      setSocket(null);
      setConnected(false);
      return;
    }

    const socketUrl = import.meta.env.VITE_API_BASE_URL || '/';
    const s = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    s.on('connect', () => {
      setConnected(true);
      console.log('Real-time Socket.IO connected');
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('incident:new', (data) => {
      setLiveAlerts((prev) => [
        { id: Date.now(), title: 'New Incident Reported', message: data.message || 'Incoming citizen alert', time: new Date() },
        ...prev.slice(0, 9),
      ]);
    });

    s.on('incident:update', (data) => {
      setLiveAlerts((prev) => [
        { id: Date.now(), title: 'Incident Updated', message: data.message || 'Status transition recorded', time: new Date() },
        ...prev.slice(0, 9),
      ]);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected, liveAlerts }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
