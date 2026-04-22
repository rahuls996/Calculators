import { useMemo, useState, useCallback } from 'react';
import { computePrice } from '@/pricing/computePrice';
import { buildPlansUrl } from '@/utils/plansUrl';
import { useAnimatedAmount } from '@/hooks/useAnimatedAmount';
import { CustomSlider } from '@/components/ui/CustomSlider';
import { EMPTY_RESULTS_TITLE } from '@/constants/calculatorCopy';
import { c1MemberPairIsValid } from '@/constants/healthMembers';
import { publicAsset } from '@/utils/publicAsset';
import { EMPTY_RESULTS_ILLUSTRATION_SRC } from '@/constants/emptyResultsIllustration';
import { DifferentiatorsCard } from './DifferentiatorsCard';
import { HealthMembersPlansHint } from './HealthMembersPlansHint';
import { ResultComplianceFooter } from './ResultComplianceFooter';

const adultIcon = publicAsset('icons/Adult.svg');
const childIcon = publicAsset('icons/Child.svg');

const coverLabels = ['₹ 10 L', '₹ 25 L', '₹ 50 L', '₹ 1 Cr'];

const CALC_MS = 720;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function HealthCalcSpinner() {
  return (
    <span className="health-calc-spinner" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="32 48"
          className="health-calc-spinner__arc"
        />
      </svg>
    </span>
  );
}

