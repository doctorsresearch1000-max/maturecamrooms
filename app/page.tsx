'use client';

import React, { useState } from "react";
import { MOCK_MODELS } from "@/lib/mockModels";
import ModelCard from "@/components/ModelCard";
import FilterBar from "@/components/FilterBar";

export default function Home() {
  const [selectedTag, setSelectedTag] = useState("All");

  const filteredModels = MOCK_MODELS.filter((model) => {
    if (selectedTag === "All") return true;
    return model.tags.includes(selectedTag);
  });

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-900 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-rose-500 tracking-wider">MATURECAMROOMS</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-full font-semibold animate-pulse">
              ● LIVE NOW
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2">Live Mature & Milf Cams</h1>
          <p className="text-gray-400">Discover top-rated live adult performers in high definition.</p>
        </div>

        <FilterBar selectedTag={selectedTag} onSelectTag={setSelectedTag} />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </div>
    </main>
  );
}
