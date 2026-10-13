import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, RefreshCw, Flame, Lightbulb, Dice5, Loader2 } from 'lucide-react';
import { CURATED_MEMES, MemeTemplate } from '../../server/memeData.ts';

interface HeroProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onFindMeme: () => void;
  onCreateMeme: () => void;
  isGenerating: boolean;
  isSearching: boolean;
  onSelectSampleTemplate: (template: MemeTemplate, initialPrompt: string) => void;
}

const SAMPLE_MEMES: {
  templateId: string;
  templateName: string;
  imgUrl: string;
  topCaption: string;
  bottomCaption: string;
  tag: string;
  promptExample: string;
}[] = [
  {
    templateId: '112126428',
    templateName: 'Distracted Boyfriend',
    imgUrl: 'https://i.imgflip.com/1ur9b0.jpg',
    topCaption: 'Starting a 6th side project',
    bottomCaption: 'My 5 unfinished projects',
    tag: 'CLASSIC REACTION',
    promptExample: 'Abandoning all my responsibilities for a shiny new hobby',
  },
  {
    templateId: '55311130',
    templateName: 'This Is Fine',
    imgUrl: 'https://i.imgflip.com/wxica.jpg',
    topCaption: '4 exams tomorrow & 0 pages read',
    bottomCaption: 'Me watching 3 hours of YouTube shorts',
    tag: 'PURE COPING',
    promptExample: 'Pretending everything is completely fine when deadlines are tomorrow',
  },
  {
    templateId: '87743120',
    templateName: 'Two Buttons',
    imgUrl: 'https://i.imgflip.com/1g8my4.jpg',
    topCaption: 'Go to sleep on time',
    bottomCaption: 'Scroll memes until 3:45 AM',
    tag: 'DAILY DILEMMA',
    promptExample: 'Sweating over whether to sleep early or scroll memes all night',
  },
  {
    templateId: '188390772',
    templateName: 'Woman Yelling at a Cat',
    imgUrl: 'https://i.imgflip.com/345v97.jpg',
    topCaption: 'You were supposed to be productive!',
    bottomCaption: 'Me taking a 4-hour nap',
    tag: 'UNBOTHERED VIBE',
    promptExample: 'Someone yelling at me for being lazy while I sit peacefully unbothered',
  },
];

const QUICK_STARTERS = [
  'Studying the night before an exam after doing nothing all term',
  'Friend who cancels plans 10 minutes before meeting because they are "tired"',
  'When you fix 1 small bug and create 14 new critical errors',
  'Opening a 20-slide group project where only one person did any work',
  'Walking into the kitchen at 2 AM like a feral goblin looking for snacks',
];

