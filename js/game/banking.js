export function takeLoan(state, amount, termMonths = 60, purpose = 'general') {
  const maxLoan = state.netWorth * 0.5 + state.reputation * 50000;
  const existing = (state.loans || []).reduce((s, l) => s + l.remaining, 0);
  if (existing + amount > maxLoan) return { ok: false, msg: 'Exceeds borrowing limit.' };
  const rate = state.economy.interestRate / 100 + 0.02;
  const loan = {
    id: `loan-${Date.now()}`,
    amount,
    remaining: amount,
    rate,
    termMonths,
    purpose,
    takenAt: { ...state.date },
  };
  return {
    ok: true,
    state: { ...state, personalCash: state.personalCash + amount, loans: [...(state.loans || []), loan] },
    msg: `Loan of $${amount.toLocaleString()} approved at ${(rate * 100).toFixed(1)}% APR.`,
  };
}

export function repayLoan(state, loanId, amount) {
  const loan = (state.loans || []).find((l) => l.id === loanId);
  if (!loan) return { ok: false, msg: 'Loan not found.' };
  const pay = Math.min(amount, loan.remaining, state.personalCash);
  if (pay <= 0) return { ok: false, msg: 'Cannot repay.' };
  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - pay,
      loans: state.loans.map((l) => l.id === loanId ? { ...l, remaining: l.remaining - pay } : l).filter((l) => l.remaining > 0),
    },
    msg: `Repaid $${pay.toLocaleString()} on loan.`,
  };
}

export function openDeposit(state, amount) {
  if (state.personalCash < amount) return { ok: false, msg: 'Insufficient funds.' };
  const rate = Math.max(0.5, state.economy.interestRate - 1) / 100;
  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - amount,
      deposits: (state.deposits || 0) + amount,
      depositRate: rate,
    },
    msg: `Deposited $${amount.toLocaleString()} at ${(rate * 100).toFixed(1)}% APY.`,
  };
}

export function withdrawDeposit(state, amount) {
  const dep = state.deposits || 0;
  const withdraw = Math.min(amount, dep);
  if (withdraw <= 0) return { ok: false, msg: 'No deposits.' };
  return {
    ok: true,
    state: { ...state, personalCash: state.personalCash + withdraw, deposits: dep - withdraw },
    msg: `Withdrew $${withdraw.toLocaleString()} from deposits.`,
  };
}

export function tickDeposits(state) {
  if (!state.deposits || !state.depositRate) return state;
  const interest = state.deposits * (state.depositRate / 365);
  return { ...state, deposits: state.deposits + interest };
}
