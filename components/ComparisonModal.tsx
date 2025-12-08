import React from 'react';
import { AppIdea } from '../types';
import { X, TrendingUp, DollarSign, Users, Target } from 'lucide-react';

interface ComparisonModalProps {
  ideas: AppIdea[];
  onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ ideas, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-black">
          <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">System Comparison</h2>
            <p className="text-neutral-500 text-xs font-mono uppercase mt-1">Side-by-side diagnostic metrics</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 bg-black h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
            {ideas.map((idea) => (
              <div key={idea.id} className="flex flex-col h-full gap-6 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 relative">
                
                {/* Decorative top accent */}
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>

                {/* Header */}
                <div className="border-b border-neutral-800 pb-5">
                  <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded bg-neutral-800 text-neutral-300 border border-neutral-700 mb-3">
                    {idea.category}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight uppercase tracking-wide">{idea.title}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">{idea.description}</p>
                </div>

                {/* Metrics */}
                <div className="space-y-6">
                  
                  {/* Virality */}
                  <div>
                    <div className="flex justify-between text-xs uppercase tracking-wide mb-2">
                      <span className="text-neutral-500 font-bold flex items-center gap-1"><TrendingUp size={12}/> Virality Score</span>
                      <span className="text-yellow-500 font-mono font-bold">{idea.viralityScore}</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-yellow-500 h-full rounded-full" 
                        style={{ width: `${idea.viralityScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Ad Revenue */}
                  <div>
                    <div className="flex justify-between text-xs uppercase tracking-wide mb-2">
                      <span className="text-neutral-500 font-bold flex items-center gap-1"><DollarSign size={12}/> Revenue Pot.</span>
                      <span className="text-white font-mono font-bold">{idea.adRevenuePotential}</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-600 h-full rounded-full" 
                        style={{ width: `${idea.adRevenuePotential}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Users */}
                  <div className="bg-black p-4 rounded-xl border border-neutral-800">
                    <div className="text-[10px] uppercase text-neutral-500 font-bold mb-1 flex items-center gap-1"><Users size={12}/> Est. Users (Yr 1)</div>
                    <div className="text-2xl font-bold text-yellow-500 font-mono">{(idea.estimatedYearOneUsers / 1000000).toFixed(1)}M</div>
                  </div>

                   {/* Strategy */}
                   <div className="bg-black p-4 rounded-xl border border-neutral-800">
                    <div className="text-[10px] uppercase text-neutral-500 font-bold mb-1 flex items-center gap-1"><Target size={12}/> Monetization Strategy</div>
                    <div className="text-xs text-neutral-300 leading-relaxed font-bold uppercase">{idea.monetizationStrategy}</div>
                  </div>

                  {/* Viral Mechanic */}
                  <div className="bg-red-900/10 p-4 rounded-xl border border-red-900/30">
                     <div className="text-[10px] text-red-400 mb-1 uppercase tracking-widest font-bold">Viral Hook</div>
                     <p className="text-xs text-neutral-300">{idea.viralMechanic}</p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};