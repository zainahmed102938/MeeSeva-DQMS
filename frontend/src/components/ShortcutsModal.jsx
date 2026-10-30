import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { SHORTCUT_REGISTRY } from '../domain/shortcuts/shortcutRegistry';

export const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = Array.from(new Set(SHORTCUT_REGISTRY.map(s => s.category || 'General')));

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 20
      }}
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard Shortcuts"
        style={{
          width: '90vw',
          maxWidth: 680,
          maxHeight: '80vh',
          background: 'var(--bg-card, #121212)',
          border: '1px solid var(--border-color, #2a2a2a)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color, #2a2a2a)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Keyboard size={20} className="text-primary" />
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>Keyboard Shortcuts</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim, #888)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {categories.map(category => (
            <div key={category}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim, #888)', marginBottom: 10 }}>
                {category}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SHORTCUT_REGISTRY.filter(s => (s.category || 'General') === category).map(shortcut => (
                  <div 
                    key={shortcut.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 8,
                      border: '1px solid var(--border-color, #222)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{shortcut.label}</div>
                      {shortcut.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim, #777)' }}>{shortcut.description}</div>
                      )}
                    </div>
                    <kbd style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-color, #333)',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace'
                    }}>
                      {shortcut.displayKeys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
