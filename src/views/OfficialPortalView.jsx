import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { useTheme } from '../context/ThemeContext';
import TelanganaBackground3D from '../components/3d/TelanganaBackground3D';
import GovHeader from '../components/common/GovHeader';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  PhoneCall,
  Play,
  Check,
  UserX,
  Pause,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Search
} from 'lucide-react';

export default function OfficialPortalView({ onOpenAiAssistant, theme: propTheme, onToggleTheme: propToggleTheme }) {
  const { user, logout } = useAuth();
  const { theme: contextTheme, toggleTheme: contextToggleTheme } = useTheme();
  const theme = propTheme || contextTheme;
  const onToggleTheme = propToggleTheme || contextToggleTheme;

  const {
    officialMetrics,
    callNext,
    startServing,
    completeCurrent,
    markNoShow,
    holdTicket,
    playChime
  } = useQueue();

  const [counterNumber, setCounterNumber] = useState(user?.profile?.assignedCounter || 'Counter 01');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const profile = user?.profile || {};

  // Action: Call Next
  const handleCallNext = async () => {
    setActionLoading(true);
    setActionError('');
    setActionMsg('');
    try {
      const ticket = await callNext(counterNumber);
      playChime();
      setActionMsg(`Token ${ticket.tokenNumber} has been called to ${counterNumber}!`);
    } catch (err) {
      setActionError(err.message || 'Failed to call next ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Start Serving
  const handleStartServing = async (ticketId) => {
    setActionLoading(true);
    setActionError('');
    setActionMsg('');
    try {
      const ticket = await startServing(ticketId);
      setActionMsg(`Now serving token ${ticket.tokenNumber} at ${counterNumber}.`);
    } catch (err) {
      setActionError(err.message || 'Failed to start service.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Complete
  const handleComplete = async (ticketId) => {
    setActionLoading(true);
    setActionError('');
    setActionMsg('');
    try {
      const ticket = await completeCurrent(ticketId, 'Service processed and approved');
      setActionMsg(`Token ${ticket.tokenNumber} marked completed successfully.`);
    } catch (err) {
      setActionError(err.message || 'Failed to complete ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Mark No-Show
  const handleNoShow = async (ticketId) => {
    if (!window.confirm('Mark this citizen as No-Show? The ticket will be recorded as unfulfilled.')) return;
    setActionLoading(true);
    setActionError('');
    setActionMsg('');
    try {
      const ticket = await markNoShow(ticketId);
      setActionMsg(`Token ${ticket.tokenNumber} recorded as No-Show.`);
    } catch (err) {
      setActionError(err.message || 'Failed to mark as no-show.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Hold
  const handleHold = async (ticketId) => {
    const reason = window.prompt('Enter reason for placing ticket on hold:', 'Pending original document verification');
    if (!reason) return;
    setActionLoading(true);
    setActionError('');
    setActionMsg('');
    try {
      const ticket = await holdTicket(ticketId, reason);
      setActionMsg(`Token ${ticket.tokenNumber} placed on hold: "${reason}"`);
    } catch (err) {
      setActionError(err.message || 'Failed to hold ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered queue tickets by status and search query
  const filteredTickets = (officialMetrics?.allOfficeTickets || []).filter((t) => {
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch =
      searchQuery.trim() === '' ||
      t.tokenNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.citizenMobile?.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const activeTicket = officialMetrics?.currentTicketDetails;

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] selection:bg-[var(--gov-primary)] selection:text-white">
      {/* 3D Backdrop (Restrained institutional background) */}
      <TelanganaBackground3D variant="official" theme={theme} />

      {/* Official Government Header */}
      <GovHeader
        role="OFFICIAL"
        user={user}
        onOpenAiAssistant={onOpenAiAssistant}
        onLogout={logout}
        onPlayChime={playChime}
        theme={theme}
        onToggleTheme={onToggleTheme}
        contextTitle={`${profile.officeName || 'MeeSeva Center'} • ${profile.districtName || 'Telangana'} (${profile.departmentId || 'REV'})`}
      />

      {/* Main Operations Dashboard */}
      <main id="main-content" className="gov-container flex-1 py-6 md:py-8 pb-20 space-y-6">
        {/* Government Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="gov-breadcrumbs">
          <ol>
            <li>
              <span className="crumb-link">Home</span>
              <ChevronRight className="crumb-separator w-3 h-3" />
            </li>
            <li>
              <span className="crumb-link">Official Administration</span>
              <ChevronRight className="crumb-separator w-3 h-3" />
            </li>
            <li>
              <span className="crumb-link">{profile.districtName || 'District Facility'}</span>
              <ChevronRight className="crumb-separator w-3 h-3" />
            </li>
            <li className="crumb-current">
              {counterNumber} Console ({profile.departmentId || 'Revenue'})
            </li>
          </ol>
        </nav>

        {/* Status Alerts */}
        {actionError && (
          <div className="p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{actionError}</span>
          </div>
        )}

        {actionMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{actionMsg}</span>
            </div>
            <button
              onClick={() => setActionMsg('')}
              type="button"
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Telemetry KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Waiting */}
          <div className="gov-card p-3.5 text-center">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Waiting</span>
              <Users className="w-3.5 h-3.5 text-[var(--gov-gold)]" />
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[var(--gov-gold)]">
              {officialMetrics?.waitingCount || 0}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">In line at office</div>
          </div>

          {/* Card 2: Now Serving */}
          <div className="gov-card p-3.5 text-center">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Now Serving</span>
              <PhoneCall className="w-3.5 h-3.5 text-[var(--gov-primary)]" />
            </div>
            <div className="text-xl md:text-2xl font-bold font-mono text-[var(--text-primary)]">
              {officialMetrics?.currentServingToken || 'None'}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">Active on counter</div>
          </div>

          {/* Card 3: Active Counters */}
          <div className="gov-card p-3.5 text-center">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Counters</span>
              <Building2 className="w-3.5 h-3.5 text-[var(--gov-emerald)]" />
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[var(--gov-emerald)]">
              {officialMetrics?.activeCounters || 1} / {officialMetrics?.totalCounters || 2}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">Operational booths</div>
          </div>

          {/* Card 4: Est Wait Time */}
          <div className="gov-card p-3.5 text-center">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Est. Wait</span>
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[var(--text-primary)]">
              {officialMetrics?.estimatedWaitTimeForNext || 0}m
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">Current queue load</div>
          </div>

          {/* Card 5: Completed Today */}
          <div className="gov-card p-3.5 text-center">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Completed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--gov-emerald)]" />
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[var(--gov-emerald)]">
              {officialMetrics?.completedCount || 0}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">Processed today</div>
          </div>

          {/* Card 6: Total Booked */}
          <div className="gov-card p-3.5 text-center">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Total</span>
              <TrendingUp className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[var(--text-primary)]">
              {officialMetrics?.totalTicketsToday || 0}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">Tokens generated</div>
          </div>
        </div>

        {/* Counter Action Console & Active Citizen Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Active Counter Action Terminal */}
          <div className="lg:col-span-2 gov-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-subtle)] gap-3">
              <div>
                <span className="gov-badge gov-badge-gold">Authorized Desk Console</span>
                <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mt-1">
                  Desk Counter Management
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Operate token transactions, calls, and service approvals
                </p>
              </div>

              {/* Counter Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="assigned-counter-desk" className="text-xs text-[var(--text-secondary)] font-medium">
                  Assigned Desk:
                </label>
                <select
                  id="assigned-counter-desk"
                  name="assignedCounter"
                  value={counterNumber}
                  onChange={(e) => setCounterNumber(e.target.value)}
                  className="gov-select py-1.5 px-3 min-h-[38px] text-xs font-mono font-bold text-[var(--gov-gold)] w-auto"
                >
                  <option value="Counter 01">Counter 01</option>
                  <option value="Counter 02">Counter 02</option>
                  <option value="Counter 03">Counter 03</option>
                  <option value="Counter 04">Counter 04</option>
                  <option value="Counter 05">Counter 05</option>
                  <option value="Counter 06">Counter 06</option>
                  <option value="Counter 07">Counter 07</option>
                </select>
              </div>
            </div>

            {/* Currently Focused Ticket at this Counter */}
            {activeTicket ? (
              <div className="p-5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-default)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    Active Ticket at {counterNumber}
                  </span>
                  <span
                    className={`gov-badge ${
                      activeTicket.status === 'CALLED'
                        ? 'gov-badge-gold'
                        : 'gov-badge-info'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                    {activeTicket.status}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <div className="text-3xl md:text-4xl font-extrabold font-mono text-[var(--gov-primary)]">
                      {activeTicket.tokenNumber}
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                      {activeTicket.serviceName}
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono">
                    Citizen Phone: <strong className="text-[var(--text-primary)]">+91 {activeTicket.citizenMobile}</strong>
                  </div>
                </div>

                {/* Operator Actions for Active Ticket: Flexbox Grouping to Prevent Collisions */}
                <div className="gov-btn-group pt-4 border-t border-[var(--border-subtle)]">
                  {activeTicket.status === 'CALLED' && (
                    <button
                      onClick={() => handleStartServing(activeTicket.id)}
                      disabled={actionLoading}
                      type="button"
                      className="gov-btn gov-btn-success"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Serving</span>
                    </button>
                  )}

                  {activeTicket.status === 'SERVING' && (
                    <button
                      onClick={() => handleComplete(activeTicket.id)}
                      disabled={actionLoading}
                      type="button"
                      className="gov-btn gov-btn-primary"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete Processing</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleHold(activeTicket.id)}
                    disabled={actionLoading}
                    type="button"
                    className="gov-btn gov-btn-secondary"
                  >
                    <Pause className="w-3.5 h-3.5 text-[var(--gov-gold)]" />
                    <span>Hold</span>
                  </button>

                  <button
                    onClick={() => handleNoShow(activeTicket.id)}
                    disabled={actionLoading}
                    type="button"
                    className="gov-btn gov-btn-danger"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>No-Show</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-default)] text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{counterNumber} is Ready</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {officialMetrics?.waitingCount || 0} citizens currently waiting in line at this office.
                  </p>
                </div>

                <div>
                  <button
                    onClick={handleCallNext}
                    disabled={actionLoading || (officialMetrics?.waitingCount || 0) === 0}
                    type="button"
                    className="gov-btn gov-btn-accent gov-btn-lg"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Next Citizen to {counterNumber}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Waiting Queue Preview */}
          <div className="gov-card flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--gov-gold)]" />
                <span>Next in Line</span>
              </h3>
              <span className="gov-badge gov-badge-gold text-[10px]">
                {officialMetrics?.waitingQueue?.length || 0} waiting
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-[320px] pr-1">
              {(officialMetrics?.waitingQueue || []).length === 0 ? (
                <div className="text-center py-12 text-[var(--text-muted)] text-xs">
                  No citizens currently waiting.
                </div>
              ) : (
                officialMetrics.waitingQueue.map((ticket, idx) => (
                  <div
                    key={ticket.id}
                    className="p-3 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between text-xs hover:border-[var(--border-strong)] transition"
                  >
                    <div>
                      <div className="font-mono font-bold text-[var(--text-primary)]">
                        {idx + 1}. {ticket.tokenNumber}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate max-w-[160px]">
                        {ticket.serviceName}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="gov-badge gov-badge-neutral text-[10px] font-mono">
                        {new Date(ticket.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Full Queue Ledger Table with Filter and Search */}
        <div className="gov-card space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-[var(--border-subtle)] gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Live Office Queue Stream</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Official transaction ledger for {profile.officeName || 'this center'} ({filteredTickets.length} records)
              </p>
            </div>

            {/* Controls: Search input & Status Filter Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0">
              {/* Search box */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="ledger-search-query"
                  name="ledgerSearchQuery"
                  aria-label="Filter queue by token, service, or phone"
                  type="text"
                  placeholder="Filter by token, service, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="gov-input pl-8 py-1.5 min-h-[36px] text-xs w-full"
                />
              </div>

              {/* Status Filters */}
              <div className="gov-btn-group">
                {['ALL', 'WAITING', 'SERVING', 'COMPLETED', 'HOLD', 'NO_SHOW', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    type="button"
                    className={`gov-btn gov-btn-sm ${
                      filterStatus === st
                        ? 'gov-btn-primary'
                        : 'gov-btn-secondary'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded border border-[var(--border-default)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-elevated)] text-[var(--text-secondary)] font-mono uppercase text-[10px] border-b border-[var(--border-default)]">
                <tr>
                  <th className="p-3">Seq #</th>
                  <th className="p-3">Token</th>
                  <th className="p-3">Service / Certificate</th>
                  <th className="p-3">Citizen Contact</th>
                  <th className="p-3">Booked At</th>
                  <th className="p-3">Counter</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--surface)]">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                      No tickets matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-[var(--surface-elevated)] transition">
                      <td className="p-3 font-mono text-[var(--text-muted)]">#{t.sequenceNumber}</td>
                      <td className="p-3 font-mono font-bold text-[var(--text-primary)]">{t.tokenNumber}</td>
                      <td className="p-3 font-medium text-[var(--text-primary)]">{t.serviceName}</td>
                      <td className="p-3 font-mono text-[var(--text-secondary)]">+91 {t.citizenMobile}</td>
                      <td className="p-3 font-mono text-[var(--text-muted)]">
                        {new Date(t.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 font-mono text-[var(--gov-gold)]">{t.assignedCounter}</td>
                      <td className="p-3">
                        <span
                          className={`gov-badge ${
                            t.status === 'COMPLETED'
                              ? 'gov-badge-success'
                              : t.status === 'SERVING'
                              ? 'gov-badge-info'
                              : t.status === 'CALLED'
                              ? 'gov-badge-gold'
                              : t.status === 'CANCELLED'
                              ? 'gov-badge-danger'
                              : 'gov-badge-neutral'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
