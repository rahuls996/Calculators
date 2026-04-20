import { StrictMode, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import HealthCalculator from '@/components/calculators/HealthCalculator';

import '../fonts.css';
import '../styles.css';
import './styles/seo.css';

const initialHlv = {
  age: 30,
  income: 10,
  retireAge: 60,
  savings: 0,
  loans: 0,
  existingCover: 0,
};
const initialTerm = { age: 30, coverIndex: 0, term: 60 };

function HealthEmbedApp() {
  const [healthState, setHealthState] = useState({
    age: 35,
    coverIndex: 0,
    adults: 1,
    children: 1,
  });
  const onHealthChange = useCallback((partial) => {
    setHealthState((s) => ({ ...s, ...partial }));
  }, []);

  return (
    <HealthCalculator
      mode="embed"
      healthState={healthState}
      onHealthChange={onHealthChange}
      c5State={initialHlv}
      c6State={initialTerm}
      isTermFigma
    />
  );
}

const el = document.getElementById('health-calculator-root');
if (el) {
  createRoot(el).render(
    <StrictMode>
      <HealthEmbedApp />
    </StrictMode>,
  );
}
