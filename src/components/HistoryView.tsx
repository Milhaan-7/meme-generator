import React from 'react';
import { Clock, ArrowRight, Sparkles, Trash2, Flame } from 'lucide-react';
import { GeneratedMemeResponse } from '../types.ts';

interface HistoryViewProps {
  history: GeneratedMemeResponse[];
  onOpenInStudio: (meme: GeneratedMemeResponse) => void;
  onClearHistory: () => void;
  onStartCreating: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onOpenInStudio,
  onClearHistory,
  onStartCreating,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 my-6">
      {/* Title Card */}
      <div className="rounded-2xl border-2 border-black bg-white p-5 sm:p-7 shadow-[6px_6px_0px_#18181B] flex items-center justify-between">
        <div>
          <span className="inline-block rounded-md border-2 border-black bg-[#EF4444] px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-[2px_2px_0px_#18181B] mb-1">
            CREATOR WORKSPACE
          </span>
          <h2 className="font-display text-2xl font-black text-black">
            Recent Meme Bakes ({history.length})
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
            Your generated memes during this session. Reopen, edit text, or re-export anytime.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-bold text-[#DC2626] neo-btn"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-black/30 p-12 text-center bg-white/60">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-[#FEF08A] text-2xl shadow-[3px_3px_0px_#18181B]">
            ⚡
          </div>
          <h3 className="mt-4 font-display text-lg font-black text-black">
            No Memes Forged Yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs sm:text-sm text-stone-600 font-medium">
            Describe a scenario in the generator to bake your first meme and save it here.
          </p>
          <button
            onClick={onStartCreating}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-black bg-[#2563EB] px-5 py-2.5 text-xs sm:text-sm font-black text-white neo-btn shadow-[3px_3px_0px_#18181B]"
          >
            <Sparkles className="h-4 w-4" />
            <span>Forge First Meme</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0px_#18181B] hover:shadow-[6px_6px_0px_#18181B] transition-all"
            >
              <div className="relative aspect-video w-full overflow-hidden border-b-2 border-black bg-stone-900">
                <img
                  src={item.generatedImageData || item.matchedTemplate?.url}
                  alt={item.punchline}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 rounded-md border border-black bg-[#FEF08A] px-2 py-0.5 text-[10px] font-black uppercase text-black">
                  {item.tone}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h4 className="font-display font-black text-sm text-black line-clamp-2">
                  "{item.punchline}"
                </h4>

                <p className="mt-2 text-xs text-stone-500 font-medium line-clamp-2 italic">
                  Prompt: {item.prompt}
                </p>

                <div className="mt-auto pt-4 flex items-center justify-between border-t-2 border-black/10">
                  <span className="text-[11px] font-bold text-stone-500 font-mono">
                    {item.matchedTemplate?.name}
                  </span>

                  <button
                    onClick={() => onOpenInStudio(item)}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#2563EB] px-3 py-1.5 text-xs font-black text-white neo-btn"
                  >
                    <span>Open in Studio</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
