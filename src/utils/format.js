export function formatINR(amount) {
  const rounded = Math.round(amount / 100) * 100;
  return '₹ ' + rounded.toLocaleString('en-IN');
}

export function formatLakhsWithRupee(val) {
  if (val >= 100) {
    const cr = val / 100;
    const t = Number.isInteger(cr) ? String(cr) : String(Math.round(cr * 10) / 10);
    return '₹' + t + ' Cr';
  }
  if (val === 0) return '₹0';
  return '₹' + val + ' L';
}

/** Absolute rupees → compact hero (e.g. ₹ 1 Cr) for HLV result line */
export function formatCoverHeroINR(rupees) {
  const r = Math.round(Number(rupees) || 0);
  if (r >= 10000000) {
    const cr = r / 10000000;
    const t = Number.isInteger(cr) ? String(cr) : String(Math.round(cr * 10) / 10);
    return '₹ ' + t + ' Cr';
  }
  if (r >= 100000) {
    const L = r / 100000;
    const t = Number.isInteger(L) ? String(L) : String(Math.round(L * 10) / 10);
    return '₹ ' + t + ' L';
  }
  if (r <= 0) return '₹ 0';
  return '₹ ' + r.toLocaleString('en-IN');
}

export function healthHospitalisationBullet(coverIndex) {
  const steps = [10, 25, 50, 100];
  const v = steps[Math.min(coverIndex | 0, steps.length - 1)];
  if (v >= 100) return '₹1Cr hospitalisation cover';
  return '₹' + v + 'L hospitalisation cover';
}
