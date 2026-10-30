import React, { useState } from 'react';
import { Folder, Plus, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProjectsView = () => {
  const { projects = [], addProject, selectProject, selectedProjectId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (honeypot) return; // Honeypot spam trap
    if (!name.trim()) return;

    if (addProject) {
      addProject({
        name,
        description,
        deadline: deadline || null,
        status: 'Active'
      });
    }

    setName('');
    setDescription('');
    setDeadline('');
    setShowModal(false);
  };

  return (
    <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Project Portfolio</h1>
          <p style={{ color: 'var(--text-dim, #888)', fontSize: '0.875rem', marginTop: 4 }}>
            Manage projects with multi-tenant team isolation
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--primary, #3b82f6)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {projects.map(proj => {
          const isSelected = proj.id === selectedProjectId;
          return (
            <div
              key={proj.id}
              onClick={() => selectProject && selectProject(proj.id)}
              style={{
                padding: 20,
                borderRadius: 14,
                background: 'var(--bg-card, #121212)',
                border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-color, #2a2a2a)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Folder size={20} className="text-primary" />
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{proj.name}</span>
                </div>
                {isSelected && (
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>Active</span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim, #888)', margin: '0 0 16px 0', minHeight: 40 }}>
                {proj.description || 'No description provided.'}
              </p>
              {proj.deadline && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-dim, #888)' }}>
                  <Calendar size={14} />
                  <span>Target: {proj.deadline}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{
              width: '90vw',
              maxWidth: 480,
              background: 'var(--bg-card, #121212)',
              border: '1px solid var(--border-color, #2a2a2a)',
              borderRadius: 16,
              padding: 24
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 16px 0' }}>Create Project</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Spam Honeypot Field */}
              <input 
                type="text" 
                value={honeypot} 
                onChange={e => setHoneypot(e.target.value)} 
                tabIndex={-1} 
                autoComplete="off" 
                style={{ display: 'none' }} 
              />

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Project Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Core Engine Architecture"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color, #333)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe project objectives and scope..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color, #333)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Target Deadline (Optional)</label>
                <input 
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color, #333)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color, #333)',
                    background: 'transparent',
                    color: '#ccc',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#3b82f6',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
