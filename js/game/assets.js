import { getRealEstateType, getLuxuryItem } from '../data/assets.js';
import { pushLog, uid } from './state.js';

export function buyProperty(state, typeId, cityId) {
  const tpl = getRealEstateType(typeId);
  if (!tpl) return { ok: false, msg: 'Invalid property type.' };
  const city = state.cities.find((c) => c.id === cityId);
  const cost = Math.floor(tpl.cost * (0.7 + (city?.propertyDemand || 50) / 100));
  if (state.personalCash < cost) return { ok: false, msg: 'Insufficient funds.' };

  const property = {
    id: uid('prop'),
    typeId,
    cityId,
    name: `${tpl.name} — ${city?.name || 'Unknown'}`,
    purchasePrice: cost,
    currentValue: cost,
    purchasedAt: { ...state.date },
  };

  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - cost,
      properties: [...(state.properties || []), property],
      prestige: (state.prestige || 0) + (tpl.prestige || 5),
      log: pushLog(state, `Acquired ${property.name} for $${cost.toLocaleString()}.`),
    },
    msg: `Purchased ${property.name}.`,
  };
}

export function sellProperty(state, propertyId) {
  const prop = state.properties.find((p) => p.id === propertyId);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  const proceeds = prop.currentValue * 0.92;
  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash + proceeds,
      properties: state.properties.filter((p) => p.id !== propertyId),
      log: pushLog(state, `Sold ${prop.name} for $${Math.round(proceeds).toLocaleString()}.`),
    },
    msg: 'Property sold.',
  };
}

export function renovateProperty(state, propertyId, amount) {
  const prop = state.properties.find((p) => p.id === propertyId);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  if (state.personalCash < amount) return { ok: false, msg: 'Insufficient funds.' };
  const valueBoost = amount * 1.15;
  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - amount,
      properties: state.properties.map((p) =>
        p.id === propertyId ? { ...p, currentValue: p.currentValue + valueBoost, renovated: true } : p
      ),
      log: pushLog(state, `Renovated ${prop.name} (+$${Math.round(valueBoost).toLocaleString()} value).`),
    },
    msg: 'Renovation complete.',
  };
}

export function buyLuxury(state, typeId) {
  const tpl = getLuxuryItem(typeId);
  if (!tpl) return { ok: false, msg: 'Item not found.' };
  if (state.personalCash < tpl.cost) return { ok: false, msg: 'Insufficient funds.' };
  const asset = {
    id: uid('lux'),
    typeId,
    name: tpl.name,
    purchasePrice: tpl.cost,
    currentValue: tpl.cost,
    purchasedAt: { ...state.date },
  };
  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash - tpl.cost,
      luxuryAssets: [...(state.luxuryAssets || []), asset],
      prestige: (state.prestige || 0) + tpl.prestige,
      log: pushLog(state, `Acquired ${tpl.name} for $${tpl.cost.toLocaleString()}.`),
    },
    msg: `Purchased ${tpl.name}.`,
  };
}

export function sellLuxury(state, assetId) {
  const asset = state.luxuryAssets.find((l) => l.id === assetId);
  if (!asset) return { ok: false, msg: 'Asset not found.' };
  const proceeds = asset.currentValue * 0.88;
  return {
    ok: true,
    state: {
      ...state,
      personalCash: state.personalCash + proceeds,
      luxuryAssets: state.luxuryAssets.filter((l) => l.id !== assetId),
      log: pushLog(state, `Sold ${asset.name} for $${Math.round(proceeds).toLocaleString()}.`),
    },
    msg: 'Asset sold.',
  };
}
