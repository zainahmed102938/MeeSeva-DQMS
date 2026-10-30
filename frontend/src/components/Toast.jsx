import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 18px',
        borderRadius: 12,
        background: 'var(--bg-card, #18181b)',
        border: `1px solid ${isSuccess ? '#22c55e' : isError ? '#ef4444' : '#3b82f6'}`,
        color: 'var(--text-main, #fff)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        fontSize: '0.9rem',
        maxWidth: 380
      }}
    >
      {isSuccess && <CheckCircle2 size={18} color="#22c55e" />}
      {isError && <AlertCircle size={18} color="#ef4444" />}
      {!isSuccess && !isError && <Info size={18} color="#3b82f6" />}

      <span style={{ flex: 1 }}>{toast.message}</span>

      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 2 }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
};
