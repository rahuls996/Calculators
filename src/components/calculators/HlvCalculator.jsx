import { useMemo, useEffect, useState, useCallback } from 'react';
import { computePrice } from '@/pricing/computePrice';
import { formatCoverHeroINR, formatLakhsWithRupee } from '@/utils/format';
import { buildPlansUrl } from '@/utils/plansUrl';
import { useAnimatedAmount } from '@/hooks/useAnimatedAmount';
import { CustomSlider } from '@/components/ui/CustomSlider';
import { EMPTY_RESULTS_TITLE } from '@/constants/calculatorCopy';
import { EMPTY_RESULTS_ILLUSTRATION_SRC } from '@/constants/emptyResultsIllustration';
import { DifferentiatorsCard } from './DifferentiatorsCard';
import { ResultComplianceFooter } from './ResultComplianceFooter';

const CALC_MS = 720;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function HlvCalcSpinner() {
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

export default function HlvCalculator({
  active = true,
  hlvState,
  onHlvChange,
  healthState,
  c6State,
  isTermFigma,
}) {
  const { age, income, retireAge, savings, loans, existingCover } = hlvState;
  const [hlvSectionTab, setHlvSectionTab] = useState('profile');
  const [resultShown, setResultShown] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [committed, setCommitted] = useState(null);

  const minRetire = Math.max(40, age + 1);
  const maxRetire = 70;

  useEffect(() => {
    const minR = Math.max(40, age + 1);
    const maxR = 70;
    if (retireAge < minR || retireAge > maxR) {
      const clamped = Math.min(Math.max(retireAge, minR), maxR);
      onHlvChange({ retireAge: clamped });
    }
  }, [age, retireAge, onHlvChange]);

  const retireValue = Math.min(Math.max(retireAge, minRetire), maxRetire);

  const loansClamped = Math.min(1000, Math.max(0, loans));
  const existingClamped = Math.min(500, Math.max(0, existingCover));

  const liveParams = useMemo(
    () => ({
      age: Math.min(69, Math.max(18, age)),
      retireAge: retireValue,
      income,
      savings,
      loans: loansClamped,
      existingCover: existingClamped,
    }),
    [age, retireValue, income, savings, loansClamped, existingClamped],
  );

  const liveResult = useMemo(() => computePrice('c5', liveParams), [liveParams]);

  const committedResult = useMemo(() => {
    if (!committed) return null;
    return computePrice('c5', {
      age: committed.age,
      retireAge: committed.retireAge,
      income: committed.income,
      savings: committed.savings,
      loans: committed.loans,
      existingCover: committed.existingCover,
    });
  }, [committed]);

  const isStale =
    resultShown &&
    committed != null &&
    (committed.age !== liveParams.age ||
      committed.retireAge !== liveParams.retireAge ||
      committed.income !== liveParams.income ||
      committed.savings !== liveParams.savings ||
      committed.loans !== liveParams.loans ||
      committed.existingCover !== liveParams.existingCover);

  const quoteForDisplay = committedResult ?? liveResult;
  const coverHeroText = formatCoverHeroINR(quoteForDisplay.suggestedCoverRs ?? quoteForDisplay.price);
  const animatedSuggestedCover = useAnimatedAmount(coverHeroText);

  const plansUrl = buildPlansUrl(
    'c5',
    healthState,
    { ...hlvState, retireAge: retireValue },
    c6State,
    isTermFigma,
  );

  const patchHlv = useCallback(
    (partial) => {
      onHlvChange(partial);
    },
    [onHlvChange],
  );

  const runCalculate = useCallback(async () => {
    setCalculating(true);
    await delay(CALC_MS);
    setCommitted({
      age: liveParams.age,
      retireAge: liveParams.retireAge,
      income: liveParams.income,
      savings: liveParams.savings,
      loans: liveParams.loans,
      existingCover: liveParams.existingCover,
    });
    setResultShown(true);
    setCalculating(false);
    requestAnimationFrame(() => {
      document.getElementById('c5-result')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
        document.getElementById('calc5')?.querySelector('.results-panel')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  }, [liveParams]);

  const handleCtaClick = useCallback(() => {
    if (hlvSectionTab === 'profile') {
      setHlvSectionTab('finance');
      return;
    }
    runCalculate();
  }, [hlvSectionTab, runCalculate]);

  const showEmpty = !resultShown && !calculating;
  const showSkeleton = !resultShown && calculating;
  const resultKey = committed
    ? `${committed.age}-${committed.retireAge}-${committed.income}-${committed.savings}-${committed.loans}-${committed.existingCover}`
    : 'initial';

  const ctaProfile = hlvSectionTab === 'profile';
  const ctaPrimary =
    ctaProfile || !resultShown ? 'term-cta--primary' : 'term-cta--secondary calc-cta--recalc';
  const ctaStaleClass =
    !ctaProfile && resultShown && isStale ? ' cta-stale term-cta--needs-recalc' : '';

  return (
    <section
      className={`calculator-section hlv-calculator--figma ${active ? 'active' : ''}`}
      id="calc5"
    >
      <div className="calculator-wrapper">
        <div className="calculator-container">
          <div className="input-panel c5-input-panel">
            <div className="calculator-intro hlv-figma-intro">
              <h1 className="calculator-title hlv-figma-title">Human life value calculator</h1>
              <p className="calculator-subtitle hlv-figma-subtitle">
                Find out how much life cover your family actually needs
              </p>
            </div>

            <div className="hlv-segmented" role="tablist" aria-label="Calculator inputs">
              <button
                type="button"
                role="tab"
                id="c5-tab-profile"
                className={`hlv-segmented-tab ${hlvSectionTab === 'profile' ? 'is-active' : ''}`}
                aria-selected={hlvSectionTab === 'profile'}
                tabIndex={hlvSectionTab === 'profile' ? 0 : -1}
                aria-controls="c5-panel-profile"
                onClick={() => setHlvSectionTab('profile')}
              >
                My profile
              </button>
              <button
                type="button"
                role="tab"
                id="c5-tab-finance"
                className={`hlv-segmented-tab ${hlvSectionTab === 'finance' ? 'is-active' : ''}`}
                aria-selected={hlvSectionTab === 'finance'}
                tabIndex={hlvSectionTab === 'finance' ? 0 : -1}
                aria-controls="c5-panel-finance"
                onClick={() => setHlvSectionTab('finance')}
              >
                My finance
              </button>
            </div>

            <div
              id="c5-panel-profile"
              className="hlv-tab-panel"
              role="tabpanel"
              aria-labelledby="c5-tab-profile"
              hidden={hlvSectionTab !== 'profile'}
            >
              <div className="slider-group">
                <div className="slider-header">
                  <label className="slider-label" htmlFor="c5-ageSlider">
                    Your age
                  </label>
                  <div className="slider-value-box">
                    <span>{age}</span>
                  </div>
                </div>
                <div className="slider-track-wrapper">
                  <CustomSlider
                    id="c5-ageSlider"
                    min={18}
                    max={69}
                    value={Math.min(69, Math.max(18, age))}
                    aria-label="Your age"
                    onValueChange={(v) => patchHlv({ age: Math.min(69, Math.max(18, v)) })}
                  />
                </div>
                <div className="slider-range">
                  <span>18 yrs</span>
                  <span>69 yrs</span>
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <label className="slider-label" htmlFor="c5-retireSlider">
                    When you plan to retire
                  </label>
                  <div className="slider-value-box">
                    <span>{retireValue} yrs</span>
                  </div>
                </div>
                <div className="slider-track-wrapper">
                  <CustomSlider
                    id="c5-retireSlider"
                    min={minRetire}
                    max={maxRetire}
                    step={1}
                    value={retireValue}
                    aria-label="When you plan to retire"
                    onValueChange={(v) => patchHlv({ retireAge: v })}
                  />
                </div>
                <div className="slider-range">
                  <span>{minRetire} yrs</span>
                  <span>70 yrs</span>
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <label className="slider-label" htmlFor="c5-incomeSlider">
                    Your annual income
                  </label>
                  <div className="slider-value-box">
                    <span>{formatLakhsWithRupee(income)}</span>
                  </div>
                </div>
                <div className="slider-track-wrapper">
                  <CustomSlider
                    id="c5-incomeSlider"
                    min={1}
                    max={200}
                    value={income}
                    aria-label="Your annual income"
                    onValueChange={(v) => patchHlv({ income: v })}
                  />
                </div>
                <div className="slider-range">
                  <span>₹1L</span>
                  <span>₹2Cr</span>
                </div>
              </div>
            </div>

            <div
              id="c5-panel-finance"
              className="hlv-tab-panel"
              role="tabpanel"
              aria-labelledby="c5-tab-finance"
              hidden={hlvSectionTab !== 'finance'}
            >
              <div className="slider-group">
                <div className="slider-header">
                  <label className="slider-label" htmlFor="c5-accSavingsSlider">
                    Savings
                  </label>
                  <div className="slider-value-box">
                    <span>{formatLakhsWithRupee(savings)}</span>
                  </div>
                </div>
                <div className="slider-track-wrapper">
                  <CustomSlider
                    id="c5-accSavingsSlider"
                    min={0}
                    max={200}
                    value={savings}
                    aria-label="Savings"
                    onValueChange={(v) => patchHlv({ savings: v })}
                  />
                </div>
                <div className="slider-range">
                  <span>₹0</span>
                  <span>₹2Cr</span>
                </div>
              </div>
              <div className="slider-group">
                <div className="slider-header">
                  <label className="slider-label" htmlFor="c5-accLoansSlider">
                    Loans and liabilities
                  </label>
                  <div className="slider-value-box">
                    <span>{formatLakhsWithRupee(loans)}</span>
                  </div>
                </div>
                <div className="slider-track-wrapper">
                  <CustomSlider
                    id="c5-accLoansSlider"
                    min={0}
                    max={1000}
                    value={loansClamped}
                    aria-label="Loans and liabilities"
                    onValueChange={(v) => patchHlv({ loans: Math.min(1000, Math.max(0, v)) })}
                  />
                </div>
                <div className="slider-range">
                  <span>₹0</span>
                  <span>₹10Cr</span>
                </div>
              </div>
              <div className="slider-group">
                <div className="slider-header">
                  <label className="slider-label" htmlFor="c5-accExistingSlider">
                    Existing life cover
                  </label>
                  <div className="slider-value-box">
                    <span>{formatLakhsWithRupee(existingCover)}</span>
                  </div>
                </div>
                <div className="slider-track-wrapper">
                  <CustomSlider
                    id="c5-accExistingSlider"
                    min={0}
                    max={500}
                    value={existingClamped}
                    aria-label="Existing life cover"
                    onValueChange={(v) =>
                      patchHlv({ existingCover: Math.min(500, Math.max(0, v)) })
                    }
                  />
                </div>
                <div className="slider-range">
                  <span>₹0</span>
                  <span>₹5Cr</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`cta-button term-figma-calc-cta ${ctaPrimary}${ctaStaleClass}`}
              data-calc="c5"
              onClick={handleCtaClick}
              disabled={calculating && !ctaProfile}
              aria-busy={calculating && !ctaProfile}
            >
              {calculating && !ctaProfile ? (
                <>
                  <HlvCalcSpinner />
                  <span>{resultShown ? 'Updating…' : 'Calculating…'}</span>
                </>
              ) : ctaProfile ? (
                'Next'
              ) : resultShown ? (
                'Recalculate'
              ) : (
                'Calculate'
              )}
            </button>
          </div>

          <div
            className={`results-panel term-figma-results-panel ${showEmpty ? 'results-empty' : ''}${isStale ? ' term-results-stale' : ''}`}
          >
            {calculating && resultShown ? (
              <div className="term-calc-loading term-calc-loading--overlay" aria-live="polite">
                <HlvCalcSpinner />
                <span className="term-calc-loading__text">Updating your quote…</span>
              </div>
            ) : null}

            <div className="results-content term-figma-results-inner">
              <div id="c5-empty" className="term-figma-empty" hidden={!showEmpty}>
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
                  <p className="term-figma-empty-title">{EMPTY_RESULTS_TITLE}</p>
                  <p className="term-figma-empty-body">
                    Adjust the sliders and hit{' '}
                    <span className="term-figma-empty-cta">Calculate premium</span> to see an estimated quote for
                    your plan.
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
                key={resultKey}
                id="c5-result"
                className={`term-figma-result ${isStale ? 'result-stale' : ''}`}
                hidden={!resultShown}
              >
                <div className="term-figma-result-top hlv-result-top">
                  <div className="hlv-hero hlv-hero--mobile" aria-live="polite">
                    <p className="hlv-mobile-starting">Life cover needed</p>
                    <p className="hlv-mobile-price-line">
                      <span className="hlv-mobile-price-amount">{animatedSuggestedCover}</span>
                    </p>
                  </div>
                  <div className="hlv-hero hlv-hero--desktop" aria-live="polite">
                    <div className="term-figma-price-cluster">
                      <p className="term-figma-starting">Life cover needed</p>
                      <p className="term-figma-price-line">
                        <span className="term-figma-price-amount">{animatedSuggestedCover}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <DifferentiatorsCard variant="hlv" plansUrl={plansUrl} isStale={isStale} />
                <ResultComplianceFooter variant="hlv" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
