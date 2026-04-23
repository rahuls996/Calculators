/**
 * api.js — Pricing API stub for v4
 *
 * Simulates a real async Health & Life pricing API.
 * To integrate the real API: replace the body of `callPricingApi` with
 * a real fetch() call using the same params shape.
 *
 * Usage:
 *   const result = await fetchPrice('c1', { age: 30, coverIndex: 0, ... });
 *   // result: { price: 13700, monthly: 1142, daily: 38, coverText: '₹1 Cr life cover' }
 */

// ─── Shared formula helpers (mirrors script.js) ─────────────────────────────

function getAgeMultiplier(age) {
  if (age <= 25) return 0.6;
  if (age <= 35) return 0.8 + (age - 25) * 0.04;
  if (age <= 45) return 1.2 + (age - 35) * 0.08;
  if (age <= 55) return 2.0 + (age - 45) * 0.15;
  if (age <= 65) return 3.5 + (age - 55) * 0.25;
  return 6.0 + (age - 65) * 0.35;
}

function r100(n) { return Math.round(n / 100) * 100; }

// ─── Local formula implementations ──────────────────────────────────────────

const C1_COVER_STEPS = [10, 25, 50, 100];

function calcC1(p) {
  const base = 5000;
  const ageComp   = r100(base * getAgeMultiplier(p.age) - base);
  const cover     = C1_COVER_STEPS[p.coverIndex];
  const coverComp = r100(base * (cover / 10 - 1) * 0.3);
  const memberComp = r100((p.adults - 1) * 1500 + p.children * 600);
  const total = Math.max(base + ageComp + coverComp + memberComp, 2000);
  const monthly = Math.ceil(total / 12);
  const daily   = Math.ceil(total / 365);
  const coverLabel = cover >= 100 ? '₹1 Cr health cover' : '₹' + cover + ' L health cover';
  return { price: total, monthly, daily, coverText: coverLabel };
}




const HLV_D_PCT = [
  6.5, 6.53, 6.56, 6.59, 6.62, 6.65, 6.68, 6.71, 6.74, 6.77, 6.8, 6.83, 6.86, 6.89, 6.92, 6.95,
  6.98, 7.01, 7.04, 7.07, 7.1, 7.13, 7.16, 7.19, 7.22, 7.25, 7.28, 7.31, 7.34, 7.37, 7.4, 7.43,
  7.46, 7.49, 7.52, 7.55, 7.58, 7.61, 7.64, 7.67, 7.7, 7.73, 7.76, 7.79, 7.82, 7.85, 7.88, 7.91,
  7.94, 8.0,
];
function hlvDiscountRate(N) {
  const n = Math.min(Math.max(Math.floor(N), 1), 50);
  return HLV_D_PCT[n - 1] / 100;
}

function calcC5(p) {
  const age = Math.min(69, Math.max(18, Number(p.age) || 18));
  const retireAge = Math.min(70, Math.max(40, Number(p.retireAge) || 60));
  let N = retireAge - age;
  if (N < 1) N = 1;

  const incomeL = Math.min(200, Math.max(1, Number(p.income) || 1));
  const incomeRs = incomeL * 100000;
  const expenses0 = incomeRs * 0.3;

  const Ngrid = Math.min(N, 50);
  const d = hlvDiscountRate(Ngrid);

  let baseHlvRs = 0;
  for (let t = 1; t <= N; t++) {
    const incomeT = incomeRs * Math.pow(1.08, t);
    const expensesT = expenses0 * Math.pow(1.06, t);
    const surplus = incomeT - expensesT;
    baseHlvRs += surplus / Math.pow(1 + d, t);
  }
  baseHlvRs = Math.max(0, baseHlvRs);

  const savingsR = Math.max(0, Number(p.savings) || 0) * 100000;
  const loansR = Math.max(0, Number(p.loans) || 0) * 100000;
  const existingR = Math.max(0, Number(p.existingCover) || 0) * 100000;
  const suggestedRs = Math.max(0, Math.round(baseHlvRs + loansR - savingsR - existingR));

  const annual_est = Math.max(r100(suggestedRs * 0.00014 + age * 1200), 2400);
  const monthly = Math.ceil(annual_est / 12);
  return {
    price: suggestedRs,
    baseHlvRs: Math.round(baseHlvRs),
    suggestedCoverRs: suggestedRs,
    monthly,
    daily: Math.max(1, Math.ceil(monthly / 30)),
    coverText: 'Term cover from ₹500/month',
    isHLV: true
  };
}

