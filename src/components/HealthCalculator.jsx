import { useMemo } from 'react';
import { computePrice } from '../pricing/computePrice';
import { healthHospitalisationBullet } from '../utils/format';
import { buildPlansUrl } from '../utils/plansUrl';
import { useAnimatedAmount } from '../hooks/useAnimatedAmount';
import { CustomSlider } from './CustomSlider';
import { c1MemberPairIsValid } from '../constants/healthMembers';
import { COMPLIANCE_ARN_HEALTH, DISCLAIMER_HEALTH } from '../constants/compliance';
import { publicAsset } from '../utils/publicAsset';

const adultIcon = publicAsset('icons/Adult.svg');
const childIcon = publicAsset('icons/Child.svg');
const arrowRightIcon = publicAsset('icons/arrow-right.svg');
const starIcon = publicAsset('icons/star.svg');

const coverLabels = ['₹ 10 L', '₹ 25 L', '₹ 50 L', '₹ 1 Cr'];

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

  const c1Params = useMemo(
    () => ({
      age,
      coverIndex,
      adults,
      children,
    }),
    [age, coverIndex, adults, children],
  );

  const result = useMemo(() => computePrice('c1', c1Params), [c1Params]);

  const premiumText = '₹ ' + result.monthly.toLocaleString('en-IN');
  const animatedPremium = useAnimatedAmount(premiumText);

  const plansUrlState = {
    ...healthState,
    age,
    adults,
    children,
    coverIndex,
  };
  const plansUrl = buildPlansUrl('c1', plansUrlState, c5State, c6State, isTermFigma);

  const perDayText = result.daily
    ? 'About ₹' + result.daily + '/day (indicative).'
    : '';

  const bulletCover = healthHospitalisationBullet(coverIndex);

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

  const outerClass =
    mode === 'tab'
      ? `calculator-section health-calculator--seo ${active ? 'active' : ''}`
      : 'health-calculator--seo';
  const Outer = mode === 'tab' ? 'section' : 'div';

  return (
    <Outer id="calc1" className={outerClass}>
      <div className="calculator-wrapper">
        <div className="calculator-container">
          <div className="input-panel">
            <div className="calculator-intro health-intro">
              <h1 className="calculator-title health-figma-title">
                What could health cover
                <br />
                cost?
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
              <label className="option-label">Who’s on the plan?</label>
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
          </div>

          <div className="results-panel health-results-panel">
            <div className="results-content health-results-inner">
              <div className="health-live-panel">
                <div className="health-result-top">
                  <p className="health-starting">Starting from</p>
                  <p className="health-price-line">
                    <span>{animatedPremium}</span>
                    <span className="health-price-suffix">/month</span>
                  </p>
                  <div className="health-perday-pill">
                    <p className="health-perday">{perDayText}</p>
                  </div>
                </div>
                <div className="health-different-card">
                  <h3 className="health-different-title">What makes us different</h3>
                  <ul className="health-different-list">
                    <li>
                      <img src={starIcon} alt="" width="18" height="18" className="health-star" />
                      <span>{bulletCover}</span>
                    </li>
                    <li>
                      <img src={starIcon} alt="" width="18" height="18" className="health-star" />
                      <span>14,000+ network hospitals for cashless care</span>
                    </li>
                  </ul>
                  <a className="health-plans-btn" href={plansUrl} target="_blank" rel="noopener noreferrer">
                    <span className="health-plans-btn-label">See plans</span>
                    <span className="health-plans-btn-icon" aria-hidden="true">
                      <img src={arrowRightIcon} alt="" width="24" height="24" />
                    </span>
                  </a>
                </div>
                <p className="health-result-arn">ARN: {COMPLIANCE_ARN_HEALTH}</p>
                <p className="health-plans-footnote">{DISCLAIMER_HEALTH}</p>
              </div>
            </div>
          </div>

          <a
            className="cta-button calc-sticky-plans health-sticky-plans"
            href={plansUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            See plans
          </a>
        </div>
      </div>
    </Outer>
  );
}
