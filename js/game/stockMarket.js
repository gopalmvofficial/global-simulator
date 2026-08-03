export function tickMarket(market, mult = 1, economy) {
  const m = { ...market, listings: [...market.listings] };
  let totalChange = 0;

  m.listings = m.listings.map((listing) => {
    const vol = listing.category === 'technology' ? 0.06 : listing.category === 'financial' ? 0.04 : 0.035;
    const phaseDrift = economy?.phase === 'boom' ? 0.02 : economy?.phase === 'recession' ? -0.02 : 0;
    const drift = (Math.random() - 0.48 + phaseDrift) * vol * mult;
    const newPrice = Math.max(0.5, listing.price * (1 + drift));
    totalChange += drift;
    const history = [...(listing.priceHistory || []), newPrice].slice(-60);
    return {
      ...listing,
      price: newPrice,
      marketCap: newPrice * listing.sharesOutstanding,
      priceHistory: history,
    };
  });

  m.index = Math.max(100, m.index * (1 + totalChange / m.listings.length));
  if (m.index > 1400) m.phase = 'bull';
  else if (m.index < 700) m.phase = 'bear';
  else m.phase = 'neutral';

  return m;
}

export function buyShares(state, symbol, quantity) {
  const listing = state.market.listings.find((l) => l.symbol === symbol);
  if (!listing) return { ok: false, msg: 'Stock not found.' };
  const cost = listing.price * quantity;
  if (state.personalCash < cost) return { ok: false, msg: 'Insufficient funds.' };
  const held = (state.stockHoldings[symbol] || 0) + quantity;
  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - cost,
      stockHoldings: { ...state.stockHoldings, [symbol]: held },
    },
    msg: `Bought ${quantity} shares of ${symbol} at $${listing.price.toFixed(2)}.`,
  };
}

export function sellShares(state, symbol, quantity) {
  const held = state.stockHoldings[symbol] || 0;
  if (held < quantity) return { ok: false, msg: 'Not enough shares.' };
  const listing = state.market.listings.find((l) => l.symbol === symbol);
  const proceeds = (listing?.price || 0) * quantity;
  const newHoldings = { ...state.stockHoldings, [symbol]: held - quantity };
  if (newHoldings[symbol] === 0) delete newHoldings[symbol];
  return {
    ok: true,
    state: { ...state, personalCash: state.personalCash + proceeds, stockHoldings: newHoldings },
    msg: `Sold ${quantity} shares of ${symbol}.`,
  };
}

export function ipoCompany(state, companyId, sharesToOffer, pricePerShare) {
  const co = state.companies.find((c) => c.id === companyId);
  if (!co) return { ok: false, msg: 'Company not found.' };
  if (co.isPublic) return { ok: false, msg: 'Already public.' };
  const proceeds = sharesToOffer * pricePerShare;
  const symbol = co.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 4);

  const listing = {
    id: co.id,
    symbol,
    name: co.name,
    typeId: co.typeId,
    category: co.category,
    price: pricePerShare,
    sharesOutstanding: sharesToOffer * 2,
    float: sharesToOffer,
    marketCap: pricePerShare * sharesToOffer * 2,
    dividend: 0,
    isPlayer: true,
    isPublic: true,
    priceHistory: Array(10).fill(pricePerShare),
  };

  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash + proceeds,
      companies: state.companies.map((c) => c.id === companyId ? { ...c, isPublic: true, symbol } : c),
      market: { ...state.market, listings: [...state.market.listings, listing] },
      stockHoldings: { ...state.stockHoldings, [symbol]: (state.market.listings.filter(l => l.isPlayer).length === 0 ? sharesToOffer : 0) },
    },
    msg: `${co.name} went public (${symbol}) raising ${proceeds.toLocaleString()}.`,
  };
}

export function attemptTakeover(state, symbol) {
  const listing = state.market.listings.find((l) => l.symbol === symbol);
  if (!listing || listing.isPlayer) return { ok: false, msg: 'Cannot acquire.' };
  const held = state.stockHoldings[symbol] || 0;
  const threshold = listing.float * 0.51;
  if (held < threshold) return { ok: false, msg: `Need ${Math.ceil(threshold - held)} more shares for control.` };
  const cost = listing.price * (listing.float - held) * 1.3;
  if (state.personalCash < cost * 0.3) return { ok: false, msg: 'Insufficient funds for takeover premium.' };
  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - cost * 0.3,
      stockHoldings: { ...state.stockHoldings, [symbol]: listing.sharesOutstanding },
    },
    msg: `Hostile takeover of ${listing.name} successful!`,
  };
}

export function stockSplit(state, symbol, ratio = 2) {
  const listing = state.market.listings.find((l) => l.symbol === symbol && l.isPlayer);
  if (!listing) return { ok: false, msg: 'Not your public company.' };
  const held = state.stockHoldings[symbol] || 0;
  return {
    ok: true,
    state: {
      ...state,
      market: {
        ...state.market,
        listings: state.market.listings.map((l) =>
          l.symbol === symbol
            ? { ...l, price: l.price / ratio, sharesOutstanding: l.sharesOutstanding * ratio, float: l.float * ratio }
            : l
        ),
      },
      stockHoldings: { ...state.stockHoldings, [symbol]: held * ratio },
    },
    msg: `${ratio}-for-1 stock split executed for ${symbol}.`,
  };
}

export function shareBuyback(state, symbol, amount) {
  const listing = state.market.listings.find((l) => l.symbol === symbol && l.isPlayer);
  if (!listing) return { ok: false, msg: 'Not your public company.' };
  const shares = Math.floor(amount / listing.price);
  if (state.personalCash < amount) return { ok: false, msg: 'Insufficient funds.' };
  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - amount,
      market: {
        ...state.market,
        listings: state.market.listings.map((l) =>
          l.symbol === symbol ? { ...l, float: Math.max(0, l.float - shares) } : l
        ),
      },
    },
    msg: `Buyback of ${shares} shares completed.`,
  };
}
