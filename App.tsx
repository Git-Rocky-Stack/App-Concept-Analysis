import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { generateViralIdeas, analyzeAppIdea, refineUserIdea, generateAppConceptImage, setProgressCallback, preloadEngine, isEngineReady } from './services/webLLMService';
import { AppIdea, AppCategory, DeepDiveAnalysis } from './types';
import { IdeaCard } from './components/IdeaCard';
import { AnalysisView } from './components/AnalysisView';
import { ComparisonModal } from './components/ComparisonModal';
import { OnboardingTour } from './components/OnboardingTour';
import { AdMobBanner } from './components/AdMobBanner';
import { AdMobInterstitial } from './components/AdMobInterstitial';
import { LicenseModal } from './components/LicenseModal';
import { UpgradePrompt } from './components/UpgradePrompt';
import { LicenseProvider, useLicense } from './contexts/LicenseContext';
import { Rocket, Sparkles, RefreshCw, BarChart3, Info, Heart, Bookmark, Filter, ArrowUpDown, Scale, X, Activity, Loader2, HelpCircle, Share2, CheckCircle2, PenTool, Zap, Sun, Moon, Download, FileJson, FileText, ChevronDown, FileSpreadsheet, Crown } from 'lucide-react';
import { jsPDF } from "jspdf";

const CATEGORIES = [
  "All",
  AppCategory.HyperCasualGame,
  AppCategory.SocialUtility,
  AppCategory.AIProductivity,
  AppCategory.HealthWellness,
  AppCategory.Entertainment
];

