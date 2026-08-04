// ===========================================================================
// DATA — all static game configuration lives here. Pure data, no logic.
// ===========================================================================

const DIFFICULTIES = {
  easy:      { label: 'Easy',      startCash: 5000000, aiSpeed: 0.7 },
  normal:    { label: 'Normal',    startCash: 2000000, aiSpeed: 1.0 },
  hard:      { label: 'Hard',      startCash: 800000,  aiSpeed: 1.3 },
  legendary: { label: 'Legendary', startCash: 300000,  aiSpeed: 1.7 },
}

const CITIES = [
  { id: 'newharbor',   name: 'New Harbor',   country: 'Meridia',   population: 8_400_000, gdp: 620_000_000_000, taxRate: 0.24, growth: 0.018, x: 22, y: 34 },
  { id: 'st-aldric',   name: 'St. Aldric',   country: 'Belmoria',  population: 3_100_000, gdp: 210_000_000_000, taxRate: 0.31, growth: 0.012, x: 46, y: 22 },
  { id: 'kaito-bay',   name: 'Kaito Bay',    country: 'Suvara',    population: 12_600_000,gdp: 980_000_000_000, taxRate: 0.19, growth: 0.041, x: 78, y: 40 },
  { id: 'dunraven',    name: 'Dunraven',     country: 'Belmoria',  population: 1_900_000, gdp: 95_000_000_000,  taxRate: 0.28, growth: 0.009, x: 44, y: 18 },
  { id: 'porto-vell',  name: 'Porto Vell',   country: 'Meridia',   population: 2_450_000, gdp: 140_000_000_000, taxRate: 0.22, growth: 0.021, x: 18, y: 46 },
  { id: 'al-zahra',    name: 'Al-Zahra',     country: 'Qariman',   population: 5_700_000, gdp: 410_000_000_000, taxRate: 0.10, growth: 0.052, x: 58, y: 44 },
  { id: 'nordkyl',     name: 'Nordkyl',      country: 'Fjordane',  population: 900_000,   gdp: 88_000_000_000,  taxRate: 0.34, growth: 0.007, x: 50, y: 8 },
  { id: 'rionegra',    name: 'Rionegra',     country: 'Vestera',   population: 6_800_000, gdp: 305_000_000_000, taxRate: 0.26, growth: 0.028, x: 28, y: 62 },
  { id: 'singapark',   name: 'Singapark',    country: 'Suvara',    population: 5_950_000, gdp: 520_000_000_000, taxRate: 0.15, growth: 0.038, x: 82, y: 50 },
  { id: 'greymoor',    name: 'Greymoor',     country: 'Albrecht',  population: 2_200_000, gdp: 130_000_000_000, taxRate: 0.29, growth: 0.011, x: 48, y: 16 },
  { id: 'lake-tessa',  name: 'Lake Tessa',   country: 'Meridia',   population: 1_300_000, gdp: 72_000_000_000,  taxRate: 0.23, growth: 0.019, x: 24, y: 30 },
  { id: 'valcris',     name: 'Valcris',      country: 'Vestera',   population: 4_100_000, gdp: 188_000_000_000, taxRate: 0.27, growth: 0.024, x: 30, y: 58 },
]

const SECTORS = [
  { id: 'banking',    name: 'Banking & Finance' },
  { id: 'tech',       name: 'Technology' },
  { id: 'media',      name: 'Media & Entertainment' },
  { id: 'realestate', name: 'Real Estate Development' },
  { id: 'retail',     name: 'Retail & Consumer' },
  { id: 'hospitality',name: 'Hospitality & Leisure' },
  { id: 'energy',     name: 'Energy & Industry' },
  { id: 'sports',     name: 'Sports Ownership' },
]

