export const LUXURY_ITEMS = [
  { id: 'hypercar', name: 'Hypercar', emoji: '🏎️', cost: 2500000, prestige: 80, appreciation: -0.0003 },
  { id: 'supercar', name: 'Supercar Collection', emoji: '🚗', cost: 800000, prestige: 45, appreciation: -0.0004 },
  { id: 'luxury-suv', name: 'Luxury SUV Fleet', emoji: '🚙', cost: 350000, prestige: 20, appreciation: -0.0005 },
  { id: 'limousine', name: 'Armored Limousine', emoji: '🚐', cost: 450000, prestige: 25, appreciation: -0.0003 },
  { id: 'private-jet', name: 'Private Jet', emoji: '✈️', cost: 45000000, prestige: 200, appreciation: -0.0002 },
  { id: 'helicopter', name: 'Helicopter', emoji: '🚁', cost: 8000000, prestige: 90, appreciation: -0.0003 },
  { id: 'mega-yacht', name: 'Mega Yacht', emoji: '🛥️', cost: 120000000, prestige: 300, appreciation: -0.0001 },
  { id: 'watch-collection', name: 'Designer Watch Collection', emoji: '⌚', cost: 500000, prestige: 35, appreciation: 0.0008 },
  { id: 'jewelry', name: 'Rare Jewelry', emoji: '💎', cost: 2000000, prestige: 60, appreciation: 0.001 },
  { id: 'art-masterpiece', name: 'Masterpiece Artwork', emoji: '🖼️', cost: 15000000, prestige: 150, appreciation: 0.0012 },
  { id: 'designer-wardrobe', name: 'Designer Wardrobe', emoji: '👗', cost: 200000, prestige: 15, appreciation: -0.0002 },
  { id: 'private-island', name: 'Private Island', emoji: '🏝️', cost: 80000000, prestige: 250, appreciation: 0.0005 },
  { id: 'castle', name: 'Historic Castle', emoji: '🏰', cost: 50000000, prestige: 180, appreciation: 0.0004 },
  { id: 'mansion', name: 'Mega Mansion', emoji: '🏛️', cost: 25000000, prestige: 120, appreciation: 0.0003 },
  { id: 'classic-cars', name: 'Classic Car Collection', emoji: '🚘', cost: 3000000, prestige: 70, appreciation: 0.0006 },
  { id: 'rare-collectible', name: 'Rare Collectibles', emoji: '🏺', cost: 1000000, prestige: 40, appreciation: 0.0009 },
];

export const REAL_ESTATE_TYPES = [
  { id: 'apartment', name: 'Apartment Building', cost: 800000, rentPerMonth: 12000, appreciation: 0.0004 },
  { id: 'villa', name: 'Luxury Villa', cost: 3500000, rentPerMonth: 0, appreciation: 0.0006, prestige: 30 },
  { id: 'mansion-re', name: 'Mansion Estate', cost: 12000000, rentPerMonth: 0, appreciation: 0.0005, prestige: 60 },
  { id: 'hotel-re', name: 'Boutique Hotel', cost: 8000000, rentPerMonth: 85000, appreciation: 0.0003 },
  { id: 'mall-re', name: 'Retail Mall', cost: 25000000, rentPerMonth: 180000, appreciation: 0.00035 },
  { id: 'office-tower', name: 'Office Tower', cost: 40000000, rentPerMonth: 320000, appreciation: 0.0004 },
  { id: 'warehouse', name: 'Warehouse Complex', cost: 3000000, rentPerMonth: 28000, appreciation: 0.0003 },
  { id: 'factory-re', name: 'Industrial Factory', cost: 6000000, rentPerMonth: 45000, appreciation: 0.00025 },
  { id: 'resort-re', name: 'Resort Property', cost: 18000000, rentPerMonth: 120000, appreciation: 0.00045 },
  { id: 'industrial-park', name: 'Industrial Park', cost: 35000000, rentPerMonth: 250000, appreciation: 0.0003 },
  { id: 'land', name: 'Development Land', cost: 2000000, rentPerMonth: 0, appreciation: 0.0008 },
  { id: 'marina', name: 'Marina', cost: 15000000, rentPerMonth: 95000, appreciation: 0.0004 },
];

export function getLuxuryItem(id) {
  return LUXURY_ITEMS.find((l) => l.id === id);
}

export function getRealEstateType(id) {
  return REAL_ESTATE_TYPES.find((r) => r.id === id);
}
