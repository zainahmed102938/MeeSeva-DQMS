import React, { useState } from 'react';
import { Video, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VideoCallView = () => {
  const { selectedProject, selectedProjectId, currentUser } = useApp();
  const [retryCount, setRetryCount] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!selectedProjectId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24, textAlign: 'center' }}>
        <AlertTriangle size={32} style={{ color: '#eab308', marginBottom: 12 }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>No Active Project Selected</h2>
        <p style={{ color: 'var(--text-dim, #888)', fontSize: '0.85rem' }}>Select a project from the top navigation to mount the conference room.</p>
      </div>
    );
  }

  // Derive isolated room name strictly using selectedProject.teamId
  const projSlug = (selectedProject?.name || 'Project').replace(/[^a-zA-Z0-9]/g, '');
  const teamSlug = (selectedProject?.teamId || 'DefaultTeam').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const roomName = `CSLM_${projSlug}_${teamSlug}_ConfRoom`;

  const handleRetry = () => {
    setIframeLoaded(false);
    setRetryCount(prev => prev + 1);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
      {/* Conference Room Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 18px',
        background: 'var(--bg-card, #121212)',
        borderBottom: '1px solid var(--border-color, #2a2a2a)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Video size={18} className="text-primary" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{roomName}</span>
          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            Isolated Team Space
          </span>
        </div>

        <button
          onClick={handleRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--border-color, #333)',
            background: 'transparent',
            color: 'var(--text-main, #fff)',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={12} /> Reconnect
        </button>
      </div>

      {/* Jitsi Video Iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          key={`video-frame-${roomName}-${retryCount}`}
          src={`https://meet.jit.si/${roomName}`}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          onLoad={() => setIframeLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
        />
      </div>
    </div>
  );
};
