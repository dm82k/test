import React from 'react';

const TabNavigation = ({ activeTab, onTabChange, addressCount }) => {
  const tabs = [
    {
      id: 'addresses',
      label: 'Direcciones',
      icon: '🏠',
      count: addressCount,
    },
    {
      id: 'statistics',
      label: 'Estadísticas',
      icon: '📊',
    },
  ];

  return (
    <div className="tab-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
          {tab.count !== undefined && (
            <span className="tab-count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
