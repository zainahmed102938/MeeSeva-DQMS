import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Folder, CheckSquare, Bug, FileCode, ArrowRight } from 'lucide-react';
import { isInputElement } from '../domain/shortcuts/shortcutRegistry';

export const GlobalSearch = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !isOpen && !isInputElement(e.target)) {
        e.preventDefault();
        if (onClose) onClose(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        zIndex: 2000
      }}
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Universal Search"
        style={{
          width: '90vw',
          maxWidth: 640,
          background: 'var(--bg-card, #121212)',
          border: '1px solid var(--border-color, #2a2a2a)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color, #2a2a2a)'
        }}>
          <Search size={20} style={{ color: 'var(--text-dim, #888)' }} />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks, bugs, files, and workspace..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main, #fff)',
              fontSize: '1.05rem',
              fontFamily: 'inherit'
            }}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim, #888)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-dim, #888)', fontSize: '0.9rem' }}>
          {query ? `Searching across resources for "${query}"...` : 'Type to search across the entire project...'}
        </div>
      </div>
    </div>
  );
};
