import React, { useState } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  Flame,
  Laugh,
  Skull,
  Heart,
  Lightbulb,
  Zap,
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { MemeTone } from '../types.ts';

interface MemeGeneratorProps {
  prompt: string;
  setPrompt: (val: string) => void;
  tone: MemeTone;
  setTone: (val: MemeTone) => void;
  language: string;
  setLanguage: (val: string) => void;
  mode: 'smart_template' | 'ai_scene';
  setMode: (val: 'smart_template' | 'ai_scene') => void;
  onGenerate: () => void;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
}

const TONES: { label: MemeTone; icon: any; color: string }[] = [
  { label: 'Relatable', icon: Laugh, color: 'bg-[#FEF08A]' },
  { label: 'Sarcastic', icon: Flame, color: 'bg-[#EF4444] text-white' },
  { label: 'Wholesome', icon: Heart, color: 'bg-[#FBCFE8]' },
  { label: 'Dark', icon: Skull, color: 'bg-stone-800 text-white' },
  { label: 'Absurd', icon: Zap, color: 'bg-[#93C5FD]' },
  { label: 'Witty', icon: Lightbulb, color: 'bg-[#BBF7D0]' },
];

const LANGUAGES = [
  { code: 'English', name: 'English' },
  { code: 'Spanish', name: 'Español' },
  { code: 'French', name: 'Français' },
  { code: 'German', name: 'Deutsch' },
  { code: 'Hindi', name: 'हिन्दी' },
  { code: 'Japanese', name: '日本語' },
];

export const MemeGenerator: React.FC<MemeGeneratorProps> = ({
  tone,
  setTone,
  language,
  setLanguage,
  mode,
  setMode,
  isLoading,
  loadingStep,
  error,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto my-4 space-y-4">
      {/* Comedic Tone Selector Bar */}
      <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#18181B]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs font-black uppercase tracking-wider text-black">
              Comedic Tone Tuning:
            </span>
            <span className="text-[11px] text-stone-500 font-medium">
              Changes comedic timing, irony, and phrasing
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#FAF7F2] px-2.5 py-1 text-xs font-bold text-black hover:bg-stone-200 transition-colors"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>{showAdvanced ? 'Hide Options' : 'Visual Engine & Language'}</span>
          </button>
        </div>

        {/* Tone Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {TONES.map((t) => {
            const Icon = t.icon;
            const isActive = tone === t.label;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setTone(t.label)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border-2 border-black p-2.5 text-xs font-black transition-all ${
                  isActive
                    ? `${t.color} shadow-[3px_3px_0px_#18181B] -translate-y-0.5`
                    : 'bg-[#FAF7F2] text-stone-700 hover:bg-white hover:text-black'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Advanced Drawer */}
        {showAdvanced && (
          <div className="mt-4 pt-3 border-t-2 border-black/10 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* Visual Engine Mode */}
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1.5">
                Visual Composition Pipeline
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('smart_template')}
                  className={`rounded-xl border-2 border-black p-2.5 text-left text-xs transition-all ${
                    mode === 'smart_template'
                      ? 'bg-[#FEF08A] font-black shadow-[2px_2px_0px_#18181B]'
                      : 'bg-white font-medium text-stone-600 hover:text-black'
                  }`}
                >
                  <div className="font-bold text-black">Smart Template</div>
                  <div className="text-[10px] text-stone-600 mt-0.5">
                    Authentic classic templates (Drake, Distracted, etc.)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('ai_scene')}
                  className={`rounded-xl border-2 border-black p-2.5 text-left text-xs transition-all ${
                    mode === 'ai_scene'
                      ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#18181B]'
                      : 'bg-white font-medium text-stone-600 hover:text-black'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1">
                    <span>AI Scene Model</span>
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Prompts Gemini visual model
                  </div>
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1.5">
                Punchline Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full appearance-none rounded-xl border-2 border-black bg-white px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <Globe className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-black" />
              </div>
              <p className="mt-1 text-[10px] font-medium text-stone-500">
                Humor is culturally translated with native phrasing.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border-2 border-black bg-[#FEE2E2] p-3 text-xs font-bold text-[#DC2626] flex items-center gap-2 shadow-[2px_2px_0px_#18181B]">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Banner */}
      {isLoading && (
        <div className="rounded-xl border-2 border-black bg-[#FEF08A] p-3 text-center text-xs font-black text-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_#18181B] animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin text-black" />
          <span>{loadingStep || 'Forging punchline with Gemini...'}</span>
        </div>
      )}
    </div>
  );
};
