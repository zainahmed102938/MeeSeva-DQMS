import React, { useMemo } from 'react';
import { Activity, ShieldCheck, CheckCircle2, Clock, GitCommit, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardView = () => {
  const { 
    currentProject, 
    tasks = [], 
    bugs = [], 
    gitCommits = [], 
    pipelines = [] 
  } = useApp();

  // Real MTTR calculation inspecting resolvedAt and createdAt
  const mttrMetric = useMemo(() => {
    const fixedBugs = bugs.filter(b => (b.status === 'Fixed' || b.status === 'fixed') && b.resolvedAt && b.createdAt);
    if (fixedBugs.length === 0) {
      return bugs.length > 0 ? 'Tracking' : 'Not enough data';
    }

    const totalDurationHours = fixedBugs.reduce((acc, b) => {
      const created = new Date(b.createdAt).getTime();
      const resolved = new Date(b.resolvedAt).getTime();
      const diffHours = Math.max(0, (resolved - created) / (1000 * 60 * 60));
      return acc + diffHours;
    }, 0);

    const avgHours = totalDurationHours / fixedBugs.length;
    return avgHours < 1 ? '< 1h' : `${avgHours.toFixed(1)}h`;
  }, [bugs]);

  // Real 28-day commit heatmap bucketed by actual commit dates
  const heatmapDays = useMemo(() => {
    const days = [];
    const now = new Date();

    const commitCountsByDate = {};
    gitCommits.forEach(c => {
      if (c.timestamp) {
        try {
          const dateStr = new Date(c.timestamp).toISOString().split('T')[0];
          commitCountsByDate[dateStr] = (commitCountsByDate[dateStr] || 0) + 1;
        } catch (_) {}
      }
    });

    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = commitCountsByDate[dateStr] || 0;
      const intensity = count > 5 ? 3 : count > 2 ? 2 : count > 0 ? 1 : 0;

      days.push({
        dateStr,
        dayNumber: 28 - i,
        count,
        intensity
      });
    }

    return days;
  }, [gitCommits]);

  const lastPipeline = pipelines[0];

  return (
    <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Engineering Cockpit</h1>
        <p style={{ color: 'var(--text-dim, #888)', fontSize: '0.875rem', marginTop: 4 }}>
          Honest DORA metrics and audit integrity
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ padding: 18, borderRadius: 14, background: 'var(--bg-card, #121212)', border: '1px solid var(--border-color, #2a2a2a)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim, #888)', marginBottom: 8 }}>Mean Time to Resolution (MTTR)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{mttrMetric}</div>
        </div>

        <div style={{ padding: 18, borderRadius: 14, background: 'var(--bg-card, #121212)', border: '1px solid var(--border-color, #2a2a2a)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim, #888)', marginBottom: 8 }}>Last Build Duration</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{lastPipeline?.duration || 'No builds'}</div>
        </div>

        <div style={{ padding: 18, borderRadius: 14, background: 'var(--bg-card, #121212)', border: '1px solid var(--border-color, #2a2a2a)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim, #888)', marginBottom: 8 }}>Total Completed Tasks</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{tasks.filter(t => t.status === 'Done').length}</div>
        </div>

        <div style={{ padding: 18, borderRadius: 14, background: 'var(--bg-card, #121212)', border: '1px solid var(--border-color, #2a2a2a)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim, #888)', marginBottom: 8 }}>Active Defect Count</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{bugs.filter(b => b.status !== 'Fixed' && b.status !== 'Closed').length}</div>
        </div>
      </div>

      {/* 28-day Commit Velocity Heatmap */}
      <div style={{ padding: 20, borderRadius: 14, background: 'var(--bg-card, #121212)', border: '1px solid var(--border-color, #2a2a2a)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GitCommit size={18} className="text-primary" />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>28-Day Commit Velocity Heatmap</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim, #888)' }}>Bucket by real commit timestamp</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', gap: 6 }}>
          {heatmapDays.map(d => (
            <div
              key={d.dateStr}
              title={`Day ${d.dayNumber} (${d.dateStr}): ${d.count} commits`}
              style={{
                aspectRatio: '1',
                borderRadius: 4,
                background: d.intensity === 3 ? '#22c55e' : d.intensity === 2 ? '#15803d' : d.intensity === 1 ? '#166534' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.03)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
