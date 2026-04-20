import { publicAsset } from '@/utils/publicAsset';
import {
  LIFE_PRODUCT_DIFFERENTIATOR_POINTS,
  HEALTH_DIFFERENTIATOR_POINTS,
  SEE_PLANS_CTA_LABEL,
  WHAT_MAKES_US_DIFFERENT_TITLE,
} from '@/constants/calculatorCopy';

const starSrc = publicAsset('icons/star.svg');
const arrowRightSrc = publicAsset('icons/arrow-right.svg');

const LAYOUT = {
  health: {
    cardClass: (isStale) =>
      `health-different-card${isStale ? ' result-stale' : ''}`,
    titleClass: 'health-different-title',
    listClass: 'health-different-list',
    starClass: 'health-star',
    starSize: 18,
    plansBtnClass: 'health-plans-btn',
    plansLabelClass: 'health-plans-btn-label',
    plansIconClass: 'health-plans-btn-icon',
    points: HEALTH_DIFFERENTIATOR_POINTS,
  },
  term: {
    cardClass: (isStale) =>
      `term-figma-different-card${isStale ? ' result-stale' : ''}`,
    titleClass: 'term-figma-different-title',
    listClass: 'term-figma-different-list',
    starClass: 'term-figma-star',
    starSize: 18,
    plansBtnClass: 'term-figma-plans-btn',
    plansLabelClass: 'term-figma-plans-btn-label',
    plansIconClass: 'term-figma-plans-btn-icon',
    points: LIFE_PRODUCT_DIFFERENTIATOR_POINTS,
  },
  hlv: {
    cardClass: (isStale) =>
      `term-figma-different-card hlv-different-card${isStale ? ' result-stale' : ''}`,
    titleClass: 'term-figma-different-title hlv-different-title',
    listClass: 'term-figma-different-list hlv-different-list',
    starClass: 'term-figma-star',
    starSize: 24,
    plansBtnClass: 'term-figma-plans-btn hlv-plans-btn',
    plansLabelClass: 'term-figma-plans-btn-label',
    plansIconClass: 'term-figma-plans-btn-icon',
    points: LIFE_PRODUCT_DIFFERENTIATOR_POINTS,
  },
};

/**
 * “What makes us different” card + See plans CTA (Health, Term, or HLV styling).
 */
export function DifferentiatorsCard({ variant, plansUrl, isStale }) {
  const layout = LAYOUT[variant];
  if (!layout) return null;

  return (
    <div className={layout.cardClass(!!isStale)}>
      <h3 className={layout.titleClass}>{WHAT_MAKES_US_DIFFERENT_TITLE}</h3>
      <ul className={layout.listClass}>
        {layout.points.map((text) => (
          <li key={text}>
            <img
              src={starSrc}
              alt=""
              width={layout.starSize}
              height={layout.starSize}
              className={layout.starClass}
            />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <a
        className={layout.plansBtnClass}
        href={plansUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className={layout.plansLabelClass}>{SEE_PLANS_CTA_LABEL}</span>
        <span className={layout.plansIconClass} aria-hidden="true">
          <img src={arrowRightSrc} alt="" width="24" height="24" />
        </span>
      </a>
    </div>
  );
}
