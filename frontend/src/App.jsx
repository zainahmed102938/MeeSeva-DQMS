import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import Telangana3DIntro from './components/3d/Telangana3DIntro';
import AuthView from './views/AuthView';

const CitizenPortalView = lazy(() => import('./views/CitizenPortalView'));
const OfficialPortalView = lazy(() => import('./views/OfficialPortalView'));
const MeeSevaAISahayak = lazy(() => import('./components/MeeSevaAISahayak'));

const INTRO_SESSION_KEY = 'meeseva_intro_seen_v2';

function readIntroSeen() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(INTRO_SESSION_KEY) === '1';
    }
  } catch {
    // Ignore storage restriction errors
  }
  return false;
}

function markIntroSeen(seen = true) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (seen) {
        window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
      } else {
        window.sessionStorage.removeItem(INTRO_SESSION_KEY);
      }
    }
  } catch {
    // Ignore storage restriction errors
  }
}

function AppContent() {
  const { isAuthenticated, isCitizen, isOfficial, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [introCompleted, setIntroCompleted] = useState(() => readIntroSeen());
  const [isAiOpen, setIsAiOpen] = useState(false);

  // If user is already authenticated from prior session, skip intro directly to portal
  useEffect(() => {
    if (isAuthenticated) {
      markIntroSeen(true);
      setIntroCompleted(true);
    }
  }, [isAuthenticated]);

  const handleIntroComplete = useCallback(() => {
    markIntroSeen(true);
    setIntroCompleted(true);
  }, []);

  const handleReplayIntro = useCallback(() => {
    markIntroSeen(false);
    setIntroCompleted(false);
  }, []);

  if (isLoading) {
    return null;
  }

  // 1. Short Cinematic Intro (Application launch -> 6.5s 4-scene intro -> Split-Screen Login)
  if (!introCompleted && !isAuthenticated) {
    return (
      <Telangana3DIntro
        theme={theme}
        onComplete={handleIntroComplete}
      />
    );
  }

  // 2. Main Portal Routing
  return (
    <div className="relative min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans overflow-x-hidden">
      {/* Government Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Suspense
        fallback={
          <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-6">
            <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-secondary)]">
              <span className="w-4 h-4 rounded-full border-2 border-[var(--gov-primary)] border-t-transparent animate-spin" />
              <span>Loading Portal View...</span>
            </div>
          </div>
        }
      >
        {!isAuthenticated ? (
          <AuthView
            onLoginSuccess={handleIntroComplete}
            onReplayIntro={handleReplayIntro}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        ) : isCitizen ? (
          <CitizenPortalView
            onOpenAiAssistant={() => setIsAiOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        ) : isOfficial ? (
          <OfficialPortalView
            onOpenAiAssistant={() => setIsAiOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        ) : (
          <AuthView
            onLoginSuccess={handleIntroComplete}
            onReplayIntro={handleReplayIntro}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {/* Global AI Assistant Modal (mounted only when opened) */}
        {isAiOpen && (
          <MeeSevaAISahayak
            isOpen={isAiOpen}
            onClose={() => setIsAiOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueueProvider>
          <AppContent />
        </QueueProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

