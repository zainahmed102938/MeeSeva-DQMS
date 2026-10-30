import React, { useRef, useEffect, useState, useCallback } from 'react';
import TelanganaEmblem from '../common/TelanganaEmblem';
import TelanganaBackground3D from './TelanganaBackground3D';
import {
  useAnime,
  createLandingTimeline,
  prefersReducedMotion
} from '../../animations';
import { useTheme } from '../../context/ThemeContext';
import {
  FileCheck2,
  Droplets,
  Route,
  Building2,
  Smartphone,
  ShieldCheck,
  Network,
  CheckCircle2,
  SkipForward,
  ArrowRight
} from 'lucide-react';

const CIVIC_NEEDS_CARDS = [
  {
    id: 'rev',
    code: 'REV-01',
    title: 'Revenue & Land Records',
    detail: 'Income, Caste, Nativity & Land Mutation',
    icon: FileCheck2,
    accentClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25'
  },
  {
    id: 'mun',
    code: 'MUN-02',
    title: 'Water & Municipal Civic Works',
    detail: 'Water Supply, Sanitation & Civil Registry',
    icon: Droplets,
    accentClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
  },
  {
    id: 'rta',
    code: 'RTA-03',
    title: 'Roads, Transit & Transport',
    detail: 'Road Safety, Licenses & Permit Workflows',
    icon: Route,
    accentClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25'
  },
  {
    id: 'civ',
    code: 'CIV-04',
    title: 'Public Welfare & Utilities',
    detail: 'Civil Supplies, Ration & Power Grids',
    icon: Building2,
    accentClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25'
  }
];

const COORDINATION_PIPELINE = [
  {
    step: '01',
    label: 'Citizen Report & Request',
    sub: 'Mobile & Center Intake',
    icon: Smartphone
  },
  {
    step: '02',
    label: 'Automated Verification',
    sub: 'Document & Jurisdiction Check',
    icon: ShieldCheck
  },
  {
    step: '03',
    label: 'Multi-Sector Coordination',
    sub: 'Govt Depts • Institutions • Hubs',
    icon: Network
  },
  {
    step: '04',
    label: 'Actionable Resolution',
    sub: 'Live E-Token & Desk Fulfillment',
    icon: CheckCircle2
  }
];

const SCENE_LABELS = {
  1: 'Scene 1/4 • Opening Identity',
  2: 'Scene 2/4 • Community & Civic Needs',
  3: 'Scene 3/4 • Intelligent Coordination',
  4: 'Scene 4/4 • Launching Portal Gateway'
};

