import React from 'react';
import { Model } from '../types/model';

interface ModelCardProps {
  model: Model;
}

export default function ModelCard({ model }: ModelCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-rose-500 transition-all duration-300 group shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-950">
        <img
          src={model.thumbnailUrl}
          alt={model.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {model.isOnline && (
            <span className="bg-emerald-500 text-gray-950 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
              <span className="w-2 h-2 rounded-full bg-gray-950 animate-pulse"></span>
              LIVE
            </span>
          )}
          {model.isHD && (
            <span className="bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded-md uppercase">
              HD
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md font-medium">
          👀 {model.viewers.toLocaleString()}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-lg text-white group-hover:text-rose-400 transition-colors">
            {model.name} <span className="text-gray-400 font-normal text-sm">({model.age})</span>
          </h3>
          <span className="text-amber-400 text-sm font-semibold flex items-center gap-1">
            ★ {model.rating}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {model.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-800 text-gray-300 text-xs px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