// Company templates: founding a company costs `cost`, produces `income` per tick
// before wages, and starts with a base `valuation` used for net worth & sale price.
const COMPANY_TEMPLATES = [
  { id: 'c-regionalbank', sector: 'banking', name: 'Regional Trust Bank', cost: 1200000, income: 42000, valuation: 5_200_000, wageBase: 18000 },
  { id: 'c-investbank',   sector: 'banking', name: 'Aurum Capital Partners', cost: 2600000, income: 95000, valuation: 11_500_000, wageBase: 40000 },
  { id: 'c-insurer',      sector: 'banking', name: 'Shieldline Insurance', cost: 1900000, income: 60000, valuation: 8_000_000, wageBase: 26000 },

  { id: 'c-softwarehouse',sector: 'tech', name: 'Vectra Software Labs', cost: 700000, income: 38000, valuation: 4_000_000, wageBase: 20000 },
  { id: 'c-cloudco',      sector: 'tech', name: 'Nimbus Cloud Systems', cost: 2500000, income: 88000, valuation: 10_800_000, wageBase: 34000 },
  { id: 'c-aicorp',       sector: 'tech', name: 'Cortex AI Research', cost: 3400000, income: 110000, valuation: 15_000_000, wageBase: 46000 },

  { id: 'c-studio',       sector: 'media', name: 'Lanternlight Studios', cost: 1600000, income: 52000, valuation: 6_800_000, wageBase: 24000 },
  { id: 'c-ott',          sector: 'media', name: 'Streamora Platform', cost: 2700000, income: 91000, valuation: 12_200_000, wageBase: 36000 },
  { id: 'c-musiclabel',   sector: 'media', name: 'Reverb Music Group', cost: 1100000, income: 34000, valuation: 4_600_000, wageBase: 18000 },

  { id: 'c-developer',    sector: 'realestate', name: 'Skyline Development Corp', cost: 1750000, income: 58000, valuation: 7_500_000, wageBase: 22000 },
  { id: 'c-reit',         sector: 'realestate', name: 'Continental REIT', cost: 2300000, income: 80000, valuation: 10_000_000, wageBase: 28000 },

  { id: 'c-retailchain',  sector: 'retail', name: 'Marlowe Retail Group', cost: 1250000, income: 40000, valuation: 5_000_000, wageBase: 20000 },
  { id: 'c-mall',         sector: 'retail', name: 'Grandview Shopping Centers', cost: 2000000, income: 66000, valuation: 8_800_000, wageBase: 26000 },

  { id: 'c-hotelchain',   sector: 'hospitality', name: 'Belmont Hotel Group', cost: 1950000, income: 62000, valuation: 8_600_000, wageBase: 24000 },
  { id: 'c-airline',      sector: 'hospitality', name: 'Skyward Airlines', cost: 3100000, income: 98000, valuation: 13_500_000, wageBase: 42000 },
  { id: 'c-cruiseline',   sector: 'hospitality', name: 'Azure Horizon Cruises', cost: 2800000, income: 84000, valuation: 12_000_000, wageBase: 34000 },

  { id: 'c-energyco',     sector: 'energy', name: 'Ferrowatt Energy', cost: 3000000, income: 102000, valuation: 13_800_000, wageBase: 38000 },
  { id: 'c-solarco',      sector: 'energy', name: 'Solvane Renewables', cost: 2050000, income: 64000, valuation: 9_200_000, wageBase: 26000 },
  { id: 'c-construction', sector: 'energy', name: 'Ironclad Construction', cost: 1450000, income: 46000, valuation: 6_200_000, wageBase: 22000 },

  { id: 'c-footballclub', sector: 'sports', name: 'Harborside FC', cost: 4000000, income: 70000, valuation: 20_000_000, wageBase: 55000 },
  { id: 'c-racingteam',   sector: 'sports', name: 'Velocity Racing Team', cost: 3600000, income: 60000, valuation: 17_000_000, wageBase: 48000 },
]

const EXECUTIVE_ROLES = ['CEO', 'COO', 'CFO', 'CTO', 'Legal Director', 'Marketing Director', 'HR Director', 'Operations Director']