export default function Telangana3DIntro({ onComplete, theme: propTheme }) {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;
  const [progress, setProgress] = useState(0);
  const [activeScene, setActiveScene] = useState(1);
  const isTransitioningRef = useRef(false);

  const { stopAll } = useAnime();

  const sceneProxyRef = useRef({
    particleOpacity: 0,
    nodeScale: 0,
    glowIntensity: 0
  });

  // DOM refs for 4-scene choreography
  const overlayRef = useRef(null);
  const emblemRef = useRef(null);
  const subtitleRef = useRef(null);
  const teluguRef = useRef(null);
  const scene2Ref = useRef(null);
  const scene3Ref = useRef(null);
  const telemetryRef = useRef(null);
  const controlsRef = useRef(null);

  const tlRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Unified exit transition handler (Skip or natural completion)
  const handleTransition = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    stopAll();
    try {
      tlRef.current?.pause?.();
    } catch {
      // Ignore pause errors
    }

    if (overlayRef.current && !prefersReducedMotion()) {
      overlayRef.current.style.transition = 'opacity 200ms cubic-bezier(0.22, 1, 0.36, 1)';
      overlayRef.current.style.opacity = '0';
      setTimeout(() => {
        onCompleteRef.current?.();
      }, 210);
    } else {
      onCompleteRef.current?.();
    }
  }, [stopAll]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        handleTransition();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const titleChars = overlayRef.current?.querySelectorAll('.intro-char') || [];
    const scene2Cards = scene2Ref.current?.querySelectorAll('.scene2-card') || [];
    const scene3Nodes = scene3Ref.current?.querySelectorAll('.scene3-node') || [];
    const telemetryBadges = telemetryRef.current?.querySelectorAll('.telemetry-badge') || [];

    const tl = createLandingTimeline({
      targets: {
        overlay: overlayRef.current,
        emblem: emblemRef.current,
        titleChars: Array.from(titleChars),
        subtitle: subtitleRef.current,
        telugu: teluguRef.current,
        scene2Cards: Array.from(scene2Cards),
        scene3Nodes: Array.from(scene3Nodes),
        telemetryBadges: Array.from(telemetryBadges),
        controls: controlsRef.current
      },
      sceneProxy: sceneProxyRef.current,
      callbacks: {
        onProgress: (p) => setProgress(p),
        onSceneChange: (s) => setActiveScene(s),
        onTransitionStart: () => setActiveScene(4),
        onComplete: () => {
          if (!isTransitioningRef.current) {
            isTransitioningRef.current = true;
            onCompleteRef.current?.();
          }
        }
      }
    });
    tlRef.current = tl;

    // Hard failsafe timer: guarantees the intro never hangs or exceeds ~7 seconds
    const failsafeTimer = setTimeout(() => {
      if (!isTransitioningRef.current) {
        isTransitioningRef.current = true;
        onCompleteRef.current?.();
      }
    }, prefersReducedMotion() ? 1200 : 7000);

    return () => {
      clearTimeout(failsafeTimer);
      window.removeEventListener('keydown', handleKeyDown);
      stopAll();
      try {
        tl?.pause?.();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [handleTransition, stopAll]);

  const isReduced = prefersReducedMotion();
  const initialHidden = isReduced ? {} : { opacity: 0 };

  return (
    <div
      ref={overlayRef}
      className="relative w-full min-h-screen overflow-x-hidden overflow-y-auto bg-[var(--bg-page)] text-[var(--text-primary)] select-none flex flex-col justify-between"
    >
      {/* Lightweight Hardware-Composited Institutional Backdrop */}
      <TelanganaBackground3D variant="citizen" theme={theme} />

      {/* Top Tricolor Accent Ribbon */}
      <div className="w-full h-1 flex shrink-0">
        <div className="h-full w-1/3 bg-amber-500" />
        <div className="h-full w-1/3 bg-slate-200 dark:bg-slate-700" />
        <div className="h-full w-1/3 bg-emerald-600" />
      </div>

      {/* Top Header Strip with Always-Visible Skip Intro Button */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-5 flex flex-wrap items-center justify-between gap-2 z-10 shrink-0">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
          <span className="font-semibold uppercase tracking-wider">
            {SCENE_LABELS[activeScene] || SCENE_LABELS[1]}
          </span>
        </div>

        <button
          onClick={handleTransition}
          type="button"
          className="gov-btn gov-btn-secondary gov-btn-sm cursor-pointer shadow-xs"
          aria-label="Skip introductory sequence and go to login"
        >
          <span>Skip Intro</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Central 4-Scene Cinematic Stage */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 my-auto flex flex-col items-center gap-5 sm:gap-6 z-10">
        {/* ================================================================
            SCENE 1: OPENING IDENTITY
            ================================================================ */}
        <section
          aria-label="Opening Identity"
          className="flex flex-col items-center text-center gap-2.5 sm:gap-3 w-full"
        >
          <div
            ref={emblemRef}
            style={initialHidden}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs max-w-full"
          >
            <TelanganaEmblem size={24} className="w-6 h-6 shrink-0" />
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase">
              <span>Government of Telangana</span>
              <span className="text-[var(--border-strong)] hidden sm:inline">|</span>
              <span className="text-[var(--gov-emerald)] font-medium">తెలంగాణ ప్రభుత్వం</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 leading-tight">
            <span className="inline-flex text-[var(--text-primary)]">
              {'MeeSeva'.split('').map((char, idx) => (
                <span key={`m-${idx}`} className="intro-char inline-block" style={initialHidden}>
                  {char}
                </span>
              ))}
            </span>
            <span className="inline-flex text-[var(--gov-primary)]">
              {'DQMS'.split('').map((char, idx) => (
                <span key={`d-${idx}`} className="intro-char inline-block" style={initialHidden}>
                  {char}
                </span>
              ))}
            </span>
          </h1>

          <p
            ref={subtitleRef}
            style={initialHidden}
            className="text-xs sm:text-sm md:text-base text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed"
          >
            Turning community civic challenges and citizen service requests into verified, zero-wait departmental resolutions across all 33 Telangana districts.
          </p>

          <div
            ref={teluguRef}
            style={initialHidden}
            className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-400 font-medium tracking-wide"
          >
            మీసేవ డిజిటల్ క్యూ మరియు పౌర సేవా సమన్వయ వేదిక • వేచి ఉండే సమయంలేని సేవలు
          </div>
        </section>

        {/* ================================================================
            SCENE 2: COMMUNITY & CIVIC SERVICE NEEDS
            ================================================================ */}
        <section
          ref={scene2Ref}
          aria-label="Community and Civic Service Domains"
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3"
        >
          {CIVIC_NEEDS_CARDS.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                style={initialHidden}
                className="scene2-card p-3 sm:p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex items-start gap-3 min-w-0"
              >
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${card.accentClass}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {card.code}
                    </span>
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug mt-0.5 break-words">
                    {card.title}
                  </h2>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5 break-words">
                    {card.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* ================================================================
            SCENE 3: INTELLIGENT MULTI-SECTOR COORDINATION WORKFLOW
            ================================================================ */}
        <section
          ref={scene3Ref}
          aria-label="Intelligent Coordination Workflow"
          className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-3.5 sm:p-4 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
            <span className="font-bold uppercase tracking-wider text-[var(--gov-primary)]">
              Intelligent Civic Coordination Workflow
            </span>
            <span>Citizens • Institutions • Govt Departments • Service Centers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {COORDINATION_PIPELINE.map((node, index) => {
              const NodeIcon = node.icon;
              return (
                <div
                  key={node.step}
                  style={initialHidden}
                  className="scene3-node relative p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center gap-3 min-w-0"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--gov-primary)] text-white flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                    <NodeIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono font-bold text-[var(--gov-primary)] uppercase">
                      Step {node.step}
                    </div>
                    <div className="text-xs font-bold text-[var(--text-primary)] leading-tight break-words">
                      {node.label}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5 break-words">
                      {node.sub}
                    </div>
                  </div>
                  {index < COORDINATION_PIPELINE.length - 1 && (
                    <ArrowRight className="hidden lg:block w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================
            SCENE 4: LIVE TELEMETRY & PORTAL HANDOFF
            ================================================================ */}
        <div
          ref={telemetryRef}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3.5 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] text-[11px] font-mono text-[var(--text-secondary)]"
        >
          <span
            className="telemetry-badge flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400"
            style={initialHidden}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            33 DISTRICTS CONNECTED
          </span>
          <span className="text-[var(--border-strong)] hidden sm:inline">|</span>
          <span className="telemetry-badge" style={initialHidden}>
            5 STATE DEPARTMENTS
          </span>
          <span className="text-[var(--border-strong)] hidden sm:inline">|</span>
          <span
            className="telemetry-badge text-[var(--gov-primary)] font-semibold"
            style={initialHidden}
          >
            ZERO-WAIT VIRTUAL E-TOKEN ENGINE
          </span>
        </div>
      </main>

      {/* Bottom Progress & Skip Controls */}
      <footer
        ref={controlsRef}
        style={initialHidden}
        className="w-full max-w-xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col items-center gap-2.5 z-10 shrink-0"
      >
        <div
          className="w-full h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Introductory sequence progress"
        >
          <div
            className="h-full bg-[var(--gov-primary)] transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between w-full gap-2 text-[11px] text-[var(--text-tertiary)]">
          <span className="font-mono">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)]">ENTER</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)]">SPACE</kbd> to skip
          </span>
          <span className="font-mono font-semibold text-[var(--gov-primary)]">
            {progress}% • {activeScene === 4 ? 'OPENING LOGIN GATEWAY' : 'SYNCHRONIZING'}
          </span>
        </div>
      </footer>
    </div>
  );
}

