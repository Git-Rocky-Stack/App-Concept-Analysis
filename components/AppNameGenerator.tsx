import React from 'react';
import { AppIdea, GeneratedAppNames } from '../types';
import { Sparkles, Check, X, Copy, RefreshCw, Loader2 } from 'lucide-react';

interface AppNameGeneratorProps {
  idea: AppIdea;
  names: GeneratedAppNames | null;
  loading: boolean;
  onGenerate: () => void;
}

export const AppNameGenerator: React.FC<AppNameGeneratorProps> = ({ idea, names, loading, onGenerate }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (name: string, index: number) => {
    navigator.clipboard.writeText(name);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getStyleColor = (style: string) => {
    switch (style.toLowerCase()) {
      case 'playful': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400';
      case 'professional': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'techy': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'minimalist': return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400';
      case 'creative': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      default: return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center animate-pulse">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wide">Generating Names...</h3>
        <p className="text-neutral-500 text-sm">AI is brainstorming creative names for your app</p>
      </div>
    );
  }

  if (!names) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wide">App Name Generator</h3>
        <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
          Generate 10 creative app names in different styles: Playful, Professional, Techy, Minimalist, and Creative.
        </p>
        <button
          onClick={onGenerate}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
        >
          <Sparkles size={16} />
          Generate Names
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white uppercase tracking-wide">Generated Names</h3>
            <p className="text-neutral-500 text-xs">For: {idea.title}</p>
          </div>
        </div>
        <button
          onClick={onGenerate}
          className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          title="Regenerate names"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {names.names.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-red-500 dark:hover:border-red-500 transition-colors group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.available ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                {item.available ? (
                  <Check size={14} className="text-green-600 dark:text-green-400" />
                ) : (
                  <X size={14} className="text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-neutral-900 dark:text-white truncate">{item.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStyleColor(item.style)}`}>
                  {item.style}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleCopy(item.name, index)}
              className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all"
              title="Copy name"
            >
              {copiedIndex === index ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <Check size={12} className="text-green-500" />
          <span>Likely available</span>
        </div>
        <div className="flex items-center gap-1">
          <X size={12} className="text-red-500" />
          <span>May be taken</span>
        </div>
      </div>
    </div>
  );
};
