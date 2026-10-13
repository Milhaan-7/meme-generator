import React from 'react';

interface FooterProps {
  onSelectTab: (tab: 'generate' | 'discover' | 'templates' | 'history') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="mt-20 border-t-2 border-black bg-white py-10 px-4 sm:px-8">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-stone-600 font-bold">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="font-display text-2xl font-black tracking-tight text-black">
              LOL<span className="inline-block bg-[#EF4444] text-white px-1.5 py-0.5 rounded-md border-2 border-black shadow-[2px_2px_0px_#18181B] -rotate-3">LAB</span>
            </span>
          </div>
          <span className="text-black font-black">&bull;</span>
          <span className="text-stone-800">Your brain. Our memes.</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5 uppercase tracking-wider font-display font-black text-black">
          <button
            onClick={() => onSelectTab('generate')}
            className="hover:text-[#EF4444] transition-colors"
          >
            Studio
          </button>
          <button
            onClick={() => onSelectTab('discover')}
            className="hover:text-[#2563EB] transition-colors"
          >
            Archive Search
          </button>
          <button
            onClick={() => onSelectTab('templates')}
            className="hover:text-black transition-colors"
          >
            Templates
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className="hover:text-[#EF4444] transition-colors"
          >
            My Bakes
          </button>
        </div>

        <div className="text-[11px] font-mono text-stone-500">
          Independent creative reaction studio &bull; 2026
        </div>
      </div>
    </footer>
  );
};
