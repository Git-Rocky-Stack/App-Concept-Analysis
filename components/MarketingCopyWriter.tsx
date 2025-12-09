import React, { useState } from 'react';
import { AppIdea, MarketingCopy } from '../types';
import { Megaphone, Copy, Check, Twitter, Instagram, Linkedin, FileText, Tag, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface MarketingCopyWriterProps {
  idea: AppIdea;
  copy: MarketingCopy | null;
  loading: boolean;
  onGenerate: () => void;
}

export const MarketingCopyWriter: React.FC<MarketingCopyWriterProps> = ({ idea, copy, loading, onGenerate }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('description');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ text, copyKey }: { text: string; copyKey: string }) => (
    <button
      onClick={() => handleCopy(text, copyKey)}
      className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
      title="Copy to clipboard"
    >
      {copied === copyKey ? (
        <Check size={14} className="text-green-500" />
      ) : (
        <Copy size={14} />
      )}
    </button>
  );

  const SectionHeader = ({ title, icon: Icon, sectionKey }: { title: string; icon: React.ElementType; sectionKey: string }) => (
    <button
      onClick={() => setExpandedSection(expandedSection === sectionKey ? null : sectionKey)}
      className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-red-600 dark:text-red-500" />
        <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wide text-sm">{title}</span>
      </div>
      {expandedSection === sectionKey ? (
        <ChevronUp size={18} className="text-neutral-400" />
      ) : (
        <ChevronDown size={18} className="text-neutral-400" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center animate-pulse">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wide">Writing Copy...</h3>
        <p className="text-neutral-500 text-sm">AI is crafting compelling marketing materials</p>
      </div>
    );
  }

  if (!copy) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wide">Marketing Copy Writer</h3>
        <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
          Generate App Store descriptions, taglines, social media posts, and press releases instantly.
        </p>
        <button
          onClick={onGenerate}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-500 hover:to-purple-400 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
        >
          <Megaphone size={16} />
          Generate Copy
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white uppercase tracking-wide">Marketing Copy</h3>
            <p className="text-neutral-500 text-xs">For: {idea.title}</p>
          </div>
        </div>
        <button
          onClick={onGenerate}
          className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          title="Regenerate copy"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {/* App Store Description */}
        <div>
          <SectionHeader title="App Store Description" icon={FileText} sectionKey="description" />
          {expandedSection === 'description' && (
            <div className="mt-2 p-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200 dark:border-neutral-700 animate-in slide-in-from-top-2 duration-200">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Short (80 chars)</span>
                  <CopyButton text={copy.appStoreDescription.short} copyKey="short-desc" />
                </div>
                <p className="text-neutral-900 dark:text-white text-sm bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  {copy.appStoreDescription.short}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Full Description</span>
                  <CopyButton text={copy.appStoreDescription.full} copyKey="full-desc" />
                </div>
                <p className="text-neutral-900 dark:text-white text-sm bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 whitespace-pre-wrap">
                  {copy.appStoreDescription.full}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Taglines */}
        <div>
          <SectionHeader title="Taglines" icon={Tag} sectionKey="taglines" />
          {expandedSection === 'taglines' && (
            <div className="mt-2 p-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200 dark:border-neutral-700 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                {copy.taglines.map((tagline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 group">
                    <p className="text-neutral-900 dark:text-white text-sm flex-1">"{tagline}"</p>
                    <CopyButton text={tagline} copyKey={`tagline-${index}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Social Posts */}
        <div>
          <SectionHeader title="Social Media Posts" icon={Twitter} sectionKey="social" />
          {expandedSection === 'social' && (
            <div className="mt-2 p-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200 dark:border-neutral-700 animate-in slide-in-from-top-2 duration-200 space-y-3">
              <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Twitter size={14} className="text-sky-500" />
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Twitter/X</span>
                  </div>
                  <CopyButton text={copy.socialPosts.twitter} copyKey="twitter" />
                </div>
                <p className="text-neutral-900 dark:text-white text-sm">{copy.socialPosts.twitter}</p>
              </div>

              <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Instagram size={14} className="text-pink-500" />
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Instagram</span>
                  </div>
                  <CopyButton text={copy.socialPosts.instagram} copyKey="instagram" />
                </div>
                <p className="text-neutral-900 dark:text-white text-sm">{copy.socialPosts.instagram}</p>
              </div>

              <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Linkedin size={14} className="text-blue-600" />
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">LinkedIn</span>
                  </div>
                  <CopyButton text={copy.socialPosts.linkedIn} copyKey="linkedin" />
                </div>
                <p className="text-neutral-900 dark:text-white text-sm">{copy.socialPosts.linkedIn}</p>
              </div>
            </div>
          )}
        </div>

        {/* Press Release */}
        <div>
          <SectionHeader title="Press Release" icon={FileText} sectionKey="press" />
          {expandedSection === 'press' && (
            <div className="mt-2 p-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200 dark:border-neutral-700 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Short Press Release</span>
                <CopyButton text={copy.pressRelease} copyKey="press" />
              </div>
              <p className="text-neutral-900 dark:text-white text-sm bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                {copy.pressRelease}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