const C6_COVER_STEPS = [2500000, 5000000, 7500000, 10000000, 20000000];
/** Figma SEO widget (3430:1434): ₹25L, ₹50L, ₹1Cr, ₹2Cr */
const C6_COVER_STEPS_4 = [2500000, 5000000, 10000000, 20000000];
/** Must match `TERM_AGE_MAX` in `src/constants/termDefaults.js` (term calculator UI). */
const TERM_AGE_MAX = 55;

function getTermAgeFactor(age) {
  if (age <= 25) return 0.7;
  if (age <= 30) return 0.7 + (age - 25) * 0.06;
  if (age <= 35) return 1.0 + (age - 30) * 0.08;
  if (age <= 40) return 1.4 + (age - 35) * 0.12;
  if (age <= 50) return 2.0 + (age - 40) * 0.2;
  return 4.0 + (age - 50) * 0.35;
}

function getTermFactor(term) {
  if (term <= 10) return 0.75;
  if (term <= 20) return 0.75 + (term - 10) * 0.025;
  if (term <= 30) return 1.0 + (term - 20) * 0.04;
  return 1.4 + (term - 30) * 0.06;
}

function calcC6(p) {
  const steps = p.coverVariant === '4' ? C6_COVER_STEPS_4 : C6_COVER_STEPS;
  const idx = Math.min(Math.max(0, p.coverIndex | 0), steps.length - 1);
  const cover = steps[idx];
  const coverInLakhs = cover / 100000;
  const baseAnnual = coverInLakhs * 28;
  const age = Math.min(TERM_AGE_MAX, Math.max(18, Number(p.age) || 18));
  const ageMul = getTermAgeFactor(age);
  const term = p.coverVariant === '4' ? 60 : p.term;
  const termMul = getTermFactor(term);
  const ageComp   = r100(baseAnnual * (ageMul - 1));
  const coverComp = r100(baseAnnual * 0.15 * (coverInLakhs / 50 - 1));
  const termComp  = r100(baseAnnual * (termMul - 1));
  let total = Math.max(r100(baseAnnual + ageComp + coverComp + termComp), 3000);
  if (p.coverVariant === '4' && p.income != null) {
    const inc = Math.min(Math.max(Number(p.income) || 10, 1), 200);
    const incomeAdj = 0.94 + (inc / 200) * 0.12;
    total = Math.max(r100(total * incomeAdj), 3000);
  }
  const daily = Math.ceil(total / 365);
  const coverLabel = cover >= 10000000
    ? '₹' + (cover / 10000000).toFixed(0) + ' Cr life cover'
    : '₹' + (cover / 100000).toFixed(0) + ' L life cover';
  return {
    price: total,
    monthly: Math.ceil(total / 12),
    daily,
    coverText: coverLabel,
    termUsed: term
  };
}

// ─── Formula dispatch map ────────────────────────────────────────────────────

const formulaMap = { c1: calcC1, c5: calcC5, c6: calcC6 };

// ─── Mock network call ───────────────────────────────────────────────────────

/**
 * Simulates a real API call with ~800ms latency.
 * Replace this function body with a real fetch() when the API is ready:
 *
 *   const res = await fetch('https://api.acko.com/v1/pricing/' + calcId, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(params)
 *   });
 *   if (!res.ok) throw new Error('API_ERROR');
 *   return await res.json();
 */
async function callPricingApi(calcId, params) {
  const LATENCY_MS = 800;
  // Failure rate set to 0 for mock — real failures come from the live API
  const FAILURE_RATE = 0;

  await new Promise(resolve => setTimeout(resolve, LATENCY_MS));

  if (Math.random() < FAILURE_RATE) {
    throw new Error('API_ERROR');
  }

  const formula = formulaMap[calcId];
  if (!formula) throw new Error('Unknown calculator: ' + calcId);
  return formula(params);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch price for a given calculator with its current params.
 * @param {string} calcId  - 'c1' through 'c6'
 * @param {object} params  - input values collected from calculator state
 * @returns {Promise<{price, monthly, daily, coverText, isYears?, isHLV?}>}
 */
async function fetchPrice(calcId, params) {
  return callPricingApi(calcId, params);
}

/**
 * Same formulas as the mock API, synchronously — for live slider updates in the UI.
 */
function computePrice(calcId, params) {
  const fn = formulaMap[calcId];
  if (!fn) throw new Error('Unknown calculator: ' + calcId);
  return fn(params);
}
