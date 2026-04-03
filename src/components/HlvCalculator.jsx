import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { computePrice } from '../pricing/computePrice';
import { formatCoverHeroINR, formatLakhsWithRupee } from '../utils/format';
import { buildPlansUrl } from '../utils/plansUrl';
import { useAnimatedAmount } from '../hooks/useAnimatedAmount';
import { CustomSlider } from './CustomSlider';
import { COMPLIANCE_ARN_HLV, DISCLAIMER_HLV } from '../constants/compliance';
import { publicAsset } from '../utils/publicAsset';

const starIcon = publicAsset('icons/star.svg');
const arrowRightIcon = publicAsset('icons/arrow-right.svg');
const hlvEmptyIllu = publicAsset('icons/term-results-empty-illustration.svg');

function scrollHlvResultsIntoView() {
  if (typeof window === 'undefined') return;
  document.getElementById('calc5')?.querySelector('.results-panel')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
  const result = document.getElementById('c5-result');
  if (result && typeof result.focus === 'function') {
    result.focus({ preventScroll: true });
  }
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
  const [hlvInputTab, setHlvInputTab] = useState('profile');
  const [hlvResultShown, setHlvResultShown] = useState(false);
  const tabProfileRef = useRef(null);
  const tabFinanceRef = useRef(null);

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

  const c5Params = useMemo(
    () => ({
      age: Math.min(69, Math.max(18, age)),
      retireAge: retireValue,
      income,
      savings,
      loans,
      existingCover,
    }),
    [age, retireValue, income, savings, loans, existingCover],
  );

  const result = useMemo(() => computePrice('c5', c5Params), [c5Params]);

  const coverHeroText = formatCoverHeroINR(result.suggestedCoverRs ?? result.price);
  const monthlyStr = result.monthly != null ? '₹ ' + result.monthly.toLocaleString('en-IN') : '₹ 0';
  const animatedSuggestedCover = useAnimatedAmount(coverHeroText);
  const stickyMonthly = useAnimatedAmount(monthlyStr + '/month');

  const plansUrl = buildPlansUrl(
    'c5',
    healthState,
    { ...hlvState, retireAge: retireValue },
    c6State,
    isTermFigma,
  );

  const perDayText = result.monthly
    ? `Indicative term premium from ${monthlyStr}/month (illustrative).`
    : '';

  const patchHlv = useCallback(
    (partial) => {
      onHlvChange(partial);
    },
    [onHlvChange],
  );

  const selectHlvTab = useCallback((tab) => {
    setHlvInputTab(tab);
    if (tab === 'finance' && typeof window !== 'undefined' && window.innerWidth <= 1024) {
      document.querySelector('#calc5 .hlv-tablist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const onHlvTabKeyDown = useCallback(
    (e, tab) => {
      if (e.key === 'ArrowRight' && tab === 'profile') {
        e.preventDefault();
        selectHlvTab('finance');
        requestAnimationFrame(() => tabFinanceRef.current?.focus());
      } else if (e.key === 'ArrowLeft' && tab === 'finance') {
        e.preventDefault();
        selectHlvTab('profile');
        requestAnimationFrame(() => tabProfileRef.current?.focus());
      }
    },
    [selectHlvTab],
  );

  const onHlvCalculate = useCallback(() => {
    if (hlvResultShown) {
      scrollHlvResultsIntoView();
      return;
    }
    setHlvResultShown(true);
    // First reveal: wait for commit so #c5-result is not [hidden] before focus/scroll.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollHlvResultsIntoView();
      });
    });
  }, [hlvResultShown]);

  const profileFields = (
    <>
      <div className="slider-group">
        <div className="slider-header">
          <label className="slider-label" htmlFor="c5-ageSlider">
            Age
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
            aria-label="Age"
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
            Expected retirement age
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
            aria-label="Expected retirement age"
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
            Annual income
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
            aria-label="Annual income"
            onValueChange={(v) => patchHlv({ income: v })}
          />
        </div>
        <div className="slider-range">
          <span>₹1L</span>
          <span>₹2Cr</span>
        </div>
      </div>
    </>
  );

  const financeFields = (
    <>
      <p className="hlv-tab-panel-hint">
        Optional — add savings, loans, and existing cover for a closer estimate. Defaults stay at zero until you change them.
      </p>
      <div className="slider-group">
        <div className="slider-header">
          <label className="slider-label" htmlFor="c5-accSavingsSlider">
            My savings
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
            aria-label="My savings"
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
            value={Math.min(1000, Math.max(0, loans))}
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
            value={Math.min(500, Math.max(0, existingCover))}
            aria-label="Existing life cover"
            onValueChange={(v) => patchHlv({ existingCover: Math.min(500, Math.max(0, v)) })}
          />
        </div>
        <div className="slider-range">
          <span>₹0</span>
          <span>₹5Cr</span>
        </div>
      </div>
    </>
  );

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
                <span className="hlv-sub-part1">See how much life cover the family</span>
                <span className="hlv-sub-part2">may need</span>
              </p>
            </div>

            <div className="hlv-input-tabs">
              <div
                className="hlv-tablist"
                role="tablist"
                aria-label="Choose which details to enter"
              >
                <button
                  ref={tabProfileRef}
                  type="button"
                  id="hlv-tab-profile"
                  role="tab"
                  aria-selected={hlvInputTab === 'profile'}
                  aria-controls="hlv-panel-profile"
                  tabIndex={hlvInputTab === 'profile' ? 0 : -1}
                  className={`hlv-tab ${hlvInputTab === 'profile' ? 'hlv-tab--active' : ''}`}
                  onClick={() => selectHlvTab('profile')}
                  onKeyDown={(e) => onHlvTabKeyDown(e, 'profile')}
                >
                  <span className="hlv-tab-label">About you</span>
                  <span className="hlv-tab-sublabel">Age, income & retirement</span>
                </button>
                <button
                  ref={tabFinanceRef}
                  type="button"
                  id="hlv-tab-finance"
                  role="tab"
                  aria-selected={hlvInputTab === 'finance'}
                  aria-controls="hlv-panel-finance"
                  tabIndex={hlvInputTab === 'finance' ? 0 : -1}
                  className={`hlv-tab ${hlvInputTab === 'finance' ? 'hlv-tab--active' : ''}`}
                  onClick={() => selectHlvTab('finance')}
                  onKeyDown={(e) => onHlvTabKeyDown(e, 'finance')}
                >
                  <span className="hlv-tab-label">
                    Fine-tune
                    <span className="hlv-tab-optional-pill">Optional</span>
                  </span>
                  <span className="hlv-tab-sublabel">Savings, loans & cover</span>
                </button>
              </div>

              <div
                id="hlv-panel-profile"
                className="hlv-tab-panel"
                role="tabpanel"
                aria-labelledby="hlv-tab-profile"
                hidden={hlvInputTab !== 'profile'}
              >
                {profileFields}
              </div>
              <div
                id="hlv-panel-finance"
                className="hlv-tab-panel"
                role="tabpanel"
                aria-labelledby="hlv-tab-finance"
                hidden={hlvInputTab !== 'finance'}
              >
                {financeFields}
              </div>

              <div className="hlv-tab-footer">
                <button
                  type="button"
                  className={`hlv-step-btn hlv-tab-cta ${hlvResultShown ? 'hlv-step-btn--secondary' : 'hlv-step-btn--primary'}`}
                  onClick={onHlvCalculate}
                >
                  {hlvResultShown ? 'Recalculate' : 'Calculate'}
                </button>
              </div>
            </div>
          </div>

          <div
            className={`results-panel term-figma-results-panel ${!hlvResultShown ? 'results-empty' : ''}`}
          >
            <div className="results-content term-figma-results-inner">
              <div
                id="c5-empty"
                className="term-figma-empty"
                hidden={hlvResultShown}
              >
                <div className="term-figma-empty-illu-wrap" aria-hidden="true">
                  <img src={hlvEmptyIllu} className="term-figma-empty-illu" alt="" width="118" height="152" />
                </div>
                <div className="term-figma-empty-text">
                  <p className="term-figma-empty-title">Your estimate will show here</p>
                  <p className="term-figma-empty-body">
                    Enter your details, then tap Calculate to see the suggested life cover.
                  </p>
                </div>
              </div>
              <div
                className="term-figma-result"
                id="c5-result"
                tabIndex={-1}
                hidden={!hlvResultShown}
              >
                <div className="term-figma-result-top hlv-result-top">
                  <div className="hlv-hero hlv-hero--mobile" aria-live="polite">
                    <p className="hlv-mobile-starting">Life cover needed</p>
                    <p className="hlv-mobile-price-line">
                      <span className="hlv-mobile-price-amount">{animatedSuggestedCover}</span>
                    </p>
                    <div className="hlv-perday-capsule">
                      <p className="hlv-perday-text">{perDayText}</p>
                    </div>
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
                <div className="term-figma-different-card hlv-different-card">
                  <h3 className="term-figma-different-title hlv-different-title">
                    What makes us different
                  </h3>
                  <ul className="term-figma-different-list hlv-different-list">
                    <li>
                      <img src={starIcon} alt="" width="14" height="14" className="term-figma-star" />
                      <span>Family gets the full payout.</span>
                    </li>
                    <li>
                      <img src={starIcon} alt="" width="14" height="14" className="term-figma-star" />
                      <span>Increase cover when life changes.</span>
                    </li>
                  </ul>
                  <a
                    className="term-figma-plans-btn hlv-plans-btn hlv-plans-btn--hero"
                    href={plansUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="term-figma-plans-btn-label">See plans</span>
                    <span className="term-figma-plans-btn-icon" aria-hidden="true">
                      <img src={arrowRightIcon} alt="" width="24" height="24" />
                    </span>
                  </a>
                </div>
                <p className="hlv-result-arn">ARN: {COMPLIANCE_ARN_HLV}</p>
                <p className="term-figma-footer-note hlv-footer-note">{DISCLAIMER_HLV}</p>
              </div>
            </div>
          </div>

          <div className="c5-mobile-sticky-bar" id="c5-mobileStickyBar" role="region" aria-label="Monthly estimate and plans">
            <div className="c5-mobile-sticky-bar-inner">
              <div className="c5-mobile-sticky-price">
                <p className="c5-mobile-sticky-label">Starting from</p>
                <p className="c5-mobile-sticky-amount" aria-live="polite">
                  {stickyMonthly}
                </p>
              </div>
              <a
                className="c5-mobile-sticky-cta"
                href={plansUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="See plans for term life insurance (opens in new tab)"
              >
                See Plans
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
