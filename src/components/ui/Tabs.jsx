import { useState } from 'react';

export default function Tabs({ tabs, defaultTab }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);

  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div>
      <div className="border-b border-gray-200 mb-5">
        <nav className="flex gap-6 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                active === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div>{activeTab?.content}</div>
    </div>
  );
}