const EXECUTIVE_POOL = [
  { id: 'ex1', role: 'CEO', name: 'Miriam Kessler', skill: 6, salary: 14000, effect: 0.10 },
  { id: 'ex2', role: 'CEO', name: 'Denholm Ashby', skill: 9, salary: 26000, effect: 0.22 },
  { id: 'ex3', role: 'COO', name: 'Farrah Kimoto', skill: 7, salary: 15000, effect: 0.14 },
  { id: 'ex4', role: 'COO', name: 'Grant Osei', skill: 5, salary: 9000, effect: 0.08 },
  { id: 'ex5', role: 'CFO', name: 'Elin Vashti', skill: 8, salary: 18000, effect: 0.16 },
  { id: 'ex6', role: 'CFO', name: 'Roman Petrakis', skill: 6, salary: 12000, effect: 0.10 },
  { id: 'ex7', role: 'CTO', name: 'Priya Ramanathan', skill: 9, salary: 24000, effect: 0.20 },
  { id: 'ex8', role: 'CTO', name: 'Wendell Cho', skill: 6, salary: 13000, effect: 0.10 },
  { id: 'ex9', role: 'Legal Director', name: 'Sabine Auclair', skill: 7, salary: 14000, effect: 0.5 },
  { id: 'ex10', role: 'Marketing Director', name: 'Théo Marchetti', skill: 7, salary: 13000, effect: 0.15 },
  { id: 'ex11', role: 'HR Director', name: 'Ingrid Halvorsen', skill: 6, salary: 10000, effect: 0.08 },
  { id: 'ex12', role: 'Operations Director', name: 'Kwame Boadi', skill: 7, salary: 12500, effect: 0.14 },
]

// NPC public companies traded on the exchange.
const STOCKS = [
  { symbol: 'MRB', name: 'Meridian Bancorp', sector: 'banking', basePrice: 84, vol: 0.035, totalShares: 20000, mergeThreshold: 10200, dividendYield: 0.02 },
  { symbol: 'HLX', name: 'Helixware Technologies', sector: 'tech', basePrice: 130, vol: 0.06, totalShares: 20000, mergeThreshold: 10200, dividendYield: 0.005 },
  { symbol: 'ORB', name: 'Orbital Media Group', sector: 'media', basePrice: 46, vol: 0.05, totalShares: 20000, mergeThreshold: 10200, dividendYield: 0.015 },
  { symbol: 'CRD', name: 'Cordillera Realty Trust', sector: 'realestate', basePrice: 58, vol: 0.03, totalShares: 20000, mergeThreshold: 10200, dividendYield: 0.03 },
  { symbol: 'MLW', name: 'Marlowe Consumer Holdings', sector: 'retail', basePrice: 38, vol: 0.04, totalShares: 20000, mergeThreshold: 10200, dividendYield: 0.018 },
  { symbol: 'SWA', name: 'Skyward Airlines Group', sector: 'hospitality', basePrice: 27, vol: 0.055, totalShares: 20000, mergeThreshold: 10200, dividendYield: 0.01 },
  { symbol: 'FRW', name: 'Ferrowatt Energy Corp', sector: 'energy', basePrice: 71, vol: 0.045, totalShares: 20000, mergeThreshold: 10200, dividendYield: 0.025 },
  { symbol: 'HFC', name: 'Harborside FC Holdings', sector: 'sports', basePrice: 33, vol: 0.05, totalShares: 20000, mergeThreshold: 10200, dividendYield: 0.008 },
  { symbol: 'GLB', name: 'Globex Logistics', sector: 'energy', basePrice: 49, vol: 0.04, totalShares: 20000, mergeThreshold: 10200, dividendYield: 0.02 },
  { symbol: 'NVX', name: 'Novexa Pharmaceuticals', sector: 'tech', basePrice: 96, vol: 0.05, totalShares: 20000, mergeThreshold: 10200, dividendYield: 0.012 },
]

const REAL_ESTATE_TEMPLATES = [
  { id: 're-land',      name: 'Undeveloped Land Parcel', cost: 400000,  rent: 0,     appreciation: 0.02, kind: 'land' },
  { id: 're-apartment', name: 'Apartment Complex',       cost: 900000,  rent: 9500,  appreciation: 0.015,kind: 'apartment' },
  { id: 're-office',    name: 'Office Tower Floor',      cost: 1_600_000, rent: 17000, appreciation: 0.018, kind: 'office' },
  { id: 're-mall',      name: 'Shopping Mall Unit',      cost: 2_400_000, rent: 26000, appreciation: 0.02, kind: 'mall' },
  { id: 're-warehouse', name: 'Industrial Warehouse',    cost: 1_100_000, rent: 11500, appreciation: 0.01, kind: 'warehouse' },
  { id: 're-hotel',     name: 'Boutique Hotel',          cost: 3_200_000, rent: 34000, appreciation: 0.022,kind: 'hotel' },
]

