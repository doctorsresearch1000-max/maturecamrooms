'use client';
import React, { useState } from 'react';
import { MOCK_MODELS } from '@/lib/mockModels';
import { ModelCard } from '@/components/ModelCard';
import { FilterBar } from '@/components/FilterBar';
import { CategoryFilter } from '@/types/model';
import Link from 'next/link';

export default function Home() {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filteredModels = MOCK_MODELS.filter((model) => {
    if (filter === 'live') return model.isLive;
    if (filter === 'all') return true;
    if (filter === 'popular') return model.categories.includes('popular');
    if (filter === 'new') return model.categories.includes('new');
    return model.categories.includes(filter);
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-rose-500 selection:text-white">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-white">
              MatureCam<span className="text-rose-500">Rooms</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              3,100+ Models Online
            </span>
            <a
              href="https://your-jerkmate-smartlink-here.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-lg shadow-md shadow-rose-600/20 transition-all"
            >
              Join Free ➔
            </a>
          </div>
        </div>
      </header>

      <FilterBar currentFilter={filter} onSelectFilter={setFilter} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold tracking-tight text-gray-200 capitalize flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            {filter === 'all' ? 'Active Broadcasts & Models' : `${filter} Rooms`}
          </h2>
          <span className="text-xs text-gray-400">
            Showing {filteredModels.length} models
          </span>
        </div>

        {filteredModels.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-900/40 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-lg">No models found for this filter.</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-4 text-xs bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              View All Models
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-900 mt-20 py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} MatureCamRooms.com. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/2257" className="hover:text-gray-400 transition-colors">18 U.S.C. 2257</Link>
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
