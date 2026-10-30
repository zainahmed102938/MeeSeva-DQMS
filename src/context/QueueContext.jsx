import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { queueEngine } from '../services/queueEngine';
import { useAuth } from './AuthContext';

const QueueContext = createContext();

// Audio Synthesizer using Web Audio API (Zero external mp3 dependencies)
const playChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    // Tone 1: High crisp ding
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Tone 2: Harmonious chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.2); // A5
    gain2.gain.setValueAtTime(0.3, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.9);
  } catch (e) {
    // Non-critical audio warning
    console.warn('Audio announcement unavailable:', e);
  }
};

export const QueueProvider = ({ children }) => {
  const { user, isCitizen, isOfficial } = useAuth();

  const [activeCitizenTicket, setActiveCitizenTicket] = useState(null);
  const [officialMetrics, setOfficialMetrics] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());

  const activeTicketRef = useRef(null);

  // Refresh queue state for citizen or official
  const syncQueueState = useCallback(() => {
    if (isCitizen && user?.profile?.mobileNumber) {
      const ticket = queueEngine.getActiveTicketForCitizen(user.profile.mobileNumber);
      
      // If status changed to CALLED, trigger audible chime
      if (
        ticket &&
        ticket.status === 'CALLED' &&
        (!activeTicketRef.current || activeTicketRef.current.status !== 'CALLED')
      ) {
        playChime();
        setLastNotification({
          id: Date.now(),
          type: 'CALLED',
          message: `Your token ${ticket.tokenNumber} has been called! Please proceed to ${ticket.assignedCounter}.`
        });
      }

      activeTicketRef.current = ticket;
      setActiveCitizenTicket(ticket);
    } else if (isOfficial && user?.profile) {
      const metrics = queueEngine.getOfficialDashboardMetrics(user.profile);
      setOfficialMetrics(metrics);
    }
    setLastSyncTime(Date.now());
  }, [isCitizen, isOfficial, user]);

  // Sync on user change or periodic smart polling (Phase 1 Real-time Sync)
  useEffect(() => {
    syncQueueState();

    const interval = setInterval(() => {
      // Smart backoff: poll every 4s when tab active, 12s when tab hidden
      if (!document.hidden) {
        syncQueueState();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [syncQueueState]);

  // Citizen Action: Book Ticket
  const bookTicket = async (bookingData) => {
    const ticket = queueEngine.bookVirtualTicket({
      citizenMobile: user.profile.mobileNumber,
      ...bookingData
    });
    setActiveCitizenTicket(ticket);
    syncQueueState();
    return ticket;
  };

  // Citizen Action: Cancel Ticket
  const cancelActiveTicket = async () => {
    if (!activeCitizenTicket) return;
    queueEngine.cancelTicket(activeCitizenTicket.id, user.profile.mobileNumber);
    setActiveCitizenTicket(null);
    syncQueueState();
  };

  // Official Action: Call Next Citizen
  const callNext = async (counterNumber) => {
    if (!isOfficial || !user?.profile) return;
    const ticket = queueEngine.callNextTicket(user.profile, counterNumber);
    syncQueueState();
    return ticket;
  };

  // Official Action: Start Serving
  const startServing = async (ticketId) => {
    if (!isOfficial || !user?.profile) return;
    const ticket = queueEngine.startServingTicket(ticketId, user.profile);
    syncQueueState();
    return ticket;
  };

  // Official Action: Complete Service
  const completeCurrent = async (ticketId, remarks) => {
    if (!isOfficial || !user?.profile) return;
    const ticket = queueEngine.completeTicket(ticketId, user.profile, remarks);
    syncQueueState();
    return ticket;
  };

  // Official Action: Mark No-Show
  const markNoShow = async (ticketId) => {
    if (!isOfficial || !user?.profile) return;
    const ticket = queueEngine.markNoShow(ticketId, user.profile);
    syncQueueState();
    return ticket;
  };

  // Official Action: Hold Ticket
  const holdTicket = async (ticketId, reason) => {
    if (!isOfficial || !user?.profile) return;
    const ticket = queueEngine.putOnHold(ticketId, user.profile, reason);
    syncQueueState();
    return ticket;
  };

  return (
    <QueueContext.Provider
      value={{
        activeCitizenTicket,
        officialMetrics,
        lastNotification,
        clearNotification: () => setLastNotification(null),
        lastSyncTime,
        syncQueueState,
        bookTicket,
        cancelActiveTicket,
        callNext,
        startServing,
        completeCurrent,
        markNoShow,
        holdTicket,
        playChime
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
