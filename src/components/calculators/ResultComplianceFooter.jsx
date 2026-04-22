import {
  COMPLIANCE_ARN_TERM,
  COMPLIANCE_UID_HEALTH,
  DISCLAIMER_HEALTH,
  DISCLAIMER_HLV,
  DISCLAIMER_TERM,
} from '@/constants/compliance';

/**
 * Compliance line (UID / ARN) + legal disclaimer under calculator results.
 */
export function ResultComplianceFooter({ variant }) {
  if (variant === 'health') {
    return (
      <div className="health-compliance-block">
        <p className="health-result-arn">
          {`UID: ${COMPLIANCE_UID_HEALTH} | T&C apply`}
        </p>
        <p className="health-plans-footnote">{DISCLAIMER_HEALTH}</p>
      </div>
    );
  }
  if (variant === 'term') {
    return (
      <div className="term-compliance-block">
        <p className="term-result-arn">
          {`ARN: ${COMPLIANCE_ARN_TERM} | T&C apply`}
        </p>
        <p className="term-figma-footer-note">{DISCLAIMER_TERM}</p>
      </div>
    );
  }
  if (variant === 'hlv') {
    return (
      <p className="term-figma-footer-note hlv-footer-note">{DISCLAIMER_HLV}</p>
    );
  }
  return null;
}
