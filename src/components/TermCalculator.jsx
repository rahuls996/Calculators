import { useMemo } from 'react';
import { computePrice } from '../pricing/computePrice';
import { buildPlansUrl } from '../utils/plansUrl';
import { useAnimatedAmount } from '../hooks/useAnimatedAmount';
import { CustomSlider } from './CustomSlider';
import { COMPLIANCE_ARN_TERM, DISCLAIMER_TERM } from '../constants/compliance';
import { publicAsset } from '../utils/publicAsset';

const starIcon = publicAsset('icons/star.svg');
const arrowRightIcon = publicAsset('icons/arrow-right.svg');

const coverLabels = ['₹ 25 L', '₹ 50 L', '₹ 75 L', '₹ 1 Cr', '₹ 2 Cr'];

export default function TermCalculator({
  active,
  termState,
  onTermChange,
  healthState,
  hlvState,
}) {
  const { age, coverIndex, term = 60 } = termState;

  const c6Params = useMemo(
    () => ({
      age: Math.min(55, Math.max(18, age)),
      coverIndex: Math.min(4, Math.max(0, coverIndex)),
      term,
      coverVariant: '5',
      income: null,
    }),
    [age, coverIndex, term],
  );

  const result = useMemo(() => computePrice('c6', c6Params), [c6Params]);

  const monthlyText = '₹ ' + result.monthly.toLocaleString('en-IN');
  const animatedMonthly = useAnimatedAmount(monthlyText);

  const plansUrl = buildPlansUrl(
    'c6',
    healthState,
    hlvState,
    {
      ...termState,
      age: Math.min(55, Math.max(18, age)),
      coverIndex: Math.min(4, Math.max(0, coverIndex)),
      term,
      income: 50,
    },
    false,
  );

  const setAge = (v) => {
    const a = Math.min(55, Math.max(18, v));
    onTermChange({ ...termState, age: a });
  };

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
                What could term cover
                <br />
                cost?
              </h1>
              <p className="calculator-subtitle term-figma-subtitle">
                Tell us a few basics to see your premium estimate
              </p>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label className="slider-label" htmlFor="c6-ageSlider">
                  Age
                </label>
                <div className="slider-value-box">
                  <span>{Math.min(55, Math.max(18, age))}</span>
                </div>
              </div>
              <div className="slider-track-wrapper">
                <CustomSlider
                  id="c6-ageSlider"
                  min={18}
                  max={55}
                  value={Math.min(55, Math.max(18, age))}
                  aria-label="Age"
                  onValueChange={setAge}
                />
              </div>
              <div className="slider-range">
                <span>18 yrs</span>
                <span>55 yrs</span>
              </div>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label className="slider-label" htmlFor="c6-coverSlider">
                  Cover amount
                </label>
                <div className="slider-value-box">
                  <span>{coverLabels[Math.min(4, Math.max(0, coverIndex))]}</span>
                </div>
              </div>
              <div className="slider-track-wrapper">
                <CustomSlider
                  id="c6-coverSlider"
                  min={0}
                  max={4}
                  step={1}
                  value={Math.min(4, Math.max(0, coverIndex))}
                  aria-label="Coverage amount"
                  onValueChange={(v) => onTermChange({ ...termState, coverIndex: v })}
                />
              </div>
              <div className="slider-steps term-figma-cover-steps">
                <span className="slider-step">₹ 25 L</span>
                <span className="slider-step">₹ 50 L</span>
                <span className="slider-step">₹ 75 L</span>
                <span className="slider-step">₹ 1 Cr</span>
                <span className="slider-step">₹ 2 Cr</span>
              </div>
            </div>
          </div>

          <div className="results-panel term-figma-results-panel">
            <div className="results-content term-figma-results-inner">
              <div className="term-figma-result" id="c6-result">
                <div className="term-figma-result-top">
                  <div className="term-figma-price-cluster">
                    <p className="term-figma-starting">Starting from</p>
                    <p className="term-figma-price-line">
                      <span className="term-figma-price-amount">{animatedMonthly}</span>
                      <span className="term-figma-price-suffix">/month</span>
                    </p>
                  </div>
                </div>
                <div className="term-figma-different-card">
                  <h3 className="term-figma-different-title">What makes us different</h3>
                  <ul className="term-figma-different-list">
                    <li>
                      <img src={starIcon} alt="" width="18" height="18" className="term-figma-star" />
                      <span>Family gets the full payout.</span>
                    </li>
                    <li>
                      <img src={starIcon} alt="" width="18" height="18" className="term-figma-star" />
                      <span>Increase cover when life changes.</span>
                    </li>
                  </ul>
                  <a
                    className="term-figma-plans-btn"
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
                <p className="term-result-arn">ARN: {COMPLIANCE_ARN_TERM}</p>
                <p className="term-figma-footer-note">{DISCLAIMER_TERM}</p>
              </div>
            </div>
          </div>

          <a
            className="cta-button calc-sticky-plans term-sticky-plans"
            id="c6-stickyPlans"
            href={plansUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            See plans
          </a>
        </div>
      </div>
    </section>
  );
}
