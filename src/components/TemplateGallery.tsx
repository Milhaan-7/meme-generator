import React, { useState, useEffect } from 'react';
import { LayoutGrid, Search, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { MemeTemplate } from '../types.ts';

interface TemplateGalleryProps {
  onSelectTemplate: (template: MemeTemplate) => void;
}

const CATEGORIES = [
  'all',
  'relatable',
  'sarcasm',
  'struggle',
  'reaction',
  'decision',
  'comparison',
  'absurd',
] as const;

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Failed to load templates', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      activeCategory === 'all' || template.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 my-6">
      {/* Header Bar */}
      <div className="rounded-2xl border-2 border-black bg-white p-5 sm:p-7 shadow-[6px_6px_0px_#18181B]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-md border-2 border-black bg-[#FEF08A] px-2.5 py-0.5 text-[10px] font-black uppercase text-black shadow-[2px_2px_0px_#18181B] mb-1">
              CULTURAL VAULT
            </span>
            <h2 className="font-display text-2xl font-black text-black">
              Classic Meme Archive
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
              Over 100 verified high-resolution templates documented through Know Your Meme.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name..."
              className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] py-2.5 pl-9 pr-3 text-xs sm:text-sm font-medium text-black placeholder-stone-400 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t-2 border-black/10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1 text-xs font-black capitalize border-2 transition-all ${
                activeCategory === cat
                  ? 'border-black bg-[#FEF08A] text-black shadow-[2px_2px_0px_#18181B]'
                  : 'border-black/20 bg-white text-stone-600 hover:border-black hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
            <span className="text-xs font-bold text-stone-600">Loading Cultural Vault...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTemplates.map((template) => (
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
                <span className="absolute bottom-2 left-2 rounded border border-black bg-white px-1.5 py-0.5 text-[9px] font-black text-black uppercase">
                  {template.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-3">
                <h4 className="font-display font-black text-xs sm:text-sm text-black line-clamp-1">
                  {template.name}
                </h4>

                <div className="mt-auto pt-3 flex items-center justify-between gap-1 border-t-2 border-black/10">
                  {template.sourceUrl && (
                    <a
                      href={template.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-stone-500 hover:text-black"
                    >
                      History
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template)}
                    className="flex items-center gap-1 rounded-lg border-2 border-black bg-[#FEF08A] px-2.5 py-1 text-[11px] font-black text-black neo-btn"
                  >
                    <span>Use</span>
                    <ArrowRight className="h-3 w-3" />
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
