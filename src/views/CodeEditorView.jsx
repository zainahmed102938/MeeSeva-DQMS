import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  FileCode, Play, Save, Check, Plus, Trash2, Bot, SplitSquareVertical, 
  Terminal, ShieldCheck, AlertCircle, FilePlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIDiffModal } from '../components/AIDiffModal';
import { DebugAIBot } from '../components/DebugAIBot';

export const CodeEditorView = () => {
  const { 
    currentProject, 
    codeFiles = [], 
    updateCodeFile, 
    activeTask, 
    activeBug, 
    showToast 
  } = useApp();

  const [activeFileId, setActiveFileId] = useState(codeFiles[0]?.id || 'main.js');
  const [editorCode, setEditorCode] = useState(codeFiles[0]?.content || '// Write code here\n');
  const [showAIPanel, setShowAIPanel] = useState(true);

  // AI Diff Modal State
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [proposedCode, setProposedCode] = useState('');

  const activeFile = codeFiles.find(f => f.id === activeFileId) || { id: 'file-1', filename: 'main.js', content: editorCode };

  useEffect(() => {
    if (activeFile) {
      setEditorCode(activeFile.content || '');
    }
  }, [activeFileId]);

  const handleSave = async () => {
    if (updateCodeFile && activeFile) {
      await updateCodeFile(activeFile.filename || 'main.js', editorCode);
      showToast({ type: 'success', message: `Saved ${activeFile.filename || 'file'}` });
    }
  };

  const onRequestReviewDiff = (newCode) => {
    setProposedCode(newCode);
    setShowDiffModal(true);
  };

  const handleApplyAIDiff = () => {
    setEditorCode(proposedCode);
    setShowDiffModal(false);
    showToast({ type: 'success', message: 'Applied AI proposed code changes to buffer' });
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#09090b', overflow: 'hidden' }}>
      {/* File Tree & Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Editor Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'var(--bg-card, #121212)',
          borderBottom: '1px solid var(--border-color, #2a2a2a)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileCode size={18} className="text-primary" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{activeFile.filename || 'main.js'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid var(--border-color, #333)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Save size={14} /> Save
            </button>
            <button
              onClick={() => setShowAIPanel(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #3b82f6',
                background: showAIPanel ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: '#60a5fa',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Bot size={14} /> AI Copilot
            </button>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage="javascript"
            value={editorCode}
            onChange={val => setEditorCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
        </div>
      </div>

      {/* Side AI Copilot */}
      {showAIPanel && (
        <div style={{ width: 360, height: '100%' }}>
          <DebugAIBot 
            currentFile={activeFile.filename}
            fileContent={editorCode}
            activeTask={activeTask}
            activeBug={activeBug}
            onRequestReviewDiff={onRequestReviewDiff}
          />
        </div>
      )}

      {/* Enforced AI Diff Review Modal */}
      <AIDiffModal
        isOpen={showDiffModal}
        filename={activeFile.filename}
        currentCode={editorCode}
        proposedCode={proposedCode}
        onApply={handleApplyAIDiff}
        onReject={() => setShowDiffModal(false)}
      />
    </div>
  );
};