const LUXURY_ITEMS = [
  { id: 'lux-car',    name: 'Executive Sports Car', cost: 220000,   prestige: 8 },
  { id: 'lux-suv',    name: 'Armored Luxury SUV',   cost: 340000,   prestige: 10 },
  { id: 'lux-jet',    name: 'Private Jet',          cost: 42_000_000, prestige: 90 },
  { id: 'lux-heli',   name: 'Executive Helicopter', cost: 6_500_000,  prestige: 35 },
  { id: 'lux-yacht',  name: 'Mega Yacht',           cost: 120_000_000,prestige: 160 },
  { id: 'lux-watch',  name: 'Rare Collector Watch', cost: 850000,   prestige: 14 },
  { id: 'lux-art',    name: 'Museum-Grade Artwork', cost: 4_200_000,  prestige: 40 },
  { id: 'lux-island', name: 'Private Island',       cost: 210_000_000,prestige: 260 },
  { id: 'lux-mansion',name: 'Hillside Mansion',     cost: 18_000_000, prestige: 70 },
]

const BANK_PRODUCTS = {
  savingsRate: 0.0006,
  fixedDepositRate: 0.0012,
  fixedDepositTermTicks: 20,
  baseLoanRate: 0.0022,
}

const WORLD_EVENTS = [
  { id: 'boom', label: 'Global Economic Boom', kind: 'positive', economyMult: 1.25, duration: 8, news: 'Markets surge worldwide as a global economic boom takes hold.' },
  { id: 'recession', label: 'Economic Recession', kind: 'negative', economyMult: 0.78, duration: 10, news: 'A wave of recessionary pressure sweeps across major economies.' },
  { id: 'crash', label: 'Stock Market Crash', kind: 'negative', economyMult: 0.6, duration: 6, stockShock: -0.35, news: 'Panic selling triggers a dramatic stock market crash.' },
  { id: 'techboom', label: 'Technology Breakthrough', kind: 'positive', economyMult: 1.15, duration: 6, sectorBoost: 'tech', news: 'A landmark technology breakthrough energizes the tech sector.' },
  { id: 'scandal', label: 'Corporate Scandal', kind: 'negative', economyMult: 0.95, duration: 4, reputationHit: 25, news: 'A corporate scandal rattles investor confidence in the sector.' },
  { id: 'disaster', label: 'Natural Disaster', kind: 'negative', economyMult: 0.85, duration: 5, news: 'A natural disaster disrupts supply chains and local economies.' },
  { id: 'tradeagreement', label: 'New Trade Agreement', kind: 'positive', economyMult: 1.1, duration: 6, news: 'A sweeping new trade agreement opens fresh markets for expansion.' },
  { id: 'cyberattack', label: 'Major Cyber Attack', kind: 'negative', economyMult: 0.9, duration: 5, sectorBoost: 'tech', news: 'A major cyber attack exposes vulnerabilities across the tech sector.' },
]

const AI_RIVAL_NAMES = [
  'Constantin Vale', 'Odalys Ferreira', 'Magnus Thorne', 'Yuki Amamiya', 'Beatrix Solano',
  'Rafael Duarte', 'Ingrid Solberg', 'Tobias Krane', 'Layla Haddad', 'Anders Voss',
]

const LEGAL_EVENTS = [
  { id: 'tax-audit', label: 'Tax Audit', cost: 180000, heat: 15, news: 'Regulators open a routine tax audit into your holdings.' },
  { id: 'antitrust', label: 'Antitrust Inquiry', cost: 350000, heat: 25, news: 'An antitrust inquiry is opened over your market share in the sector.' },
  { id: 'labor-dispute', label: 'Labor Dispute', cost: 120000, heat: 10, news: 'Employees at one of your companies file a labor dispute.' },
  { id: 'contract-suit', label: 'Contract Lawsuit', cost: 90000, heat: 8, news: 'A supplier files a contract dispute lawsuit against one of your businesses.' },
]

const TICK_MS = 4000
const DB_NAME = 'business-empire-db'
const DB_VERSION = 1
const SAVE_STORE = 'saves'
const MAX_SLOTS = 3

export {
  DIFFICULTIES, CITIES, SECTORS, COMPANY_TEMPLATES, EXECUTIVE_ROLES, EXECUTIVE_POOL,
  STOCKS, REAL_ESTATE_TEMPLATES, LUXURY_ITEMS, BANK_PRODUCTS, WORLD_EVENTS,
  AI_RIVAL_NAMES, LEGAL_EVENTS, TICK_MS, DB_NAME, DB_VERSION, SAVE_STORE, MAX_SLOTS,
}
