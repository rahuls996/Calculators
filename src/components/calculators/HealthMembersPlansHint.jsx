import {
  HEALTH_MEMBERS_PLANS_HINT_AFTER_RESULT,
  HEALTH_MEMBERS_PLANS_HINT_BEFORE_RESULT,
} from '@/constants/calculatorCopy';

/** Health calculator only — member combinations are limited in-widget. */
export function HealthMembersPlansHint({ resultShown = false }) {
  return (
    <p className="health-members-plans-hint" role="note">
      {resultShown ? HEALTH_MEMBERS_PLANS_HINT_AFTER_RESULT : HEALTH_MEMBERS_PLANS_HINT_BEFORE_RESULT}
    </p>
  );
}
