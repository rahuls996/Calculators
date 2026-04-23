/**
 * Marketing / product copy shared across SEO calculator widgets.
 * Update here when legal, product, or UX changes bullet or CTA wording.
 */

export const WHAT_MAKES_US_DIFFERENT_TITLE = 'What makes us different';

export const SEE_PLANS_CTA_LABEL = 'See plans';

/** Right-rail empty state (before first result) — all calculators */
export const EMPTY_RESULTS_TITLE = 'Get your premium estimate';

/**
 * Health only: member steppers allow a fixed set of adult/child pairs; full family setup on plans page.
 * Before the first quote there is no “See plans” CTA in the right column, so the initial line avoids that label.
 */
export const HEALTH_MEMBERS_PLANS_HINT_BEFORE_RESULT =
  'This quick estimate uses a few standard member options. After you see your estimate, you can customise members and cover on the plans page.';

/** Shown once a result exists, when the “See plans” CTA is visible below the price. */
export const HEALTH_MEMBERS_PLANS_HINT_AFTER_RESULT =
  'This quick estimate uses a few standard member options. If you need something different, continue to See plans to customise your quote.';

/** Stale state — Figma 3849:5610; form Recalculate is the CTA. */
export const STALE_CALLOUT_TITLE = 'Your inputs changed';
export const STALE_CALLOUT_BODY = 'Press Recalculate to see the new price.';

/** Health insurance — results “differentiators” list */
export const HEALTH_DIFFERENTIATOR_POINTS = Object.freeze([
  'Zero waiting period',
  '11,500+ cashless hospitals',
]);

/** Term + HLV (life) — same two bullets in Figma-aligned cards */
export const LIFE_PRODUCT_DIFFERENTIATOR_POINTS = Object.freeze([
  'Coverage from ₹25L to ₹100Cr',
  'Pay less with zero commission',
]);
