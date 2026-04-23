import { STALE_CALLOUT_BODY, STALE_CALLOUT_TITLE } from '@/constants/calculatorCopy';
import { publicAsset } from '@/utils/publicAsset';

/** `Frame 2085662091.svg` — 60×70 glass disc + purple refresh (replaces prior coral export) */
const STALE_INPUTS_ILLU_SRC = publicAsset('icons/stale-inputs-changed-illu.svg');

/**
 * Figma 3849:5610 — centered illustration + copy; parent results panel provides border + mint gradient.
 */
export function StaleResultCallout({ idPrefix = 'stale' }) {
  const titleId = `${idPrefix}-callout-title`;
  const bodyId = `${idPrefix}-callout-body`;
  return (
    <div
      className="stale-result-callout"
      role="status"
      aria-live="polite"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
    >
      <div className="stale-result-callout__content">
        <div className="stale-result-callout__illu" aria-hidden="true">
          <img
            className="stale-result-callout__illu-img"
            src={STALE_INPUTS_ILLU_SRC}
            alt=""
            width={60}
            height={70}
            decoding="async"
          />
        </div>
        <h2 className="stale-result-callout__title" id={titleId}>
          {STALE_CALLOUT_TITLE}
        </h2>
        <p className="stale-result-callout__text" id={bodyId}>
          {STALE_CALLOUT_BODY}
        </p>
      </div>
    </div>
  );
}
