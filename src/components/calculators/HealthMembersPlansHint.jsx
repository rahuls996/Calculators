import { HEALTH_MEMBERS_PLANS_HINT } from '@/constants/calculatorCopy';

/** Health calculator only — member combinations are limited in-widget. */
export function HealthMembersPlansHint() {
  return (
    <p className="health-members-plans-hint" role="note">
      {HEALTH_MEMBERS_PLANS_HINT}
    </p>
  );
}
