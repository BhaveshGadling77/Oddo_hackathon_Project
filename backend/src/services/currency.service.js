const axios  = require('axios');
const logger = require('../utils/logger');

const rateCache = new Map();
const TTL = 3_600_000; // 1 hour

async function convert(amount, fromCurrency, toCurrency) {
  if (!fromCurrency || !toCurrency) return parseFloat(amount);
  if (fromCurrency === toCurrency)  return parseFloat(amount);
  const rates = await getRates(toCurrency);
  const rate  = rates[fromCurrency];
  if (!rate) throw new Error(`No exchange rate for ${fromCurrency} → ${toCurrency}`);
  return parseFloat((amount / rate).toFixed(2));
}

async function getRates(baseCurrency) {
  const cached = rateCache.get(baseCurrency);
  if (cached && Date.now() - cached.ts < TTL) return cached.rates;
  try {
    const { data } = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      { timeout: 5000 }
    );
    rateCache.set(baseCurrency, { rates: data.rates, ts: Date.now() });
    return data.rates;
  } catch (err) {
    logger.warn(`Exchange rate fetch failed: ${err.message}`);
    if (cached) return cached.rates;
    throw new Error('Currency service unavailable');
  }
}

async function getCountryCurrencies() {
  try {
    const { data } = await axios.get(
      'https://restcountries.com/v3.1/all?fields=name,currencies',
      { timeout: 8000 }
    );
    const map = {};
    for (const c of data) {
      const code = Object.keys(c.currencies || {})[0];
      if (code && c.name?.common) map[c.name.common] = code;
    }
    return map;
  } catch {
    return {
      'United States': 'USD', 'India': 'INR', 'United Kingdom': 'GBP',
      'Germany': 'EUR', 'France': 'EUR', 'Japan': 'JPY',
      'Canada': 'CAD', 'Australia': 'AUD', 'Singapore': 'SGD',
    };
  }
}

async function getCountryList() {
  try {
    const { data } = await axios.get(
      'https://restcountries.com/v3.1/all?fields=name,currencies,flags',
      { timeout: 8000 }
    );
    return data
      .filter(c => Object.keys(c.currencies || {}).length)
      .map(c => ({
        name:     c.name.common,
        currency: Object.keys(c.currencies)[0],
        symbol:   Object.values(c.currencies)[0]?.symbol || '',
        flag:     c.flags?.svg || '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch { return []; }
}

module.exports = { convert, getRates, getCountryCurrencies, getCountryList };