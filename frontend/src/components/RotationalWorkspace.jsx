import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  LayoutDashboard, Kanban, FolderGit2, Bug, Code2, Video, Users, 
  Settings, LogOut, Sun, Moon, Search, Command, CheckSquare, Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CommandPalette } from './CommandPalette';
import { GlobalSearch } from './GlobalSearch';
import { ShortcutsModal } from './ShortcutsModal';
import { isInputElement } from '../domain/shortcuts/shortcutRegistry';

// React.lazy code splitting for view bundles (P3-003)
const DashboardView = lazy(() => import('../views/DashboardView').then(m => ({ default: m.DashboardView })));
const KanbanView = lazy(() => import('../views/KanbanView').then(m => ({ default: m.KanbanView })));
const ProjectsView = lazy(() => import('../views/ProjectsView').then(m => ({ default: m.ProjectsView })));
const CodeEditorView = lazy(() => import('../views/CodeEditorView').then(m => ({ default: m.CodeEditorView })));
const RepoView = lazy(() => import('../views/RepoView').then(m => ({ default: m.RepoView })));
const VideoCallView = lazy(() => import('../views/VideoCallView').then(m => ({ default: m.VideoCallView })));
const Whiteboard = lazy(() => import('./Whiteboard').then(m => ({ default: m.Whiteboard })));

export const RotationalWorkspace = () => {
  const { 
    currentUser, 
    logout, 
    selectedProject, 
    projects = [], 
    selectProject,
    isDarkMode = true,
    toggleDarkMode
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Global Keyboard shortcuts handling
  useEffect(() => {
    let chordWaiting = false;
    let chordTimer = null;

    const handleKeyDown = (e) => {
      if (isInputElement(e.target)) return;

      // Theme toggle: Mod + Shift + L
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (toggleDarkMode) toggleDarkMode();
        return;
      }

      // Help: ?
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal(true);
        return;
      }

      // Chord navigation: 'g' then <key>
      if (!chordWaiting && e.key.toLowerCase() === 'g') {
        chordWaiting = true;
        clearTimeout(chordTimer);
        chordTimer = setTimeout(() => { chordWaiting = false; }, 1200);
        return;
      }

      if (chordWaiting) {
        chordWaiting = false;
        clearTimeout(chordTimer);
        const k = e.key.toLowerCase();
        if (k === 'd') setActiveTab('dashboard');
        else if (k === 'p') setActiveTab('projects');
        else if (k === 'k') setActiveTab('kanban');
        else if (k === 'c') setActiveTab('code');
        else if (k === 'r') setActiveTab('repo');
        else if (k === 'w') setActiveTab('whiteboard');
        else if (k === 'v') setActiveTab('video');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(chordTimer);
    };
  }, [toggleDarkMode]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'code', label: 'Code Editor', icon: Code2 },
    { id: 'repo', label: 'Repository', icon: FolderGit2 },
    { id: 'whiteboard', label: 'Whiteboard', icon: CheckSquare },
    { id: 'video', label: 'Video Call', icon: Video },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#09090b', color: '#fff', overflow: 'hidden' }}>
      {/* Left Navigation Rail */}
      <div style={{
        width: 240,
        height: '100%',
        background: 'var(--bg-card, #121212)',
        borderRight: '1px solid var(--border-color, #2a2a2a)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px'
      }}>
        {/* Workspace Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 16px 8px', borderBottom: '1px solid var(--border-color, #222)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>CSLM Studio</span>
        </div>

        {/* Project Selector */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim, #777)', fontWeight: 600, padding: '0 8px 6px 8px' }}>
            Active Project
          </label>
          <select
            value={selectedProject?.id || ''}
            onChange={e => selectProject && selectProject(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 8,
              border: '1px solid var(--border-color, #333)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Nav Links */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'var(--text-dim, #999)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Footer */}
        <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-color, #222)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <img 
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'} 
              alt="Avatar"
              style={{ width: 28, height: 28, borderRadius: 14 }}
            />
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentUser?.name || 'Developer'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim, #888)' }}>{currentUser?.role || 'User'}</div>
            </div>
          </div>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Top Action Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 24px',
          background: 'var(--bg-card, #121212)',
          borderBottom: '1px solid var(--border-color, #2a2a2a)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setShowCommandPalette(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-color, #333)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-dim, #888)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Command size={14} />
              <span>Command Palette...</span>
              <kbd style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }}>⌘K</kbd>
            </button>

            <button
              onClick={() => setShowGlobalSearch(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color, #333)',
                background: 'transparent',
                color: 'var(--text-dim, #888)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Search size={14} /> Search (/)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              onClick={() => { if (toggleDarkMode) toggleDarkMode(); }} 
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
              title="Toggle Theme (Mod+Shift+L)"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* View Workspace with Suspense */}
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>Loading workspace module...</div>}>
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'projects' && <ProjectsView />}
            {activeTab === 'kanban' && <KanbanView />}
            {activeTab === 'code' && <CodeEditorView />}
            {activeTab === 'repo' && <RepoView />}
            {activeTab === 'whiteboard' && <Whiteboard projectId={selectedProject?.id} currentUser={currentUser} />}
            {activeTab === 'video' && <VideoCallView />}
          </Suspense>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
        onSelectAction={(action) => {
          if (action.targetTab) setActiveTab(action.targetTab);
          if (action.id === 'tool-toggle-theme' && toggleDarkMode) toggleDarkMode();
        }}
      />
      <GlobalSearch isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />
      <ShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
    </div>
  );
};
