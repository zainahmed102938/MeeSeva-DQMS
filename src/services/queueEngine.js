/**
 * MeeSeva Deterministic Queue Engine
 * 
 * Replaces prototype's Math.random() and frontend setInterval() with 
 * transactional, relational-compliant queue algorithms.
 * Mirrors the Oracle 23ai schema and state machine:
 * WAITING -> CALLED -> SERVING -> COMPLETED | CANCELLED | NO_SHOW | HOLD
 */

import { MASTER_DEPARTMENTS, TELANGANA_DISTRICTS, getOfficesForDistrict } from '../data/masterData';

const STORAGE_KEYS = {
  TICKETS: 'MEESEVA_QUEUE_TICKETS_V1',
  HISTORY: 'MEESEVA_STATUS_HISTORY_V1',
  COUNTERS: 'MEESEVA_OFFICE_COUNTERS_V1',
  DAILY_SEQUENCES: 'MEESEVA_DAILY_SEQUENCES_V1'
};

// Initial Seed Data (Deterministic initial state)
const getInitialSeed = () => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Pre-seed realistic active counters across key offices
  const initialCounters = [
    { id: 1, officeName: 'MeeSeva Center - Sanath Nagar', districtId: 'HYD', departmentId: 'REV', counterNumber: 'Counter 01', status: 'OPEN', currentTicketId: 102 },
    { id: 2, officeName: 'MeeSeva Center - Sanath Nagar', districtId: 'HYD', departmentId: 'REV', counterNumber: 'Counter 02', status: 'OPEN', currentTicketId: null },
    { id: 3, officeName: 'District RTO Office - Hyderabad', districtId: 'HYD', departmentId: 'RTA', counterNumber: 'Counter 04', status: 'OPEN', currentTicketId: 201 },
    { id: 4, officeName: 'MeeSeva Center - Municipal Complex, Hanamkonda', districtId: 'HNK', departmentId: 'REG', counterNumber: 'Counter 03', status: 'OPEN', currentTicketId: 301 },
    { id: 5, officeName: 'MeeSeva Center - Civil Supplies Hub, Nizamabad', districtId: 'NZB', departmentId: 'CIVIL', counterNumber: 'Counter 06', status: 'OPEN', currentTicketId: 401 }
  ];

  // Pre-seed initial tickets
  const initialTickets = [
    {
      id: 101,
      citizenId: 'cit-9876543200',
      citizenMobile: '9876543200',
      districtId: 'HYD',
      departmentId: 'REV',
      serviceName: 'Income Certificate',
      tokenNumber: 'REV-001',
      sequenceNumber: 1,
      bookingDate: todayStr,
      officeName: 'MeeSeva Center - Sanath Nagar',
      officeAddress: 'H No 7-1-304/2/A/1, Subhash Nagar, Sanath Nagar, Hyderabad - 500018',
      assignedCounter: 'Counter 01',
      counterId: 1,
      status: 'COMPLETED',
      bookedAt: new Date(now.getTime() - 40 * 60000).toISOString(),
      calledAt: new Date(now.getTime() - 35 * 60000).toISOString(),
      servingAt: new Date(now.getTime() - 33 * 60000).toISOString(),
      completedAt: new Date(now.getTime() - 25 * 60000).toISOString()
    },
    {
      id: 102,
      citizenId: 'cit-9876543201',
      citizenMobile: '9876543201',
      districtId: 'HYD',
      departmentId: 'REV',
      serviceName: 'Caste / Community Certificate',
      tokenNumber: 'REV-002',
      sequenceNumber: 2,
      bookingDate: todayStr,
      officeName: 'MeeSeva Center - Sanath Nagar',
      officeAddress: 'H No 7-1-304/2/A/1, Subhash Nagar, Sanath Nagar, Hyderabad - 500018',
      assignedCounter: 'Counter 01',
      counterId: 1,
      status: 'SERVING',
      bookedAt: new Date(now.getTime() - 24 * 60000).toISOString(),
      calledAt: new Date(now.getTime() - 8 * 60000).toISOString(),
      servingAt: new Date(now.getTime() - 5 * 60000).toISOString(),
      completedAt: null
    },
    {
      id: 103,
      citizenId: 'cit-9876543202',
      citizenMobile: '9876543202',
      districtId: 'HYD',
      departmentId: 'REV',
      serviceName: 'Residence / Nativity Certificate',
      tokenNumber: 'REV-003',
      sequenceNumber: 3,
      bookingDate: todayStr,
      officeName: 'MeeSeva Center - Sanath Nagar',
      officeAddress: 'H No 7-1-304/2/A/1, Subhash Nagar, Sanath Nagar, Hyderabad - 500018',
      assignedCounter: 'Counter 01 & 02',
      counterId: null,
      status: 'WAITING',
      bookedAt: new Date(now.getTime() - 15 * 60000).toISOString(),
      calledAt: null,
      servingAt: null,
      completedAt: null
    },
    {
      id: 104,
      citizenId: 'cit-9876543203',
      citizenMobile: '9876543203',
      districtId: 'HYD',
      departmentId: 'REV',
      serviceName: 'Encumbrance Certificate (EC)',
      tokenNumber: 'REV-004',
      sequenceNumber: 4,
      bookingDate: todayStr,
      officeName: 'MeeSeva Center - Sanath Nagar',
      officeAddress: 'H No 7-1-304/2/A/1, Subhash Nagar, Sanath Nagar, Hyderabad - 500018',
      assignedCounter: 'Counter 01 & 02',
      counterId: null,
      status: 'WAITING',
      bookedAt: new Date(now.getTime() - 7 * 60000).toISOString(),
      calledAt: null,
      servingAt: null,
      completedAt: null
    }
  ];

  const initialHistory = [
    { id: 1, ticketId: 101, oldStatus: 'WAITING', newStatus: 'CALLED', changedBy: 'Sri V. Ramesh', changedAt: new Date(now.getTime() - 35 * 60000).toISOString() },
    { id: 2, ticketId: 101, oldStatus: 'CALLED', newStatus: 'SERVING', changedBy: 'Sri V. Ramesh', changedAt: new Date(now.getTime() - 33 * 60000).toISOString() },
    { id: 3, ticketId: 101, oldStatus: 'SERVING', newStatus: 'COMPLETED', changedBy: 'Sri V. Ramesh', changedAt: new Date(now.getTime() - 25 * 60000).toISOString() },
    { id: 4, ticketId: 102, oldStatus: 'WAITING', newStatus: 'CALLED', changedBy: 'Sri V. Ramesh', changedAt: new Date(now.getTime() - 8 * 60000).toISOString() },
    { id: 5, ticketId: 102, oldStatus: 'CALLED', newStatus: 'SERVING', changedBy: 'Sri V. Ramesh', changedAt: new Date(now.getTime() - 5 * 60000).toISOString() }
  ];

  const initialSequences = {
    'HYD_REV': 4,
    'HYD_RTA': 1,
    'HNK_REG': 1,
    'NZB_CIVIL': 1
  };

  return { initialTickets, initialHistory, initialCounters, initialSequences };
};

