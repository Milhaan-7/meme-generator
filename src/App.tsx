import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { MemeGenerator } from './components/MemeGenerator.tsx';
import { MemeCanvasStudio } from './components/MemeCanvasStudio.tsx';
import { MemeDiscovery } from './components/MemeDiscovery.tsx';
import { TemplateGallery } from './components/TemplateGallery.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { AboutModal } from './components/AboutModal.tsx';
import { LoginModal, UserProfile } from './components/LoginModal.tsx';
import { TemplatePickerModal } from './components/TemplatePickerModal.tsx';
import { Footer } from './components/Footer.tsx';
import { GeneratedMemeResponse, MemeTemplate, MemeTone } from './types.ts';
import { CURATED_MEMES } from '../server/memeData.ts';

const DEFAULT_USER: UserProfile = {
  name: 'Guest Critic',
  handle: '@guest_creator',
  avatar: '🐸',
  isLoggedIn: false,
  memberTier: 'Guest',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'discover' | 'templates' | 'history'>('generate');

  // Generator & Prompt states
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<MemeTone>('Relatable');
  const [language, setLanguage] = useState('English');
  const [mode, setMode] = useState<'smart_template' | 'ai_scene'>('smart_template');
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);

  // Status flags
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentMeme, setCurrentMeme] = useState<GeneratedMemeResponse | null>(null);

  // History & Discovery
  const [history, setHistory] = useState<GeneratedMemeResponse[]>([]);
  const [discoveryInitialQuery, setDiscoveryInitialQuery] = useState('');

  // User Profile & Modals
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Load stored session / history on start
  useEffect(() => {
    try {
      const savedHistory = sessionStorage.getItem('lollab_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      const savedUser = localStorage.getItem('lollab_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('lollab_user', JSON.stringify(user));
    } catch (e) {}
  };

  const handleLogout = () => {
    setCurrentUser(DEFAULT_USER);
    try {
      localStorage.removeItem('lollab_user');
    } catch (e) {}
  };

  const saveToHistory = (item: GeneratedMemeResponse) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((p) => p.id !== item.id)].slice(0, 30);
      try {
        sessionStorage.setItem('lollab_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // 1. "Create a meme" action
  const handleCreateMeme = async (
    forcedPrompt = prompt,
    forcedTemplate = selectedTemplate,
    forcedMode = mode
  ) => {
    const finalPrompt = forcedPrompt.trim();
    if (!finalPrompt) return;

    setIsGenerating(true);
    setGenerationError(null);
    setLoadingStep('Interpreting comedic conflict & irony...');

    const timer1 = setTimeout(() => {
      setLoadingStep('Forging punchline & comedic phrasing...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setLoadingStep('Composing high-resolution canvas...');
    }, 2400);

    try {
      const res = await fetch('/api/generate-meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          tone,
          language,
          mode: forcedMode,
          templateId: forcedTemplate?.id,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate meme. Please try again.');
      }

      const memeResult: GeneratedMemeResponse = data.data;
      setCurrentMeme(memeResult);
      saveToHistory(memeResult);
      setActiveTab('generate');

      setTimeout(() => {
        document.getElementById('meme-studio-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setGenerationError(err.message || 'Failed to generate meme.');
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  // 2. "Find a meme" action
  const handleFindMeme = (searchQuery = prompt) => {
    const finalQuery = searchQuery.trim();
    if (!finalQuery) return;

    setDiscoveryInitialQuery(finalQuery);
    setActiveTab('discover');
  };

  // Sample meme from hero clicked
  const handleSelectSampleTemplate = (template: MemeTemplate, initialPrompt: string) => {
    setSelectedTemplate(template);
    setPrompt(initialPrompt);
    handleCreateMeme(initialPrompt, template);
  };

  // Select template from Archive or Discovery
  const handleSelectTemplateForMeme = (template: MemeTemplate, initialText?: string) => {
    setSelectedTemplate(template);
    if (initialText) {
      setPrompt(initialText);
    }
    setActiveTab('generate');

    if (currentMeme) {
      setCurrentMeme({
        ...currentMeme,
        matchedTemplate: template,
        generatedImageData: null,
      });
    } else if (initialText) {
      handleCreateMeme(initialText, template);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#18181B] selection:bg-[#FEF08A] selection:text-black flex flex-col bg-paper-grid">
      {/* Editorial Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-8">
        {/* Asymmetric Hero with Large Prompt & Sample Meme Preview */}
        <Hero
          prompt={prompt}
          setPrompt={setPrompt}
          onFindMeme={() => handleFindMeme()}
          onCreateMeme={() => handleCreateMeme()}
          isGenerating={isGenerating}
          isSearching={isSearching}
          onSelectSampleTemplate={handleSelectSampleTemplate}
        />

        {/* Workspace Tab 1: Studio & Generator */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            <MemeGenerator
              prompt={prompt}
              setPrompt={setPrompt}
              tone={tone}
              setTone={setTone}
              language={language}
              setLanguage={setLanguage}
              mode={mode}
              setMode={setMode}
              onGenerate={() => handleCreateMeme()}
              isLoading={isGenerating}
              loadingStep={loadingStep}
              error={generationError}
            />

            {/* If a meme was generated, render the interactive Canvas Studio */}
            {currentMeme && (
              <div id="meme-studio-section">
                <MemeCanvasStudio
                  memeData={currentMeme}
                  onRegenerate={() => handleCreateMeme()}
                  onChangeTemplate={() => setIsPickerOpen(true)}
                  isRegenerating={isGenerating}
                />
              </div>
            )}

            {/* Landing Page Culture Archive Spotlight Gallery (Item 10) */}
            <div className="pt-8 border-t-2 border-black/10">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <span className="rounded-md border border-black bg-[#2563EB] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-white shadow-[1px_1px_0px_#18181B]">
                    CULTURE ARCHIVE SPOTLIGHT
                  </span>
                  <h3 className="font-display font-black text-xl text-black mt-1">
                    Popular Reaction Formats
                  </h3>
                  <p className="text-xs text-stone-600 font-medium">
                    Verified meme templates documented through Know Your Meme. Select any template to forge a custom reaction.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('discover')}
                  className="rounded-xl border-2 border-black bg-[#FEF08A] hover:bg-[#FDE047] px-3.5 py-1.5 text-xs font-black text-black neo-btn cursor-pointer shadow-[2px_2px_0px_#18181B]"
                >
                  <span>Open Full Archive Search →</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {CURATED_MEMES.slice(0, 4).map((template) => (
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
                      <h4 className="font-display font-black text-xs sm:text-sm text-black line-clamp-1">
                        {template.name}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-stone-500 line-clamp-1">
                        {template.situations?.[0] || template.description}
                      </p>

                      <div className="mt-auto pt-2.5 flex items-center justify-between gap-1 border-t-2 border-black/10">
                        {template.sourceUrl && (
                          <a
                            href={template.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-stone-500 hover:text-black"
                          >
                            Source
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSelectTemplateForMeme(template, template.situations?.[0])}
                          className="rounded-lg border-2 border-black bg-[#FEF08A] px-2.5 py-0.5 text-[11px] font-black text-black neo-btn"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Workspace Tab 2: Semantic Meme Discovery Gallery */}
        {activeTab === 'discover' && (
          <MemeDiscovery
            initialQuery={discoveryInitialQuery}
            onSelectTemplateForGeneration={(template, query) =>
              handleSelectTemplateForMeme(template, query)
            }
            onTriggerGeneration={(query) => {
              setPrompt(query);
              setMode('ai_scene');
              setActiveTab('generate');
              handleCreateMeme(query, null, 'ai_scene');
            }}
          />
        )}

        {/* Workspace Tab 3: Classic Template Vault Archive */}
        {activeTab === 'templates' && (
          <TemplateGallery
            onSelectTemplate={(template) => handleSelectTemplateForMeme(template)}
          />
        )}

        {/* Workspace Tab 4: User Session History (My Bakes) */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onOpenInStudio={(item) => {
              setCurrentMeme(item);
              setActiveTab('generate');
            }}
            onClearHistory={() => {
              setHistory([]);
              sessionStorage.removeItem('lollab_history');
            }}
            onStartCreating={() => setActiveTab('generate')}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <Footer onSelectTab={(tab) => setActiveTab(tab)} />

      {/* Auth / Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* About Zine Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Template Switcher Modal */}
      <TemplatePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(t) => {
          if (currentMeme) {
            setCurrentMeme({
              ...currentMeme,
              matchedTemplate: t,
              generatedImageData: null,
            });
          }
        }}
        currentTemplateId={currentMeme?.matchedTemplate?.id}
      />
    </div>
  );
}
