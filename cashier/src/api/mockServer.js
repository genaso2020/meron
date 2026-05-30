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

export function createMockServer() {
  let fightNo = 5;
  let subscribers = new Set();

  const users = [
    {
      id: 1,
      email: 'cashier@demo.local',
      password: '1234',
      tellerNo: 4,
      tellerName: 'Cashier Basic User',
      outlet: 'Outlet/Branch'
    }
  ];

  const state = {
    fight: {
      datetimeLabel: formatDateTime(new Date()),
      title: 'Place Your Bet Now!!!',
      fightNo
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
    subscribeToFightUpdates(cb) {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    async placeBet({ tellerNo, fightNo, side, amount }) {
      await sleep(250);
      const ticketId = Math.random().toString(36).slice(2, 10).toUpperCase();
      return {
        ticketId,
        tellerNo,
        fightNo,
        side,
        amount,
        createdAt: new Date().toISOString()
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
    async eod() {
      await sleep(350);
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
