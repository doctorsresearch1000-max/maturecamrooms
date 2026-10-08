'use client';
import React from 'react';
import { CategoryFilter } from '@/types/model';

interface FilterBarProps {
  currentFilter: CategoryFilter;
  onSelectFilter: (filter: CategoryFilter) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ currentFilter, onSelectFilter }) => {
  const filters: { id: CategoryFilter; label: string }[] = [
    { id: 'live', label: '🔴 Live Now' },
    { id: 'all', label: 'All Models' },
    { id: 'mature', label: 'Mature' },
    { id: 'milf', label: 'MILF' },
    { id: 'popular', label: '🔥 Popular' },
    { id: 'new', label: '✨ New' },
  ];

  return (
    <div className="w-full border-b border-gray-800 bg-gray-900/60 backdrop-blur sticky top-[65px] z-40 py-3 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 min-w-max">
        {filters.map((f) => {
          const isActive = currentFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
