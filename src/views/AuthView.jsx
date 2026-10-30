import React, { useState, useEffect } from 'react';
import { useAuth, OFFICIAL_ROSTER } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TelanganaBackground3D from '../components/3d/TelanganaBackground3D';
import TelanganaEmblem from '../components/common/TelanganaEmblem';
import {
  Smartphone,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  ShieldCheck,
  Clock,
  MapPin,
  PlayCircle,
  FileCheck2
} from 'lucide-react';

export default function AuthView({
  onLoginSuccess,
  onReplayIntro,
  theme: propTheme,
  onToggleTheme: propToggleTheme
}) {
  const { theme: contextTheme, toggleTheme: contextToggleTheme } = useTheme();
  const theme = propTheme || contextTheme;
  const onToggleTheme = propToggleTheme || contextToggleTheme;

  const { requestOtp, verifyOtp } = useAuth();

  const [activeTab, setActiveTab] = useState('CITIZEN'); // 'CITIZEN' | 'OFFICIAL'
  const [mobileNumber, setMobileNumber] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [step, setStep] = useState('INPUT'); // 'INPUT' | 'OTP'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [showSandboxAccounts, setShowSandboxAccounts] = useState(false);

  // Resend OTP countdown effect
  useEffect(() => {
    let interval = null;
    if (step === 'OTP' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Handle Request OTP
  const handleRequestOtp = async (e) => {
    e?.preventDefault?.();
    setError('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (activeTab === 'CITIZEN') {
        const cleaned = mobileNumber.replace(/\D/g, '');
        if (cleaned.length !== 10) {
          throw new Error('Please enter a valid 10-digit Indian mobile number.');
        }
        const res = await requestOtp(cleaned, 'CITIZEN');
        setInfoMsg(res.message);
        setStep('OTP');
        setResendTimer(30);
      } else {
        const cleaned = officialEmail.trim().toLowerCase();
        if (!cleaned || !cleaned.includes('@')) {
          throw new Error('Please enter a valid official email address.');
        }
        if (!cleaned.endsWith('.gov.in') && !OFFICIAL_ROSTER[cleaned]) {
          throw new Error('Official login restricted to authorized government emails (*.gov.in).');
        }
        const res = await requestOtp(cleaned, 'OFFICIAL');
        setInfoMsg(res.message);
        setStep('OTP');
        setResendTimer(30);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const identifier = activeTab === 'CITIZEN' ? mobileNumber : officialEmail;
      const sessionUser = await verifyOtp(identifier, otpCode, activeTab);
      onLoginSuccess?.(sessionUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill helpers for sandbox demonstration
  const handleAutofillOfficial = (email) => {
    setActiveTab('OFFICIAL');
    setOfficialEmail(email);
    setStep('INPUT');
    setError('');
    setInfoMsg('');
  };

  const handleAutofillCitizen = (phone) => {
    setActiveTab('CITIZEN');
    setMobileNumber(phone);
    setStep('INPUT');
    setError('');
    setInfoMsg('');
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] overflow-x-hidden">
      {/* Lightweight Institutional Backdrop */}
      <TelanganaBackground3D
        variant={activeTab === 'OFFICIAL' ? 'official' : 'citizen'}
        theme={theme}
      />

      {/* Top State Tricolor Ribbon */}
      <div className="w-full h-1 flex shrink-0">
        <div className="h-full w-1/3 bg-amber-500" />
        <div className="h-full w-1/3 bg-slate-200 dark:bg-slate-700" />
        <div className="h-full w-1/3 bg-emerald-600" />
      </div>

      {/* Top Utility Bar */}
      <header className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-xs z-20 shrink-0">
        <div className="gov-container py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-[var(--text-secondary)] min-w-0">
            <TelanganaEmblem size={24} className="w-6 h-6 shrink-0" />
            <span className="font-bold text-[var(--text-primary)] truncate">
              GOVERNMENT OF TELANGANA
            </span>
            <span className="text-[var(--border-strong)] hidden sm:inline">|</span>
            <span className="text-[var(--gov-emerald)] hidden sm:inline">తెలంగాణ ప్రభుత్వం</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--bg-surface-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] text-xs font-medium cursor-pointer transition"
                title="Replay short cinematic introduction"
              >
                <PlayCircle className="w-3.5 h-3.5 text-[var(--gov-primary)] shrink-0" />
                <span className="hidden sm:inline">Intro</span>
              </button>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--bg-surface-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] text-xs font-medium cursor-pointer transition"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                aria-label="Toggle visual theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="hidden sm:inline">Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="hidden sm:inline">Dark Theme</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main
        id="main-content"
        className="gov-container flex-1 flex items-center justify-center py-5 sm:py-8 lg:py-12 z-10"
      >
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">
          {/* ================================================================
              MOBILE COMPACT BRAND BANNER (Visible only on < 1024px so login
              form stays prioritized at the top of narrow mobile viewports)
              ================================================================ */}
          <div className="lg:hidden flex items-center gap-3 p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs">
            <TelanganaEmblem size={40} className="w-10 h-10 shrink-0" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
                  MeeSeva DQMS
                </span>
                <span className="gov-badge gov-badge-info text-[10px] py-0.5 px-2">
                  33 Districts
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-snug mt-0.5">
                Unified Citizen Queue & Civic Service Resolution Gateway
              </p>
            </div>
          </div>

          {/* ================================================================
              LEFT PANEL (Desktop/Laptop Left Column | Mobile Secondary Column)
              SocialSolve / MeeSeva Civic Identity, Purpose & Coordination Visual
              ================================================================ */}
          <section
            aria-label="Platform Identity and Civic Coordination Overview"
            className="order-2 lg:order-1 lg:col-span-7 gov-card border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-7 lg:p-9 flex flex-col justify-between gap-6"
          >
            {/* Top Brand & Headline */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gov-primary-light)] border border-[var(--border-default)] text-[var(--gov-primary)] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Official Telangana Civic Technology Platform</span>
              </div>

              <div className="flex items-start gap-4">
                <TelanganaEmblem size={56} className="hidden sm:block w-14 h-14 shrink-0 mt-0.5" />
                <div className="space-y-1.5 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
                    MeeSeva Digital Queue & Civic Service Portal
                  </h1>
                  <p className="text-xs sm:text-sm font-medium text-[var(--gov-emerald)]">
                    మీసేవ డిజిటల్ క్యూ నిర్వహణ వ్యవస్థ • వేచి ఉండే సమయంలేని ప్రభుత్వ సేవలు
                  </p>
                </div>
              </div>

              {/* Concise 1-Paragraph Purpose Statement */}
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                MeeSeva DQMS connects citizens directly with verified government departments across all 33 Telangana districts—transforming revenue certificates, municipal civic works, transport licensing, and public utility requests into predictable, zero-wait virtual tokens and real-time counter fulfillment.
              </p>
            </div>

            {/* Refined Visual Illustration: Citizen Report/Request -> Authority Coordination */}
            <div
              className="rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] p-4 sm:p-5 space-y-4"
              aria-label="Citizen to Authority Coordination Architecture"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-[var(--gov-primary)]">
                  Live Citizen-to-Authority Resolution Pipeline
                </span>
                <span className="gov-badge gov-badge-success text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  STATEWIDE SYNC ACTIVE
                </span>
              </div>

              {/* Custom Responsive Vector Architecture Diagram (Hidden on extra-narrow <380px screens to keep mobile compact) */}
              <div className="hidden sm:block w-full overflow-hidden rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3">
                <svg
                  viewBox="0 0 600 130"
                  className="w-full h-auto max-h-[130px]"
                  role="img"
                  aria-label="Diagram showing Citizen Request routed through Verification Engine to Departmental Counter Resolution"
                >
                  <defs>
                    <linearGradient id="pipelineLine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#d97706" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>

                  {/* Connecting Flow Line */}
                  <line
                    x1="95"
                    y1="56"
                    x2="505"
                    y2="56"
                    stroke="url(#pipelineLine)"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />

                  {/* Node 1: Citizen Intake */}
                  <g transform="translate(30, 18)">
                    <rect
                      x="0"
                      y="0"
                      width="115"
                      height="76"
                      rx="10"
                      fill="var(--bg-surface-elevated)"
                      stroke="var(--border-strong)"
                      strokeWidth="1.5"
                    />
                    <circle cx="57" cy="28" r="14" fill="rgba(37, 99, 235, 0.15)" />
                    <path
                      d="M52 24h10v8H52z"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                    />
                    <text
                      x="57"
                      y="54"
                      textAnchor="middle"
                      fill="var(--text-primary)"
                      fontSize="11"
                      fontWeight="700"
                    >
                      1. Citizen Request
                    </text>
                    <text
                      x="57"
                      y="67"
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="9"
                    >
                      Mobile / Civic Intake
                    </text>
                  </g>

                  {/* Node 2: Smart Routing & Verification */}
                  <g transform="translate(242, 18)">
                    <rect
                      x="0"
                      y="0"
                      width="116"
                      height="76"
                      rx="10"
                      fill="var(--bg-surface-elevated)"
                      stroke="var(--border-strong)"
                      strokeWidth="1.5"
                    />
                    <circle cx="58" cy="28" r="14" fill="rgba(217, 119, 6, 0.16)" />
                    <path
                      d="M53 28l3 3 7-7"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text
                      x="58"
                      y="54"
                      textAnchor="middle"
                      fill="var(--text-primary)"
                      fontSize="11"
                      fontWeight="700"
                    >
                      2. Smart Routing
                    </text>
                    <text
                      x="58"
                      y="67"
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="9"
                    >
                      33 District Centers
                    </text>
                  </g>

                  {/* Node 3: Authority Fulfillment */}
                  <g transform="translate(455, 18)">
                    <rect
                      x="0"
                      y="0"
                      width="115"
                      height="76"
                      rx="10"
                      fill="var(--bg-surface-elevated)"
                      stroke="var(--border-strong)"
                      strokeWidth="1.5"
                    />
                    <circle cx="57" cy="28" r="14" fill="rgba(5, 150, 105, 0.16)" />
                    <path
                      d="M51 28l4 4 8-8"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text
                      x="57"
                      y="54"
                      textAnchor="middle"
                      fill="var(--text-primary)"
                      fontSize="11"
                      fontWeight="700"
                    >
                      3. Desk Resolution
                    </text>
                    <text
                      x="57"
                      y="67"
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="9"
                    >
                      Verified E-Token Call
                    </text>
                  </g>
                </svg>
              </div>

              {/* Three Concise Service Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-[var(--gov-primary)] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text-primary)]">33 Districts</div>
                    <div className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">
                      Unified jurisdiction routing
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start gap-2.5 min-w-0">
                  <FileCheck2 className="w-4 h-4 text-[var(--gov-gold)] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text-primary)]">5 Core Depts</div>
                    <div className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">
                      REV, MUN, RTA, CS & Power
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start gap-2.5 min-w-0">
                  <Clock className="w-4 h-4 text-[var(--gov-emerald)] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text-primary)]">Live Telemetry</div>
                    <div className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">
                      Real-time wait estimation
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Institutional Trust Footer */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-tertiary)]">
              <span>Helpline: <strong className="text-[var(--text-secondary)]">1100 / 1800-425-1110</strong></span>
              <span className="font-mono text-[11px]">ITE&C Department • Govt of Telangana</span>
            </div>
          </section>

          {/* ================================================================
              RIGHT PANEL (Desktop/Laptop Right Column | Mobile Primary Column)
              Structured Authentication Form
              ================================================================ */}
          <section
            aria-label="Portal Sign In"
            className="order-1 lg:order-2 lg:col-span-5 gov-card shadow-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-7 lg:p-8 flex flex-col justify-between gap-5"
          >
            <div className="space-y-5">
              {/* Form Header */}
              <div className="pb-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--gov-primary)] block">
                    Authenticated Gateway
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                    Sign In to MeeSeva Portal
                  </h2>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    Select your portal role and verify via 6-digit OTP
                  </p>
                </div>
                <TelanganaEmblem size={42} className="hidden sm:block lg:hidden w-10 h-10 shrink-0" />
              </div>

              {/* Dual Pathway Selector: Segmented Control */}
              <div
                role="tablist"
                aria-label="Portal Pathway Selection"
                className="gov-segmented-control"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'CITIZEN'}
                  id="tab-citizen"
                  aria-controls="panel-citizen"
                  onClick={() => {
                    setActiveTab('CITIZEN');
                    setStep('INPUT');
                    setError('');
                    setInfoMsg('');
                  }}
                  className="gov-segment-btn"
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>Citizen Services</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'OFFICIAL'}
                  id="tab-official"
                  aria-controls="panel-official"
                  onClick={() => {
                    setActiveTab('OFFICIAL');
                    setStep('INPUT');
                    setError('');
                    setInfoMsg('');
                  }}
                  className="gov-segment-btn"
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>Authorized Official</span>
                </button>
              </div>

              {/* Error / Info Status Alerts */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span className="break-words">{error}</span>
                </div>
              )}

              {infoMsg && (
                <div
                  role="status"
                  className="flex items-start gap-2.5 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <span className="break-words">{infoMsg}</span>
                </div>
              )}

              {/* Authentication Form */}
              {step === 'INPUT' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  {activeTab === 'CITIZEN' ? (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="citizen-mobile"
                        className="block text-sm font-semibold text-[var(--text-primary)]"
                      >
                        Citizen Mobile Number
                      </label>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        Used for instant OTP verification and live SMS token alerts
                      </p>
                      <div className="gov-input-group mt-1">
                        <span className="gov-input-addon">+91</span>
                        <input
                          id="citizen-mobile"
                          name="citizenMobile"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10}
                          required
                          className="gov-input font-mono text-base"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="official-email"
                        className="block text-sm font-semibold text-[var(--text-primary)]"
                      >
                        Official Government Email
                      </label>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        Authorized government credentials (*.gov.in) for counter operations
                      </p>
                      <div className="gov-input-group mt-1">
                        <span className="gov-input-addon">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          id="official-email"
                          name="officialEmail"
                          type="email"
                          autoComplete="email"
                          value={officialEmail}
                          onChange={(e) => setOfficialEmail(e.target.value)}
                          placeholder="officer.rev@telangana.gov.in"
                          required
                          className="gov-input font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="gov-btn gov-btn-primary gov-btn-lg w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Generating Verification Code...</span>
                    ) : (
                      <>
                        <span>Request Verification Code</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor="otp-code"
                        className="text-sm font-semibold text-[var(--text-primary)]"
                      >
                        Enter 6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('INPUT');
                          setOtpCode('');
                          setError('');
                        }}
                        className="text-xs text-[var(--gov-primary)] hover:underline cursor-pointer font-medium"
                      >
                        Change {activeTab === 'CITIZEN' ? 'Mobile' : 'Email'}
                      </button>
                    </div>

                    <p className="text-xs text-[var(--text-tertiary)]">
                      Enter the code sent to your registered {activeTab === 'CITIZEN' ? 'mobile number' : 'government email'}
                    </p>

                    <div className="gov-input-group mt-1">
                      <span className="gov-input-addon">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input
                        id="otp-code"
                        name="otpCode"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        required
                        autoFocus
                        className="gov-input text-center font-mono text-xl tracking-[0.35em]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)] pt-1">
                      <span>
                        Sandbox OTP: <strong className="text-[var(--gov-primary)] font-mono">123456</strong>
                      </span>

                      {resendTimer > 0 ? (
                        <span className="font-mono text-xs text-[var(--text-tertiary)]">
                          Resend in {resendTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={loading}
                          className="text-[var(--gov-primary)] hover:underline cursor-pointer font-semibold"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="gov-btn gov-btn-primary gov-btn-lg w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Verifying Authentication...</span>
                    ) : (
                      <>
                        <span>Verify OTP & Enter Portal</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Development Test Accounts: Subdued, Collapsible Section */}
            <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowSandboxAccounts((prev) => !prev)}
                aria-expanded={showSandboxAccounts}
                className="w-full flex items-center justify-between text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition py-1 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[var(--gov-primary)] shrink-0" />
                  <span>Development Test Accounts (Quick Autofill)</span>
                </div>
                {showSandboxAccounts ? (
                  <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                )}
              </button>

              {showSandboxAccounts && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAutofillCitizen('9876543210')}
                    className="text-left p-2.5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] hover:border-[var(--gov-primary)] transition text-xs cursor-pointer min-w-0"
                  >
                    <div className="font-semibold text-[var(--gov-primary)] truncate">Citizen Profile</div>
                    <div className="text-[var(--text-tertiary)] font-mono text-[11px] mt-0.5 truncate">9876543210</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutofillOfficial('officer.rev@telangana.gov.in')}
                    className="text-left p-2.5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] hover:border-[var(--gov-primary)] transition text-xs cursor-pointer min-w-0"
                  >
                    <div className="font-semibold text-[var(--gov-primary)] truncate">Revenue Officer</div>
                    <div className="text-[var(--text-tertiary)] font-mono text-[11px] mt-0.5 truncate">Hyderabad (REV)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutofillOfficial('officer.rta@telangana.gov.in')}
                    className="text-left p-2.5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] hover:border-[var(--gov-primary)] transition text-xs cursor-pointer min-w-0"
                  >
                    <div className="font-semibold text-[var(--gov-primary)] truncate">RTA Inspector</div>
                    <div className="text-[var(--text-tertiary)] font-mono text-[11px] mt-0.5 truncate">Hyderabad (RTA)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutofillOfficial('officer.reg@telangana.gov.in')}
                    className="text-left p-2.5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] hover:border-[var(--gov-primary)] transition text-xs cursor-pointer min-w-0"
                  >
                    <div className="font-semibold text-[var(--gov-primary)] truncate">Municipal Registrar</div>
                    <div className="text-[var(--text-tertiary)] font-mono text-[11px] mt-0.5 truncate">Hanamkonda (REG)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutofillOfficial('officer.civil@telangana.gov.in')}
                    className="text-left p-2.5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] hover:border-[var(--gov-primary)] transition text-xs cursor-pointer min-w-0"
                  >
                    <div className="font-semibold text-[var(--gov-primary)] truncate">Civil Supplies</div>
                    <div className="text-[var(--text-tertiary)] font-mono text-[11px] mt-0.5 truncate">Nizamabad (CS)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutofillOfficial('director.dqms@telangana.gov.in')}
                    className="text-left p-2.5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] hover:border-[var(--gov-primary)] transition text-xs cursor-pointer min-w-0"
                  >
                    <div className="font-semibold text-[var(--gov-primary)] truncate">State Commissioner</div>
                    <div className="text-[var(--text-tertiary)] font-mono text-[11px] mt-0.5 truncate">All 33 Districts</div>
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

