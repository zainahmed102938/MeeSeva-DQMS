import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export const ContextMenu = ({ 
  trigger, 
  items = [], 
  align = 'right',
  customTriggerClass = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef(null);
  const itemRefs = useRef([]);

  const actionableIndices = items
    .map((item, idx) => (!item.separator && !item.disabled ? idx : null))
    .filter(idx => idx !== null);

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
      return;
    }

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => {
          if (actionableIndices.length === 0) return -1;
          const currentPos = actionableIndices.indexOf(prev);
          const nextPos = (currentPos + 1) % actionableIndices.length;
          return actionableIndices[nextPos];
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => {
          if (actionableIndices.length === 0) return -1;
          const currentPos = actionableIndices.indexOf(prev);
          const nextPos = (currentPos - 1 + actionableIndices.length) % actionableIndices.length;
          return actionableIndices[nextPos];
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (focusedIndex >= 0 && items[focusedIndex] && !items[focusedIndex].disabled) {
          e.preventDefault();
          handleItemClick(e, items[focusedIndex]);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, focusedIndex, actionableIndices, items]);

  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    if (item.disabled) return;
    setIsOpen(false);
    if (item.onClick) item.onClick();
  };

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }} onClick={e => e.stopPropagation()}>
      {trigger ? (
        <div
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(prev => !prev)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(prev => !prev);
            }
          }}
        >
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className={`btn-icon ${customTriggerClass}`}
          title="More options"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="More options"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim, #888)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main, #fff)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim, #888)'; }}
        >
          <MoreVertical size={16} />
        </button>
      )}

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          style={{
            position: 'absolute',
            top: '100%',
            [align === 'right' ? 'right' : 'left']: 0,
            marginTop: 4,
            width: 190,
            background: 'var(--bg-card, #121212)',
            border: '1px solid var(--border-color, #2a2a2a)',
            borderRadius: 14,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 1000,
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          {items.map((item, idx) => {
            if (item.separator) {
              return (
                <div 
                  key={`sep-${idx}`}
                  role="separator"
                  style={{ height: 1, background: 'var(--border-color, #2a2a2a)', margin: '4px 0' }} 
                />
              );
            }

            const Icon = item.icon;
            const isDanger = item.danger;
            const isFocused = focusedIndex === idx;

            return (
              <button
                key={idx}
                ref={el => { itemRefs.current[idx] = el; }}
                role="menuitem"
                tabIndex={isFocused ? 0 : -1}
                aria-disabled={item.disabled}
                disabled={item.disabled}
                onClick={e => handleItemClick(e, item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: isFocused ? (isDanger ? 'rgba(239,68,68,0.18)' : 'var(--bg-card-hover, rgba(255,255,255,0.06))') : 'transparent',
                  color: isDanger ? '#ef4444' : (item.disabled ? 'var(--text-dim, #666)' : 'var(--text-main, #e5e7eb)'),
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  opacity: item.disabled ? 0.5 : 1,
                  outline: isFocused ? '1px solid var(--primary, #3b82f6)' : 'none',
                  transition: 'background 0.12s ease'
                }}
                onMouseEnter={e => {
                  if (!item.disabled) {
                    setFocusedIndex(idx);
                    e.currentTarget.style.background = isDanger ? 'rgba(239,68,68,0.12)' : 'var(--bg-card-hover, rgba(255,255,255,0.06))';
                  }
                }}
                onMouseLeave={e => {
                  if (!isFocused) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {Icon && <Icon size={14} style={{ flexShrink: 0 }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
