import React, { useState } from 'react';
import { Shield, KeyRound, Lock, ArrowRight, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GhibliLoginView = () => {
  const { login, verifyMfaCode, requiresMfa, authError } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return; // Silent discard for automated bot submissions

    setIsSubmitting(true);
    try {
      if (requiresMfa) {
        if (verifyMfaCode) await verifyMfaCode(mfaCode);
      } else {
        if (login) await login(identifier, password);
      }
    } catch (_) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.08), transparent 70%), #09090b',
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        padding: 32,
        background: 'var(--bg-card, #121212)',
        border: '1px solid var(--border-color, #2a2a2a)',
        borderRadius: 20,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <Shield size={24} className="text-primary" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Secure Workspace Login</h1>
          <p style={{ color: 'var(--text-dim, #888)', fontSize: '0.85rem', marginTop: 4 }}>
            Zero-leakage session architecture & MFA
          </p>
        </div>

        {authError && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.8rem', marginBottom: 16 }}>
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Honeypot field */}
          <input 
            type="text" 
            value={honeypot} 
            onChange={e => setHoneypot(e.target.value)} 
            style={{ display: 'none' }} 
            tabIndex={-1} 
            autoComplete="off" 
          />

          {!requiresMfa ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Username or Email</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    required
                    placeholder="admin or user@domain.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: 10,
                      border: '1px solid var(--border-color, #333)',
                      background: 'rgba(0,0,0,0.4)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: 10,
                      border: '1px solid var(--border-color, #333)',
                      background: 'rgba(0,0,0,0.4)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>6-Digit 2FA Verification Code</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color, #333)',
                    background: 'rgba(0,0,0,0.4)',
                    color: '#fff',
                    fontSize: '1.1rem',
                    letterSpacing: '0.2em',
                    outline: 'none'
                  }}
                />
                <KeyRound size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 6
            }}
          >
            <span>{requiresMfa ? 'Verify Security Token' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
