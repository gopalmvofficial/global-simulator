export const BUSINESS_CATEGORIES = {
  financial: { name: 'Financial', icon: '🏦', color: '#c9a227' },
  technology: { name: 'Technology', icon: '💻', color: '#4a7fd4' },
  media: { name: 'Media & Entertainment', icon: '🎬', color: '#a44d5c' },
  retail: { name: 'Retail', icon: '🛍️', color: '#3d8b7a' },
  hospitality: { name: 'Hospitality', icon: '🏨', color: '#d4a84a' },
  transport: { name: 'Transport', icon: '✈️', color: '#6b8cae' },
  construction: { name: 'Construction', icon: '🏗️', color: '#8b7355' },
  healthcare: { name: 'Healthcare', icon: '🏥', color: '#5cb87a' },
  sports: { name: 'Sports', icon: '⚽', color: '#d4655a' },
  entertainment: { name: 'Entertainment', icon: '🎰', color: '#9b59b6' },
  energy: { name: 'Energy', icon: '⚡', color: '#f39c12' },
  agriculture: { name: 'Agriculture', icon: '🌾', color: '#27ae60' },
  realestate: { name: 'Real Estate Dev', icon: '🏙️', color: '#3498db' },
  security: { name: 'Security', icon: '🛡️', color: '#7f8c8d' },
};

