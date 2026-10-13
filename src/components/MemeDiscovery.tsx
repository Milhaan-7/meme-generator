import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Sparkle
} from 'lucide-react';
import { MemeTemplate, DiscoveryResponse } from '../types.ts';
import { CURATED_MEMES } from '../../server/memeData.ts';

interface MemeDiscoveryProps {
  onSelectTemplateForGeneration: (template: MemeTemplate, initialPrompt?: string) => void;
  onTriggerGeneration?: (query: string) => void;
  initialQuery?: string;
}

const DISCOVERY_SUGGESTIONS = [
  'A meme showing someone celebrating too early',
  'A reaction meme for when your crush replies instantly',
  'A meme about being completely broke right after shopping',
  'A student who studies only after seeing the exam timetable',
  'Someone trying to look calm while everything around them is on fire',
  'Making an absurd trade offer where one person gets nothing',
  'Two completely different groups surprisingly agreeing on one thing',
  'Awkwardly looking away pretending you did not see what happened',
];

export const MemeDiscovery: React.FC<MemeDiscoveryProps> = ({
  onSelectTemplateForGeneration,
  onTriggerGeneration,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<DiscoveryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);
  const [isExportingId, setIsExportingId] = useState<string | null>(null);
  const [autoForgeCountdown, setAutoForgeCountdown] = useState<number | null>(null);
  const lastSearchedRef = useRef<string>('');

  // Automatically trigger search when initialQuery is provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && lastSearchedRef.current !== initialQuery.trim()) {
      setQuery(initialQuery);
      lastSearchedRef.current = initialQuery.trim();
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const res = await fetch('/api/discover-memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to search meme library.');
      }

      setSearchResult(data);
      setActiveMatchIndex(0);

      // Evaluate match relevance
      const topScore = data.results?.[0]?.relevanceScore || 0;
      if (topScore < 70 || (data.results && data.results.length === 0)) {
        setAutoForgeCountdown(4);
      } else {
        setAutoForgeCountdown(null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during semantic search.');
    } finally {
      setIsSearching(false);
    }
  };

  // Countdown timer for automatic AI generation if low relevance
  useEffect(() => {
    if (autoForgeCountdown === null) return;
    if (autoForgeCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoForgeCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoForgeCountdown === 0) {
      setAutoForgeCountdown(null);
      if (searchResult && onTriggerGeneration) {
        onTriggerGeneration(searchResult.query);
      }
    }
  }, [autoForgeCountdown, searchResult, onTriggerGeneration]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleCopyCaption = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaptionId(id);
    setTimeout(() => setCopiedCaptionId(null), 2000);
  };

  const handleDownloadMemePng = (template: MemeTemplate, caption: string) => {
    setIsExportingId(template.id);
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(template.url)}`;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const naturalW = img.naturalWidth || 600;
        const naturalH = img.naturalHeight || 600;
        const targetW = Math.min(naturalW, 900);
        const ratio = targetW / naturalW;
        const targetH = Math.round(naturalH * ratio);

        const headerHeight = Math.max(90, Math.round(targetH * 0.2));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH + headerHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsExportingId(null);
          return;
        }

        // Draw header
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, headerHeight);

        // Header divider
        ctx.fillStyle = '#18181B';
        ctx.fillRect(0, headerHeight - 2, targetW, 2);

        // Draw caption text
        ctx.fillStyle = '#18181B';
        const fontSize = Math.max(16, Math.min(26, Math.round(targetW * 0.038)));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const padding = 20;
        const maxTextW = targetW - padding * 2;
        const words = caption.split(' ');
        let line = '';
        let curY = padding;
        const lineHeight = Math.round(fontSize * 1.3);

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextW && n > 0) {
            ctx.fillText(line, padding, curY);
            line = words[n] + ' ';
            curY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, padding, curY);

        // Draw image
        ctx.drawImage(img, 0, headerHeight, targetW, targetH);

        // Watermark
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(targetW - 130, canvas.height - 24, 126, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LOLLAB // ARCHIVE', targetW - 67, canvas.height - 14);

        const dataUrl = canvas.toDataURL('image/png');
        const cleanName = (template.name || 'meme').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const link = document.createElement('a');
        link.download = `lollab-${cleanName}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Failed to export canvas PNG:', err);
      } finally {
        setIsExportingId(null);
      }
    };

    img.onerror = () => {
      setIsExportingId(null);
      window.open(template.url, '_blank');
    };

    img.src = proxyUrl;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 my-6">
      
      {/* Search Header Container */}
      <div className="rounded-2xl border-2 border-black bg-white p-5 sm:p-7 shadow-[6px_6px_0px_#18181B]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="inline-block rounded-md border-2 border-black bg-[#2563EB] px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-[2px_2px_0px_#18181B] mb-1">
              SEMANTIC DISCOVERY ARCHIVE
            </span>
            <h2 className="font-display text-2xl font-black text-black">
              Find Existing Memes by Meaning & Context
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-stone-500 uppercase">
            100+ Live Verified Templates
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Describe the meme situation or emotion (e.g. celebrating too early, pretending to understand)..."
              className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] py-3 pl-11 pr-4 text-sm sm:text-base text-black placeholder-stone-400 font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#2563EB] px-6 py-3 text-sm font-black text-white neo-btn shadow-[3px_3px_0px_#18181B] disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching Archive...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search Archive</span>
              </>
            )}
          </button>
        </div>

        {/* Example prompts */}
        <div className="mt-4 pt-3 border-t-2 border-black/10">
          <span className="text-[11px] font-black uppercase tracking-wider text-stone-600 block mb-2">
            Try Searching For:
          </span>
          <div className="flex flex-wrap gap-2">
            {DISCOVERY_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(sug)}
                className="rounded-lg border-2 border-black/30 bg-[#FAF7F2] hover:border-black hover:bg-[#FEF08A] px-2.5 py-1 text-xs font-bold text-black transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border-2 border-black bg-[#FEE2E2] p-3 text-xs font-bold text-[#DC2626] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Semantic Intent AI Breakdown */}
      {searchResult && (
        <div className="rounded-2xl border-2 border-black bg-[#FEF08A] p-4 shadow-[4px_4px_0px_#18181B]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black/20 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-black text-white px-2 py-0.5 font-mono text-[10px] font-black uppercase">
                AI COGNITIVE PARSE
              </span>
              <span className="font-display font-black text-xs text-black uppercase tracking-wider">
                Extracted Comedic Intent
              </span>
            </div>
            <span className="font-mono text-xs font-black text-black">
              {searchResult.totalFound} Matches Found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="font-black text-stone-700 block uppercase text-[10px]">Interpreted Premise:</span>
              <p className="font-bold text-black mt-0.5">"{searchResult.interpretedIntent}"</p>
            </div>
            <div>
              <span className="font-black text-stone-700 block uppercase text-[10px]">Detected Emotions:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {searchResult.emotions?.map((e, i) => (
                  <span key={i} className="rounded-md border border-black bg-white px-2 py-0.5 font-bold text-black">
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-black text-stone-700 block uppercase text-[10px]">Contextual Tags:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {searchResult.keywords?.map((kw, i) => (
                  <span key={i} className="rounded-md border border-black bg-white px-2 py-0.5 font-mono font-bold text-black">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relevance Evaluation Callout & AI Forge Fallback Trigger */}
      {searchResult && (
        (() => {
          const topScore = searchResult.results?.[0]?.relevanceScore || 0;
          const isLowRelevance = topScore < 70 || searchResult.results.length === 0;
          const currentMatch = searchResult.results[activeMatchIndex] || searchResult.results[0];

          return (
            <div className="space-y-6">
              {/* Match Evaluation Banner */}
              <div
                className={`rounded-2xl border-2 border-black p-4 sm:p-5 shadow-[4px_4px_0px_#18181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isLowRelevance ? 'bg-[#FEF08A]' : 'bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md border border-black px-2 py-0.5 font-mono text-[10px] font-black uppercase ${
                        isLowRelevance ? 'bg-[#EF4444] text-white' : 'bg-[#2563EB] text-white'
                      }`}
                    >
                      {isLowRelevance ? 'NO EXACT ARCHIVE MATCH' : 'SUFFICIENT RELEVANCE MATCH'}
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-700">
                      Top Match Fit: {topScore}%
                    </span>
                  </div>
                  <p className="font-display font-black text-sm sm:text-base text-black">
                    {isLowRelevance ? (
                      autoForgeCountdown !== null ? (
                        <span>
                          No sufficiently relevant archive meme exists (&lt; 70%). Auto-forging original AI meme in{' '}
                          <span className="inline-block bg-[#EF4444] text-white px-2 py-0.5 rounded font-mono font-bold">
                            {autoForgeCountdown}s
                          </span>
                          ...
                        </span>
                      ) : (
                        "No sufficiently relevant archive meme exists (< 70%). Let's forge an original one."
                      )
                    ) : (
                      `Found high-relevance cultural matches for "${searchResult.query}". Viewing match ${activeMatchIndex + 1} of ${searchResult.results.length}.`
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isLowRelevance && autoForgeCountdown !== null && (
                    <button
                      type="button"
                      onClick={() => setAutoForgeCountdown(null)}
                      className="rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black neo-btn"
                    >
                      Cancel Auto-Forge
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onTriggerGeneration?.(searchResult.query)}
                    className="flex items-center gap-2 rounded-xl border-2 border-black bg-[#EF4444] hover:bg-[#DC2626] px-4 py-2.5 text-xs sm:text-sm font-black text-white neo-btn shrink-0 shadow-[2px_2px_0px_#18181B] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Forge Original with AI →</span>
                  </button>
                </div>
              </div>

              {/* Featured Best Match Showcase Card */}
              {currentMatch && (
                <div className="rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#18181B]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black/10 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-black bg-[#2563EB] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-white">
                        TOP RECOMMENDED MEME
                      </span>
                      <span className="font-display font-black text-sm text-black">
                        Candidate {activeMatchIndex + 1} of {searchResult.results.length}
                      </span>
                    </div>

                    {searchResult.results.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMatchIndex((prev) => (prev + 1) % searchResult.results.length)
                        }
                        className="flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#FEF08A] px-3 py-1 text-xs font-bold text-black neo-btn"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Try Next Result ({((activeMatchIndex + 1) % searchResult.results.length) + 1}/{searchResult.results.length})</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Image Preview */}
                    <div className="md:col-span-5 flex justify-center">
                      <div className="relative aspect-square w-full max-w-[340px] overflow-hidden rounded-xl border-2 border-black bg-stone-900 shadow-[4px_4px_0px_#18181B]">
                        <img
                          src={currentMatch.url}
                          alt={currentMatch.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 rounded-md border border-black bg-[#FAF7F2] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-black shadow-sm">
                          CULTURE ARCHIVE
                        </div>
                        {currentMatch.relevanceScore && (
                          <div className="absolute top-2.5 right-2.5 rounded-full border border-black bg-[#FEF08A] px-2.5 py-0.5 font-mono text-[11px] font-black text-black shadow-sm">
                            {currentMatch.relevanceScore}% FIT
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details and Actions */}
                    <div className="md:col-span-7 flex flex-col gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded border border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase text-stone-700">
                            {currentMatch.category}
                          </span>
                          {currentMatch.sourceUrl && (
                            <a
                              href={currentMatch.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:underline"
                            >
                              <span>KnowYourMeme Verified</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <h3 className="font-display font-black text-xl sm:text-2xl text-black">
                          {currentMatch.name}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-stone-600 font-medium">
                          {currentMatch.description}
                        </p>
                      </div>

                      {/* AI Fit Explanation */}
                      {currentMatch.explanation && (
                        <div className="rounded-xl border-2 border-black/20 bg-[#FAF7F2] p-3 text-xs text-stone-800 font-medium">
                          <span className="font-bold text-[#2563EB]">WHY THIS FITS YOUR SCENARIO: </span>
                          {currentMatch.explanation}
                        </div>
                      )}

                      {/* Action Buttons: Download PNG, Copy Caption, Edit in Studio */}
                      <div className="pt-3 border-t-2 border-black/10 flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadMemePng(
                              currentMatch,
                              currentMatch.explanation || searchResult.query
                            )
                          }
                          disabled={isExportingId === currentMatch.id}
                          className="flex items-center gap-2 rounded-xl border-2 border-black bg-[#EF4444] px-4 py-2.5 text-xs sm:text-sm font-black text-white neo-btn shadow-[2px_2px_0px_#18181B]"
                        >
                          {isExportingId === currentMatch.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                              <span>Exporting PNG...</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              <span>Download Meme PNG</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyCaption(
                              currentMatch.id,
                              currentMatch.explanation || searchResult.query
                            )
                          }
                          className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 py-2.5 text-xs font-bold text-black neo-btn"
                        >
                          {copiedCaptionId === currentMatch.id ? (
                            <>
                              <Check className="h-4 w-4 text-emerald-600" />
                              <span className="text-emerald-700">Caption Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 text-stone-500" />
                              <span>Copy Caption</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onSelectTemplateForGeneration(currentMatch, searchResult.query)
                          }
                          className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#2563EB] px-3.5 py-2.5 text-xs font-bold text-white neo-btn"
                        >
                          <Sliders className="h-4 w-4" />
                          <span>Customize in Studio</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery Grid of All Matches */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-black text-black flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#2563EB]" />
                    <span>All Matching Memes ({searchResult.results.length})</span>
                  </h3>
                  <span className="text-xs font-bold font-mono text-stone-600">
                    Ranked by contextual fit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {searchResult.results.map((template, idx) => (
                    <div
                      key={template.id}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0px_#18181B] hover:shadow-[6px_6px_0px_#18181B] hover:-translate-y-1 transition-all duration-200 ${
                        idx === activeMatchIndex ? 'ring-2 ring-black bg-[#FEF08A]/10' : ''
                      }`}
                    >
                      {/* Image Section */}
                      <div className="relative aspect-square w-full overflow-hidden border-b-2 border-black bg-stone-900">
                        <img
                          src={template.url}
                          alt={template.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        <div className="absolute top-2.5 left-2.5 rounded-md border-2 border-black bg-[#FAF7F2] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-black shadow-[2px_2px_0px_#18181B]">
                          CULTURE ARCHIVE
                        </div>

                        {template.relevanceScore && (
                          <div className="absolute top-2.5 right-2.5 rounded-full border-2 border-black bg-[#FEF08A] px-2.5 py-0.5 font-mono text-[11px] font-black text-black shadow-[2px_2px_0px_#18181B]">
                            {template.relevanceScore}% FIT
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2 rounded border border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase text-black">
                          {template.category}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="flex flex-1 flex-col p-4">
                        <h4 className="font-display font-black text-base text-black line-clamp-1">
                          {template.name}
                        </h4>

                        <p className="mt-1 text-xs text-stone-600 font-medium line-clamp-2">
                          {template.description}
                        </p>

                        {template.explanation && (
                          <div className="mt-2.5 rounded-lg border-2 border-black/20 bg-[#FAF7F2] p-2 text-[11px] text-stone-800 font-medium line-clamp-2">
                            <span className="font-bold text-[#2563EB]">FIT: </span>
                            {template.explanation}
                          </div>
                        )}

                        {/* Card Actions */}
                        <div className="mt-auto pt-3 flex items-center justify-between gap-1.5 border-t-2 border-black/10">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Download PNG"
                              onClick={() =>
                                handleDownloadMemePng(
                                  template,
                                  template.explanation || searchResult.query
                                )
                              }
                              disabled={isExportingId === template.id}
                              className="rounded-lg border-2 border-black bg-white p-1.5 text-black hover:bg-[#FEF08A] transition-colors"
                            >
                              {isExportingId === template.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Download className="h-3.5 w-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              title="Copy Caption"
                              onClick={() =>
                                handleCopyCaption(
                                  template.id,
                                  template.explanation || searchResult.query
                                )
                              }
                              className="rounded-lg border-2 border-black bg-white p-1.5 text-black hover:bg-[#FEF08A] transition-colors"
                            >
                              {copiedCaptionId === template.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {template.sourceUrl && (
                              <a
                                href={template.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="KnowYourMeme"
                                className="rounded-lg border-2 border-black bg-white p-1.5 text-stone-600 hover:text-black hover:bg-stone-100 transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onSelectTemplateForGeneration(template, searchResult.query)
                            }
                            className="flex items-center gap-1 rounded-xl border-2 border-black bg-[#2563EB] px-2.5 py-1.5 text-xs font-black text-white neo-btn"
                          >
                            <span>Use</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Initial State: Guide + Featured Reaction Starters */}
      {!searchResult && !isSearching && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#18181B] flex flex-col sm:flex-row items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-[#FEF08A] text-3xl shadow-[3px_3px_0px_#18181B]">
              🔍
            </div>
            <div>
              <span className="rounded border border-black bg-[#2563EB] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-white">
                HOW ARCHIVE SEARCH WORKS
              </span>
              <h3 className="mt-1 font-display text-lg sm:text-xl font-black text-black">
                Search Cultural Reactions by Context & Subtext
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                Describe a situation, awkward dilemma, or reaction in natural language above. Gemini decodes the comedic tension and ranks verified templates from Know Your Meme and Imgflip with fit scores.
              </p>
            </div>
          </div>

          {/* Featured Templates Row */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-black text-base text-black flex items-center gap-1.5">
                <span>Featured Cultural Reactions</span>
                <span className="text-xs font-mono font-bold text-stone-500">(Instant Starters)</span>
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {CURATED_MEMES.slice(0, 8).map((template) => (
                <div
                  key={template.id}
                  className="group flex flex-col overflow-hidden rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] hover:-translate-y-0.5 transition-all"
                >
                  <div className="relative aspect-square w-full overflow-hidden border-b-2 border-black bg-stone-900">
                    <img
                      src={template.url}
                      alt={template.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1.5 left-1.5 rounded border border-black bg-white px-1.5 py-0.5 text-[9px] font-black uppercase text-black">
                      {template.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-3">
                    <h5 className="font-display font-black text-xs sm:text-sm text-black line-clamp-1">
                      {template.name}
                    </h5>
                    <p className="mt-0.5 text-[11px] text-stone-500 line-clamp-1">
                      {template.situations?.[0] || template.description}
                    </p>

                    <div className="mt-auto pt-2.5 flex items-center justify-between gap-1 border-t-2 border-black/10">
                      {template.sourceUrl && (
                        <a
                          href={template.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-stone-500 hover:text-black flex items-center gap-0.5"
                        >
                          <span>Info</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          onSelectTemplateForGeneration(template, template.situations?.[0] || template.name)
                        }
                        className="flex items-center gap-1 rounded-lg border-2 border-black bg-[#FEF08A] px-2 py-0.5 text-[11px] font-black text-black neo-btn"
                      >
                        <span>Use</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