export default function HealthCalculator({
  mode = 'tab',
  active = true,
  healthState,
  onHealthChange,
  c5State,
  c6State,
  isTermFigma,
}) {
  const age = Math.min(60, Math.max(18, healthState.age ?? 35));
  const adults = healthState.adults ?? 1;
  const children = healthState.children ?? 1;
  const coverIndex = healthState.coverIndex ?? 0;

  const [resultShown, setResultShown] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [committed, setCommitted] = useState(null);

  const liveParams = useMemo(
    () => ({
      age,
      coverIndex,
      adults,
      children,
    }),
    [age, coverIndex, adults, children],
  );

  const liveResult = useMemo(() => computePrice('c1', liveParams), [liveParams]);

  const committedResult = useMemo(() => {
    if (!committed) return null;
    return computePrice('c1', {
      age: committed.age,
      coverIndex: committed.coverIndex,
      adults: committed.adults,
      children: committed.children,
    });
  }, [committed]);

  const isStale =
    resultShown &&
    committed != null &&
    (committed.age !== age ||
      committed.coverIndex !== coverIndex ||
      committed.adults !== adults ||
      committed.children !== children);

  const quote = committedResult ?? liveResult;
  const premiumText = '₹ ' + quote.monthly.toLocaleString('en-IN');
  const animatedPremium = useAnimatedAmount(premiumText);

  const plansUrlState = {
    ...healthState,
    age,
    adults,
    children,
    coverIndex,
  };
  const plansUrl = buildPlansUrl('c1', plansUrlState, c5State, c6State, isTermFigma);

  function setHealth(partial) {
    onHealthChange({ ...healthState, ...partial });
  }

  function bumpAdults(delta) {
    const nextA = adults + delta;
    if (!c1MemberPairIsValid(nextA, children)) return;
    setHealth({ adults: nextA });
  }

  function bumpChildren(delta) {
    const nextC = children + delta;
    if (!c1MemberPairIsValid(adults, nextC)) return;
    setHealth({ children: nextC });
  }

  const runCalculate = useCallback(async () => {
    setCalculating(true);
    await delay(CALC_MS);
    setCommitted({
      age,
      coverIndex,
      adults,
      children,
    });
    setResultShown(true);
    setCalculating(false);
    requestAnimationFrame(() => {
      document.getElementById('c1-result')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, [age, coverIndex, adults, children]);

  const showEmpty = !resultShown && !calculating;
  const showSkeleton = !resultShown && calculating;

  const outerClass =
    mode === 'tab'
      ? `calculator-section health-calculator--seo ${active ? 'active' : ''}`
      : 'health-calculator--seo';
  const Outer = mode === 'tab' ? 'section' : 'div';

  const resultKey = committed
    ? `${committed.age}-${committed.coverIndex}-${committed.adults}-${committed.children}`
    : 'initial';

  return (
    <Outer id="calc1" className={outerClass}>
      <div className="calculator-wrapper">
        <div className="calculator-container">
          <div className="input-panel">
            <div className="calculator-intro health-intro">
              <h1 className="calculator-title health-figma-title">
                What will your health
                <br />
                cover cost?
              </h1>
              <p className="calculator-subtitle health-figma-subtitle">
                Tell us a few basics to see your premium estimate
              </p>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label className="slider-label" htmlFor="c1-ageSlider">
                  Age
                </label>
                <div className="slider-value-box">
                  <span>{age}</span>
                </div>
              </div>
              <div className="slider-track-wrapper">
                <CustomSlider
                  id="c1-ageSlider"
                  min={18}
                  max={60}
                  step={1}
                  value={age}
                  aria-label="Age"
                  onValueChange={(v) => setHealth({ age: Math.min(60, Math.max(18, v)) })}
                />
              </div>
              <div className="slider-range">
                <span>18 yrs</span>
                <span>60 yrs</span>
              </div>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label className="slider-label">Coverage</label>
                <div className="slider-value-box">
                  <span>{coverLabels[coverIndex]}</span>
                </div>
              </div>
              <div className="slider-track-wrapper">
                <CustomSlider
                  min={0}
                  max={3}
                  step={1}
                  value={coverIndex}
                  aria-label="Coverage amount"
                  onValueChange={(v) => setHealth({ coverIndex: v })}
                />
              </div>
              <div className="slider-steps health-figma-cover-steps">
                <span className="slider-step">₹ 10 L</span>
                <span className="slider-step">₹ 25 L</span>
                <span className="slider-step">₹ 50 L</span>
                <span className="slider-step">₹ 1 Cr</span>
              </div>
            </div>

            <div className="option-group health-figma-members">
              <label className="option-label">Who are you covering?</label>
              <div className="member-stepper-group health-figma-stepper-group">
                <div className="member-stepper health-figma-stepper">
                  <div className="member-stepper-head">
                    <img className="member-stepper-icon" src={adultIcon} alt="" width="24" height="24" />
                    <span className="member-stepper-label">Adults</span>
                  </div>
                  <div className="member-stepper-controls">
                    <button
                      type="button"
                      className="stepper-btn"
                      aria-label="Decrease adults"
                      disabled={!c1MemberPairIsValid(adults - 1, children)}
                      onClick={() => bumpAdults(-1)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                    <span className="stepper-value" data-zero={adults === 0 ? 'true' : 'false'}>
                      {adults}
                    </span>
                    <button
                      type="button"
                      className="stepper-btn"
                      aria-label="Increase adults"
                      disabled={!c1MemberPairIsValid(adults + 1, children)}
                      onClick={() => bumpAdults(1)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="member-stepper health-figma-stepper">
                  <div className="member-stepper-head">
                    <img className="member-stepper-icon" src={childIcon} alt="" width="24" height="24" />
                    <span className="member-stepper-label">Child</span>
                  </div>
                  <div className="member-stepper-controls">
                    <button
                      type="button"
                      className="stepper-btn"
                      aria-label="Decrease children"
                      disabled={!c1MemberPairIsValid(adults, children - 1)}
                      onClick={() => bumpChildren(-1)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                    <span className="stepper-value" data-zero={children === 0 ? 'true' : 'false'}>
                      {children}
                    </span>
                    <button
                      type="button"
                      className="stepper-btn"
                      aria-label="Increase children"
                      disabled={!c1MemberPairIsValid(adults, children + 1)}
                      onClick={() => bumpChildren(1)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <HealthMembersPlansHint resultShown={resultShown} />

            <button
              type="button"
              className={`cta-button health-figma-calc-cta ${resultShown ? 'health-secondary-cta health-recalc-cta' : 'health-primary-cta'}${isStale ? ' cta-stale health-cta--needs-recalc' : ''}`}
              onClick={runCalculate}
              disabled={calculating}
              aria-busy={calculating}
            >
              {calculating ? (
                <>
                  <HealthCalcSpinner />
                  <span>{resultShown ? 'Updating…' : 'Calculating…'}</span>
                </>
              ) : resultShown ? (
                'Recalculate'
              ) : (
                'Calculate premium'
              )}
            </button>
          </div>

          <div
            className={`results-panel health-results-panel ${showEmpty ? 'results-empty' : ''}${isStale ? ' health-results-stale' : ''}`}
          >
            {calculating && resultShown ? (
              <div className="health-calc-loading health-calc-loading--overlay" aria-live="polite">
                <HealthCalcSpinner />
                <span className="health-calc-loading__text">Updating your quote…</span>
              </div>
            ) : null}

            <div className="results-content health-results-inner">
              <div id="c1-empty" className="health-results-empty" hidden={!showEmpty}>
                <div className="health-results-empty-illu-wrap" aria-hidden="true">
                  <img
                    src={EMPTY_RESULTS_ILLUSTRATION_SRC}
                    className="health-results-empty-illu"
                    alt=""
                    width={118}
                    height={152}
                  />
                </div>
                <div className="health-results-empty-text">
                  <p className="health-results-empty-title">{EMPTY_RESULTS_TITLE}</p>
                  <p className="health-results-empty-body">
                    Adjust the sliders and hit{' '}
                    <span className="health-results-empty-cta">Calculate premium</span> to see an estimated
                    quote for your plan.
                  </p>
                </div>
              </div>

              {showSkeleton ? (
                <div className="health-calc-skeleton-wrap" aria-busy="true">
                  <div className="price-skeleton" />
                  <p className="health-calc-skeleton-hint">Crunching numbers…</p>
                </div>
              ) : null}

              <div
                key={resultKey}
                id="c1-result"
                className={`health-live-panel ${isStale ? 'result-stale' : ''}`}
                hidden={!resultShown}
              >
                <div className="health-result-top">
                  <p className="health-starting">Starting from</p>
                  <p className="health-price-line">
                    <span>{animatedPremium}</span>
                    <span className="health-price-suffix">/month</span>
                  </p>
                </div>
                <DifferentiatorsCard variant="health" plansUrl={plansUrl} />
                <ResultComplianceFooter variant="health" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Outer>
  );
}
