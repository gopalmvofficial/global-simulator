import { seededRandom } from '../core/utils.js';

const REGIONS = [
  { id: 'na', name: 'North America', lat: 40, lng: -100 },
  { id: 'eu', name: 'Europe', lat: 50, lng: 10 },
  { id: 'asia', name: 'Asia', lat: 35, lng: 105 },
  { id: 'sa', name: 'South America', lat: -15, lng: -60 },
  { id: 'af', name: 'Africa', lat: 0, lng: 20 },
  { id: 'me', name: 'Middle East', lat: 28, lng: 45 },
  { id: 'oceania', name: 'Oceania', lat: -25, lng: 135 },
];

const CITY_NAMES = {
  na: ['New York', 'Los Angeles', 'Chicago', 'Toronto', 'Miami', 'San Francisco', 'Boston', 'Seattle', 'Dallas', 'Vancouver', 'Montreal', 'Houston', 'Atlanta', 'Denver', 'Phoenix'],
  eu: ['London', 'Paris', 'Berlin', 'Frankfurt', 'Amsterdam', 'Zurich', 'Milan', 'Madrid', 'Stockholm', 'Dublin', 'Vienna', 'Brussels', 'Copenhagen', 'Oslo', 'Warsaw'],
  asia: ['Tokyo', 'Shanghai', 'Singapore', 'Hong Kong', 'Seoul', 'Mumbai', 'Dubai', 'Bangkok', 'Jakarta', 'Taipei', 'Shenzhen', 'Beijing', 'Delhi', 'Kuala Lumpur', 'Manila'],
  sa: ['São Paulo', 'Buenos Aires', 'Santiago', 'Bogotá', 'Lima', 'Rio de Janeiro', 'Mexico City', 'Medellín', 'Montevideo', 'Quito'],
  af: ['Johannesburg', 'Cairo', 'Lagos', 'Nairobi', 'Casablanca', 'Accra', 'Addis Ababa', 'Cape Town', 'Tunis', 'Kigali'],
  me: ['Dubai', 'Riyadh', 'Tel Aviv', 'Doha', 'Abu Dhabi', 'Istanbul', 'Kuwait City', 'Manama', 'Muscat', 'Amman'],
  oceania: ['Sydney', 'Melbourne', 'Auckland', 'Brisbane', 'Perth', 'Wellington', 'Adelaide', 'Canberra', 'Christchurch', 'Gold Coast'],
};

export function generateWorldCities() {
  const cities = [];
  let idx = 0;
  for (const region of REGIONS) {
    const names = CITY_NAMES[region.id] || [];
    const rng = seededRandom(region.id.charCodeAt(0) * 1000);
    for (let i = 0; i < names.length; i++) {
      const pop = Math.floor(500000 + rng() * 12000000);
      const gdp = pop * (8000 + rng() * 45000);
      cities.push({
        id: `city-${idx++}`,
        name: names[i],
        regionId: region.id,
        region: region.name,
        lat: region.lat + (rng() - 0.5) * 20,
        lng: region.lng + (rng() - 0.5) * 30,
        population: pop,
        gdp,
        economy: 40 + rng() * 55,
        employment: 85 + rng() * 12,
        crimeRate: rng() * 40,
        infrastructure: 40 + rng() * 55,
        politicalStability: 50 + rng() * 45,
        propertyDemand: 30 + rng() * 65,
        tourism: rng() * 80,
        education: 40 + rng() * 55,
        transportation: 35 + rng() * 60,
        techLevel: 30 + rng() * 65,
        taxRate: 15 + rng() * 25,
        regulations: 30 + rng() * 50,
      });
    }
  }
  return cities;
}

export const WORLD_CITIES = generateWorldCities();

export function getCityById(id) {
  return WORLD_CITIES.find((c) => c.id === id);
}

export function getCitiesByRegion(regionId) {
  return WORLD_CITIES.filter((c) => c.regionId === regionId);
}

export function tickCity(city, economyMult = 1) {
  const drift = () => (Math.random() - 0.48) * 0.8;
  return {
    ...city,
    economy: Math.max(10, Math.min(100, city.economy + drift() * economyMult)),
    employment: Math.max(60, Math.min(99, city.employment + drift() * 0.3)),
    crimeRate: Math.max(0, Math.min(80, city.crimeRate + drift() * 0.5)),
    infrastructure: Math.max(20, Math.min(100, city.infrastructure + drift() * 0.2)),
    politicalStability: Math.max(20, Math.min(100, city.politicalStability + drift() * 0.4)),
    propertyDemand: Math.max(10, Math.min(100, city.propertyDemand + drift() * 0.6)),
    tourism: Math.max(0, Math.min(100, city.tourism + drift() * 0.5)),
    techLevel: Math.max(10, Math.min(100, city.techLevel + drift() * 0.15)),
    population: Math.floor(city.population * (1 + (city.economy - 50) * 0.00001)),
    gdp: city.gdp * (1 + (city.economy - 50) * 0.00005),
  };
}