const TYPES = [
  // Financial
  { id: 'bank', name: 'Commercial Bank', category: 'financial', baseCost: 500000, baseRevenue: 12000, baseExpenses: 6000, employees: 80, isBank: true },
  { id: 'investment-bank', name: 'Investment Bank', category: 'financial', baseCost: 2000000, baseRevenue: 45000, baseExpenses: 22000, employees: 120 },
  { id: 'insurance', name: 'Insurance Company', category: 'financial', baseCost: 800000, baseRevenue: 18000, baseExpenses: 9000, employees: 60 },
  { id: 'hedge-fund', name: 'Hedge Fund', category: 'financial', baseCost: 1500000, baseRevenue: 35000, baseExpenses: 12000, employees: 25 },
  { id: 'brokerage', name: 'Stock Brokerage', category: 'financial', baseCost: 600000, baseRevenue: 14000, baseExpenses: 7000, employees: 40 },
  { id: 'vc-firm', name: 'Venture Capital Firm', category: 'financial', baseCost: 3000000, baseRevenue: 25000, baseExpenses: 8000, employees: 20 },
  { id: 'crypto-exchange', name: 'Crypto Exchange', category: 'financial', baseCost: 1200000, baseRevenue: 28000, baseExpenses: 10000, employees: 35 },
  // Technology
  { id: 'ai-company', name: 'AI Company', category: 'technology', baseCost: 2500000, baseRevenue: 40000, baseExpenses: 25000, employees: 100 },
  { id: 'software', name: 'Software Company', category: 'technology', baseCost: 400000, baseRevenue: 15000, baseExpenses: 8000, employees: 50 },
  { id: 'cloud', name: 'Cloud Provider', category: 'technology', baseCost: 5000000, baseRevenue: 80000, baseExpenses: 45000, employees: 200 },
  { id: 'cybersecurity', name: 'Cybersecurity Firm', category: 'technology', baseCost: 800000, baseRevenue: 20000, baseExpenses: 10000, employees: 45 },
  { id: 'semiconductor', name: 'Semiconductor Co', category: 'technology', baseCost: 8000000, baseRevenue: 120000, baseExpenses: 70000, employees: 300 },
  { id: 'social-media', name: 'Social Media Platform', category: 'technology', baseCost: 4000000, baseRevenue: 60000, baseExpenses: 35000, employees: 150 },
  { id: 'robotics', name: 'Robotics Company', category: 'technology', baseCost: 3500000, baseRevenue: 35000, baseExpenses: 20000, employees: 80 },
  // Media
  { id: 'movie-studio', name: 'Movie Studio', category: 'media', baseCost: 3000000, baseRevenue: 30000, baseExpenses: 18000, employees: 90 },
  { id: 'tv-network', name: 'TV Network', category: 'media', baseCost: 5000000, baseRevenue: 55000, baseExpenses: 30000, employees: 120 },
  { id: 'ott', name: 'OTT Streaming Platform', category: 'media', baseCost: 8000000, baseRevenue: 70000, baseExpenses: 50000, employees: 100 },
  { id: 'music-label', name: 'Music Label', category: 'media', baseCost: 600000, baseRevenue: 12000, baseExpenses: 6000, employees: 30 },
  { id: 'news-agency', name: 'News Agency', category: 'media', baseCost: 1500000, baseRevenue: 22000, baseExpenses: 14000, employees: 70 },
  { id: 'animation', name: 'Animation Studio', category: 'media', baseCost: 2000000, baseRevenue: 25000, baseExpenses: 15000, employees: 60 },
  { id: 'publishing', name: 'Publishing House', category: 'media', baseCost: 400000, baseRevenue: 8000, baseExpenses: 4000, employees: 25 },
  // Retail
  { id: 'supermarket', name: 'Supermarket Chain', category: 'retail', baseCost: 300000, baseRevenue: 10000, baseExpenses: 7000, employees: 40 },
  { id: 'mall', name: 'Shopping Mall', category: 'retail', baseCost: 4000000, baseRevenue: 45000, baseExpenses: 20000, employees: 30 },
  { id: 'luxury-boutique', name: 'Luxury Boutique', category: 'retail', baseCost: 800000, baseRevenue: 18000, baseExpenses: 8000, employees: 15 },
  { id: 'car-dealership', name: 'Car Dealership', category: 'retail', baseCost: 600000, baseRevenue: 15000, baseExpenses: 9000, employees: 20 },
  { id: 'fashion-brand', name: 'Fashion Brand', category: 'retail', baseCost: 500000, baseRevenue: 12000, baseExpenses: 6000, employees: 25 },
  // Hospitality
  { id: 'hotel', name: 'Hotel Chain', category: 'hospitality', baseCost: 2000000, baseRevenue: 28000, baseExpenses: 16000, employees: 80 },
  { id: 'resort', name: 'Luxury Resort', category: 'hospitality', baseCost: 5000000, baseRevenue: 40000, baseExpenses: 22000, employees: 100 },
  { id: 'restaurant', name: 'Restaurant Chain', category: 'hospitality', baseCost: 150000, baseRevenue: 5000, baseExpenses: 3500, employees: 20 },
  { id: 'theme-park', name: 'Theme Park', category: 'hospitality', baseCost: 15000000, baseRevenue: 100000, baseExpenses: 55000, employees: 200 },
  { id: 'cruise', name: 'Cruise Line', category: 'hospitality', baseCost: 20000000, baseRevenue: 120000, baseExpenses: 70000, employees: 250 },
  // Transport
  { id: 'airline', name: 'Airline', category: 'transport', baseCost: 10000000, baseRevenue: 80000, baseExpenses: 55000, employees: 300 },
  { id: 'airport', name: 'Airport Operator', category: 'transport', baseCost: 25000000, baseRevenue: 150000, baseExpenses: 80000, employees: 150 },
  { id: 'logistics', name: 'Logistics Company', category: 'transport', baseCost: 800000, baseRevenue: 18000, baseExpenses: 12000, employees: 60 },
  { id: 'shipping', name: 'Shipping Company', category: 'transport', baseCost: 5000000, baseRevenue: 45000, baseExpenses: 28000, employees: 100 },
  { id: 'delivery', name: 'Delivery Service', category: 'transport', baseCost: 300000, baseRevenue: 8000, baseExpenses: 5000, employees: 35 },
  // Construction
  { id: 'construction', name: 'Construction Firm', category: 'construction', baseCost: 500000, baseRevenue: 12000, baseExpenses: 8000, employees: 50 },
  { id: 'cement', name: 'Cement Company', category: 'construction', baseCost: 3000000, baseRevenue: 35000, baseExpenses: 20000, employees: 80 },
  { id: 'steel', name: 'Steel Company', category: 'construction', baseCost: 5000000, baseRevenue: 50000, baseExpenses: 30000, employees: 100 },
  // Healthcare
  { id: 'hospital', name: 'Hospital', category: 'healthcare', baseCost: 8000000, baseRevenue: 60000, baseExpenses: 45000, employees: 200 },
  { id: 'pharma', name: 'Pharmaceutical Co', category: 'healthcare', baseCost: 6000000, baseRevenue: 70000, baseExpenses: 40000, employees: 120 },
  { id: 'medical-equip', name: 'Medical Equipment Co', category: 'healthcare', baseCost: 2000000, baseRevenue: 30000, baseExpenses: 15000, employees: 60 },
  // Sports
  { id: 'football-club', name: 'Football Club', category: 'sports', baseCost: 50000000, baseRevenue: 80000, baseExpenses: 60000, employees: 50, isSports: true },
  { id: 'basketball-club', name: 'Basketball Club', category: 'sports', baseCost: 80000000, baseRevenue: 120000, baseExpenses: 90000, employees: 45, isSports: true },
  { id: 'stadium', name: 'Stadium Company', category: 'sports', baseCost: 300000000, baseRevenue: 200000, baseExpenses: 80000, employees: 30 },
  { id: 'esports', name: 'Esports Organization', category: 'sports', baseCost: 2000000, baseRevenue: 15000, baseExpenses: 10000, employees: 25, isSports: true },
  // Entertainment
  { id: 'casino', name: 'Casino', category: 'entertainment', baseCost: 10000000, baseRevenue: 90000, baseExpenses: 40000, employees: 80 },
  { id: 'gaming-studio', name: 'Gaming Studio', category: 'entertainment', baseCost: 1500000, baseRevenue: 25000, baseExpenses: 15000, employees: 55 },
  { id: 'vr-company', name: 'VR Company', category: 'entertainment', baseCost: 3000000, baseRevenue: 20000, baseExpenses: 18000, employees: 40 },
  // Energy
  { id: 'solar', name: 'Solar Energy Co', category: 'energy', baseCost: 4000000, baseRevenue: 35000, baseExpenses: 15000, employees: 50 },
  { id: 'wind', name: 'Wind Farm Operator', category: 'energy', baseCost: 6000000, baseRevenue: 45000, baseExpenses: 18000, employees: 40 },
  { id: 'oil', name: 'Oil Company', category: 'energy', baseCost: 15000000, baseRevenue: 150000, baseExpenses: 80000, employees: 150 },
  { id: 'nuclear', name: 'Nuclear Plant Operator', category: 'energy', baseCost: 50000000, baseRevenue: 200000, baseExpenses: 100000, employees: 200 },
  // Agriculture
  { id: 'farm', name: 'Agribusiness Farm', category: 'agriculture', baseCost: 500000, baseRevenue: 8000, baseExpenses: 4000, employees: 30 },
  { id: 'food-processing', name: 'Food Processing Co', category: 'agriculture', baseCost: 1500000, baseRevenue: 20000, baseExpenses: 12000, employees: 70 },
  // Real Estate Dev
  { id: 're-dev', name: 'Real Estate Developer', category: 'realestate', baseCost: 2000000, baseRevenue: 30000, baseExpenses: 15000, employees: 40 },
  // Security
  { id: 'private-security', name: 'Private Security Co', category: 'security', baseCost: 300000, baseRevenue: 7000, baseExpenses: 4000, employees: 35 },
];

