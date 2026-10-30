import React, { useState } from 'react';
import { GitBranch, GitCommit, GitPullRequest, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RepoView = () => {
  const { gitBranches = [], gitCommits = [], gitPullRequests = [], mergePullRequest } = useApp();
  const [activeTab, setActiveTab] = useState('commits');

  return (
    <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header and Honest Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Version Control & Repositories</h1>
          <p style={{ color: 'var(--text-dim, #888)', fontSize: '0.875rem', marginTop: 4 }}>
            Branching, commit histories, and pull request audits
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Honest Simulation Badges */}
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 8,
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#60a5fa',
            letterSpacing: '0.04em'
          }}>
            SIMULATED REPOSITORY
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 8,
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#facc15',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}>
            <Github size={13} /> GITHUB — READ ONLY
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-color, #2a2a2a)', paddingBottom: 12, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('commits')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'commits' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: activeTab === 'commits' ? '#fff' : 'var(--text-dim, #888)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <GitCommit size={16} /> Commits ({gitCommits.length})
        </button>
        <button
          onClick={() => setActiveTab('prs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'prs' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: activeTab === 'prs' ? '#fff' : 'var(--text-dim, #888)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <GitPullRequest size={16} /> Pull Requests ({gitPullRequests.length})
        </button>
      </div>

      {/* Content */}
      <div style={{ background: 'var(--bg-card, #121212)', border: '1px solid var(--border-color, #2a2a2a)', borderRadius: 14, padding: 16 }}>
        {activeTab === 'commits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {gitCommits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-dim, #888)' }}>No commits recorded yet.</div>
            ) : (
              gitCommits.map(c => (
                <div key={c.hash || c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{c.message}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim, #888)', marginTop: 4 }}>
                      By {c.author} on branch {c.branch || 'main'}
                    </div>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)' }}>
                    {c.hash?.slice(0, 7) || 'HEAD'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'prs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {gitPullRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-dim, #888)' }}>No open pull requests.</div>
            ) : (
              gitPullRequests.map(pr => (
                <div key={pr.id || pr.number} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>#{pr.number}: {pr.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim, #888)', marginTop: 4 }}>
                      {pr.sourceBranch} → {pr.targetBranch} • Status: {pr.status}
                    </div>
                  </div>
                  {pr.status === 'Open' && (
                    <button
                      onClick={() => mergePullRequest && mergePullRequest(pr.id || pr.number)}
                      style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#000', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Merge PR
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
