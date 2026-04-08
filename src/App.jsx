import { useState, useCallback } from 'react';
import TabNav from './components/TabNav';
import HealthCalculator from './components/HealthCalculator';
import HlvCalculator from './components/HlvCalculator';
import TermCalculator from './components/TermCalculator';

const initialHealth = { age: 35, coverIndex: 0, adults: 1, children: 1 };
const initialHlv = {
  age: 30,
  income: 10,
  retireAge: 60,
  savings: 0,
  loans: 0,
  existingCover: 0,
};
const initialTerm = { age: 30, coverIndex: 0, term: 60, income: 50 };

export default function App() {
  const [activeTab, setActiveTab] = useState('calc1');
  const [healthState, setHealthState] = useState(initialHealth);
  const [hlvState, setHlvState] = useState(initialHlv);
  const [termState, setTermState] = useState(initialTerm);

  const onHealthChange = useCallback((partial) => {
    setHealthState((s) => ({ ...s, ...partial }));
  }, []);

  const onHlvChange = useCallback((partial) => {
    setHlvState((s) => ({ ...s, ...partial }));
  }, []);

  const onTermChange = useCallback((s) => {
    setTermState(s);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const isTermFigma = true;

  return (
    <div className="tab-container">
      <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="tab-content">
        <HealthCalculator
          mode="tab"
          active={activeTab === 'calc1'}
          healthState={healthState}
          onHealthChange={onHealthChange}
          c5State={hlvState}
          c6State={termState}
          isTermFigma={isTermFigma}
        />
        <HlvCalculator
          active={activeTab === 'calc5'}
          hlvState={hlvState}
          onHlvChange={onHlvChange}
          healthState={healthState}
          c6State={termState}
          isTermFigma={isTermFigma}
        />
        <TermCalculator
          active={activeTab === 'calc6'}
          termState={termState}
          onTermChange={onTermChange}
          healthState={healthState}
          hlvState={hlvState}
        />
      </div>
    </div>
  );
}
