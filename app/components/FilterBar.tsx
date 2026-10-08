import React from 'react';

interface FilterBarProps {
  selectedTag: string;
  onSelectTag: (tag: string) => void;
}

const TAGS = ['All', 'Mature', 'Milf', 'Natural', 'HD', 'Interactive', 'Toys'];

export default function FilterBar({ selectedTag, onSelectTag }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
      {TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelectTag(tag)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selectedTag === tag || (tag === 'All' && !selectedTag)
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
