import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Square, Circle, Minus, ArrowRight, Type, Pen, Eraser, 
  RotateCcw, RotateCw, ZoomIn, ZoomOut, Check, AlertCircle, RefreshCw, Trash2
} from 'lucide-react';
import { Repository } from '../lib/repository';
import { DynamicStorage } from '../lib/supabase';

export const Whiteboard = ({ projectId, currentUser }) => {
  const currentProjectId = projectId || 'default';
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#3b82f6');
  const [lineWidth, setLineWidth] = useState(3);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);

  // Load whiteboard data
  const loadWhiteboardData = useCallback(async () => {
    if (!currentProjectId) return;
    setIsLoading(true);
    try {
      const localData = DynamicStorage.getItem(`cslm_wb_${currentProjectId}`, null);
      if (localData?.elements) {
        setElements(localData.elements);
        setHistory([localData.elements]);
        setHistoryIndex(0);
        if (localData.appState) {
          if (localData.appState.zoom) setZoom(localData.appState.zoom);
          if (localData.appState.pan) setPan(localData.appState.pan);
        }
      } else {
        const remoteBoards = await Repository.getAll('whiteboards', [], { projectId: currentProjectId });
        const board = remoteBoards.find(b => b.projectId === currentProjectId);
        if (board?.elements) {
          setElements(board.elements);
          setHistory([board.elements]);
          setHistoryIndex(0);
        }
      }
    } catch (e) {
      console.warn('Error loading whiteboard data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [currentProjectId]);

  useEffect(() => {
    loadWhiteboardData();
  }, [loadWhiteboardData]);

  // Persist whiteboard using Repository.upsert
  const persistWhiteboard = useCallback(async (currentElements, currentZoom = zoom, currentPan = pan) => {
    if (!currentProjectId) return;
    setSaveStatus('saving');

    const docRecord = {
      id: `wb-${currentProjectId}`,
      projectId: currentProjectId,
      elements: currentElements,
      appState: { zoom: currentZoom, pan: currentPan },
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.id || 'anonymous'
    };

    DynamicStorage.setItem(`cslm_wb_${currentProjectId}`, docRecord);

    try {
      const res = await Repository.upsert('whiteboards', docRecord, 'id');
      if (res && res.error) {
        setSaveStatus('error');
      } else {
        setSaveStatus(res?.remote ? 'saved_server' : 'saved_local');
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    } catch (err) {
      console.warn('[Whiteboard] Remote persist notice:', err);
      setSaveStatus('error');
    }
  }, [currentProjectId, zoom, pan, currentUser]);

  const pushHistory = useCallback((newElements) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newElements);
    if (updatedHistory.length > 25) updatedHistory.shift();
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setElements(newElements);
    persistWhiteboard(newElements);
  }, [history, historyIndex, persistWhiteboard]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setElements(history[prevIndex]);
      persistWhiteboard(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
      persistWhiteboard(history[nextIndex]);
    }
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    return {
      x: ((clientX - rect.left) / zoom) - pan.x,
      y: ((clientY - rect.top) / zoom) - pan.y
    };
  };

  // Redraw canvas with high-DPI
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    const allElements = currentElement ? [...elements, currentElement] : elements;

    allElements.forEach(el => {
      ctx.strokeStyle = el.color || '#3b82f6';
      ctx.fillStyle = el.color || '#3b82f6';
      ctx.lineWidth = el.lineWidth || 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'pen' && el.points?.length > 1) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === 'rect') {
        ctx.strokeRect(el.x, el.y, el.w, el.h);
      } else if (el.type === 'circle') {
        ctx.beginPath();
        const radius = Math.sqrt(el.w * el.w + el.h * el.h);
        ctx.arc(el.x, el.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (el.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(el.x + el.w, el.y + el.h);
        ctx.stroke();
      }
    });

    ctx.restore();
  }, [elements, currentElement, zoom, pan]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // ResizeObserver for responsive high-DPI backing bitmap
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      redrawCanvas();
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [redrawCanvas]);

  const eraseAtPoint = (point) => {
    const remaining = elements.filter(el => {
      if (el.type === 'pen') {
        return !el.points.some(p => Math.hypot(p.x - point.x, p.y - point.y) < 15);
      }
      if (el.type === 'rect') {
        return !(point.x >= el.x && point.x <= el.x + el.w && point.y >= el.y && point.y <= el.y + el.h);
      }
      return true;
    });

    if (remaining.length !== elements.length) {
      pushHistory(remaining);
    }
  };

  const handlePointerDown = (e) => {
    const p = getCanvasCoords(e);
    if (tool === 'eraser') {
      setIsDrawing(true);
      eraseAtPoint(p);
      return;
    }

    setIsDrawing(true);
    if (tool === 'pen') {
      setCurrentElement({ type: 'pen', points: [p], color, lineWidth });
    } else {
      setCurrentElement({ type: tool, x: p.x, y: p.y, w: 0, h: 0, color, lineWidth });
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    const p = getCanvasCoords(e);

    if (tool === 'eraser') {
      eraseAtPoint(p);
      return;
    }

    if (tool === 'pen') {
      setCurrentElement(prev => prev ? { ...prev, points: [...prev.points, p] } : null);
    } else if (currentElement) {
      setCurrentElement(prev => ({
        ...prev,
        w: p.x - prev.x,
        h: p.y - prev.y
      }));
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentElement) {
      pushHistory([...elements, currentElement]);
      setCurrentElement(null);
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#09090b' }}>
      {/* Floating Toolbar */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        background: 'rgba(24, 24, 27, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        zIndex: 10,
        boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
      }}>
        <button 
          className={`btn-icon ${tool === 'pen' ? 'active' : ''}`}
          onClick={() => setTool('pen')}
          style={{ background: tool === 'pen' ? 'rgba(59, 130, 246, 0.2)' : 'none', border: 'none', color: '#fff', padding: 6, borderRadius: 6, cursor: 'pointer' }}
          title="Pen"
        >
          <Pen size={18} />
        </button>
        <button 
          className={`btn-icon ${tool === 'rect' ? 'active' : ''}`}
          onClick={() => setTool('rect')}
          style={{ background: tool === 'rect' ? 'rgba(59, 130, 246, 0.2)' : 'none', border: 'none', color: '#fff', padding: 6, borderRadius: 6, cursor: 'pointer' }}
          title="Rectangle"
        >
          <Square size={18} />
        </button>
        <button 
          className={`btn-icon ${tool === 'circle' ? 'active' : ''}`}
          onClick={() => setTool('circle')}
          style={{ background: tool === 'circle' ? 'rgba(59, 130, 246, 0.2)' : 'none', border: 'none', color: '#fff', padding: 6, borderRadius: 6, cursor: 'pointer' }}
          title="Circle"
        >
          <Circle size={18} />
        </button>
        <button 
          className={`btn-icon ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool('eraser')}
          style={{ background: tool === 'eraser' ? 'rgba(239, 68, 68, 0.2)' : 'none', border: 'none', color: '#fff', padding: 6, borderRadius: 6, cursor: 'pointer' }}
          title="Eraser"
        >
          <Eraser size={18} />
        </button>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

        <button onClick={handleUndo} disabled={historyIndex <= 0} style={{ background: 'none', border: 'none', color: historyIndex <= 0 ? '#444' : '#fff', padding: 6, cursor: 'pointer' }}>
          <RotateCcw size={16} />
        </button>
        <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} style={{ background: 'none', border: 'none', color: historyIndex >= history.length - 1 ? '#444' : '#fff', padding: 6, cursor: 'pointer' }}>
          <RotateCw size={16} />
        </button>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

        <div style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
          {saveStatus === 'saving' && <span>Saving...</span>}
          {saveStatus === 'saved_server' && <span style={{ color: '#22c55e' }}>Saved (Cloud)</span>}
          {saveStatus === 'saved_local' && <span style={{ color: '#3b82f6' }}>Saved (Local)</span>}
          {saveStatus === 'error' && <span style={{ color: '#ef4444' }}>Save Error</span>}
        </div>
      </div>

      <canvas 
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
      />
    </div>
  );
};
