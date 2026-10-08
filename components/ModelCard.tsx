import React from 'react';
import { Model } from '@/types/model';

interface ModelCardProps {
  model: Model;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  return (
    <a
      href={model.destinationUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-gray-900 border border-gray-800/80 rounded-xl overflow-hidden hover:border-rose-500/40 transition-all duration-300 flex flex-col shadow-lg hover:shadow-rose-500/10"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-950">
        <img
          src={model.thumbnail}
          alt={model.displayName}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-60"></div>
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {model.isLive ? (
            <span className="bg-rose-600/95 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              LIVE
            </span>
          ) : (
            <span className="bg-gray-800/90 backdrop-blur-md text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-md">
              OFFLINE
            </span>
          )}
        </div>
        {model.isLive && model.viewerCount && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-gray-200 text-xs font-medium px-2 py-1 rounded-md">
            👥 {model.viewerCount.toLocaleString()}
          </div>
        )}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
          <div className="w-full bg-rose-600 hover:bg-rose-500 text-white text-center font-bold text-sm py-2.5 rounded-lg shadow-lg">
            {model.isLive ? 'Watch Live ➔' : 'View Profile'}
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between bg-gray-900">
        <div>
          <div className="flex justify-between items-baseline">
            <h4 className="font-bold text-white text-base group-hover:text-rose-400 transition-colors truncate">
              {model.displayName}
            </h4>
            {model.age && (
              <span className="text-sm font-semibold text-rose-400 ml-2">
                {model.age} yrs
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <span>📍</span> {model.country || 'International'}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-800/60">
          {model.categories.map((cat) => (
            <span
              key={cat}
              className="text-[10px] uppercase tracking-wider bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-medium"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
};
