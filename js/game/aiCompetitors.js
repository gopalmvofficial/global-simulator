export function tickAICompetitors(competitors, market) {
  return competitors.map((ai) => {
    const growth = (Math.random() - 0.45) * 0.02 * (1 + ai.aggression);
    const marketEffect = market.phase === 'bull' ? 1.01 : market.phase === 'bear' ? 0.99 : 1;
    const newWorth = Math.max(100000, ai.netWorth * (1 + growth) * marketEffect);
    const companyChange = Math.random() < ai.aggression * 0.1 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    return {
      ...ai,
      netWorth: newWorth,
      companies: Math.max(1, ai.companies + companyChange),
      reputation: Math.max(0, Math.min(100, ai.reputation + (Math.random() - 0.5) * 2)),
    };
  }).sort((a, b) => b.netWorth - a.netWorth);
}

export function getAIActions(state) {
  const actions = [];
  if (Math.random() < 0.05) {
    const ai = state.aiCompetitors[Math.floor(Math.random() * 20)];
    const target = state.market.listings[Math.floor(Math.random() * state.market.listings.length)];
    if (ai && target) {
      actions.push({ type: 'bid', ai: ai.name, target: target.name, msg: `${ai.name} increases stake in ${target.name}` });
    }
  }
  if (Math.random() < 0.03) {
    const ai = state.aiCompetitors[Math.floor(Math.random() * 10)];
    actions.push({ type: 'expand', ai: ai?.name, msg: `${ai?.name} announces international expansion` });
  }
  return actions;
}

export function getPlayerRank(state) {
  const all = [{ name: state.playerName, netWorth: state.netWorth, isPlayer: true }, ...state.aiCompetitors.map((a) => ({ name: a.name, netWorth: a.netWorth }))];
  all.sort((a, b) => b.netWorth - a.netWorth);
  const rank = all.findIndex((e) => e.isPlayer) + 1;
  return { rank, total: all.length, leaders: all.slice(0, 10) };
}
