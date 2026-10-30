import React, { useState } from 'react';
import { Bot, Send, Sparkles, Check, FileCode, ShieldCheck } from 'lucide-react';

import { buildAIContext } from '../domain/ai/contextBuilder';
import { AIProvider, FreeLLMAPIProvider } from '../domain/ai/aiProvider';

export const DebugAIBot = ({
  currentFile,
  fileContent,
  activeTask,
  activeBug,
  onRequestReviewDiff
}) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'AI Assistant ready with strict diff review safeguard. Connected to FreeLLMAPI multi-provider gateway and fallback engine.'
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim() || isThinking) return;

    const userPromptText = prompt.trim();
    const userMsg = { id: `usr-${Date.now()}`, role: 'user', content: userPromptText };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setIsThinking(true);

    try {
      const context = buildAIContext({
        currentFile,
        fileContent,
        activeTask,
        activeBug
      });

      const response = await AIProvider.ask({ userPrompt: userPromptText, context });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        proposedCode: response.proposedCode,
        model: response.model
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `AI completion error: ${err.message}`
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-card, #121212)',
      borderLeft: '1px solid var(--border-color, #2a2a2a)'
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color, #2a2a2a)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: '0.85rem',
        fontWeight: 600
      }}>
        <Bot size={16} className="text-primary" />
        <span>Context AI Copilot</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.7rem',
          padding: '2px 8px',
          borderRadius: 8,
          background: 'rgba(34, 197, 94, 0.1)',
          color: '#22c55e',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <ShieldCheck size={12} /> Diff Protected
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map(msg => (
          <div 
            key={msg.id}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              fontSize: '0.85rem',
              background: msg.role === 'user' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color, #222)',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '90%'
            }}
          >
            <div>{msg.content}</div>

            {msg.proposedCode && onRequestReviewDiff && (
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => onRequestReviewDiff(msg.proposedCode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #3b82f6',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <FileCode size={14} /> Review Diff
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--border-color, #2a2a2a)', display: 'flex', gap: 8 }}>
        <input 
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI or request code changes..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--border-color, #333)',
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <button 
          onClick={handleSend}
          disabled={isThinking}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