function AppContent() {
  // License Context
  const {
    isPro,
    canGenerate,
    canSave,
    recordGeneration,
    hasFeature,
    remainingGenerations,
    showLicenseModal,
    setShowLicenseModal,
    showUpgradePrompt,
    setShowUpgradePrompt,
    upgradePromptFeature,
    setUpgradePromptFeature
  } = useLicense();

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return (saved === 'dark' || saved === 'light') ? saved : 'dark';
    }
    return 'dark';
  });

  // WebLLM Model Loading State
  const [modelLoading, setModelLoading] = useState(!isEngineReady());
  const [modelProgress, setModelProgress] = useState("Initializing AI engine...");

  const [mode, setMode] = useState<'generate' | 'validate'>('generate');
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [userContext, setUserContext] = useState('');
  
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  
  const [selectedIdea, setSelectedIdea] = useState<AppIdea | null>(null);
  const [analysis, setAnalysis] = useState<DeepDiveAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ad State
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [pendingAnalysisIdea, setPendingAnalysisIdea] = useState<AppIdea | null>(null);

  // Export Menu State
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

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

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize WebLLM Engine on app load
  useEffect(() => {
    setProgressCallback((progress) => {
      setModelProgress(progress);
      if (progress.includes("ready")) {
        setModelLoading(false);
      }
    });

    preloadEngine()
      .then(() => setModelLoading(false))
      .catch((err) => {
        console.error("Failed to load AI model:", err);
        setModelProgress("Failed to load AI model. Please refresh.");
      });
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Click outside listener for export menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper for Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Handle Share
  const handleShare = useCallback((idea: AppIdea) => {
    try {
        const json = JSON.stringify(idea);
        const encoded = btoa(encodeURIComponent(json));
        const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
        navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard");
    } catch (err) {
        console.error("Failed to share", err);
        showToast("Failed to generate link");
    }
  }, [showToast]);

  // Handle Hash on Load
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash.startsWith('#share=')) {
            try {
                const base64 = hash.replace('#share=', '');
                const json = decodeURIComponent(atob(base64));
                const sharedIdea = JSON.parse(json) as AppIdea;
                
                if (sharedIdea.id && sharedIdea.title) {
                    setIdeas([sharedIdea]);
                    setActiveTab('generated');
                    // Scroll to ideas section
                    const listEl = document.getElementById('ideas-list');
                    if (listEl) listEl.scrollIntoView({ behavior: 'smooth' });
                    showToast("Shared idea loaded");
                }
            } catch (e) {
                console.error("Invalid share link", e);
            }
        }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [showToast]);

  // Persist saved ideas
  useEffect(() => {
    localStorage.setItem('savedIdeas', JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  // Initial Tour Check
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
        setTimeout(() => setShowTour(true), 1500);
    }
  }, []);

  const handleCompleteTour = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const startTour = () => {
    setShowTour(true);
  };

  const toggleSaveIdea = useCallback((idea: AppIdea) => {
    setSavedIdeas(prev => {
      const exists = prev.find(i => i.id === idea.id);
      if (exists) {
        // Always allow unsaving
        return prev.filter(i => i.id !== idea.id);
      } else {
        // Check save limit for free users
        if (!canSave(prev.length)) {
          setUpgradePromptFeature('unlimited_saves');
          setShowUpgradePrompt(true);
          return prev;
        }
        return [...prev, idea];
      }
    });
  }, [canSave, setUpgradePromptFeature, setShowUpgradePrompt]);

  const toggleComparison = useCallback((idea: AppIdea) => {
    // Comparison requires pro
    if (!hasFeature('comparison')) {
      setUpgradePromptFeature('comparison');
      setShowUpgradePrompt(true);
      return;
    }

    setComparisonQueue(prev => {
        const exists = prev.find(i => i.id === idea.id);
        if (exists) {
            return prev.filter(i => i.id !== idea.id);
        } else {
            if (prev.length >= 3) return prev; // Limit to 3
            return [...prev, idea];
        }
    });
  }, [hasFeature, setUpgradePromptFeature, setShowUpgradePrompt]);

  const clearComparison = useCallback(() => {
    setComparisonQueue([]);
  }, []);

  const handleGenerateIdeas = useCallback(async () => {
    // Check generation limit for free users
    if (!canGenerate()) {
      setUpgradePromptFeature('unlimited_generations');
      setShowUpgradePrompt(true);
      return;
    }

    if (window.location.hash) {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }

    setLoadingIdeas(true);
    setIdeas([]);
    setSelectedIdea(null);
    setAnalysis(null);
    setActiveTab('generated');
    setFilterCategory("All");
    setSortOption("virality-desc");

    const generatedIdeas = await generateViralIdeas(selectedCategory as AppCategory | "All");
    setIdeas(generatedIdeas);
    setLoadingIdeas(false);

    // Record generation for free tier tracking
    recordGeneration();
  }, [selectedCategory, canGenerate, recordGeneration, setUpgradePromptFeature, setShowUpgradePrompt]);

  const handleGenerateImage = useCallback(async (idea: AppIdea) => {
    // Check if user has image generation feature
    if (!hasFeature('image_generation')) {
      setUpgradePromptFeature('image_generation');
      setShowUpgradePrompt(true);
      return;
    }

    setGeneratingImages(prev => ({ ...prev, [idea.id]: true }));

    const imageUrl = await generateAppConceptImage(idea);
    
    if (imageUrl) {
        const updateList = (list: AppIdea[]) => list.map(item => 
            item.id === idea.id ? { ...item, imageUrl } : item
        );
        
        setIdeas(updateList);
        setSavedIdeas(updateList);
        
        if (selectedIdea?.id === idea.id) {
            setSelectedIdea(prev => prev ? { ...prev, imageUrl } : null);
        }

        showToast("Concept art generated successfully");
    } else {
        showToast("Failed to generate image");
    }

    setGeneratingImages(prev => ({ ...prev, [idea.id]: false }));
  }, [selectedIdea, showToast, hasFeature, setUpgradePromptFeature, setShowUpgradePrompt]);

  const handleValidateCustomIdea = useCallback(async () => {
    if (!userContext.trim()) return;

    // Check generation limit for free users
    if (!canGenerate()) {
      setUpgradePromptFeature('unlimited_generations');
      setShowUpgradePrompt(true);
      return;
    }

    // Deep analysis requires pro
    if (!hasFeature('deep_analysis')) {
      setUpgradePromptFeature('deep_analysis');
      setShowUpgradePrompt(true);
      return;
    }

    if (window.location.hash) {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }

    setLoadingIdeas(true);
    setIdeas([]);
    setSelectedIdea(null);
    setAnalysis(null);
    setActiveTab('generated');
    setFilterCategory("All");

    const refinedIdea = await refineUserIdea(userContext);

    if (refinedIdea) {
        setIdeas([refinedIdea]);
        setSelectedIdea(refinedIdea);

        setLoadingAnalysis(true);
        if (window.innerWidth < 1024) {
             setTimeout(() => {
                 document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
             }, 100);
        }

        const result = await analyzeAppIdea(refinedIdea);
        setAnalysis(result);
        setLoadingAnalysis(false);

        // Record generation
        recordGeneration();
    } else {
        showToast("Could not process idea. Try again.");
    }

    setLoadingIdeas(false);
  }, [userContext, showToast, canGenerate, hasFeature, recordGeneration, setUpgradePromptFeature, setShowUpgradePrompt]);

  const executeAnalysis = useCallback(async (idea: AppIdea) => {
    setSelectedIdea(idea);
    setLoadingAnalysis(true);
    setAnalysis(null);
    
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    const result = await analyzeAppIdea(idea);
    setAnalysis(result);
    setLoadingAnalysis(false);
  }, []);

  const handleAnalyzeClick = useCallback((idea: AppIdea) => {
      if (selectedIdea?.id === idea.id) return;

      // Deep analysis requires pro
      if (!hasFeature('deep_analysis')) {
        setUpgradePromptFeature('deep_analysis');
        setShowUpgradePrompt(true);
        return;
      }

      // Trigger Interstitial Ad
      setPendingAnalysisIdea(idea);
      setShowInterstitial(true);
  }, [selectedIdea, hasFeature, setUpgradePromptFeature, setShowUpgradePrompt]);

  const handleInterstitialClose = useCallback(() => {
      setShowInterstitial(false);
      if (pendingAnalysisIdea) {
          executeAnalysis(pendingAnalysisIdea);
          setPendingAnalysisIdea(null);
      }
  }, [pendingAnalysisIdea, executeAnalysis]);

  // Derived state for sorting and filtering
  const processedIdeas = useMemo(() => {
    let currentList = activeTab === 'generated' ? ideas : savedIdeas;

    if (filterCategory !== "All") {
      currentList = currentList.filter(idea => idea.category === filterCategory);
    }

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

  const handleExportJSON = useCallback(() => {
    // Export requires pro
    if (!hasFeature('export')) {
      setUpgradePromptFeature('export');
      setShowUpgradePrompt(true);
      setShowExportMenu(false);
      return;
    }

    const dataStr = JSON.stringify(processedIdeas, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'strategia-x-ideas.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    setShowExportMenu(false);
    showToast("JSON Exported");
  }, [processedIdeas, showToast, hasFeature, setUpgradePromptFeature, setShowUpgradePrompt]);

  const handleExportCSV = useCallback(() => {
    // Export requires pro
    if (!hasFeature('export')) {
      setUpgradePromptFeature('export');
      setShowUpgradePrompt(true);
      setShowExportMenu(false);
      return;
    }

    if (processedIdeas.length === 0) return;

    // Define headers
    const headers = [
      "Title",
      "Tagline",
      "Category",
      "Description",
      "Viral Mechanic",
      "Monetization Strategy",
      "Est. Year 1 Users",
      "Virality Score",
      "Ad Revenue Potential",
      "Image URL"
    ];

    // Map data to rows
    const rows = processedIdeas.map(idea => [
      `"${idea.title.replace(/"/g, '""')}"`,
      `"${idea.tagline.replace(/"/g, '""')}"`,
      `"${idea.category}"`,
      `"${idea.description.replace(/"/g, '""')}"`,
      `"${idea.viralMechanic.replace(/"/g, '""')}"`,
      `"${idea.monetizationStrategy.replace(/"/g, '""')}"`,
      idea.estimatedYearOneUsers,
      idea.viralityScore,
      idea.adRevenuePotential,
      `"${idea.imageUrl || ''}"`
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'strategia-x-ideas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
    showToast("CSV Exported");
  }, [processedIdeas, showToast, hasFeature, setUpgradePromptFeature, setShowUpgradePrompt]);

  const handleExportPDF = useCallback(() => {
    // Export requires pro
    if (!hasFeature('export')) {
      setUpgradePromptFeature('export');
      setShowUpgradePrompt(true);
      setShowExportMenu(false);
      return;
    }

    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxLineWidth = pageWidth - (margin * 2);
        let yPos = 20;

        // Title
        doc.setFontSize(22);
        doc.setTextColor(220, 38, 38); // Red
        doc.setFont("helvetica", "bold");
        doc.text("Strategia-X Report", margin, yPos);
        yPos += 10;

        // Subtitle/Date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated: ${new Date().toLocaleDateString()} | Count: ${processedIdeas.length}`, margin, yPos);
        yPos += 20;

        // Loop through ideas
        processedIdeas.forEach((idea, index) => {
            // Check for page break
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Idea Title
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            const title = `${index + 1}. ${idea.title}`;
            doc.text(title, margin, yPos);
            yPos += 7;

            // Stats
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80);
            doc.text(`${idea.category} | Virality: ${idea.viralityScore} | Revenue: ${idea.adRevenuePotential}`, margin, yPos);
            yPos += 6;

            // Tagline
            doc.setFont("helvetica", "italic");
            doc.setTextColor(50);
            const taglineLines = doc.splitTextToSize(idea.tagline, maxLineWidth);
            doc.text(taglineLines, margin, yPos);
            yPos += (taglineLines.length * 5) + 2;

            // Description
            doc.setFont("helvetica", "normal");
            doc.setTextColor(20);
            const descLines = doc.splitTextToSize(idea.description, maxLineWidth);
            doc.text(descLines, margin, yPos);
            yPos += (descLines.length * 5) + 12; // Spacing after item
        });

        doc.save("strategia-x-report.pdf");
        setShowExportMenu(false);
        showToast("PDF Exported");
    } catch (e) {
        console.error("PDF Export Error", e);
        showToast("Failed to export PDF");
    }
  }, [processedIdeas, showToast, hasFeature, setUpgradePromptFeature, setShowUpgradePrompt]);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-black text-neutral-900 dark:text-white selection:bg-red-900 selection:text-white flex flex-col relative">
      
      {/* Native Ad Interstitial Overlay */}
      <AdMobInterstitial isOpen={showInterstitial} onClose={handleInterstitialClose} />

      {/* WebLLM Model Loading Overlay */}
      {modelLoading && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 mx-auto mb-8 relative">
              <div className="absolute inset-0 border-4 border-red-600/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto text-red-600" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Loading AI Engine</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Downloading AI model to your browser. This only happens once and enables completely free, offline AI analysis.
            </p>
            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
              <p className="text-red-500 text-xs font-mono">{modelProgress}</p>
            </div>
            <p className="text-neutral-600 text-xs mt-6">
              First load: ~2GB download | Subsequent visits: Instant
            </p>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] transition-all duration-300 transform ${toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
         <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3">
            <CheckCircle2 className="text-green-500" size={18} />
            <span className="text-sm font-bold tracking-wide">{toastMessage}</span>
         </div>
      </div>

      {/* License Modal */}
      <LicenseModal isOpen={showLicenseModal} onClose={() => setShowLicenseModal(false)} />

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature={upgradePromptFeature}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 relative flex items-center justify-between">
          
          {/* Left Spacer / Toolbar Logo */}
          <div className="flex-1 flex items-center justify-start">
             <img 
                src="/toolbar_logo.png" 
                alt="Strategia-X" 
                className="h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity invert dark:invert-0" 
             />
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
             <img 
                src="/stx_logo.png" 
                alt="STX 1 System Monitor" 
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] invert dark:invert-0" 
             />
          </div>

          {/* Right Actions */}
          <div className="flex-1 flex items-center justify-end gap-4 sm:gap-6 text-sm">
             {/* Pro Badge / Upgrade Button */}
             {isPro ? (
               <button
                 onClick={() => setShowLicenseModal(true)}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all hover:scale-105"
               >
                 <Crown size={14} />
                 <span className="hidden sm:inline">Pro</span>
               </button>
             ) : (
               <button
                 onClick={() => setShowLicenseModal(true)}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-red-500/30 transition-all hover:scale-105"
               >
                 <Crown size={14} />
                 <span className="hidden sm:inline">Upgrade</span>
               </button>
             )}

             <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 hidden sm:block"></div>

             {/* Remaining generations indicator for free users */}
             {!isPro && (
               <>
                 <span className="hidden sm:inline text-neutral-500 font-mono text-xs tracking-wider">
                   {remainingGenerations}/3 FREE
                 </span>
                 <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 hidden sm:block"></div>
               </>
             )}

             <span className="hidden lg:inline text-neutral-500 font-mono text-xs tracking-wider">LOCAL AI</span>
             <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 hidden lg:block"></div>

             <button onClick={toggleTheme} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors" title="Toggle Theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>

             <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 hidden sm:block"></div>

             <button onClick={startTour} className="text-neutral-400 hover:text-red-600 dark:hover:text-red-500 transition-colors flex items-center gap-2 group">
                <HelpCircle size={16} className="group-hover:text-red-600 dark:group-hover:text-red-500" />
                <span className="hidden sm:inline uppercase text-xs font-bold tracking-wider">Guide</span>
             </button>
          </div>
        </div>
        
        {/* Chrome Divider - Toolbar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-white via-neutral-300 to-white dark:from-black dark:via-neutral-400 dark:to-black shadow-[0_1px_5px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_5px_rgba(255,255,255,0.2)]"></div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Hero / Controls */}
        <section className="mb-14 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-6 uppercase tracking-tight transition-colors duration-300">
            App Concept <span className="text-red-600">Analytics</span>
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-10 font-light max-w-2xl mx-auto tracking-wide transition-colors duration-300">
            Unpack the static. Identify the signal. Engineer your next unicorn.
          </p>

          {/* Mode Switcher */}
          <div className="flex justify-center mb-10">
            <div className="bg-white dark:bg-neutral-900 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 inline-flex shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] transition-colors duration-300">
              <button
                onClick={() => setMode('generate')}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    mode === 'generate' 
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700' 
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300 border border-transparent'
                }`}
              >
                Market Generator
              </button>
              <button
                onClick={() => setMode('validate')}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    mode === 'validate' 
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700' 
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300 border border-transparent'
                }`}
              >
                Validate Concept
              </button>
            </div>
          </div>

          {/* Chrome Divider - Hero Area */}
          <div className="w-full max-w-2xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-500 to-transparent mb-12 opacity-60"></div>

          {mode === 'generate' ? (
             <div className="animate-in fade-in zoom-in-95 duration-300">
                <div id="tour-categories" className="flex flex-wrap justify-center gap-3 mb-12 p-2 rounded-xl">
                    {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 border-2 ${
                        selectedCategory === cat 
                            ? 'bg-red-50 dark:bg-red-900/80 text-red-900 dark:text-white border-red-200 dark:border-neutral-300 shadow-md dark:shadow-[0_0_15px_rgba(220,38,38,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]' 
                            : 'bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-400 hover:text-neutral-900 dark:hover:text-white shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                        }`}
                    >
                        {cat}
                    </button>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                    id="tour-generate-btn"
                    onClick={handleGenerateIdeas}
                    disabled={loadingIdeas}
                    className={`group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 rounded-xl focus:outline-none border-2 border-red-700/50 dark:border-neutral-400/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] uppercase tracking-widest text-sm
                        ${loadingIdeas 
                        ? 'bg-neutral-400 dark:bg-neutral-800 cursor-not-allowed opacity-75 shadow-none' 
                        : 'bg-gradient-to-b from-red-600 to-red-800 dark:from-red-700 dark:to-red-900 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] dark:hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] active:scale-95'}
                    `}
                    >
                    {loadingIdeas ? (
                        <Loader2 className="animate-spin mr-3 text-white dark:text-red-500" size={18} />
                    ) : (
                        <Activity className="mr-3" size={18} />
                    )}
                    {loadingIdeas ? 'Analyzing...' : 'Generate Analysis'}
                    </button>
                </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300 px-4">
                 <div className="relative">
                    <textarea
                        value={userContext}
                        onChange={(e) => setUserContext(e.target.value)}
                        placeholder="Enter your app concept for analysis...&#10;Example: 'A competitive walking app where you can steal steps from friends if you walk more than them in a day. The loser has to watch ads to regain their streak.'"
                        className="w-full bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:focus:ring-red-900 transition-all outline-none min-h-[160px] mb-8 text-sm leading-relaxed shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] resize-none"
                    />
                    <PenTool className="absolute top-6 right-6 text-neutral-400 dark:text-neutral-700 pointer-events-none" size={20} />
                 </div>
                 <div className="flex justify-center">
                    <button
                        onClick={handleValidateCustomIdea}
                        disabled={loadingIdeas || !userContext.trim()}
                        className={`group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 rounded-xl focus:outline-none border-2 border-red-700/50 dark:border-neutral-400/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] uppercase tracking-widest text-sm
                            ${(loadingIdeas || !userContext.trim())
                            ? 'bg-neutral-400 dark:bg-neutral-800 cursor-not-allowed opacity-75 shadow-none' 
                            : 'bg-gradient-to-b from-red-600 to-red-800 dark:from-red-700 dark:to-red-900 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] dark:hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] active:scale-95'}
                        `}
                    >
                        {loadingIdeas ? (
                            <Loader2 className="animate-spin mr-3 text-white dark:text-red-500" size={18} />
                        ) : (
                            <Zap className="mr-3" size={18} fill="currentColor" />
                        )}
                        {loadingIdeas ? 'Processing...' : 'Run Diagnostics'}
                    </button>
                 </div>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Ideas List */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tabs */}
            <div id="tour-tabs" className="flex items-center gap-6 mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-1">
                <button
                    onClick={() => setActiveTab('generated')}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
                        activeTab === 'generated'
                        ? 'border-red-600 text-neutral-900 dark:text-white'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                >
                    <BarChart3 size={16} />
                    Live Data
                    {ideas.length > 0 && <span className="bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white text-[10px] px-1.5 py-0.5 rounded ml-1">{ideas.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
                        activeTab === 'saved'
                        ? 'border-red-600 text-neutral-900 dark:text-white'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                >
                    <Bookmark size={16} />
                    Saved
                    <span className="bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white text-[10px] px-1.5 py-0.5 rounded ml-1">{savedIdeas.length}</span>
                </button>
            </div>

            {/* Filter and Sort Controls */}
            <div id="tour-filters" className="flex flex-wrap gap-2 mb-6 bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm z-10 relative">
              <div className="relative flex-1 min-w-[140px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" size={14} />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-neutral-50 dark:bg-black text-neutral-700 dark:text-neutral-300 text-xs font-medium uppercase rounded-lg focus:ring-0 focus:border-neutral-400 block w-full pl-9 p-2.5 appearance-none cursor-pointer border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-400 transition-colors shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 min-w-[160px]">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" size={14} />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-neutral-50 dark:bg-black text-neutral-700 dark:text-neutral-300 text-xs font-medium uppercase rounded-lg focus:ring-0 focus:border-neutral-400 block w-full pl-9 p-2.5 appearance-none cursor-pointer border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-400 transition-colors shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  <option value="virality-desc">Virality: High to Low</option>
                  <option value="virality-asc">Virality: Low to High</option>
                  <option value="revenue-desc">Ad Revenue: High to Low</option>
                  <option value="revenue-asc">Ad Revenue: Low to High</option>
                </select>
              </div>

              {/* Export Button */}
              <div className="relative flex-initial" ref={exportMenuRef}>
                 <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={processedIdeas.length === 0}
                    className={`h-full px-4 rounded-lg flex items-center gap-2 text-xs font-bold uppercase transition-all duration-200 border border-neutral-200 dark:border-neutral-700 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
                    ${processedIdeas.length === 0 
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                        : 'bg-neutral-50 dark:bg-black text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                 >
                    <Download size={14} />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                 </button>

                 {/* Dropdown Menu */}
                 {showExportMenu && processedIdeas.length > 0 && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-1">
                            <button
                                onClick={handleExportJSON}
                                className="w-full text-left px-3 py-2 text-xs font-bold uppercase flex items-center gap-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                            >
                                <FileJson size={14} className="text-yellow-600 dark:text-yellow-500" />
                                Export JSON
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="w-full text-left px-3 py-2 text-xs font-bold uppercase flex items-center gap-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                            >
                                <FileSpreadsheet size={14} className="text-green-600 dark:text-green-500" />
                                Export CSV
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="w-full text-left px-3 py-2 text-xs font-bold uppercase flex items-center gap-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                            >
                                <FileText size={14} className="text-red-600 dark:text-red-500" />
                                Export PDF Report
                            </button>
                        </div>
                    </div>
                 )}
              </div>
            </div>

            {/* Empty States */}
            {activeTab === 'generated' && ideas.length === 0 && !loadingIdeas && (
              <div className="text-center py-16 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/50">
                <div className="bg-white dark:bg-neutral-800 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 border border-neutral-200 dark:border-neutral-700">
                  <Info className="text-neutral-400 dark:text-neutral-500" size={24} />
                </div>
                <p className="text-neutral-900 dark:text-white font-bold uppercase tracking-wide">No Data Generated</p>
                <p className="text-neutral-500 text-xs mt-2">Initialize system generation above.</p>
              </div>
            )}

            {activeTab === 'saved' && savedIdeas.length === 0 && (
                <div className="text-center py-16 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/50">
                  <div className="bg-white dark:bg-neutral-800 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 border border-neutral-200 dark:border-neutral-700">
                    <Heart className="text-neutral-400 dark:text-neutral-500" size={24} />
                  </div>
                  <p className="text-neutral-900 dark:text-white font-bold uppercase tracking-wide">No Saved Concepts</p>
                  <p className="text-neutral-500 text-xs mt-2">Mark items for quick access.</p>
                </div>
            )}
            
            {/* Filtered Empty State */}
            {((activeTab === 'generated' && ideas.length > 0) || (activeTab === 'saved' && savedIdeas.length > 0)) && processedIdeas.length === 0 && (
              <div className="text-center py-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide">Filter returns no results.</p>
                <button 
                  onClick={() => setFilterCategory("All")}
                  className="mt-3 text-red-600 dark:text-red-500 text-xs font-bold uppercase hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 hover:underline"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Loading State */}
            {activeTab === 'generated' && loadingIdeas && (
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="h-48 rounded-xl bg-white dark:bg-neutral-900 animate-pulse border border-neutral-200 dark:border-neutral-800"></div>
                 ))}
               </div>
            )}

            {/* List */}
            <div id="ideas-list" className="space-y-4">
              {processedIdeas.map((idea) => (
                <IdeaCard 
                  key={idea.id} 
                  idea={idea} 
                  onAnalyze={handleAnalyzeClick} 
                  isSelected={selectedIdea?.id === idea.id}
                  isSaved={savedIdeas.some(saved => saved.id === idea.id)}
                  onToggleSave={toggleSaveIdea}
                  isCompareSelected={comparisonQueue.some(i => i.id === idea.id)}
                  onToggleCompare={toggleComparison}
                  disableCompareSelect={comparisonQueue.length >= 3 && !comparisonQueue.some(i => i.id === idea.id)}
                  onShare={handleShare}
                  onGenerateImage={handleGenerateImage}
                  isGeneratingImage={!!generatingImages[idea.id]}
                  isAnalyzing={loadingAnalysis && selectedIdea?.id === idea.id}
                />
              ))}
            </div>
          </div>

          {/* Analysis View */}
          <div className="lg:col-span-7" id="analysis-section">
            <div className="sticky top-24">
              {selectedIdea ? (
                <div className="bg-white dark:bg-black rounded-2xl border border-neutral-200 dark:border-neutral-800 p-1 sm:p-6 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
                   {/* Background Gradient Mesh */}
                   <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-100 dark:bg-red-900/10 rounded-full blur-3xl -z-10 pointer-events-none opacity-50 dark:opacity-100"></div>

                  <div className="mb-8 flex items-start justify-between px-2 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wide">{selectedIdea.title}</h2>
                      <span className="text-neutral-500 dark:text-neutral-400 text-sm font-mono">{selectedIdea.tagline}</span>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-bold mb-1">Revenue Model</div>
                        <div className="text-yellow-600 dark:text-yellow-500 font-bold uppercase text-sm tracking-wider">{selectedIdea.monetizationStrategy}</div>
                    </div>
                  </div>
                  <AnalysisView 
                    idea={selectedIdea} 
                    analysis={analysis} 
                    loading={loadingAnalysis}
                    onShare={handleShare}
                  />
                </div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-3xl bg-neutral-100/30 dark:bg-neutral-900/30">
                  <div className="w-24 h-24 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <BarChart3 className="text-neutral-400 dark:text-neutral-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wide">Awaiting Selection</h3>
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
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-neutral-900 dark:bg-neutral-900 border-2 border-neutral-400/50 text-white px-6 py-3 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center gap-6 animate-in slide-in-from-bottom-6 duration-300">
                <div className="flex items-center gap-3">
                    <div className="bg-red-700 rounded-md w-6 h-6 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                        {comparisonQueue.length}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide text-neutral-300">Analysis Queue</span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowComparisonModal(true)}
                        className="bg-white text-black hover:bg-neutral-200 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 border border-neutral-400 shadow-[0_2px_5px_rgba(0,0,0,0.2)]"
                    >
                        Compare
                    </button>
                    <button 
                        onClick={clearComparison}
                        className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-all duration-200 hover:scale-110 active:scale-90 border border-transparent hover:border-neutral-600"
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

        {/* Onboarding Tour */}
        <OnboardingTour 
          isOpen={showTour} 
          onClose={() => setShowTour(false)} 
          onComplete={handleCompleteTour}
          steps={[
              {
                  targetId: 'tour-categories',
                  title: 'Target Market',
                  description: 'Select a specific app category to focus the AI analysis on a particular market segment.',
                  position: 'bottom'
              },
              {
                  targetId: 'tour-generate-btn',
                  title: 'Initialize Analysis',
                  description: 'Launch the generative engine to create data-driven app concepts based on your selected parameters.',
                  position: 'bottom'
              },
              {
                  targetId: 'tour-tabs',
                  title: 'Data Management',
                  description: 'Switch between your live generated results and your saved high-potential concepts.',
                  position: 'bottom'
              },
              {
                  targetId: 'tour-filters',
                  title: 'Refine Data',
                  description: 'Use these controls to sort and filter results by revenue potential or virality score.',
                  position: 'bottom'
              }
          ]}
        />

      </main>

      <footer className="pt-12 text-center border-t border-neutral-200 dark:border-neutral-900/50 bg-white dark:bg-black mt-auto transition-colors duration-300">
        <div className="text-red-600 font-bold uppercase tracking-[0.2em] text-lg mb-3">
            Strategic. Excellence. Engineered.
        </div>
        <a href="https://www.strategia-x.com" target="_blank" rel="noopener noreferrer" className="text-neutral-500 dark:text-white text-sm font-light hover:text-red-600 dark:hover:text-red-500 transition-colors opacity-80">
            www.strategia-x.com
        </a>

        {/* AdMob Banner Integrated Here */}
        <div className="mt-8">
            <AdMobBanner />
        </div>
      </footer>
    </div>
  );
}

// Wrap AppContent with LicenseProvider
export default function App() {
  return (
    <LicenseProvider>
      <AppContent />
    </LicenseProvider>
  );
}