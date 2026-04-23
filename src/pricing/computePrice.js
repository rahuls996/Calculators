/**
 * Pricing formulas (ported from api.js) — synchronous compute for live UI updates.
 */

import { getHlvDiscountRateForHorizon } from '../data/hlvDiscountGrid.js';
import { TERM_AGE_MAX } from '@/constants/termDefaults.js';

function getAgeMultiplier(age) {
  if (age <= 25) return 0.6;
  if (age <= 35) return 0.8 + (age - 25) * 0.04;
  if (age <= 45) return 1.2 + (age - 35) * 0.08;
  if (age <= 55) return 2.0 + (age - 45) * 0.15;
  if (age <= 65) return 3.5 + (age - 55) * 0.25;
  return 6.0 + (age - 65) * 0.35;
}

function r100(n) {
  return Math.round(n / 100) * 100;
}

const C1_COVER_STEPS = [10, 25, 50, 100];

function calcC1(p) {
  const base = 5000;
  const ageComp = r100(base * getAgeMultiplier(p.age) - base);
  const cover = C1_COVER_STEPS[p.coverIndex];
  const coverComp = r100(base * (cover / 10 - 1) * 0.3);
  const memberComp = r100((p.adults - 1) * 1500 + p.children * 600);
  const total = Math.max(base + ageComp + coverComp + memberComp, 2000);
  const monthly = Math.ceil(total / 12);
  const daily = Math.ceil(total / 365);
  const coverLabel = cover >= 100 ? '₹1 Cr health cover' : '₹' + cover + ' L health cover';
  return { price: total, monthly, daily, coverText: coverLabel };
}

const HLV_INCOME_GROWTH = 0.08;
const HLV_EXPENSE_INFLATION = 0.06;
const HLV_EXPENSE_RATIO = 0.3;

/** HLV: income path PV + balance sheet; price / suggestedCoverRs = incremental need. */
function calcC5(p) {
  const age = Math.min(69, Math.max(18, Number(p.age) || 18));
  const retireAge = Math.min(70, Math.max(40, Number(p.retireAge) || 60));
  let N = retireAge - age;
  if (N < 1) N = 1;

  const incomeL = Math.min(200, Math.max(1, Number(p.income) || 1));
  const incomeRs = incomeL * 100000;
  const expenses0 = incomeRs * HLV_EXPENSE_RATIO;

  const Ngrid = Math.min(N, 50);
  const d = getHlvDiscountRateForHorizon(Ngrid);

  let baseHlvRs = 0;
  for (let t = 1; t <= N; t++) {
    const incomeT = incomeRs * Math.pow(1 + HLV_INCOME_GROWTH, t);
    const expensesT = expenses0 * Math.pow(1 + HLV_EXPENSE_INFLATION, t);
    const surplus = incomeT - expensesT;
    baseHlvRs += surplus / Math.pow(1 + d, t);
  }
  baseHlvRs = Math.max(0, baseHlvRs);

  const savingsR = Math.max(0, Number(p.savings) || 0) * 100000;
  const loansR = Math.max(0, Number(p.loans) || 0) * 100000;
  const existingR = Math.max(0, Number(p.existingCover) || 0) * 100000;
  const suggestedRs = Math.max(0, Math.round(baseHlvRs + loansR - savingsR - existingR));

  const annualEst = Math.max(r100(suggestedRs * 0.00014 + age * 1200), 2400);
  const monthly = Math.ceil(annualEst / 12);

  return {
    price: suggestedRs,
    baseHlvRs: Math.round(baseHlvRs),
    suggestedCoverRs: suggestedRs,
    monthly,
    daily: Math.max(1, Math.ceil(monthly / 30)),
    coverText: 'Term cover from ₹500/month',
    isHLV: true,
  };
}

const C6_COVER_STEPS = [2500000, 5000000, 7500000, 10000000, 20000000];
const C6_COVER_STEPS_4 = [2500000, 5000000, 10000000, 20000000];

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
  const ageComp = r100(baseAnnual * (ageMul - 1));
  const coverComp = r100(baseAnnual * 0.15 * (coverInLakhs / 50 - 1));
  const termComp = r100(baseAnnual * (termMul - 1));
  let total = Math.max(r100(baseAnnual + ageComp + coverComp + termComp), 3000);
  if (p.coverVariant === '4' && p.income != null) {
    const inc = Math.min(Math.max(Number(p.income) || 10, 1), 200);
    const incomeAdj = 0.94 + (inc / 200) * 0.12;
    total = Math.max(r100(total * incomeAdj), 3000);
  }
  const daily = Math.ceil(total / 365);
  const coverLabel =
    cover >= 10000000
      ? '₹' + (cover / 10000000).toFixed(0) + ' Cr life cover'
      : '₹' + (cover / 100000).toFixed(0) + ' L life cover';
  return {
    price: total,
    monthly: Math.ceil(total / 12),
    daily,
    coverText: coverLabel,
    termUsed: term,
  };
}

const formulaMap = { c1: calcC1, c5: calcC5, c6: calcC6 };

export function computePrice(calcId, params) {
  const fn = formulaMap[calcId];
  if (!fn) throw new Error('Unknown calculator: ' + calcId);
  return fn(params);
}

export { calcC1, calcC5, calcC6, C1_COVER_STEPS, C6_COVER_STEPS, C6_COVER_STEPS_4 };
