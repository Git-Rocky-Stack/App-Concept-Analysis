import React, { useState } from 'react';
import { AppIdea, MVPPlan, MVPFeature } from '../types';
import { Layers, Clock, Zap, ChevronDown, ChevronUp, RefreshCw, Loader2, Code, AlertCircle, Star } from 'lucide-react';

interface MVPFeaturePlannerProps {
  idea: AppIdea;
  plan: MVPPlan | null;
  loading: boolean;
  onGenerate: () => void;
}

const EffortBadge = ({ effort }: { effort: string }) => {
  const colors = {
    Low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    High: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[effort as keyof typeof colors] || colors.Medium}`}>
      {effort}
    </span>
  );
};

const ImpactBadge = ({ impact }: { impact: string }) => {
  const stars = { Low: 1, Medium: 2, High: 3 };
  const count = stars[impact as keyof typeof stars] || 2;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < count ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-300 dark:text-neutral-600'}
        />
      ))}
    </div>
  );
};

const FeatureCard = ({ feature, index }: { feature: MVPFeature; index: number }) => (
  <div className="flex items-start gap-3 p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
    <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500 shrink-0">
      {index + 1}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h5 className="font-bold text-neutral-900 dark:text-white text-sm truncate">{feature.name}</h5>
        <ImpactBadge impact={feature.impact} />
      </div>
      <p className="text-neutral-500 text-xs mb-2">{feature.description}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400">Effort:</span>
        <EffortBadge effort={feature.effort} />
      </div>
    </div>
  </div>
);

export const MVPFeaturePlanner: React.FC<MVPFeaturePlannerProps> = ({ idea, plan, loading, onGenerate }) => {
  const [expandedSection, setExpandedSection] = useState<string>('mustHave');

  const sections = [
    { key: 'mustHave', title: 'Must Have', icon: AlertCircle, color: 'text-red-500', features: plan?.mustHave || [] },
    { key: 'shouldHave', title: 'Should Have', icon: Zap, color: 'text-yellow-500', features: plan?.shouldHave || [] },
    { key: 'niceToHave', title: 'Nice to Have', icon: Star, color: 'text-blue-500', features: plan?.niceToHave || [] },
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center animate-pulse">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wide">Planning MVP...</h3>
        <p className="text-neutral-500 text-sm">AI is prioritizing features for your MVP</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wide">MVP Feature Planner</h3>
        <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
          Get a prioritized feature roadmap using MoSCoW method: Must Have, Should Have, and Nice to Have.
        </p>
        <button
          onClick={onGenerate}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-500 hover:to-teal-400 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
        >
          <Layers size={16} />
          Plan MVP
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white uppercase tracking-wide">MVP Roadmap</h3>
            <p className="text-neutral-500 text-xs">For: {idea.title}</p>
          </div>
        </div>
        <button
          onClick={onGenerate}
          className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          title="Regenerate plan"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-green-600 dark:text-green-400" />
            <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">Est. Timeline</span>
          </div>
          <p className="text-2xl font-bold text-green-800 dark:text-green-300">{plan.estimatedMVPWeeks} weeks</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Code size={16} className="text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">Tech Stack</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {plan.techStack.slice(0, 3).map((tech, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.key}>
            <button
              onClick={() => setExpandedSection(expandedSection === section.key ? '' : section.key)}
              className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <section.icon size={18} className={section.color} />
                <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wide text-sm">{section.title}</span>
                <span className="text-xs px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-400">
                  {section.features.length}
                </span>
              </div>
              {expandedSection === section.key ? (
                <ChevronUp size={18} className="text-neutral-400" />
              ) : (
                <ChevronDown size={18} className="text-neutral-400" />
              )}
            </button>
            {expandedSection === section.key && section.features.length > 0 && (
              <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {section.features.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} index={index} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold">Effort:</span>
            <EffortBadge effort="Low" />
            <EffortBadge effort="Medium" />
            <EffortBadge effort="High" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Impact:</span>
            <ImpactBadge impact="Low" />
            <ImpactBadge impact="Medium" />
            <ImpactBadge impact="High" />
          </div>
        </div>
      </div>
    </div>
  );
};
