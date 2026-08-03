export function tickAuctions(auctions) {
  return auctions.map((a) => ({
    ...a,
    ticksLeft: a.ticksLeft - 1,
    currentBid: a.ticksLeft % 3 === 0 ? a.currentBid + a.minIncrement * (Math.random() > 0.4 ? 1 : 0) : a.currentBid,
    highBidder: a.ticksLeft % 5 === 0 ? 'AI Rival' : a.highBidder,
  })).filter((a) => a.ticksLeft > 0);
}

export function placeBid(state, auctionId, amount) {
  const auction = state.auctions.find((a) => a.id === auctionId);
  if (!auction) return { ok: false, msg: 'Auction not found.' };
  if (amount < auction.currentBid + auction.minIncrement) return { ok: false, msg: `Minimum bid: $${(auction.currentBid + auction.minIncrement).toLocaleString()}` };
  if (state.personalCash < amount) return { ok: false, msg: 'Insufficient funds.' };

  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - amount,
      auctions: state.auctions.map((a) =>
        a.id === auctionId ? { ...a, currentBid: amount, highBidder: state.playerName, bidder: 'player' } : a
      ),
    },
    msg: `Bid of $${amount.toLocaleString()} placed.`,
  };
}

export function generateNewAuction() {
  const types = [
    { type: 'tv-rights', name: 'Champions League Broadcast Rights', base: 80000000 },
    { type: 'streaming', name: 'Exclusive Streaming Rights Package', base: 45000000 },
    { type: 'real-estate', name: 'Waterfront Commercial District', base: 120000000 },
    { type: 'company', name: 'Tech Startup Portfolio', base: 25000000 },
    { type: 'sports', name: 'Basketball Franchise', base: 2000000000 },
    { type: 'luxury', name: 'Rare Art Collection', base: 35000000 },
  ];
  const t = types[Math.floor(Math.random() * types.length)];
  return {
    id: `auc-${Date.now()}`,
    type: t.type,
    name: t.name,
    currentBid: t.base,
    minIncrement: Math.floor(t.base * 0.05),
    ticksLeft: 15 + Math.floor(Math.random() * 15),
    highBidder: null,
    bidder: null,
  };
}
