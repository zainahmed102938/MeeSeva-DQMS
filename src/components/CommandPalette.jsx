import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight, X } from 'lucide-react';
import { SHORTCUT_REGISTRY, isInputElement } from '../domain/shortcuts/shortcutRegistry';

export const CommandPalette = ({ isOpen, onClose, onSelectAction }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const filteredItems = SHORTCUT_REGISTRY.filter(item => {
    if (!query) return true;
    const q = query.toLowerCase();
    return item.label.toLowerCase().includes(q) || 
           item.description?.toLowerCase().includes(q) ||
           item.category?.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (!isInputElement(e.target)) {
          e.preventDefault();
          if (onClose) onClose(!isOpen);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (item) => {
    if (onSelectAction) onSelectAction(item);
    if (onClose) onClose();
  };

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
        aria-label="Command Palette"
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
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or search..."
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
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[selectedIndex]) handleSelect(filteredItems[selectedIndex]);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim, #888)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div 
          role="listbox" 
          aria-label="Commands"
          style={{
            maxHeight: 360,
            overflowY: 'auto',
            padding: 8
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-dim, #888)', fontSize: '0.9rem' }}>
              No commands found matching "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: isSelected ? '#60a5fa' : 'var(--text-main, #e5e7eb)',
                    transition: 'background 0.1s ease'
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Command size={16} style={{ opacity: isSelected ? 1 : 0.6 }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.label}</div>
                      {item.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim, #888)' }}>{item.description}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.displayKeys && (
                      <kbd style={{
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid var(--border-color, #333)',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}>
                        {item.displayKeys}
                      </kbd>
                    )}
                    <ArrowRight size={14} style={{ opacity: isSelected ? 1 : 0.3 }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
