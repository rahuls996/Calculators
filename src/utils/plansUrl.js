const plansBaseUrls = {
  c1: 'https://www.acko.com/health-insurance/buy',
  c5: 'https://www.acko.com/term-life-insurance/buy',
  c6: 'https://www.acko.com/term-life-insurance/buy',
};

import { TERM_DEFAULT_INCOME_LAKHS } from '../constants/termDefaults';

const COVER_STEPS_C1 = [1000000, 2500000, 5000000, 10000000];
const C6_COVER_5 = [2500000, 5000000, 7500000, 10000000, 20000000];
const C6_COVER_4 = [2500000, 5000000, 10000000, 20000000];

export function buildPlansUrl(calcId, c1State, c5State, c6State, isTermFigma) {
  const base = plansBaseUrls[calcId] || '#';
  const params = new URLSearchParams();
  params.set('utm_source', 'calculator');
  params.set('utm_medium', 'seo');

  if (calcId === 'c1') {
    params.set('age', String(c1State.age));
    params.set('cover', String(COVER_STEPS_C1[c1State.coverIndex]));
    params.set('adults', String(c1State.adults));
    params.set('children', String(c1State.children));
    return base + '?' + params.toString();
  }

  if (calcId === 'c5') {
    params.set('age', String(c5State.age));
    params.set('income', String(c5State.income));
    params.set('retire_age', String(c5State.retireAge));
    params.set('savings', String(c5State.savings));
    params.set('loans', String(c5State.loans));
    params.set('existing_cover', String(c5State.existingCover));
    return base + '?' + params.toString();
  }

  if (calcId === 'c6') {
    const steps = isTermFigma ? C6_COVER_4 : C6_COVER_5;
    const ci = Math.min(c6State.coverIndex, steps.length - 1);
    params.set('age', String(c6State.age));
    params.set('cover', String(steps[ci]));
    params.set('term', isTermFigma ? '60' : String(c6State.term));
    params.set('income', String(c6State.income ?? TERM_DEFAULT_INCOME_LAKHS));
    return base + '?' + params.toString();
  }

  return base;
}
