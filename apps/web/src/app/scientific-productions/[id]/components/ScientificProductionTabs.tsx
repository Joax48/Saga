'use client';

import { useState, useEffect, ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface ScientificProductionTabsProps {
  tabs: TabItem[];
  defaultActive?: string;
  onChange: (id: string) => void;
}

export function ScientificProductionTabs({
  tabs,
  defaultActive,
  onChange,
}: ScientificProductionTabsProps) {
  const [active, setActive] = useState(defaultActive ?? tabs[0]?.id);

  useEffect(() => {
    const initial = defaultActive ?? tabs[0]?.id;
    setActive(initial);
    if (initial) onChange(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick(id: string) {
    setActive(id);
    onChange(id);
  }

  return (
    /* No background here — comes from the parent section */
    <nav className="flex w-full h-14 ">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => handleClick(tab.id)}
            className={[
              'flex-1 h-full relative flex items-center justify-center',
              'text-[18px] font-normal transition-colors cursor-pointer',
              'border-b-400',
              isActive
                ? 'border-(--color-text-brand-primary)'
                : 'border-transparent hover:border-gray-300',
            ].join(' ')}
            style={{ color: '#0F0F0F' }}
          >
            {tab.icon && (
              <span
                className="absolute left-4 flex items-center"
                style={{
                  color: isActive ? 'var(--color-text-brand-primary)' : '#9CA3AF',
                }}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
