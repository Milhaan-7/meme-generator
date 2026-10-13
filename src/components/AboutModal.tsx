import React from 'react';
import { X, Sparkles, Database, Shield, Cpu, Code2 } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border-2 border-black bg-[#FAF7F2] p-6 shadow-[8px_8px_0px_#18181B]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-white text-black hover:bg-[#EF4444] hover:text-white neo-btn"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black bg-[#FEF08A] text-2xl shadow-[3px_3px_0px_#18181B]">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-2xl font-black text-black">LOLLAB</h3>
              <span className="rounded border border-black bg-[#EF4444] px-1.5 py-0.2 font-mono text-[10px] font-black text-white">
                v2.0
              </span>
            </div>
            <p className="text-xs text-stone-600 font-bold uppercase tracking-wider">
              Reaction Forge & Cultural Archive
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-800">
          <p className="font-medium leading-relaxed">
            LOLLAB rejects cookie-cutter AI dashboards. It operates as an art-directed reaction laboratory bridging modern natural language humor with iconic internet history.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#18181B]">
              <div className="flex items-center gap-2 font-black text-black text-xs mb-1">
                <Cpu className="h-4 w-4 text-[#2563EB]" />
                <span>Gemini 3.8 Cognition</span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium">
                Interprets subtext, situational irony, and comedic punchlines rather than naive keyword stuffing.
              </p>
            </div>

            <div className="rounded-xl border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#18181B]">
              <div className="flex items-center gap-2 font-black text-black text-xs mb-1">
                <Code2 className="h-4 w-4 text-[#EF4444]" />
                <span>HTML5 Canvas Compositor</span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium">
                High-DPI vector text rendering prevents misspelled AI artifacts and exports crisp PNGs instantly.
              </p>
            </div>

            <div className="rounded-xl border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#18181B]">
              <div className="flex items-center gap-2 font-black text-black text-xs mb-1">
                <Database className="h-4 w-4 text-[#2563EB]" />
                <span>Verified Archive Index</span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium">
                Curated and live 100+ templates with Know Your Meme links, box metrics, and semantic tags.
              </p>
            </div>

            <div className="rounded-xl border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#18181B]">
              <div className="flex items-center gap-2 font-black text-black text-xs mb-1">
                <Shield className="h-4 w-4 text-[#84CC16]" />
                <span>CORS-Protected Proxy</span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium">
                Full-stack Express architecture guarantees safe canvas drawing without tainted cross-origin blocks.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t-2 border-black/10 text-[11px] font-bold text-stone-500 font-mono">
            Crafted with React 19, TypeScript, Express, and Google Gemini API.
          </div>
        </div>
      </div>
    </div>
  );
};