export const BUSINESS_TYPES = TYPES;

export const EXECUTIVE_ROLES = [
  'CEO', 'COO', 'CFO', 'CTO', 'CIO', 'Legal', 'HR', 'Marketing', 'Operations', 'Sales', 'Research', 'Security',
];

const FIRST_NAMES = ['James', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'Robert', 'Sophia', 'William', 'Isabella', 'Richard', 'Mia', 'Charles', 'Charlotte', 'Thomas', 'Amelia', 'Daniel', 'Harper', 'Alexander', 'Evelyn'];
const LAST_NAMES = ['Chen', 'Williams', 'Patel', 'Johnson', 'Garcia', 'Kim', 'Anderson', 'Martinez', 'Thompson', 'Lee', 'Wilson', 'Brown', 'Taylor', 'Nguyen', 'Singh', 'Cohen', 'Murphy', 'Schmidt', 'Okafor', 'Rossi'];

export function generateExecutive(role, tier = 'mid') {
  const tierMult = { junior: 0.6, mid: 1, senior: 1.4, elite: 1.8 }[tier] || 1;
  const baseSalary = { CEO: 500000, COO: 350000, CFO: 400000, CTO: 380000, CIO: 320000, Legal: 280000, HR: 200000, Marketing: 250000, Operations: 220000, Sales: 230000, Research: 300000, Security: 180000 }[role] || 200000;
  const skill = () => Math.floor(40 + Math.random() * 55 * tierMult);
  return {
    id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
    role,
    tier,
    salary: Math.floor(baseSalary * tierMult),
    experience: Math.floor(3 + Math.random() * 20 * tierMult),
    leadership: skill(),
    intelligence: skill(),
    ethics: Math.floor(30 + Math.random() * 60),
    loyalty: Math.floor(50 + Math.random() * 45),
    negotiation: skill(),
    innovation: skill(),
    publicImage: skill(),
    performance: 70 + Math.random() * 25,
  };
}

export function generateExecutivePool(count = 48) {
  const pool = [];
  const tiers = ['junior', 'mid', 'senior', 'elite'];
  for (let i = 0; i < count; i++) {
    const role = EXECUTIVE_ROLES[i % EXECUTIVE_ROLES.length];
    const tier = tiers[Math.floor(i / EXECUTIVE_ROLES.length) % tiers.length];
    pool.push(generateExecutive(role, tier));
  }
  return pool;
}

export function getBusinessType(id) {
  return BUSINESS_TYPES.find((t) => t.id === id);
}

export function getTypesByCategory(category) {
  return BUSINESS_TYPES.filter((t) => t.category === category);
}

export function calcExecutiveBonus(exec) {
  if (!exec) return 0.7;
  const avg = (exec.leadership + exec.intelligence + exec.innovation + exec.performance) / 4;
  const ethicsPenalty = exec.ethics < 30 ? 0.85 : 1;
  const loyaltyBonus = exec.loyalty > 80 ? 1.05 : 1;
  return (0.5 + avg / 100) * ethicsPenalty * loyaltyBonus;
}

export function generateCompanyName(type, cityName) {
  const prefixes = ['Global', 'United', 'Premier', 'Atlas', 'Summit', 'Nova', 'Apex', 'Prime', 'Sterling', 'Pacific'];
  const suffix = type.name.split(' ').pop();
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffix} ${cityName ? `(${cityName.split(' ')[0]})` : ''}`.trim();
}
