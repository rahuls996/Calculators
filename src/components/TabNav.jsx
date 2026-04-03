const TABS = [
  { id: 'calc1', label: 'Health Premium', icon: 'star' },
  { id: 'calc5', label: 'HLV', icon: 'drop' },
  { id: 'calc6', label: 'Term Insurance', icon: 'shield' },
];

function TabIcon({ name }) {
  if (name === 'star') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 1.5L11.3 6.2L16.5 6.9L12.8 10.5L13.6 15.7L9 13.3L4.4 15.7L5.2 10.5L1.5 6.9L6.7 6.2L9 1.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === 'drop') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 2.25C9 2.25 4.5 5.25 4.5 9.75C4.5 12.2625 6.5025 14.25 9 14.25C11.4975 14.25 13.5 12.2625 13.5 9.75C13.5 5.25 9 2.25 9 2.25Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 14.25V16.5M6.75 16.5H11.25"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 1.5L2.25 5.25V12.75L9 16.5L15.75 12.75V5.25L9 1.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.25V16.5M2.25 5.25L9 8.25M9 8.25L15.75 5.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="tab-nav">
      <div className="tab-nav-inner">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            data-tab={tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            <TabIcon name={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
