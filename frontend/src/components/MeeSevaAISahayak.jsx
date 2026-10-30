import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FreeLLMAPIProvider } from '../domain/ai/aiProvider';
import { Sparkles, Send, X, Bot, Shield, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const CITIZEN_SAMPLE_PROMPTS = [
  'What documents are needed for an Income Certificate in Telangana?',
  'What is the procedure for Caste / Community Certificate?',
  'How do I book an LLR slot for driving license in RTA?',
  'How can I add a family member to my Telangana Ration Card?',
  'What are MeeSeva office working hours?'
];

const OFFICIAL_SAMPLE_PROMPTS = [
  'Analyze today\'s counter wait times and suggest optimal staffing.',
  'How to resolve peak hour congestion in Revenue services?',
  'Summarize standard operating procedure for handling No-Show citizens.'
];

export default function MeeSevaAISahayak({ isOpen, onClose }) {
  const { user, isCitizen } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init-msg',
      role: 'assistant',
      content: isCitizen
        ? 'Namaskaram! I am your MeeSeva Digital Sahayak (మీసేవ సహాయక్). I can assist you with document requirements, application procedures, and queue guidelines across all 33 Telangana districts. How may I help you today?'
        : 'Welcome, Officer. I am the MeeSeva Operations AI Copilot. I can assist with counter load balancing, service throughput analytics, and queue policy guidelines.'
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const query = (textToSend || prompt).trim();
    if (!query || isThinking) return;

    const userMsg = { id: `usr-${Date.now()}`, role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsThinking(true);

    try {
      const systemInstruction = `You are MeeSeva Digital Sahayak, an official AI assistant for the Government of Telangana Digital Queue Management System (DQMS).
You guide citizens and officers across all 33 Telangana districts with extreme accuracy, clarity, and respect.
You know about:
- Revenue Department (Income, Caste, Residence, Legal Heir, EC, Pahani, OBCC certificates)
- Civil Registration & Municipal (Birth, Death, Property Tax, Trade License, Water Connection)
- Transport Department RTA (LLR slots, Driving License Renewal, Vehicle Transfer)
- Civil Supplies (Ration Card, Member Addition, Address Modification)
- Electricity Utilities (TSPDCL/TSNPDCL bill payment, New Connections)
Provide clear bullet points and accurate document checklists.`;

      // Call FreeLLMAPI abstraction
      const res = await FreeLLMAPIProvider.generateCompletion({
        userPrompt: query,
        context: {
          systemInstruction,
          raw: {
            userType: user?.type,
            userProfile: user?.profile
          }
        }
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.text,
        model: res.model
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Unable to complete AI response: ${err.message}. (FreeLLMAPI fallback engine active)`
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const samplePrompts = isCitizen ? CITIZEN_SAMPLE_PROMPTS : OFFICIAL_SAMPLE_PROMPTS;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-sahayak-title"
      className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-950/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg h-[90vh] gov-card p-5 border border-[var(--border-default)] shadow-2xl flex flex-col justify-between bg-[var(--surface)] text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[var(--gov-primary)] flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 id="ai-sahayak-title" className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <span>{isCitizen ? 'MeeSeva Digital Sahayak' : 'AI Operations Copilot'}</span>
                <span className="gov-badge gov-badge-info text-[10px] py-0 px-1.5 font-mono">
                  State AI Engine
                </span>
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">Telangana Government Intelligent Guidance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Assistant"
            type="button"
            className="p-1.5 rounded-lg bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer border border-[var(--border-subtle)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded bg-[var(--gov-primary-light)] text-[var(--gov-primary)] border border-[var(--border-default)] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[var(--gov-primary)] text-white rounded-tr-none'
                    : 'bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                {m.model && (
                  <div className="mt-1.5 text-[10px] text-[var(--text-muted)] font-mono text-right">
                    Engine: {m.model}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-2.5 items-center text-[var(--text-muted)] text-xs">
              <div className="w-6 h-6 rounded bg-[var(--gov-primary-light)] text-[var(--gov-primary)] border border-[var(--border-default)] flex items-center justify-center animate-spin">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-[11px]">Consulting Telangana MeeSeva Knowledge Base...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] border-t border-[var(--border-subtle)]">
          {samplePrompts.slice(0, 3).map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(promptText)}
              type="button"
              className="px-2.5 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-default)] hover:border-[var(--gov-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition cursor-pointer text-[10px]"
            >
              {promptText.length > 35 ? promptText.slice(0, 35) + '...' : promptText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-3 border-t border-[var(--border-subtle)] flex gap-2"
        >
          <input
            id="ai-prompt-input"
            name="aiPromptInput"
            aria-label="Ask MeeSeva AI question"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isCitizen ? 'Ask about certificates, documents, or queue status...' : 'Ask about counter operations or queue telemetry...'}
            className="gov-input flex-1 min-h-[40px] text-xs py-2 px-3"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isThinking}
            className="gov-btn gov-btn-primary min-h-[40px] px-4 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