export class QueueEngine {
  constructor() {
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
      const seed = getInitialSeed();
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(seed.initialTickets));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(seed.initialHistory));
      localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(seed.initialCounters));
      localStorage.setItem(STORAGE_KEYS.DAILY_SEQUENCES, JSON.stringify(seed.initialSequences));
    }
  }

  getTickets() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
  }

  saveTickets(tickets) {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }

  getHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
  }

  addHistory(ticketId, oldStatus, newStatus, changedBy, remarks = '') {
    const history = this.getHistory();
    const entry = {
      id: Date.now() + Math.floor(Math.random() * 100),
      ticketId,
      oldStatus,
      newStatus,
      changedBy,
      remarks,
      changedAt: new Date().toISOString()
    };
    history.push(entry);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return entry;
  }

  getCounters() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COUNTERS) || '[]');
  }

  saveCounters(counters) {
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
  }

  getSequences() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_SEQUENCES) || '{}');
  }

  saveSequences(seqs) {
    localStorage.setItem(STORAGE_KEYS.DAILY_SEQUENCES, JSON.stringify(seqs));
  }

  // 1. Transactional Ticket Booking
  bookVirtualTicket({
    citizenMobile,
    districtId,
    departmentId,
    subServiceName,
    officeName,
    officeAddress
  }) {
    const dept = MASTER_DEPARTMENTS[departmentId];
    if (!dept) throw new Error('Invalid Department specified.');

    const tickets = this.getTickets();
    const todayStr = new Date().toISOString().slice(0, 10);

    // Guard: Prevent double-booking for the same mobile in WAITING or SERVING status
    const existingActive = tickets.find(
      (t) =>
        t.citizenMobile === citizenMobile &&
        (t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'SERVING')
    );

    if (existingActive) {
      throw new Error(
        `Active ticket (${existingActive.tokenNumber}) already exists for this mobile number at ${existingActive.officeName}. Please complete or cancel it before booking a new ticket.`
      );
    }

    // Sequence increment
    const sequences = this.getSequences();
    const seqKey = `${districtId}_${departmentId}`;
    const nextSeq = (sequences[seqKey] || 0) + 1;
    sequences[seqKey] = nextSeq;
    this.saveSequences(sequences);

    const tokenNumber = `${dept.prefix}${String(nextSeq).padStart(3, '0')}`;

    const newTicket = {
      id: Date.now(),
      citizenId: `cit-${citizenMobile}`,
      citizenMobile,
      districtId,
      departmentId,
      serviceName: subServiceName,
      tokenNumber,
      sequenceNumber: nextSeq,
      bookingDate: todayStr,
      officeName,
      officeAddress,
      assignedCounter: dept.counterName,
      counterId: null,
      status: 'WAITING',
      bookedAt: new Date().toISOString(),
      calledAt: null,
      servingAt: null,
      completedAt: null,
      cancelledAt: null
    };

    tickets.push(newTicket);
    this.saveTickets(tickets);

    this.addHistory(newTicket.id, null, 'WAITING', `Citizen (${citizenMobile})`, 'Virtual ticket self-booked');

    return this.calculateTicketTelemetry(newTicket);
  }

  // 2. Telemetry & Queue Position Calculator (NO RANDOM MATH)
  calculateTicketTelemetry(ticket) {
    if (!ticket) return null;

    const tickets = this.getTickets();
    const dept = MASTER_DEPARTMENTS[ticket.departmentId];
    const avgMins = dept?.avgServiceMinutes || 4;

    // Filter tickets in the same office and department
    const relevantTickets = tickets.filter(
      (t) =>
        t.officeName === ticket.officeName &&
        t.departmentId === ticket.departmentId &&
        t.bookingDate === ticket.bookingDate
    );

    // Active counters in this office & department
    const counters = this.getCounters().filter(
      (c) =>
        c.officeName === ticket.officeName &&
        c.departmentId === ticket.departmentId &&
        c.status === 'OPEN'
    );
    const activeCounterCount = Math.max(1, counters.length);

    // Calculate People Ahead: WAITING tickets with sequenceNumber < current ticket
    const peopleAhead = relevantTickets.filter(
      (t) => t.status === 'WAITING' && t.sequenceNumber < ticket.sequenceNumber
    ).length;

    // Current Serving Token in this office/department
    const currentServingTicket = relevantTickets.find((t) => t.status === 'SERVING') ||
      relevantTickets.find((t) => t.status === 'CALLED');

    const currentServingToken = currentServingTicket ? currentServingTicket.tokenNumber : 'None';

    // Estimated Wait Time (Deterministic Calculation)
    let estimatedWaitMinutes = 0;
    if (ticket.status === 'SERVING') {
      estimatedWaitMinutes = 0;
    } else if (ticket.status === 'CALLED') {
      estimatedWaitMinutes = 0;
    } else if (ticket.status === 'WAITING') {
      estimatedWaitMinutes = Math.ceil((peopleAhead * avgMins) / activeCounterCount);
    }

    return {
      ...ticket,
      peopleAhead,
      currentServingToken,
      estimatedWaitMinutes,
      activeCounterCount
    };
  }

  // 3. Get Active Ticket for Citizen Mobile
  getActiveTicketForCitizen(citizenMobile) {
    const tickets = this.getTickets();
    const active = tickets.find(
      (t) =>
        t.citizenMobile === citizenMobile &&
        (t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'SERVING')
    );
    if (!active) return null;
    return this.calculateTicketTelemetry(active);
  }

  // 4. Cancel Ticket
  cancelTicket(ticketId, citizenMobile) {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex((t) => t.id === ticketId);

    if (ticketIndex === -1) throw new Error('Ticket not found.');
    const ticket = tickets[ticketIndex];

    if (ticket.status === 'COMPLETED' || ticket.status === 'CANCELLED') {
      throw new Error(`Cannot cancel a ticket with status ${ticket.status}.`);
    }

    const oldStatus = ticket.status;
    ticket.status = 'CANCELLED';
    ticket.cancelledAt = new Date().toISOString();
    tickets[ticketIndex] = ticket;
    this.saveTickets(tickets);

    this.addHistory(ticketId, oldStatus, 'CANCELLED', `Citizen (${citizenMobile})`, 'User initiated cancellation');

    return ticket;
  }

  // 5. Official: Call Next Waiting Ticket to Counter
  callNextTicket(official, counterNumber) {
    const tickets = this.getTickets();

    // Look for earliest WAITING ticket matching official's office and department
    const waitingTickets = tickets
      .filter(
        (t) =>
          t.officeName === official.officeName &&
          t.departmentId === official.departmentId &&
          t.status === 'WAITING'
      )
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    if (waitingTickets.length === 0) {
      throw new Error(`No waiting citizens in queue for ${official.departmentName} at ${official.officeName}.`);
    }

    const ticketToCall = waitingTickets[0];
    const ticketIndex = tickets.findIndex((t) => t.id === ticketToCall.id);

    const oldStatus = ticketToCall.status;
    ticketToCall.status = 'CALLED';
    ticketToCall.calledAt = new Date().toISOString();
    ticketToCall.assignedCounter = counterNumber || official.assignedCounter || 'Counter 01';
    tickets[ticketIndex] = ticketToCall;
    this.saveTickets(tickets);

    // Update Counter state
    const counters = this.getCounters();
    const counterIndex = counters.findIndex(
      (c) => c.officeName === official.officeName && c.counterNumber === counterNumber
    );
    if (counterIndex !== -1) {
      counters[counterIndex].currentTicketId = ticketToCall.id;
      counters[counterIndex].status = 'OPEN';
      this.saveCounters(counters);
    }

    this.addHistory(
      ticketToCall.id,
      oldStatus,
      'CALLED',
      official.name,
      `Called to ${ticketToCall.assignedCounter}`
    );

    return this.calculateTicketTelemetry(ticketToCall);
  }

  // 6. Official: Start Serving
  startServingTicket(ticketId, official) {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
    if (ticketIndex === -1) throw new Error('Ticket not found.');

    const ticket = tickets[ticketIndex];
    const oldStatus = ticket.status;
    ticket.status = 'SERVING';
    ticket.servingAt = new Date().toISOString();
    tickets[ticketIndex] = ticket;
    this.saveTickets(tickets);

    this.addHistory(ticketId, oldStatus, 'SERVING', official.name, 'Citizen presented at counter, processing begun');
    return this.calculateTicketTelemetry(ticket);
  }

  // 7. Official: Complete Ticket
  completeTicket(ticketId, official, remarks = 'Service completed successfully') {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
    if (ticketIndex === -1) throw new Error('Ticket not found.');

    const ticket = tickets[ticketIndex];
    const oldStatus = ticket.status;
    ticket.status = 'COMPLETED';
    ticket.completedAt = new Date().toISOString();
    tickets[ticketIndex] = ticket;
    this.saveTickets(tickets);

    // Free the counter
    const counters = this.getCounters();
    const counterIndex = counters.findIndex(
      (c) => c.officeName === official.officeName && c.currentTicketId === ticketId
    );
    if (counterIndex !== -1) {
      counters[counterIndex].currentTicketId = null;
      this.saveCounters(counters);
    }

    this.addHistory(ticketId, oldStatus, 'COMPLETED', official.name, remarks);
    return this.calculateTicketTelemetry(ticket);
  }

  // 8. Official: Mark No-Show
  markNoShow(ticketId, official) {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
    if (ticketIndex === -1) throw new Error('Ticket not found.');

    const ticket = tickets[ticketIndex];
    const oldStatus = ticket.status;
    ticket.status = 'NO_SHOW';
    tickets[ticketIndex] = ticket;
    this.saveTickets(tickets);

    // Free the counter
    const counters = this.getCounters();
    const counterIndex = counters.findIndex(
      (c) => c.officeName === official.officeName && c.currentTicketId === ticketId
    );
    if (counterIndex !== -1) {
      counters[counterIndex].currentTicketId = null;
      this.saveCounters(counters);
    }

    this.addHistory(ticketId, oldStatus, 'NO_SHOW', official.name, 'Citizen did not appear when called');
    return this.calculateTicketTelemetry(ticket);
  }

  // 9. Official: Put On Hold
  putOnHold(ticketId, official, reason = 'Document verification pending') {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
    if (ticketIndex === -1) throw new Error('Ticket not found.');

    const ticket = tickets[ticketIndex];
    const oldStatus = ticket.status;
    ticket.status = 'HOLD';
    tickets[ticketIndex] = ticket;
    this.saveTickets(tickets);

    this.addHistory(ticketId, oldStatus, 'HOLD', official.name, reason);
    return this.calculateTicketTelemetry(ticket);
  }

  // 10. Official Dashboard Metrics Aggregator
  getOfficialDashboardMetrics(official) {
    const tickets = this.getTickets();
    const dept = MASTER_DEPARTMENTS[official.departmentId];
    const avgMins = dept?.avgServiceMinutes || 4;

    const officeTickets = tickets.filter(
      (t) =>
        (official.role === 'ADMIN' || t.officeName === official.officeName) &&
        (official.role === 'ADMIN' || t.departmentId === official.departmentId)
    );

    const waiting = officeTickets.filter((t) => t.status === 'WAITING');
    const serving = officeTickets.find((t) => t.status === 'SERVING');
    const called = officeTickets.find((t) => t.status === 'CALLED');
    const completed = officeTickets.filter((t) => t.status === 'COMPLETED');
    const cancelled = officeTickets.filter((t) => t.status === 'CANCELLED');
    const noShow = officeTickets.filter((t) => t.status === 'NO_SHOW');
    const onHold = officeTickets.filter((t) => t.status === 'HOLD');

    const counters = this.getCounters().filter(
      (c) => official.role === 'ADMIN' || (c.officeName === official.officeName && c.departmentId === official.departmentId)
    );

    return {
      totalTicketsToday: officeTickets.length,
      waitingCount: waiting.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      noShowCount: noShow.length,
      holdCount: onHold.length,
      currentServingToken: serving ? serving.tokenNumber : (called ? called.tokenNumber : 'None'),
      currentTicketDetails: serving || called || null,
      activeCounters: counters.filter((c) => c.status === 'OPEN').length,
      totalCounters: counters.length,
      estimatedWaitTimeForNext: Math.ceil((waiting.length * avgMins) / Math.max(1, counters.length)),
      waitingQueue: waiting.sort((a, b) => a.sequenceNumber - b.sequenceNumber),
      recentCompleted: completed.slice(-5).reverse(),
      allOfficeTickets: officeTickets.slice().reverse()
    };
  }
}

export const queueEngine = new QueueEngine();
