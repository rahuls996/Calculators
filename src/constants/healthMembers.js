/** Allowed health floater pairs only: 1A, 2A, 1A1C, 2A1C, 2A2C, 1A2C. */
export const C1_VALID_MEMBER_KEYS = new Set(['1-0', '2-0', '1-1', '2-1', '2-2', '1-2']);

export function c1MemberPairIsValid(adults, children) {
  if (adults < 0 || children < 0) return false;
  return C1_VALID_MEMBER_KEYS.has(adults + '-' + children);
}

