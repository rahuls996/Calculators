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
  const [hlvSectionTab, setHlvSectionTab] = useState('profile');

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
            className="cta-button calc-cta--first term-figma-calc-cta term-cta--primary"
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
            Calculate premium
          </button>
        </div>
      </div>
    </section>
  );
}
