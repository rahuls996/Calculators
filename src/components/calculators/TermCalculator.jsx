import { useMemo, useState, useCallback, useEffect } from 'react';
import { computePrice } from '@/pricing/computePrice';
import { buildPlansUrl } from '@/utils/plansUrl';
import { useAnimatedAmount } from '@/hooks/useAnimatedAmount';
import { CustomSlider } from '@/components/ui/CustomSlider';
import { EMPTY_RESULTS_ILLUSTRATION_SRC } from '@/constants/emptyResultsIllustration';
import { TERM_DEFAULT_INCOME_LAKHS } from '@/constants/termDefaults';
import { DifferentiatorsCard } from './DifferentiatorsCard';
import { ResultComplianceFooter } from './ResultComplianceFooter';

const coverLabels = ['₹ 25 L', '₹ 50 L', '₹ 1 Cr', '₹ 2 Cr'];

const COVER_VARIANT = '4';
const CALC_MS = 720;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function TermCalcSpinner() {
  return (
    <span className="term-calc-spinner" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="32 48"
          className="term-calc-spinner__arc"
        />
      </svg>
    </span>
  );
}

export default function TermCalculator({ active, termState, onTermChange, healthState, hlvState }) {
  const { age, coverIndex, term = 60 } = termState;

  const ci = Math.min(3, Math.max(0, coverIndex));
  const displayAge = Math.min(100, Math.max(18, age));

  const [resultShown, setResultShown] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [committed, setCommitted] = useState(null);

  useEffect(() => {
    if (coverIndex > 3) {
      onTermChange({ ...termState, coverIndex: 3 });
    }
  }, [coverIndex, onTermChange, termState]);

  const paramsFor = useCallback(
    (a, cIdx) => ({
      age: Math.min(100, Math.max(18, a)),
      coverIndex: Math.min(3, Math.max(0, cIdx)),
      term,
      coverVariant: COVER_VARIANT,
      income: TERM_DEFAULT_INCOME_LAKHS,
    }),
    [term],
  );

  const liveParams = useMemo(
    () => paramsFor(displayAge, ci),
    [paramsFor, displayAge, ci],
  );

  const liveResult = useMemo(() => computePrice('c6', liveParams), [liveParams]);

  const committedResult = useMemo(() => {
    if (!committed) return null;
    return computePrice('c6', paramsFor(committed.age, committed.coverIndex));
  }, [committed, paramsFor]);

  const isStale =
    resultShown &&
    committed != null &&
    (committed.age !== displayAge || committed.coverIndex !== ci);

  const premiumSource = committedResult ?? liveResult;
  const monthlyText = '₹ ' + premiumSource.monthly.toLocaleString('en-IN');
  const animatedMonthly = useAnimatedAmount(monthlyText);

  const plansUrl = buildPlansUrl(
    'c6',
    healthState,
    hlvState,
    {
      ...termState,
      age: displayAge,
      coverIndex: ci,
      term: 60,
    },
    true,
  );

  const setAge = (v) => {
    const a = Math.min(100, Math.max(18, v));
    onTermChange({ ...termState, age: a });
  };

  const runCalculate = useCallback(async () => {
    setCalculating(true);
    await delay(CALC_MS);
    setCommitted({
      age: displayAge,
      coverIndex: ci,
    });
    setResultShown(true);
    setCalculating(false);
    requestAnimationFrame(() => {
      document.getElementById('c6-result')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, [displayAge, ci]);

  const showEmpty = !resultShown && !calculating;
  const showSkeleton = !resultShown && calculating;
  const resultBlockKey = committed ? `${committed.age}-${committed.coverIndex}` : 'initial';

  return (
    <section
      className={`calculator-section term-calculator--figma ${active ? 'active' : ''}`}
      id="calc6"
    >
      <div className="calculator-wrapper">
        <div className="calculator-container">
          <div className="input-panel">
            <div className="calculator-intro">
              <h1 className="calculator-title term-figma-title">
                What will your term plan actually cost?
              </h1>
              <p className="calculator-subtitle term-figma-subtitle">
                Tell us a few basics to see your premium estimate
              </p>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label className="slider-label" htmlFor="c6-ageSlider">
                  Your age
                </label>
                <div className="slider-value-box">
                  <span>{displayAge}</span>
                </div>
              </div>
              <div className="slider-track-wrapper">
                <CustomSlider
                  id="c6-ageSlider"
                  min={18}
                  max={100}
                  value={displayAge}
                  aria-label="Your age"
                  onValueChange={setAge}
                />
              </div>
              <div className="slider-range">
                <span>18 yrs</span>
                <span>100 yrs</span>
              </div>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label className="slider-label" htmlFor="c6-coverSlider">
                  Cover amount
                </label>
                <div className="slider-value-box">
                  <span>{coverLabels[ci]}</span>
                </div>
              </div>
              <div className="slider-track-wrapper">
                <CustomSlider
                  id="c6-coverSlider"
                  min={0}
                  max={3}
                  step={1}
                  value={ci}
                  aria-label="Coverage amount"
                  onValueChange={(v) => onTermChange({ ...termState, coverIndex: v })}
                />
              </div>
              <div className="slider-steps term-figma-cover-steps">
                <span className="slider-step">₹ 25 L</span>
                <span className="slider-step">₹ 50 L</span>
                <span className="slider-step">₹ 1 Cr</span>
                <span className="slider-step">₹ 2 Cr</span>
              </div>
            </div>

            <button
              type="button"
              className={`cta-button term-figma-calc-cta ${resultShown ? 'term-cta--secondary calc-cta--recalc' : 'term-cta--primary'}${isStale ? ' cta-stale term-cta--needs-recalc' : ''}`}
              onClick={runCalculate}
              disabled={calculating}
              aria-busy={calculating}
            >
              {calculating ? (
                <>
                  <TermCalcSpinner />
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
            className={`results-panel term-figma-results-panel ${showEmpty ? 'results-empty' : ''}${isStale ? ' term-results-stale' : ''}`}
          >
            {calculating && resultShown ? (
              <div className="term-calc-loading term-calc-loading--overlay" aria-live="polite">
                <TermCalcSpinner />
                <span className="term-calc-loading__text">Updating your quote…</span>
              </div>
            ) : null}

            <div className="results-content term-figma-results-inner">
              <div
                id="c6-empty"
                className="term-figma-empty"
                hidden={!showEmpty}
              >
                <div className="term-figma-empty-illu-wrap" aria-hidden="true">
                  <img
                    src={EMPTY_RESULTS_ILLUSTRATION_SRC}
                    className="term-figma-empty-illu"
                    alt=""
                    width={118}
                    height={152}
                  />
                </div>
                <div className="term-figma-empty-text">
                  <p className="term-figma-empty-title">See your price instantly</p>
                  <p className="term-figma-empty-body">
                    Adjust the sliders, then hit <span className="term-figma-empty-cta">Calculate premium</span> to
                    get your personalised quote.
                  </p>
                </div>
              </div>

              {showSkeleton ? (
                <div className="term-calc-skeleton-wrap" aria-busy="true">
                  <div className="price-skeleton" />
                  <p className="term-calc-skeleton-hint">Crunching numbers…</p>
                </div>
              ) : null}

              <div
                key={resultBlockKey}
                className={`term-figma-result ${isStale ? 'result-stale' : ''}`}
                id="c6-result"
                hidden={!resultShown}
              >
                <div className="term-figma-result-top">
                  <div className="term-figma-price-cluster">
                    <p className="term-figma-starting">Starting from</p>
                    <p className="term-figma-price-line">
                      <span className="term-figma-price-amount">{animatedMonthly}</span>
                      <span className="term-figma-price-suffix">/month</span>
                    </p>
                  </div>
                </div>
                <DifferentiatorsCard variant="term" plansUrl={plansUrl} isStale={isStale} />
                <ResultComplianceFooter variant="term" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
