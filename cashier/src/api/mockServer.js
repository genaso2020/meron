function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDateTime(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hh = String(h).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${mm} ${dd}, ${yyyy}, ${hh}:${mi}:${ss} ${ampm}`;
}

function formatScheduleTime(d) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mmm = months[d.getMonth()];
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hh = String(h).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${mmm} ${dd}, ${yyyy}, Time : ${hh}:${mi}:${ss} ${ampm}`;
}

export function createMockServer() {
  let fightNo = 5;
  let subscribers = new Set();
  let placedTickets = [];
  let claimedCodes = new Set();
  let eodRows = [];

  const users = [
    {
      id: 1,
      email: 'cashier@demo.local',
      password: '1234',
      role: 'cashier',
      tellerNo: 4,
      tellerName: 'Cashier Basic User',
      outlet: 'Outlet/Branch'
    },
    {
      id: 2,
      email: 'manager@demo.local',
      password: '1234',
      pin: '1234',
      role: 'manager',
      tellerNo: 1,
      tellerName: 'Manager User',
      outlet: 'Outlet/Branch'
    },
    {
      id: 3,
      email: 'supervisor@demo.local',
      password: '1234',
      pin: '1234',
      role: 'supervisor',
      tellerNo: 2,
      tellerName: 'Supervisor User',
      outlet: 'Outlet/Branch'
    }
  ];

  const results = [
    {
      fightNo: 1,
      datetime: formatScheduleTime(new Date(Date.now() - 4 * 60 * 60 * 1000)),
      cock1: 'Cock Red / R-01 / MERON',
      cock2: 'Cock White / W-01 / WALA',
      winningSide: 'MERON',
      method: 'TKO'
    },
    {
      fightNo: 2,
      datetime: formatScheduleTime(new Date(Date.now() - 3 * 60 * 60 * 1000)),
      cock1: 'Cock Green / G-02 / MERON',
      cock2: 'Cock Blue / B-02 / WALA',
      winningSide: 'WALA',
      method: 'DEC'
    },
    {
      fightNo: 3,
      datetime: formatScheduleTime(new Date(Date.now() - 2 * 60 * 60 * 1000)),
      cock1: 'Cock A / A-03 / MERON',
      cock2: 'Cock B / B-03 / WALA',
      winningSide: 'DRAW',
      method: 'DRAW'
    }
  ];

  const state = {
    fight: {
      datetimeLabel: formatDateTime(new Date()),
      title: 'Place Your Bet Now!!!',
      fightNo,
      scheduleTime: formatScheduleTime(new Date())
    },
    limits: {
      min: 150,
      max: 100_000_000
    },
    odds: {
      MERON: 1.85,
      DRAW: 8.0,
      WALA: 1.42
    }
  };

  const matches = [
    {
      fightNo: 5,
      scheduleTime: formatScheduleTime(new Date()),
      eventName: 'Derby Event',
      eventLocation: 'Outlet/Branch',
      cock1Name: 'Cock A',
      cock2Name: 'Cock B',
      status: 'ACTIVE'
    },
    {
      fightNo: 6,
      scheduleTime: formatScheduleTime(new Date(Date.now() + 15 * 60 * 1000)),
      eventName: 'Derby Event',
      eventLocation: 'Outlet/Branch',
      cock1Name: 'Cock C',
      cock2Name: 'Cock D',
      status: 'SCHEDULED'
    },
    {
      fightNo: 7,
      scheduleTime: formatScheduleTime(new Date(Date.now() + 30 * 60 * 1000)),
      eventName: 'Derby Event',
      eventLocation: 'Outlet/Branch',
      cock1Name: 'Cock E',
      cock2Name: 'Cock F',
      status: 'SCHEDULED'
    },
    {
      fightNo: 4,
      scheduleTime: formatScheduleTime(new Date(Date.now() - 45 * 60 * 1000)),
      eventName: 'Derby Event',
      eventLocation: 'Outlet/Branch',
      cock1Name: 'Cock X',
      cock2Name: 'Cock Y',
      status: 'DONE'
    }
  ];

  const interval = setInterval(() => {
    state.fight = {
      ...state.fight,
      datetimeLabel: formatDateTime(new Date())
    };
    for (const cb of subscribers) cb({ ...state.fight });
  }, 1000);

  return {
    async login({ email, password }) {
      await sleep(250);
      const u = users.find((x) => x.email.toLowerCase() === String(email).toLowerCase());
      if (!u || u.password !== password) {
        throw new Error('Invalid email or password');
      }
      return {
        userId: u.id,
        email: u.email,
        role: u.role,
        tellerNo: u.tellerNo,
        tellerName: u.tellerName,
        outlet: u.outlet
      };
    },
    logout() {
      return;
    },
    async verifyPassword({ userId, password }) {
      await sleep(250);
      const u = users.find((x) => x.id === userId);
      if (!u || u.password !== password) {
        throw new Error('Invalid password');
      }
      return { ok: true };
    },
    async verifyManagerPin({ pin }) {
      await sleep(250);
      const p = String(pin ?? '');
      const u = users.find((x) => String(x.role).toLowerCase() !== 'cashier' && String(x.pin ?? x.password) === p);
      if (!u) {
        throw new Error('Invalid PIN');
      }
      return { ok: true, userId: u.id, role: u.role, tellerName: u.tellerName };
    },
    async setFightNo({ fightNo }) {
      await sleep(200);
      if (!Number.isInteger(fightNo) || fightNo <= 0) {
        throw new Error('Invalid fight number');
      }

      const m = matches.find((x) => x.fightNo === fightNo);
      state.fight = {
        ...state.fight,
        fightNo,
        scheduleTime: m?.scheduleTime ?? state.fight.scheduleTime
      };
      for (const cb of subscribers) cb({ ...state.fight });
      return { ok: true };
    },
    async getScheduledFights() {
      await sleep(250);
      return matches
        .filter((m) => String(m.status).toUpperCase() !== 'DONE')
        .sort((a, b) => a.fightNo - b.fightNo)
        .map((m) => ({ ...m }));
    },
    async getActiveMatchForSod() {
      await sleep(250);
      const active = matches.filter((m) => String(m.status).toUpperCase() === 'ACTIVE');
      if (active.length === 0) {
        throw new Error('No ACTIVE match found');
      }

      const keyCounts = new Map();
      for (const m of active) {
        const key = `${m.eventName ?? ''}__${m.eventLocation ?? ''}__${m.scheduleTime ?? ''}`;
        keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
      }

      for (const [, count] of keyCounts) {
        if (count > 1) {
          throw new Error('Duplicate ACTIVE matches found for the same event/location/schedule time');
        }
      }

      return { ...active[0] };
    },
    async getCurrentFight() {
      await sleep(150);
      return { ...state.fight };
    },
    async getLimits() {
      await sleep(100);
      return { ...state.limits };
    },
    async getOdds() {
      await sleep(120);
      return { ...state.odds };
    },
    async getMatchResults() {
      await sleep(350);
      return results.map((r) => ({ ...r }));
    },
    subscribeToFightUpdates(cb) {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    async placeBet({ tellerNo, fightNo, side, amount }) {
      await sleep(250);
      const ticketId = Math.random().toString(36).slice(2, 10).toUpperCase();
      const ticket = {
        ticketId,
        tellerNo,
        fightNo,
        side,
        amount,
        createdAt: new Date().toISOString()
      };
      placedTickets = [ticket, ...placedTickets].slice(0, 250);
      return ticket;
    },
    async getTicketByCode({ code }) {
      await sleep(250);
      const c = String(code ?? '').trim().toUpperCase();
      if (!c) throw new Error('Ticket code is required');
      const t = placedTickets.find((x) => String(x.ticketId).toUpperCase() === c);
      if (!t) throw new Error('Ticket not found');
      if (claimedCodes.has(c)) throw new Error('Ticket already claimed');
      const oddsValue = Number(state.odds?.[t.side] ?? 0);
      const amt = Number(t.amount ?? 0);
      const payout = (Number.isFinite(amt) ? amt : 0) * (Number.isFinite(oddsValue) ? oddsValue : 0);
      return {
        code: c,
        ticketNo: t.ticketId,
        eventName: state.fight?.title ?? 'Event',
        fightNo: t.fightNo,
        side: t.side,
        amount: t.amount,
        odds: oddsValue,
        possiblePayout: payout,
        createdAt: t.createdAt,
        createdAtText: formatDateTime(new Date(t.createdAt))
      };
    },
    async claimTicket({ code, releasingTerminal, claimedBy, claimedAt }) {
      await sleep(300);
      const c = String(code ?? '').trim().toUpperCase();
      if (!c) throw new Error('Ticket code is required');
      if (claimedCodes.has(c)) throw new Error('Ticket already claimed');
      const t = placedTickets.find((x) => String(x.ticketId).toUpperCase() === c);
      if (!t) throw new Error('Ticket not found');
      claimedCodes.add(c);
      const oddsValue = Number(state.odds?.[t.side] ?? 0);
      const amt = Number(t.amount ?? 0);
      const payout = (Number.isFinite(amt) ? amt : 0) * (Number.isFinite(oddsValue) ? oddsValue : 0);
      const at = claimedAt ? new Date(claimedAt) : new Date();
      return {
        code: c,
        ticketNo: t.ticketId,
        eventName: state.fight?.title ?? 'Event',
        fightNo: t.fightNo,
        side: t.side,
        amount: t.amount,
        odds: oddsValue,
        possiblePayout: payout,
        cashier: claimedBy ?? 'Cashier',
        terminal: releasingTerminal,
        createdAt: t.createdAt,
        createdAtText: formatDateTime(new Date(t.createdAt)),
        claimedAt: at.toISOString(),
        claimedAtText: formatDateTime(at),
        releasingTerminal
      };
    },
    async refundTicket({ ticketId }) {
      await sleep(250);
      return { ticketId, refunded: true };
    },
    async winningCall({ fightNo, winnerSide }) {
      await sleep(250);
      return { fightNo, winnerSide, ok: true };
    },
    async eod(payload) {
      await sleep(350);
      if (payload) {
        eodRows = [{ ...payload, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` }, ...eodRows].slice(0, 200);
      }
      return { ok: true };
    },
    async sod() {
      await sleep(350);
      return { ok: true };
    },
    dispose() {
      clearInterval(interval);
      subscribers.clear();
    }
  };
}
