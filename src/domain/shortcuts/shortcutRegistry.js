/**
 * Centralized Keyboard Shortcuts Registry.
 * Acts as the authoritative source of truth for:
 * 1. Global keyboard event listeners
 * 2. The Help & Shortcuts Modal (?)
 * 3. The Command Palette (Cmd/Ctrl + K)
 */

export const isMac = typeof window !== 'undefined' 
  ? /Mac|iPod|iPhone|iPad/.test(navigator.platform || '') 
  : false;

export const formatKeyCombo = (keys) => {
  return keys.map(k => {
    if (k.toLowerCase() === 'mod') return isMac ? '⌘' : 'Ctrl';
    if (k.toLowerCase() === 'shift') return isMac ? '⇧' : 'Shift';
    if (k.toLowerCase() === 'alt') return isMac ? '⌥' : 'Alt';
    return k.toUpperCase();
  }).join(isMac ? '' : '+');
};

export const isInputElement = (el) => {
  if (!el) return false;
  if (el.isContentEditable || el.contentEditable === 'true') return true;
  const tag = el.tagName?.toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (typeof el.closest === 'function') {
    if (
      el.closest('.monaco-editor') ||
      el.closest('[role="textbox"]') ||
      el.closest('[contenteditable="true"]') ||
      el.closest('.monaco-mouse-cursor-text')
    ) {
      return true;
    }
  }
  return false;
};

export const SHORTCUT_REGISTRY = [
  // ── Navigation ──
  {
    id: 'nav-dashboard',
    label: 'Open Dashboard',
    category: 'Navigation',
    description: 'Switch to real-time engineering cockpit & metrics',
    keys: ['g', 'd'],
    displayKeys: 'G then D',
    targetTab: 'dashboard'
  },
  {
    id: 'nav-projects',
    label: 'Open Projects Hub',
    category: 'Navigation',
    description: 'Switch to project workspace portfolio',
    keys: ['g', 'p'],
    displayKeys: 'G then P',
    targetTab: 'projects'
  },
  {
    id: 'nav-kanban',
    label: 'Open Kanban Board',
    category: 'Navigation',
    description: 'Switch to agile workflow task stages',
    keys: ['g', 'k'],
    displayKeys: 'G then K',
    targetTab: 'kanban'
  },
  {
    id: 'nav-sprints',
    label: 'Open Sprints',
    category: 'Navigation',
    description: 'Switch to sprint planning & burndown velocity',
    keys: ['g', 's'],
    displayKeys: 'G then S',
    targetTab: 'sprints'
  },
  {
    id: 'nav-code',
    label: 'Open Code Editor',
    category: 'Navigation',
    description: 'Switch to Monaco IDE & AI Copilot workspace',
    keys: ['g', 'c'],
    displayKeys: 'G then C',
    targetTab: 'code'
  },
  {
    id: 'nav-repo',
    label: 'Open Git Repository',
    category: 'Navigation',
    description: 'Switch to branches, commits stream & PRs',
    keys: ['g', 'r'],
    displayKeys: 'G then R',
    targetTab: 'repo'
  },
  {
    id: 'nav-bugs',
    label: 'Open Bug Tracker',
    category: 'Navigation',
    description: 'Switch to defect triage & developer fixes',
    keys: ['g', 'b'],
    displayKeys: 'G then B',
    targetTab: 'bugs'
  },
  {
    id: 'nav-chat',
    label: 'Open Team Chat',
    category: 'Navigation',
    description: 'Switch to real-time team collaboration channels',
    keys: ['g', 't'],
    displayKeys: 'G then T',
    targetTab: 'chat'
  },
  {
    id: 'nav-video',
    label: 'Open Video & Whiteboard',
    category: 'Navigation',
    description: 'Switch to conference & drawing canvas',
    keys: ['g', 'w'],
    displayKeys: 'G then W',
    targetTab: 'video'
  },
  {
    id: 'nav-team',
    label: 'Open Team Members',
    category: 'Navigation',
    description: 'Switch to team permissions & RBAC management',
    keys: ['g', 'm'],
    displayKeys: 'G then M',
    targetTab: 'team'
  },

  // ── Global Tools & Palettes ──
  {
    id: 'tool-command-palette',
    label: 'Command Palette',
    category: 'Global',
    description: 'Quickly find actions, views, and commands',
    keys: ['mod', 'k'],
    displayKeys: formatKeyCombo(['mod', 'k']),
  },
  {
    id: 'tool-global-search',
    label: 'Universal Search',
    category: 'Global',
    description: 'Search across tasks, bugs, PRs and code files',
    keys: ['/'],
    displayKeys: '/',
  },
  {
    id: 'tool-help-shortcuts',
    label: 'Keyboard Shortcuts Help',
    category: 'Global',
    description: 'Show all available keyboard shortcuts',
    keys: ['?'],
    displayKeys: '?',
  },
  {
    id: 'tool-toggle-theme',
    label: 'Toggle Dark / Light Mode',
    category: 'Global',
    description: 'Switch between glass dark and clean light theme',
    keys: ['mod', 'shift', 'l'],
    displayKeys: formatKeyCombo(['mod', 'shift', 'l']),
  },

  // ── Actions ──
  {
    id: 'action-save-file',
    label: 'Save Active File',
    category: 'Actions',
    description: 'Save current code buffer and update repository',
    keys: ['mod', 's'],
    displayKeys: formatKeyCombo(['mod', 's']),
  },
  {
    id: 'action-close-modal',
    label: 'Dismiss Dialog / Modal',
    category: 'Actions',
    description: 'Close the current active dialog or palette',
    keys: ['Escape'],
    displayKeys: 'Esc',
  }
];
