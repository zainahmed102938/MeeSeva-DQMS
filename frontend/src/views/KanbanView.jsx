import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, PlayCircle, MoreHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ContextMenu } from '../components/ContextMenu';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

export const KanbanView = () => {
  const { 
    allTasks = [], 
    allowedProjectIds = [], 
    selectedProjectId, 
    moveTask, 
    addTask, 
    showToast 
  } = useApp();

  const [filterMode, setFilterMode] = useState('project'); // 'project' or 'all'
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [targetColumn, setTargetColumn] = useState('To Do');

  // Filter tasks based on view mode and allowed projects
  const displayedTasks = filterMode === 'all'
    ? allTasks.filter(t => allowedProjectIds.includes(t.projectId))
    : allTasks.filter(t => t.projectId === selectedProjectId);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    if (moveTask) {
      const moved = await moveTask(taskId, newStatus, null, 'kanban');
      if (moved) {
        showToast({ type: 'success', message: `Task moved to ${newStatus}` });
      }
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (addTask) {
      addTask({
        title: taskTitle,
        status: targetColumn,
        projectId: selectedProjectId,
        priority: 'Medium'
      });
      showToast({ type: 'success', message: 'Task created successfully' });
    }

    setTaskTitle('');
    setShowAddModal(false);
  };

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Kanban Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Agile Kanban Board</h1>
          <p style={{ color: 'var(--text-dim, #888)', fontSize: '0.85rem', marginTop: 4 }}>
            Centralized movement audit trail & actor attribution
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 2, border: '1px solid var(--border-color, #333)' }}>
            <button
              onClick={() => setFilterMode('project')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: filterMode === 'project' ? '#3b82f6' : 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Current Project
            </button>
            <button
              onClick={() => setFilterMode('all')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: filterMode === 'all' ? '#3b82f6' : 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              All Projects
            </button>
          </div>

          <button
            onClick={() => { setTargetColumn('To Do'); setShowAddModal(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Columns Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, overflowX: 'auto', minHeight: 400 }}>
        {COLUMNS.map(col => {
          const colTasks = displayedTasks.filter(t => t.status === col);
          return (
            <div
              key={col}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
              style={{
                background: 'var(--bg-card, #121212)',
                borderRadius: 14,
                border: '1px solid var(--border-color, #2a2a2a)',
                display: 'flex',
                flexDirection: 'column',
                padding: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-color, #222)', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{col}</span>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim, #888)' }}>
                  {colTasks.length}
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
                    style={{
                      padding: 12,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color, #262626)',
                      borderRadius: 10,
                      cursor: 'grab'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 8 }}>{task.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim, #888)' }}>
                      <span>{task.priority || 'Medium'}</span>
                      <ContextMenu 
                        items={COLUMNS.filter(c => c !== col).map(target => ({
                          label: `Move to ${target}`,
                          onClick: async () => {
                            const moved = await moveTask(task.id, target, null, 'kanban');
                            if (moved) {
                              showToast({ type: 'success', message: `Task moved to ${target}` });
                            }
                          }
                        }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div 
            style={{
              width: '90vw',
              maxWidth: 440,
              background: 'var(--bg-card, #121212)',
              border: '1px solid var(--border-color, #2a2a2a)',
              borderRadius: 16,
              padding: 24
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Create New Task</h3>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input 
                type="text"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="Task title..."
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #333', background: 'transparent', color: '#ccc', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
