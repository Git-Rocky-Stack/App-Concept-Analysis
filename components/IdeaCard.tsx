import React from 'react';
import { AppIdea } from '../types';
import { TrendingUp, DollarSign, Users, Heart, Scale, Zap } from 'lucide-react';

interface IdeaCardProps {
  idea: AppIdea;
  onAnalyze: (idea: AppIdea) => void;
  isSelected: boolean;
  isSaved: boolean;
  onToggleSave: (idea: AppIdea) => void;
  isCompareSelected: boolean;
  onToggleCompare: (idea: AppIdea) => void;
  disableCompareSelect: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ 
  idea, 
  onAnalyze, 
  isSelected, 
  isSaved, 
  onToggleSave,
  isCompareSelected,
  onToggleCompare,
  disableCompareSelect
}) => {
  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 group cursor-pointer
        ${isSelected 
          ? 'bg-neutral-900 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
          : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900'}
      `}
      onClick={() => onAnalyze(idea)}
    >
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {/* Compare Button - Chrome Bezel */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(idea);
          }}
          disabled={!isCompareSelected && disableCompareSelect}
          className={`
            p-2 rounded-lg transition-all duration-200 border border-neutral-500/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
            ${isCompareSelected
                ? 'bg-red-700 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)] border-red-500'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white hover:border-neutral-400'
            }
            ${(!isCompareSelected && disableCompareSelect) ? 'opacity-30 cursor-not-allowed' : ''}
          `}
          title={isCompareSelected ? "Remove from comparison" : (disableCompareSelect ? "Max 3 items selected" : "Add to compare")}
        >
            <Scale size={16} />
        </button>

        {/* Save Button - Chrome Bezel */}
        <button
            onClick={(e) => {
            e.stopPropagation();
            onToggleSave(idea);
            }}
            className={`
                p-2 rounded-lg transition-colors border border-neutral-500/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
                ${isSaved 
                    ? 'text-white bg-red-600 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]' 
                    : 'text-neutral-400 bg-neutral-800 hover:bg-neutral-700 hover:text-white hover:border-neutral-400'
                }
            `}
            title={isSaved ? "Remove from favorites" : "Save to favorites"}
        >
            <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex justify-between items-start mb-3 pr-20">
        <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-neutral-800 text-neutral-300 border border-neutral-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {idea.category}
        </span>
        <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold font-mono">
          <TrendingUp size={14} />
          <span>SCORE: {idea.viralityScore}</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 pr-8 uppercase tracking-wide leading-tight">{idea.title}</h3>
      <p className="text-neutral-500 text-xs mb-4 line-clamp-1 font-mono uppercase tracking-tight">{idea.tagline}</p>
      
      <p className="text-neutral-300 text-sm mb-6 leading-relaxed font-light line-clamp-2">
        {idea.description}
      </p>

      <div className="grid grid-cols-2 gap-3 mt-auto mb-5">
        <div className="bg-black p-3 rounded-lg border border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-500 text-[10px] uppercase tracking-wider mb-1 font-bold">
            <Users size={12} />
            <span>Proj. Users</span>
          </div>
          <span className="text-yellow-500 font-mono text-lg font-bold">
            {(idea.estimatedYearOneUsers / 1000000).toFixed(1)}M
          </span>
        </div>
        <div className="bg-black p-3 rounded-lg border border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-500 text-[10px] uppercase tracking-wider mb-1 font-bold">
            <DollarSign size={12} />
            <span>Ad Pot.</span>
          </div>
          <div className="w-full bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-red-600 h-full rounded-full" 
              style={{ width: `${idea.adRevenuePotential}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Analyze Button - Chrome Bezel */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAnalyze(idea);
        }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 active:scale-[0.98] border-2 border-neutral-400/60"
      >
        <Zap size={14} className="fill-white" />
        Analyze Diagnostics
      </button>
    </div>
  );
};