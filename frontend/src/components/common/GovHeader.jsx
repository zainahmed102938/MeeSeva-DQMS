import React from 'react';
import TelanganaEmblem from './TelanganaEmblem';
import { Sparkles, Volume2, LogOut, Sun, Moon, PhoneCall } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Standardized Government of Telangana Portal Header
 * Provides institutional branding, accessibility controls, user context, and action triggers.
 * Fully adapts to active visual theme (Light/Dark) using institutional design tokens.
 */
export default function GovHeader({
  role = 'CITIZEN', // 'CITIZEN' | 'OFFICIAL'
  user = null,
  onOpenAiAssistant = null,
  onLogout = null,
  onPlayChime = null,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
  contextTitle = null,
  contextSubtitle = null
}) {
  const { theme: contextTheme, toggleTheme: contextToggleTheme } = useTheme();
  const theme = propTheme || contextTheme;
  const onToggleTheme = propToggleTheme || contextToggleTheme;

  const profile = user?.profile || {};
  const isOfficial = role === 'OFFICIAL';
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] shadow-sm text-[var(--text-primary)]">
      {/* 1. Tricolor State Accent Ribbon */}
      <div className="w-full h-1 flex">
        <div className="h-full w-1/3 bg-amber-500" />
        <div className="h-full w-1/3 bg-slate-100" />
        <div className="h-full w-1/3 bg-emerald-600" />
      </div>

      {/* 2. Top Institutional Utility Strip */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs py-1.5 px-3 sm:px-4 md:px-8 text-[var(--text-secondary)]">
        <div className="gov-container flex flex-wrap items-center justify-between gap-2 p-0">
          {/* Official Entity Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-medium text-[var(--text-secondary)] min-w-0">
            <span className="font-semibold text-[var(--text-primary)] truncate">GOVERNMENT OF TELANGANA</span>
            <span className="text-[var(--border-strong)] hidden sm:inline">|</span>
            <span className="text-[var(--text-muted)] font-normal hidden sm:inline">తెలంగాణ ప్రభుత్వం</span>
          </div>

          {/* Utility Tools: Helpline & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-[var(--text-secondary)]">
              <PhoneCall className="w-3 h-3 text-amber-500 shrink-0" />
              <span>MeeSeva Helpline: <strong>1100</strong> / <strong>1800-425-1110</strong></span>
            </div>

            {onPlayChime && (
              <button
                onClick={onPlayChime}
                type="button"
                className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition px-1.5 py-0.5 rounded hover:bg-[var(--border-subtle)] cursor-pointer"
                title="Test announcement chime sound"
                aria-label="Test announcement audio chime"
              >
                <Volume2 className="w-3 h-3 shrink-0" />
                <span className="hidden md:inline">Chime</span>
              </button>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                type="button"
                className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition px-2 py-0.5 rounded hover:bg-[var(--border-subtle)] cursor-pointer border border-[var(--border-subtle)]"
                title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
                aria-label="Toggle visual theme"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-medium text-[11px]">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium text-[11px]">Dark</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Application Identity & Actions Bar */}
      <div className="gov-container py-2.5 md:py-3.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        {/* Brand & Organization Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <TelanganaEmblem size={40} className="w-9 h-9 md:w-11 md:h-11 shrink-0" />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base md:text-lg tracking-tight text-[var(--text-primary)]">
                MeeSeva DQMS
              </span>
              <span
                className={`gov-badge text-[10px] py-0.5 px-2 ${
                  isOfficial ? 'gov-badge-gold' : 'gov-badge-info'
                }`}
              >
                {isOfficial ? (profile.role || 'OFFICIAL OPERATIONS') : 'CITIZEN SERVICES'}
              </span>
            </div>
            
            <p className="text-[11px] sm:text-xs text-[var(--text-muted)] leading-tight truncate mt-0.5">
              {contextTitle || (isOfficial 
                ? `${profile.officeName || 'MeeSeva Center'} • ${profile.districtName || 'Telangana'}`
                : 'Digital Queue Management System • వర్చువల్ క్యూ సేవలు')}
            </p>
          </div>
        </div>

        {/* Action Controls & User Identity */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* AI Advisor Button */}
          {onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              type="button"
              className="gov-btn gov-btn-secondary gov-btn-sm"
              title={isOfficial ? 'AI Operations Digest' : 'Ask MeeSeva AI Sahayak'}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isOfficial ? 'text-amber-500' : 'text-blue-600 dark:text-blue-400'}`} />
              <span className="hidden sm:inline">
                {isOfficial ? 'Operations Digest' : 'AI Sahayak'}
              </span>
            </button>
          )}

          {/* User Profile Context */}
          {user && (
            <div className="hidden sm:flex flex-col text-right pl-2 border-l border-[var(--border-default)]">
              <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                {profile.name || (isOfficial ? 'Official Desk' : 'Citizen')}
              </span>
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                {isOfficial 
                  ? (profile.assignedCounter ? `${profile.assignedCounter} • ${profile.departmentId || 'REV'}` : profile.email)
                  : `+91 ${profile.mobileNumber || ''}`}
              </span>
            </div>
          )}

          {/* Official Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              className="gov-btn gov-btn-danger gov-btn-sm"
              title="End session and log out"
              aria-label="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
