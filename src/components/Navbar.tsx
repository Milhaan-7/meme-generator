import React from 'react';
import { Sparkles, Search, LayoutGrid, Clock, Info, User, Flame } from 'lucide-react';
import { UserProfile } from './LoginModal.tsx';

interface NavbarProps {
  activeTab: 'generate' | 'discover' | 'templates' | 'history';
  setActiveTab: (tab: 'generate' | 'discover' | 'templates' | 'history') => void;
  historyCount: number;
  currentUser: UserProfile;
  onOpenLogin: () => void;
  onOpenAbout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  currentUser,
  onOpenLogin,
  onOpenAbout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-[#FAF7F2] px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Brand: LOLLAB */}
        <div
          onClick={() => setActiveTab('generate')}
          className="group flex cursor-pointer items-center gap-2.5 transition-transform select-none"
        >
          <div className="flex items-center">
            <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-black">
              LOL<span className="inline-block bg-[#EF4444] text-white px-1.5 py-0.5 rounded-md border-2 border-black shadow-[2px_2px_0px_#18181B] -rotate-3 group-hover:rotate-0 transition-transform">LAB</span>
            </span>
          </div>
          <span className="hidden sm:inline-block border-l-2 border-black/20 pl-2.5 text-[11px] font-mono font-bold uppercase tracking-wider text-stone-500">
            Reaction Forge
          </span>
        </div>

        {/* Center Editorial Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold border-2 transition-all ${
              activeTab === 'generate'
                ? 'border-black bg-[#FEF08A] text-black shadow-[3px_3px_0px_#18181B]'
                : 'border-transparent text-stone-700 hover:border-black/30 hover:bg-white/60'
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#EF4444]" />
            <span>Make</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold border-2 transition-all ${
              activeTab === 'discover'
                ? 'border-black bg-[#2563EB] text-white shadow-[3px_3px_0px_#18181B]'
                : 'border-transparent text-stone-700 hover:border-black/30 hover:bg-white/60'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Find</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-bold border-2 transition-all ${
              activeTab === 'templates'
                ? 'border-black bg-white text-black shadow-[3px_3px_0px_#18181B]'
                : 'border-transparent text-stone-700 hover:border-black/30 hover:bg-white/60'
            }`}
            title="Culture Archive"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Archive</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold border-2 transition-all relative ${
              activeTab === 'history'
                ? 'border-black bg-[#EF4444] text-white shadow-[3px_3px_0px_#18181B]'
                : 'border-transparent text-stone-700 hover:border-black/30 hover:bg-white/60'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">My Bakes</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full border border-black bg-[#FEF08A] px-1 text-[10px] font-black text-black">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Session / Profile Controls */}
        <div className="flex items-center gap-2">
          {/* User Profile Button */}
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-black neo-btn"
          >
            <span className="text-base">{currentUser.avatar}</span>
            <span className="hidden sm:inline-block font-mono text-[11px]">
              {currentUser.handle}
            </span>
          </button>

          {/* Info Button */}
          <button
            type="button"
            onClick={onOpenAbout}
            title="About LOLLAB"
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white text-black neo-btn"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
