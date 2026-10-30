import React, { useMemo } from 'react';
import { Check, X, GitCommit, FileCode, ArrowRight, ShieldAlert } from 'lucide-react';

/**
 * Line-by-line diff computation algorithm (LCS-based diff)
 */
function computeLineDiff(originalText = '', proposedText = '') {
  const origLines = (originalText || '').split('\n');
  const propLines = (proposedText || '').split('\n');

  const n = origLines.length;
  const m = propLines.length;

  // Size guard (P3-005) - avoid O(N*M) table freeze on massive files
  if (n * m > 2000000) {
    const diff = [
      ...origLines.map((line, idx) => ({ type: 'removed', text: line, lineOrig: idx + 1 })),
      ...propLines.map((line, idx) => ({ type: 'added', text: line, lineProp: idx + 1 }))
    ];
    return { diff, additions: propLines.length, deletions: origLines.length, isTruncated: true };
  }

  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (origLines[i] === propLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to build diff chunks
  let i = n;
  let j = m;
  const diff = [];
  let additions = 0;
  let deletions = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === propLines[j - 1]) {
      diff.unshift({ type: 'unchanged', text: origLines[i - 1], lineOrig: i, lineProp: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'added', text: propLines[j - 1], lineProp: j });
      additions++;
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({ type: 'removed', text: origLines[i - 1], lineOrig: i });
      deletions++;
      i--;
    }
  }

  return { diff, additions, deletions, isTruncated: false };
}

export const AIDiffModal = ({
  isOpen,
  filename,
  currentCode,
  proposedCode,
  onApply,
  onReject,
  isDarkMode = true
}) => {
  const { diff, additions, deletions, isTruncated } = useMemo(() => {
    if (!isOpen || !proposedCode) return { diff: [], additions: 0, deletions: 0, isTruncated: false };
    return computeLineDiff(currentCode, proposedCode);
  }, [isOpen, currentCode, proposedCode]);

  if (!isOpen || !proposedCode) return null;

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
        zIndex: 1000,
        padding: 20
      }}
    >
      <div 
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-label={`AI Code Proposal Diff for ${filename || 'file'}`}
        style={{
          width: '90vw',
          maxWidth: 1000,
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card, #121212)',
          border: '1px solid var(--border-color, #2a2a2a)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color, #2a2a2a)',
          background: 'var(--bg-header, rgba(255,255,255,0.02))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileCode size={20} className="text-primary" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{filename || 'Active File'}</span>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  -{deletions}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                  +{additions}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim, #888)' }}>
                Review changes before committing to editor buffer
              </div>
            </div>
          </div>
          <button 
            onClick={onReject}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim, #888)', padding: 6 }}
            aria-label="Close diff review"
          >
            <X size={20} />
          </button>
        </div>

        {/* Truncated notice if applicable */}
        {isTruncated && (
          <div style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '8px 20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={16} />
            <span>File exceeds 2,000,000 cell diff limit. Showing simplified block diff for UI performance.</span>
          </div>
        )}

        {/* Diff Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.85rem',
          lineHeight: '1.5',
          background: 'rgba(0,0,0,0.3)',
          padding: '10px 0'
        }}>
          {diff.map((line, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                padding: '2px 16px',
                background: line.type === 'added' ? 'rgba(34, 197, 94, 0.12)' : line.type === 'removed' ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
                color: line.type === 'added' ? '#4ade80' : line.type === 'removed' ? '#f87171' : 'var(--text-main, #e5e7eb)',
                borderLeft: line.type === 'added' ? '3px solid #22c55e' : line.type === 'removed' ? '3px solid #ef4444' : '3px solid transparent'
              }}
            >
              <span style={{ width: 40, userSelect: 'none', color: 'var(--text-dim, #666)', textAlign: 'right', marginRight: 16 }}>
                {line.lineOrig || line.lineProp || ''}
              </span>
              <span style={{ width: 20, userSelect: 'none', fontWeight: 'bold' }}>
                {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
              </span>
              <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {line.text}
              </span>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color, #2a2a2a)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          background: 'var(--bg-header, rgba(255,255,255,0.02))'
        }}>
          <button 
            onClick={onReject}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--border-color, #333)',
              background: 'transparent',
              color: 'var(--text-main, #e5e7eb)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Reject Proposal
          </button>
          <button 
            onClick={onApply}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#22c55e',
              color: '#000',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Check size={16} />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
