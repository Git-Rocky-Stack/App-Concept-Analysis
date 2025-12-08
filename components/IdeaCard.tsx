import React, { useState } from 'react';
import { AppIdea, AppCategory } from '../types';
import { TrendingUp, DollarSign, Users, Heart, Scale, Zap, Share2, Image as ImageIcon, Loader2 } from 'lucide-react';

interface IdeaCardProps {
  idea: AppIdea;
  onAnalyze: (idea: AppIdea) => void;
  isSelected: boolean;
  isSaved: boolean;
  onToggleSave: (idea: AppIdea) => void;
  isCompareSelected: boolean;
  onToggleCompare: (idea: AppIdea) => void;
  disableCompareSelect: boolean;
  onShare: (idea: AppIdea) => void;
  onGenerateImage: (idea: AppIdea) => Promise<void>;
  isGeneratingImage: boolean;
  isAnalyzing: boolean;
}

const getGradient = (category: string, title: string) => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const getHue = (base: number) => (base + (hash % 40)) % 360;

  switch (category) {
    case AppCategory.HyperCasualGame: return `linear-gradient(135deg, hsl(${getHue(260)}, 70%, 20%) 0%, hsl(${getHue(300)}, 70%, 15%) 100%)`; // Purple/Pink
    case AppCategory.SocialUtility: return `linear-gradient(135deg, hsl(${getHue(200)}, 70%, 20%) 0%, hsl(${getHue(240)}, 70%, 15%) 100%)`; // Blue
    case AppCategory.AIProductivity: return `linear-gradient(135deg, hsl(${getHue(160)}, 70%, 20%) 0%, hsl(${getHue(190)}, 70%, 15%) 100%)`; // Teal
    case AppCategory.HealthWellness: return `linear-gradient(135deg, hsl(${getHue(120)}, 60%, 20%) 0%, hsl(${getHue(150)}, 60%, 15%) 100%)`; // Green
    case AppCategory.Entertainment: return `linear-gradient(135deg, hsl(${getHue(10)}, 80%, 20%) 0%, hsl(${getHue(40)}, 80%, 15%) 100%)`; // Orange/Red
    default: return `linear-gradient(135deg, hsl(${getHue(0)}, 0%, 20%) 0%, hsl(${getHue(0)}, 0%, 10%) 100%)`;
  }
};

export const IdeaCard: React.FC<IdeaCardProps> = ({ 
  idea, 
  onAnalyze, 
  isSelected, 
  isSaved, 
  onToggleSave,
  isCompareSelected,
  onToggleCompare,
  disableCompareSelect,
  onShare,
  onGenerateImage,
  isGeneratingImage,
  isAnalyzing
}) => {
  const gradient = getGradient(idea.category, idea.title);

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-300 group cursor-pointer flex flex-col
        hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]
        ${isSelected 
          ? 'bg-white dark:bg-neutral-900 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
          : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900'}
      `}
      onClick={() => !isAnalyzing && onAnalyze(idea)}
    >
      {/* Image Area */}
      <div className="h-44 w-full relative overflow-hidden bg-neutral-900 group/image">
        {idea.imageUrl ? (
          <img src={idea.imageUrl} alt={idea.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center relative"
            style={{ background: gradient }}
          >
             <div className="absolute inset-0 opacity-20" style={{ 
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                backgroundSize: '20px 20px' 
             }}></div>
             <div className="text-white/20 font-black text-6xl uppercase tracking-tighter mix-blend-overlay select-none">
                {idea.title.substring(0, 2)}
             </div>
          </div>
        )}

        {/* Generate Image Button (Overlay) */}
        {!idea.imageUrl && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onGenerateImage(idea);
                }}
                disabled={isGeneratingImage}
                className="absolute inset-0 m-auto w-fit h-fit px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 opacity-0 group-hover/image:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-100 disabled:cursor-wait"
            >
                {isGeneratingImage ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                {isGeneratingImage ? 'Generating...' : 'Generate Concept Art'}
            </button>
        )}
        
        {/* Overlay Gradient for Text Readability at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-60"></div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 z-20">
             {/* Share Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onShare(idea);
                }}
                className="p-1.5 rounded-md bg-black/40 hover:bg-black/70 text-white/70 hover:text-white backdrop-blur-md border border-white/10 transition-all duration-200"
                title="Share"
            >
                <Share2 size={14} />
            </button>

            {/* Compare Button */}
            <button
            onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(idea);
            }}
            disabled={!isCompareSelected && disableCompareSelect}
            className={`
                p-1.5 rounded-md backdrop-blur-md border transition-all duration-200
                ${isCompareSelected
                    ? 'bg-red-600 text-white border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                    : 'bg-black/40 hover:bg-black/70 text-white/70 hover:text-white border-white/10'
                }
                ${(!isCompareSelected && disableCompareSelect) ? 'opacity-30 cursor-not-allowed' : ''}
            `}
            title="Compare"
            >
                <Scale size={14} />
            </button>

            {/* Save Button */}
            <button
                onClick={(e) => {
                e.stopPropagation();
                onToggleSave(idea);
                }}
                className={`
                    p-1.5 rounded-md backdrop-blur-md border transition-all duration-200
                    ${isSaved 
                        ? 'bg-red-600 text-white border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]' 
                        : 'bg-black/40 hover:bg-black/70 text-white/70 hover:text-white border-white/10'
                    }
                `}
                title="Save"
            >
                <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
            </button>
        </div>

        {/* Category Badge - Now over image */}
        <div className="absolute top-3 left-3 z-20">
             <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-black/50 backdrop-blur-md text-white border border-white/10 shadow-sm">
                {idea.category}
            </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white uppercase tracking-wide leading-tight line-clamp-1 flex-1 pr-4">{idea.title}</h3>
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 text-xs font-bold font-mono shrink-0 bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-900/50">
                <TrendingUp size={12} />
                <span>{idea.viralityScore}</span>
            </div>
        </div>

        <p className="text-neutral-500 text-xs mb-4 line-clamp-1 font-mono uppercase tracking-tight">{idea.tagline}</p>
        
        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-6 leading-relaxed font-light line-clamp-3">
            {idea.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-auto mb-5">
            <div className="bg-neutral-50 dark:bg-black p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-500 text-[10px] uppercase tracking-wider mb-1 font-bold">
                <Users size={12} />
                <span>Proj. Users</span>
            </div>
            <span className="text-yellow-600 dark:text-yellow-500 font-mono text-lg font-bold">
                {(idea.estimatedYearOneUsers / 1000000).toFixed(1)}M
            </span>
            </div>
            <div className="bg-neutral-50 dark:bg-black p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-500 text-[10px] uppercase tracking-wider mb-1 font-bold">
                <DollarSign size={12} />
                <span>Ad Pot.</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                className="bg-red-600 h-full rounded-full" 
                style={{ width: `${idea.adRevenuePotential}%` }}
                ></div>
            </div>
            </div>
        </div>

        {/* Quick Analyze Button */}
        <button
            onClick={(e) => {
            e.stopPropagation();
            onAnalyze(idea);
            }}
            disabled={isAnalyzing}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 dark:from-red-800 dark:to-red-600 text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 border-2 border-red-500/50 dark:border-neutral-400/60
            ${isAnalyzing 
                ? 'opacity-80 cursor-wait' 
                : 'hover:from-red-500 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-500 hover:scale-[1.02] shadow-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95'
            }`}
        >
            {isAnalyzing ? (
                <>
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing...
                </>
            ) : (
                <>
                    <Zap size={14} className="fill-white" />
                    Analyze Diagnostics
                </>
            )}
        </button>
      </div>
    </div>
  );
};