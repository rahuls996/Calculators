import { useMemo, useEffect, useState, useCallback } from 'react';
import { computePrice } from '../pricing/computePrice';
import { formatCoverHeroINR, formatLakhsWithRupee } from '../utils/format';
import { buildPlansUrl } from '../utils/plansUrl';
import { useAnimatedAmount } from '../hooks/useAnimatedAmount';
import { CustomSlider } from './CustomSlider';
import { COMPLIANCE_ARN_HLV, DISCLAIMER_HLV } from '../constants/compliance';
import { publicAsset } from '../utils/publicAsset';

const starIcon = publicAsset('icons/star.svg');
const arrowRightIcon = publicAsset('icons/arrow-right.svg');

export default function HlvCalculator({
  active = true,
  hlvState,
  onHlvChange,
  healthState,
  c6State,
  isTermFigma,
}) {
  const { age, income, retireAge, savings, loans, existingCover } = hlvState;
  const [refineOpen, setRefineOpen] = useState(false);

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

  const toggleRefine = () => setRefineOpen((o) => !o);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && refineOpen) setRefineOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [refineOpen]);

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

            <div
              className={`c5-refine-accordion ${refineOpen ? 'is-open' : ''}`}
              id="c5-refineAccordion"
            >
              <button
                type="button"
                className={`c5-refine-trigger c5-refine-trigger--desktop ${refineOpen ? 'is-open' : ''}`}
                id="c5-refineOpen"
                aria-expanded={refineOpen}
                aria-controls="c5-accordionPanel"
                onClick={toggleRefine}
              >
                <span className="c5-refine-trigger-copy">
                  <span className="c5-refine-trigger-title">Refine estimate</span>
                  <span className="c5-refine-trigger-sub">Add savings, loans &amp; retirement age</span>
                </span>
                <span className="c5-refine-trigger-icon" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`c5-refine-accordion-trigger ${refineOpen ? 'is-open' : ''}`}
                id="c5-accordionToggle"
                aria-expanded={refineOpen}
                aria-controls="c5-accordionPanel"
                onClick={toggleRefine}
              >
                <span className="c5-refine-accordion-row">
                  <span className="c5-refine-accordion-copy">
                    <span className="c5-refine-accordion-title">Refine estimate</span>
                    <span className="c5-refine-accordion-sub">Add savings, loans &amp; retirement age</span>
                  </span>
                  <span className="c5-refine-accordion-icon" aria-hidden="true" />
                </span>
              </button>
              <div
                className="c5-refine-accordion-panel"
                id="c5-accordionPanel"
                role="region"
                aria-label="Savings, loans and retirement age"
                aria-hidden={!refineOpen}
              >
                <div className="c5-refine-panel-measure">
                  <div className="c5-refine-divider" aria-hidden="true" />
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
              </div>
            </div>
          </div>

          <div className="results-panel term-figma-results-panel">
            <div className="results-content term-figma-results-inner">
              <div className="term-figma-result" id="c5-result">
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
                      <img src={starIcon} alt="" width="24" height="24" className="term-figma-star" />
                      <span>Family gets the full payout.</span>
                    </li>
                    <li>
                      <img src={starIcon} alt="" width="24" height="24" className="term-figma-star" />
                      <span>Increase cover when life changes.</span>
                    </li>
                  </ul>
                  <a
                    className="term-figma-plans-btn hlv-plans-btn"
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

          <button
            type="button"
            className="cta-button calc-cta--first"
            data-calc="c5"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
                document.getElementById('calc5')?.querySelector('.results-panel')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }
            }}
          >
            Calculate my cover
          </button>
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