export const Hero: React.FC<HeroProps> = ({
  prompt,
  setPrompt,
  onFindMeme,
  onCreateMeme,
  isGenerating,
  isSearching,
  onSelectSampleTemplate,
}) => {
  const [sampleIndex, setSampleIndex] = useState(0);
  const sample = SAMPLE_MEMES[sampleIndex];

  const nextSample = () => {
    setSampleIndex((prev) => (prev + 1) % SAMPLE_MEMES.length);
  };

  const handleApplySample = () => {
    setPrompt(sample.promptExample);
    const matched = CURATED_MEMES.find((m) => m.id === sample.templateId);
    if (matched) {
      onSelectSampleTemplate(matched, sample.promptExample);
    }
  };

  const handleRandomStarter = () => {
    const random = QUICK_STARTERS[Math.floor(Math.random() * QUICK_STARTERS.length)];
    setPrompt(random);
  };

  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 max-w-7xl mx-auto">
      {/* Asymmetric 2-Column Editorial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* Left Column: Headline, Prompt & Two Primary Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Pill / Sticker */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block -rotate-2 rounded-md border-2 border-black bg-[#FEF08A] px-3 py-1 font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#18181B]">
              LOLLAB EDITORIAL // REACTION FORGE
            </span>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest hidden sm:inline">
              Gemini 3.8 Intelligence + Cultural Archive
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-black leading-[1.05]">
              Your brain.{' '}
              <span className="relative inline-block text-[#EF4444]">
                Our memes.
                <span className="absolute -bottom-1 left-0 w-full h-2 bg-[#FEF08A] -z-10 -rotate-1 rounded" />
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-700 font-medium leading-relaxed max-w-xl">
              Find the perfect reaction—or make one that doesn't exist yet.
            </p>
          </div>

          {/* Large Prompt Card */}
          <div className="rounded-2xl border-2 border-black bg-white p-4 sm:p-5 shadow-[6px_6px_0px_#18181B] relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
                <span>Describe Any Situation, Feeling, or Joke</span>
              </label>
              <button
                type="button"
                onClick={handleRandomStarter}
                className="text-[11px] font-bold text-stone-600 hover:text-black flex items-center gap-1 underline underline-offset-2"
              >
                <Dice5 className="h-3 w-3" />
                <span>Surprise prompt</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. When you're in a group project and one person does all the work while others send thumbs up in WhatsApp..."
              className="w-full rounded-xl border-2 border-black/80 bg-[#FAF7F2] p-3.5 text-sm sm:text-base text-black placeholder-stone-400 font-medium focus:bg-white focus:border-black focus:outline-none transition-colors resize-none"
            />

            {/* Two Clear Actions side-by-side */}
            <div className="mt-4 pt-3 border-t-2 border-black/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Find a meme */}
              <button
                type="button"
                onClick={onFindMeme}
                disabled={isSearching || isGenerating || !prompt.trim()}
                title={!prompt.trim() ? 'Type a scenario to discover matching memes' : 'Search archive for matching reactions'}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-black transition-all ${
                  isSearching
                    ? 'border-black bg-[#1D4ED8] text-white shadow-[2px_2px_0px_#18181B] cursor-wait'
                    : !prompt.trim()
                    ? 'border-stone-300 bg-stone-200 text-stone-400 shadow-none cursor-not-allowed'
                    : 'border-black bg-[#2563EB] text-white neo-btn shadow-[3px_3px_0px_#18181B] hover:-translate-y-0.5'
                }`}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Searching Archive...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Find a meme</span>
                  </>
                )}
              </button>

              {/* Create a meme */}
              <button
                type="button"
                onClick={onCreateMeme}
                disabled={isGenerating || isSearching || !prompt.trim()}
                title={!prompt.trim() ? 'Type a scenario to generate a new meme' : 'Generate an original AI meme'}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-black transition-all ${
                  isGenerating
                    ? 'border-black bg-[#FEF08A] text-black shadow-[2px_2px_0px_#18181B] cursor-wait'
                    : !prompt.trim()
                    ? 'border-stone-300 bg-stone-200 text-stone-400 shadow-none cursor-not-allowed'
                    : 'border-black bg-[#FEF08A] text-black neo-btn shadow-[3px_3px_0px_#18181B] hover:-translate-y-0.5'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#EF4444]" />
                    <span>Forging Punchline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-[#EF4444]" />
                    <span>Create a meme</span>
                  </>
                )}
              </button>
            </div>

            {/* Engine Workflow Indicator */}
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-stone-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Search-First Engine Active</span>
              </span>
              <span className="text-stone-400 hidden sm:inline">
                Finds cultural reactions or auto-forges original AI meme if no match exists
              </span>
            </div>
          </div>

          {/* Quick starter chips (Full scenarios, no clipping, graceful wrapping) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-600">
                Instant Scenario Sparks:
              </span>
              <span className="text-[10px] font-bold text-stone-400 hidden sm:inline">
                Click any scenario to populate prompt
              </span>
            </div>
            <div className="flex flex-wrap gap-2 max-w-full">
              {QUICK_STARTERS.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(item)}
                  className="rounded-lg border-2 border-black bg-white hover:bg-[#FEF08A] hover:-translate-y-0.5 active:translate-y-0 px-3 py-1.5 text-xs font-bold text-black text-left transition-all shadow-[2px_2px_0px_#18181B] leading-snug cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Eye-catching Sample Meme Preview (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md">
            
            {/* Playful top tape strip */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 w-32 h-6 tape-strip rounded-sm border border-black/20 flex items-center justify-center text-[10px] font-mono font-bold text-black uppercase tracking-wider select-none">
              SAMPLE PRINT
            </div>

            {/* Poster Card */}
            <div className="rotate-1 hover:rotate-0 transition-transform duration-300 rounded-2xl border-2 border-black bg-white p-4 shadow-[8px_8px_0px_#18181B]">
              
              {/* Header inside poster */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-black">
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-[#EF4444] px-1.5 py-0.5 font-mono text-[10px] font-black uppercase text-white border border-black">
                    {sample.tag}
                  </span>
                  <span className="font-display text-xs font-black text-black">
                    {sample.templateName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={nextSample}
                  title="Cycle to next sample meme"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Next sample ({sampleIndex + 1}/{SAMPLE_MEMES.length})</span>
                </button>
              </div>

              {/* Meme Image with classic overlay caption */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border-2 border-black bg-stone-900 group">
                <img
                  src={sample.imgUrl}
                  alt={sample.templateName}
                  className="h-full w-full object-cover select-none"
                />

                {/* Classic meme overlay text preview */}
                <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none text-center">
                  <span className="meme-impact text-lg sm:text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] stroke-black leading-tight">
                    {sample.topCaption}
                  </span>
                  <span className="meme-impact text-lg sm:text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] stroke-black leading-tight">
                    {sample.bottomCaption}
                  </span>
                </div>
              </div>

              {/* Bottom Interactive Bar */}
              <div className="mt-3 pt-2.5 border-t-2 border-black flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                    Premise:
                  </span>
                  <p className="text-xs font-bold text-black truncate" title={sample.promptExample}>
                    "{sample.promptExample}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApplySample}
                  title="Load this sample and generate meme"
                  className="flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#FEF08A] hover:bg-[#FDE047] px-3.5 py-1.5 text-xs font-black text-black neo-btn shrink-0 cursor-pointer shadow-[2px_2px_0px_#18181B]"
                >
                  <span>Use This</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Cute bottom sticker stamp */}
            <div className="absolute -bottom-3 -left-3 rotate-[-6deg] rounded-full border-2 border-black bg-[#EF4444] px-3 py-1 text-[11px] font-black text-white shadow-[2px_2px_0px_#18181B] select-none">
              100% ORGANIC HUMOR 🤌
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
