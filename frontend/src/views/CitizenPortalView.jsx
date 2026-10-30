import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { useTheme } from '../context/ThemeContext';
import { TELANGANA_DISTRICTS, MASTER_DEPARTMENTS, getOfficesForDistrict } from '../data/masterData';
import TelanganaBackground3D from '../components/3d/TelanganaBackground3D';
import GovHeader from '../components/common/GovHeader';
import TelanganaEmblem from '../components/common/TelanganaEmblem';
import {
  Ticket,
  Clock,
  Users,
  MapPin,
  Building,
  CheckCircle,
  AlertTriangle,
  Printer,
  ChevronRight,
  ShieldCheck,
  Radio,
  ArrowRight
} from 'lucide-react';

/**
 * Barcode & Verification Strip Component
 * Renders an authentic government-grade optical barcode pattern.
 */
function GovBarcodeStrip({ code }) {
  // Deterministic pattern of bar widths based on code
  const barPattern = [3, 1, 2, 4, 1, 3, 2, 1, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 4, 2, 1, 3];

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border-default)] rounded-md">
      <div className="flex items-stretch h-9 gap-[2px] justify-center w-full max-w-[280px]">
        {barPattern.map((width, idx) => (
          <div
            key={idx}
            className="bg-[var(--text-primary)]"
            style={{ width: `${width * 2}px` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between w-full max-w-[280px] text-[10px] font-mono text-[var(--text-secondary)]">
        <span>*TS-{code}*</span>
        <span className="flex items-center gap-1 text-[var(--gov-emerald)] font-semibold">
          <ShieldCheck className="w-3 h-3" /> VERIFIED
        </span>
      </div>
    </div>
  );
}

export default function CitizenPortalView({ onOpenAiAssistant, theme: propTheme, onToggleTheme: propToggleTheme }) {
  const { user, logout } = useAuth();
  const { theme: contextTheme, toggleTheme: contextToggleTheme } = useTheme();
  const theme = propTheme || contextTheme;
  const onToggleTheme = propToggleTheme || contextToggleTheme;

  const {
    activeCitizenTicket,
    bookTicket,
    cancelActiveTicket,
    lastNotification,
    clearNotification,
    playChime
  } = useQueue();

  // Booking Form State
  const [selectedDistrictId, setSelectedDistrictId] = useState('HYD');
  const [selectedDeptId, setSelectedDeptId] = useState('REV');
  const [selectedSubService, setSelectedSubService] = useState('Integrated Certificate (Caste, Nativity, Date of Birth)');
  const [selectedOfficeIndex, setSelectedOfficeIndex] = useState('0');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Available offices based on district & department selection
  const availableOffices = useMemo(() => {
    if (!selectedDistrictId || !selectedDeptId) return [];
    return getOfficesForDistrict(selectedDistrictId, selectedDeptId);
  }, [selectedDistrictId, selectedDeptId]);

  // Selected Department Meta
  const currentDept = useMemo(() => {
    return MASTER_DEPARTMENTS[selectedDeptId] || null;
  }, [selectedDeptId]);

  // Handle District Change
  const handleDistrictChange = (e) => {
    const distId = e.target.value;
    setSelectedDistrictId(distId);
    setSelectedOfficeIndex('');
    setBookingError('');
  };

  // Handle Department Change
  const handleDeptChange = (e) => {
    const deptId = e.target.value;
    setSelectedDeptId(deptId);
    setSelectedSubService('');
    setSelectedOfficeIndex('');
    setBookingError('');
  };

  // Handle Booking Submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!selectedDistrictId || !selectedDeptId || !selectedSubService || selectedOfficeIndex === '') {
      setBookingError('Please complete all selection steps before reserving a token.');
      return;
    }

    const office = availableOffices[parseInt(selectedOfficeIndex, 10)];
    if (!office) {
      setBookingError('Please select a valid MeeSeva Center office.');
      return;
    }

    setBookingLoading(true);
    try {
      await bookTicket({
        districtId: selectedDistrictId,
        departmentId: selectedDeptId,
        subServiceName: selectedSubService,
        officeName: office.name,
        officeAddress: office.addr
      });
      playChime();
    } catch (err) {
      setBookingError(err.message || 'Failed to book virtual queue ticket.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle Ticket Cancellation
  const handleConfirmCancel = async () => {
    try {
      await cancelActiveTicket();
      setShowCancelModal(false);
    } catch (err) {
      alert(err.message || 'Failed to cancel ticket.');
    }
  };

  // Handle Ticket Print
  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] selection:bg-[var(--gov-primary)] selection:text-white">
      {/* 3D Backdrop (Restrained institutional background) */}
      <div className="no-print">
        <TelanganaBackground3D variant="citizen" theme={theme} />
      </div>

      {/* Official Government Header */}
      <GovHeader
        role="CITIZEN"
        user={user}
        onOpenAiAssistant={onOpenAiAssistant}
        onLogout={logout}
        onPlayChime={playChime}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Main Content Area */}
      <main id="main-content" className="gov-container flex-1 py-6 md:py-10 pb-20 max-w-5xl">
        {/* Government Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="gov-breadcrumbs no-print">
          <ol>
            <li>
              <span className="crumb-link">Home</span>
              <ChevronRight className="crumb-separator w-3 h-3" />
            </li>
            <li>
              <span className="crumb-link">Citizen Services</span>
              <ChevronRight className="crumb-separator w-3 h-3" />
            </li>
            <li>
              <span className="crumb-link">
                {activeCitizenTicket
                  ? activeCitizenTicket.departmentId
                  : currentDept?.name || 'Department'}
              </span>
              <ChevronRight className="crumb-separator w-3 h-3" />
            </li>
            <li className="crumb-current">
              {activeCitizenTicket ? `Virtual Token ${activeCitizenTicket.tokenNumber}` : 'Virtual Token Booking'}
            </li>
          </ol>
        </nav>

        {/* Real-Time Announcement Banner */}
        {lastNotification && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--surface-elevated)] border-l-4 border-l-[var(--success)] border border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm no-print">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[var(--success)] animate-ping shrink-0" />
              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-[var(--success)] font-mono">
                  Official Loudspeaker Announcement
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                  {lastNotification.message}
                </div>
              </div>
            </div>
            <button
              onClick={clearNotification}
              type="button"
              className="gov-btn gov-btn-secondary gov-btn-sm self-end sm:self-center"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Display: Either Active Ticket OR Booking Form */}
        {activeCitizenTicket ? (
          /* ======================================================== */
          /* Step 2: Active Ticket Display (Government Digital Pass)   */
          /* ======================================================== */
          <div className="gov-ticket-pass">
            {/* Header: Official State Branding & Status */}
            <div className="gov-ticket-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <TelanganaEmblem size={46} className="shrink-0" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                    GOVERNMENT OF TELANGANA • తెలంగాణ ప్రభుత్వం
                  </div>
                  <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)] leading-tight">
                    MeeSeva Digital Queue Management System
                  </h1>
                  <div className="text-xs text-[var(--gov-primary)] font-medium">
                    Official E-Token Verification Pass • {activeCitizenTicket.districtId} District
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="sm:text-right shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Queue State
                </span>
                <span
                  className={`gov-badge ${
                    activeCitizenTicket.status === 'CALLED'
                      ? 'gov-badge-gold'
                      : activeCitizenTicket.status === 'SERVING'
                      ? 'gov-badge-success'
                      : 'gov-badge-info'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                  {activeCitizenTicket.status === 'CALLED'
                    ? 'TOKEN CALLED! PROCEED TO COUNTER'
                    : activeCitizenTicket.status === 'SERVING'
                    ? 'CURRENTLY SERVING'
                    : 'IN WAITING QUEUE'}
                </span>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="gov-ticket-body space-y-6">
              {/* Primary Token Hero Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-default)]">
                <div className="md:col-span-2 text-center md:text-left space-y-2">
                  <span className="text-xs uppercase font-mono tracking-widest text-[var(--text-muted)]">
                    Your Assigned Virtual Token
                  </span>
                  <div className="gov-token-number text-[var(--gov-primary)]">
                    {activeCitizenTicket.tokenNumber}
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {activeCitizenTicket.serviceName}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] font-mono">
                    Sequence #{activeCitizenTicket.sequenceNumber} • Department:{' '}
                    <strong className="text-[var(--text-primary)]">{activeCitizenTicket.departmentId}</strong> • Booked at{' '}
                    {new Date(activeCitizenTicket.bookedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Simulated Optical Barcode & QR Verification */}
                <div className="flex justify-center md:justify-end">
                  <GovBarcodeStrip code={activeCitizenTicket.tokenNumber} />
                </div>
              </div>

              {/* Live Queue Telemetry Cards */}
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[var(--gov-primary)]" />
                  <span>Real-Time Desk Telemetry</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {/* Card 1: Now Serving */}
                  <div className="p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-default)] text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
                      <Ticket className="w-3.5 h-3.5 text-[var(--gov-primary)]" />
                      <span className="font-semibold uppercase tracking-wider">Now Serving</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                      {activeCitizenTicket.currentServingToken}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1">At this MeeSeva facility</div>
                  </div>

                  {/* Card 2: People Ahead */}
                  <div className="p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-default)] text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
                      <Users className="w-3.5 h-3.5 text-[var(--gov-emerald)]" />
                      <span className="font-semibold uppercase tracking-wider">People Ahead</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[var(--gov-emerald)]">
                      {activeCitizenTicket.peopleAhead}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1">
                      {activeCitizenTicket.peopleAhead === 0 ? 'You are next in line!' : 'Citizens waiting before you'}
                    </div>
                  </div>

                  {/* Card 3: Estimated Wait Time */}
                  <div className="p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-default)] text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
                      <Clock className="w-3.5 h-3.5 text-[var(--gov-gold)]" />
                      <span className="font-semibold uppercase tracking-wider">Est. Wait Time</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[var(--gov-gold)]">
                      {activeCitizenTicket.status === 'CALLED' || activeCitizenTicket.status === 'SERVING'
                        ? 'Now Serving!'
                        : activeCitizenTicket.estimatedWaitMinutes === 0
                        ? 'Immediate'
                        : `~${activeCitizenTicket.estimatedWaitMinutes} mins`}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1">
                      Calculated across {activeCitizenTicket.activeCounterCount} active counters
                    </div>
                  </div>
                </div>
              </div>

              {/* Perforation Line */}
              <div className="gov-ticket-perforation" />

              {/* Location & Assigned Counter Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-default)] space-y-2 text-xs md:text-sm">
                  <div className="flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-[var(--gov-primary)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text-primary)]">MeeSeva Center:</strong>
                      <div className="text-[var(--text-secondary)] font-medium">{activeCitizenTicket.officeName}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[var(--gov-emerald)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text-primary)]">Physical Address:</strong>
                      <div className="text-[var(--text-muted)]">{activeCitizenTicket.officeAddress}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-default)] space-y-2 text-xs md:text-sm">
                  <div className="flex items-start gap-2.5">
                    <Ticket className="w-4 h-4 text-[var(--gov-gold)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text-primary)]">Designated Counter:</strong>
                      <div className="font-mono font-bold text-[var(--gov-gold)] text-sm">
                        {activeCitizenTicket.assignedCounter || 'Counter 01 (Allocating)'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[var(--gov-emerald)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text-primary)]">Notification Channel:</strong>
                      <div className="text-[var(--text-muted)] font-mono">
                        SMS & Voice dispatch to +91 {user?.profile?.mobileNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar (Buttons with guaranteed wrapping, zero collision) */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                  <span>Synchronized with Central State Queue Engine</span>
                </div>

                <div className="gov-btn-group w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handlePrintTicket}
                    className="gov-btn gov-btn-secondary w-full sm:w-auto"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Save Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="gov-btn gov-btn-danger w-full sm:w-auto"
                  >
                    Cancel Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* Step 1: Virtual Queue Ticket Booking Form (Institutional) */
          /* ======================================================== */
          <div className="gov-card space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-subtle)] gap-3">
              <div>
                <span className="gov-badge gov-badge-info mb-1.5">Official Citizen Service</span>
                <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                  Book Virtual Queue Ticket
                </h1>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Select your district, department, and office to reserve a guaranteed token position.
                </p>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-[10px] font-mono text-[var(--text-muted)] block">STATEWIDE GATEWAY</span>
                <span className="text-xs font-bold text-[var(--gov-emerald)] font-mono">33 / 33 DISTRICTS CONNECTED</span>
              </div>
            </div>

            {bookingError && (
              <div className="p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Section 1: Geographic Jurisdiction & Department */}
              <div className="gov-form-section">
                <div className="gov-form-section-title">
                  <span className="gov-form-section-badge">1</span>
                  <span>Jurisdiction & Department</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* District Selection */}
                  <div>
                    <label
                      htmlFor="booking-district"
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5"
                    >
                      Telangana District
                    </label>
                    <select
                      id="booking-district"
                      name="districtId"
                      value={selectedDistrictId}
                      onChange={handleDistrictChange}
                      required
                      className="gov-select"
                    >
                      <option value="">-- Select Telangana District --</option>
                      {TELANGANA_DISTRICTS.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name} District ({dist.region})
                        </option>
                      ))}
                    </select>
                    <p className="gov-helper-text">
                      Tokens are routed strictly to centers within your selected district jurisdiction.
                    </p>
                  </div>

                  {/* Department Selection */}
                  <div>
                    <label
                      htmlFor="booking-department"
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5"
                    >
                      Government Department
                    </label>
                    <select
                      id="booking-department"
                      name="departmentId"
                      value={selectedDeptId}
                      onChange={handleDeptChange}
                      disabled={!selectedDistrictId}
                      required
                      className="gov-select"
                    >
                      <option value="">
                        {!selectedDistrictId ? '-- Select District First --' : '-- Select Department --'}
                      </option>
                      {Object.values(MASTER_DEPARTMENTS).map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.prefix})
                        </option>
                      ))}
                    </select>
                    <p className="gov-helper-text">
                      Choose the administrative department responsible for your required certificate or service.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Service & MeeSeva Office Center */}
              <div className="gov-form-section">
                <div className="gov-form-section-title">
                  <span className="gov-form-section-badge">2</span>
                  <span>Service & Center Location</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sub-Service Selection */}
                  <div>
                    <label
                      htmlFor="booking-subservice"
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5"
                    >
                      Specific Certificate / Service
                    </label>
                    <select
                      id="booking-subservice"
                      name="subService"
                      value={selectedSubService}
                      onChange={(e) => setSelectedSubService(e.target.value)}
                      disabled={!selectedDeptId}
                      required
                      className="gov-select"
                    >
                      <option value="">
                        {!selectedDeptId ? '-- Select Department First --' : '-- Select Certificate/Service --'}
                      </option>
                      {selectedDeptId &&
                        MASTER_DEPARTMENTS[selectedDeptId]?.subServices.map((sub, i) => (
                          <option key={i} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>
                    <p className="gov-helper-text">
                      Ensures proper desk allocation and required counter documentation checklist.
                    </p>
                  </div>

                  {/* Office Center Selection */}
                  <div>
                    <label
                      htmlFor="booking-office"
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5"
                    >
                      MeeSeva / Govt Office Location
                    </label>
                    <select
                      id="booking-office"
                      name="officeIndex"
                      value={selectedOfficeIndex}
                      onChange={(e) => setSelectedOfficeIndex(e.target.value)}
                      disabled={!selectedDeptId}
                      required
                      className="gov-select"
                    >
                      <option value="">
                        {!selectedDeptId ? '-- Select Department First --' : '-- Select Office Center --'}
                      </option>
                      {availableOffices.map((office, idx) => (
                        <option key={idx} value={idx}>
                          {office.name}
                        </option>
                      ))}
                    </select>
                    <p className="gov-helper-text">
                      Choose the official MeeSeva center nearest to you.
                    </p>
                  </div>
                </div>

                {/* Office Center Details Box */}
                {selectedOfficeIndex !== '' && availableOffices[selectedOfficeIndex] && (
                  <div className="mt-4 p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-default)] text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-[var(--gov-primary)] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-[var(--text-primary)] text-sm">
                          {availableOffices[selectedOfficeIndex].name}
                        </div>
                        <div className="text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                          <span>{availableOffices[selectedOfficeIndex].addr}</span>
                        </div>
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block">Operating Hours</span>
                      <span className="text-xs font-mono font-semibold text-[var(--gov-emerald)]">09:00 AM - 05:00 PM</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Verified Communication Channel */}
              <div className="gov-form-section">
                <div className="gov-form-section-title">
                  <span className="gov-form-section-badge">3</span>
                  <span>Citizen Communication Channel</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Registered Mobile for SMS Notifications & Queue Calls
                  </label>
                  <div className="px-3.5 py-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] font-mono text-sm flex items-center justify-between">
                    <span className="font-bold">+91 {user?.profile?.mobileNumber || '9876543210'}</span>
                    <span className="text-[11px] text-[var(--gov-emerald)] font-semibold uppercase flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Verified Citizen Session
                    </span>
                  </div>
                  <p className="gov-helper-text">
                    Live token call notifications and counter alerts will be delivered via SMS to this authenticated mobile number.
                  </p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="gov-btn gov-btn-primary gov-btn-lg w-full flex items-center justify-center gap-2 cursor-pointer"
                >
                  {bookingLoading ? (
                    <span>Registering Token in Telangana State Database...</span>
                  ) : (
                    <>
                      <Ticket className="w-5 h-5" />
                      <span>Generate Virtual Queue Ticket</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Confirmation Modal: Cancel Ticket */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
        >
          <div className="gov-card max-w-sm w-full border border-rose-500/40 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 id="cancel-modal-title" className="text-lg font-bold text-[var(--text-primary)]">
                Cancel Queue Ticket?
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Are you sure you want to cancel your virtual token{' '}
                <strong className="text-rose-600 dark:text-rose-400">{activeCitizenTicket?.tokenNumber}</strong>? Your reservation and
                sequence position will be permanently released.
              </p>
            </div>
            <div className="gov-btn-group justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="gov-btn gov-btn-secondary flex-1"
              >
                Keep Ticket
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="gov-btn gov-btn-danger flex-1"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
