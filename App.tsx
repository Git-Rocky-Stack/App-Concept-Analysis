import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { generateViralIdeas, analyzeAppIdea } from './services/geminiService';
import { AppIdea, AppCategory, DeepDiveAnalysis } from './types';
import { IdeaCard } from './components/IdeaCard';
import { AnalysisView } from './components/AnalysisView';
import { ComparisonModal } from './components/ComparisonModal';
import { Rocket, Sparkles, RefreshCw, BarChart3, Info, Heart, Bookmark, Filter, ArrowUpDown, Scale, X, Activity } from 'lucide-react';

const CATEGORIES = [
  "All",
  AppCategory.HyperCasualGame,
  AppCategory.SocialUtility,
  AppCategory.AIProductivity,
  AppCategory.HealthWellness,
  AppCategory.Entertainment
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<AppIdea | null>(null);
  const [analysis, setAnalysis] = useState<DeepDiveAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // New state for Saved Ideas
  const [savedIdeas, setSavedIdeas] = useState<AppIdea[]>(() => {
    try {
      const saved = localStorage.getItem('savedIdeas');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load saved ideas", e);
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState<'generated' | 'saved'>('generated');
  
  // Sorting and Filtering State
  const [sortOption, setSortOption] = useState<string>("virality-desc");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  // Comparison State
  const [comparisonQueue, setComparisonQueue] = useState<AppIdea[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Persist saved ideas
  useEffect(() => {
    localStorage.setItem('savedIdeas', JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  const toggleSaveIdea = useCallback((idea: AppIdea) => {
    setSavedIdeas(prev => {
      const exists = prev.find(i => i.id === idea.id);
      if (exists) {
        return prev.filter(i => i.id !== idea.id);
      } else {
        return [...prev, idea];
      }
    });
  }, []);

  const toggleComparison = useCallback((idea: AppIdea) => {
    setComparisonQueue(prev => {
        const exists = prev.find(i => i.id === idea.id);
        if (exists) {
            return prev.filter(i => i.id !== idea.id);
        } else {
            if (prev.length >= 3) return prev; // Limit to 3
            return [...prev, idea];
        }
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonQueue([]);
  }, []);

  const handleGenerateIdeas = useCallback(async () => {
    setLoadingIdeas(true);
    setIdeas([]);
    setSelectedIdea(null);
    setAnalysis(null);
    setActiveTab('generated'); // Switch back to generated view
    setFilterCategory("All"); // Reset local filter when generating new batch
    setSortOption("virality-desc"); // Reset sort

    const generatedIdeas = await generateViralIdeas(selectedCategory as AppCategory | "All");
    setIdeas(generatedIdeas);
    setLoadingIdeas(false);
  }, [selectedCategory]);

  const handleAnalyze = useCallback(async (idea: AppIdea) => {
    if (selectedIdea?.id === idea.id) return;
    
    setSelectedIdea(idea);
    setLoadingAnalysis(true);
    setAnalysis(null);
    
    // Smooth scroll to analysis section on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    const result = await analyzeAppIdea(idea);
    setAnalysis(result);
    setLoadingAnalysis(false);
  }, [selectedIdea]);

  // Derived state for sorting and filtering
  const processedIdeas = useMemo(() => {
    let currentList = activeTab === 'generated' ? ideas : savedIdeas;

    // Filter
    if (filterCategory !== "All") {
      currentList = currentList.filter(idea => idea.category === filterCategory);
    }

    // Sort
    return [...currentList].sort((a, b) => {
      switch (sortOption) {
        case "virality-desc": return b.viralityScore - a.viralityScore;
        case "virality-asc": return a.viralityScore - b.viralityScore;
        case "revenue-desc": return b.adRevenuePotential - a.adRevenuePotential;
        case "revenue-asc": return a.adRevenuePotential - b.adRevenuePotential;
        default: return 0;
      }
    });
  }, [ideas, savedIdeas, activeTab, filterCategory, sortOption]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-900 selection:text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 relative flex items-center justify-between">
          
          {/* Left Spacer */}
          <div className="flex-1 flex items-center justify-start">
            {/* Empty for balance, or move other controls here if needed */}
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
             <img 
                src="./stx_logo.png" 
                alt="STX 1 System Monitor" 
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
             />
          </div>

          {/* Right Actions */}
          <div className="flex-1 flex items-center justify-end gap-6 text-sm">
             <span className="hidden sm:inline text-neutral-500 font-mono text-xs tracking-wider">GEN 2.5 ENABLED</span>
             <div className="w-px h-4 bg-neutral-800 hidden sm:block"></div>
             <a href="#" className="text-neutral-400 hover:text-red-500 transition-colors uppercase text-xs font-bold tracking-wider">Docs</a>
          </div>
        </div>
        
        {/* Chrome Divider - Toolbar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-black via-neutral-400 to-black shadow-[0_1px_5px_rgba(255,255,255,0.2)]"></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
        
        {/* Hero / Controls */}
        <section className="mb-14 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 uppercase tracking-tight">
            App Concept <span className="text-red-600">Analytics</span>
          </h2>
          <p className="text-neutral-400 text-lg mb-10 font-light max-w-2xl mx-auto">
            Strategic excellence engineered. Generate high-potential app concepts optimized for viral growth.
          </p>

          {/* Chrome Divider - Hero Area */}
          <div className="w-full max-w-2xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-neutral-500 to-transparent mb-12 opacity-60"></div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                  selectedCategory === cat 
                    ? 'bg-red-900/80 text-white border-neutral-300 shadow-[0_0_15px_rgba(220,38,38,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]' 
                    : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-400 hover:text-white hover:shadow-[0_0_8px_rgba(255,255,255,0.1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerateIdeas}
              disabled={loadingIdeas}
              className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-b from-red-700 to-red-900 rounded-xl focus:outline-none hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-neutral-400/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] uppercase tracking-widest text-sm"
            >
              {loadingIdeas ? (
                <RefreshCw className="animate-spin mr-3" size={18} />
              ) : (
                <Activity className="mr-3" size={18} />
              )}
              {loadingIdeas ? 'Analyzing...' : 'Generate Analysis'}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Ideas List */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tabs */}
            <div className="flex items-center gap-6 mb-4 border-b border-neutral-800 pb-1">
                <button
                    onClick={() => setActiveTab('generated')}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
                        activeTab === 'generated'
                        ? 'border-red-600 text-white'
                        : 'border-transparent text-neutral-500 hover:text-neutral-300'
                    }`}
                >
                    <BarChart3 size={16} />
                    Live Data
                    {ideas.length > 0 && <span className="bg-neutral-800 text-white text-[10px] px-1.5 py-0.5 rounded ml-1">{ideas.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
                        activeTab === 'saved'
                        ? 'border-red-600 text-white'
                        : 'border-transparent text-neutral-500 hover:text-neutral-300'
                    }`}
                >
                    <Bookmark size={16} />
                    Saved
                    <span className="bg-neutral-800 text-white text-[10px] px-1.5 py-0.5 rounded ml-1">{savedIdeas.length}</span>
                </button>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap gap-2 mb-6 bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              <div className="relative flex-1 min-w-[140px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={14} />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-black text-neutral-300 text-xs font-medium uppercase rounded-lg focus:ring-0 focus:border-neutral-400 block w-full pl-9 p-2.5 appearance-none cursor-pointer border border-neutral-700 hover:border-neutral-400 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 min-w-[160px]">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={14} />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-black text-neutral-300 text-xs font-medium uppercase rounded-lg focus:ring-0 focus:border-neutral-400 block w-full pl-9 p-2.5 appearance-none cursor-pointer border border-neutral-700 hover:border-neutral-400 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  <option value="virality-desc">Virality: High to Low</option>
                  <option value="virality-asc">Virality: Low to High</option>
                  <option value="revenue-desc">Ad Revenue: High to Low</option>
                  <option value="revenue-asc">Ad Revenue: Low to High</option>
                </select>
              </div>
            </div>

            {/* Empty States */}
            {activeTab === 'generated' && ideas.length === 0 && !loadingIdeas && (
              <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/50">
                <div className="bg-neutral-800 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 border border-neutral-700">
                  <Info className="text-neutral-500" size={24} />
                </div>
                <p className="text-white font-bold uppercase tracking-wide">No Data Generated</p>
                <p className="text-neutral-500 text-xs mt-2">Initialize system generation above.</p>
              </div>
            )}

            {activeTab === 'saved' && savedIdeas.length === 0 && (
                <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/50">
                  <div className="bg-neutral-800 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 border border-neutral-700">
                    <Heart className="text-neutral-500" size={24} />
                  </div>
                  <p className="text-white font-bold uppercase tracking-wide">No Saved Concepts</p>
                  <p className="text-neutral-500 text-xs mt-2">Mark items for quick access.</p>
                </div>
            )}
            
            {/* Filtered Empty State */}
            {((activeTab === 'generated' && ideas.length > 0) || (activeTab === 'saved' && savedIdeas.length > 0)) && processedIdeas.length === 0 && (
              <div className="text-center py-10 rounded-xl bg-neutral-900 border border-neutral-800">
                <p className="text-neutral-400 text-xs uppercase tracking-wide">Filter returns no results.</p>
                <button 
                  onClick={() => setFilterCategory("All")}
                  className="mt-3 text-red-500 text-xs font-bold uppercase hover:text-red-400"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Loading State */}
            {activeTab === 'generated' && loadingIdeas && (
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="h-48 rounded-xl bg-neutral-900 animate-pulse border border-neutral-800"></div>
                 ))}
               </div>
            )}

            {/* List */}
            <div className="space-y-4">
              {processedIdeas.map((idea) => (
                <IdeaCard 
                  key={idea.id} 
                  idea={idea} 
                  onAnalyze={handleAnalyze} 
                  isSelected={selectedIdea?.id === idea.id}
                  isSaved={savedIdeas.some(saved => saved.id === idea.id)}
                  onToggleSave={toggleSaveIdea}
                  isCompareSelected={comparisonQueue.some(i => i.id === idea.id)}
                  onToggleCompare={toggleComparison}
                  disableCompareSelect={comparisonQueue.length >= 3 && !comparisonQueue.some(i => i.id === idea.id)}
                />
              ))}
            </div>
          </div>

          {/* Analysis View */}
          <div className="lg:col-span-7" id="analysis-section">
            <div className="sticky top-24">
              {selectedIdea ? (
                <div className="bg-black rounded-2xl border border-neutral-800 p-1 sm:p-6 shadow-2xl relative overflow-hidden">
                   {/* Background Gradient Mesh */}
                   <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-900/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                  <div className="mb-8 flex items-start justify-between px-2 border-b border-neutral-800 pb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">{selectedIdea.title}</h2>
                      <span className="text-neutral-400 text-sm font-mono">{selectedIdea.tagline}</span>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Revenue Model</div>
                        <div className="text-yellow-500 font-bold uppercase text-sm tracking-wider">{selectedIdea.monetizationStrategy}</div>
                    </div>
                  </div>
                  <AnalysisView 
                    idea={selectedIdea} 
                    analysis={analysis} 
                    loading={loadingAnalysis} 
                  />
                </div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-800 rounded-3xl bg-neutral-900/30">
                  <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
                    <BarChart3 className="text-neutral-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Awaiting Selection</h3>
                  <p className="text-neutral-500 max-w-sm text-sm">
                    Select a data point from the registry to initialize detailed diagnostic analysis.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Floating Comparison Bar */}
        {comparisonQueue.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-neutral-900 border-2 border-neutral-400/50 text-white px-6 py-3 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center gap-6 animate-in slide-in-from-bottom-6 duration-300">
                <div className="flex items-center gap-3">
                    <div className="bg-red-700 rounded-md w-6 h-6 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                        {comparisonQueue.length}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide text-neutral-300">Analysis Queue</span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowComparisonModal(true)}
                        className="bg-white text-black hover:bg-neutral-200 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-neutral-400 shadow-[0_2px_5px_rgba(0,0,0,0.2)]"
                    >
                        Compare
                    </button>
                    <button 
                        onClick={clearComparison}
                        className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-colors border border-transparent hover:border-neutral-600"
                        title="Clear selection"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        )}

        {/* Comparison Modal */}
        {showComparisonModal && (
            <ComparisonModal 
                ideas={comparisonQueue} 
                onClose={() => setShowComparisonModal(false)} 
            />
        )}

      </main>
    </div>
  );
}