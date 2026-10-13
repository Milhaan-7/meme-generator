import React, { useState, useEffect } from 'react';
import { X, Search, Check, Loader2 } from 'lucide-react';
import { MemeTemplate } from '../types.ts';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: MemeTemplate) => void;
  currentTemplateId?: string;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentTemplateId,
}) => {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && templates.length === 0) {
      setLoading(true);
      fetch('/api/templates')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.templates)) {
            setTemplates(d.templates);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, templates.length]);

  if (!isOpen) return null;

  const filtered = templates.filter(
    (t) =>
      !search.trim() ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border-2 border-black bg-[#FAF7F2] shadow-[8px_8px_0px_#18181B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black px-6 py-4 bg-white">
          <div>
            <h3 className="font-display font-black text-lg text-black">
              Swap Meme Template
            </h3>
            <p className="text-xs text-stone-600 font-medium">
              Keep your current punchlines and re-render onto any classic format.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-white text-black hover:bg-[#EF4444] hover:text-white neo-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b-2 border-black/10 bg-[#FAF7F2]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name (e.g. Drake, Boyfriend, Two Buttons, Cat)..."
              className="w-full rounded-xl border-2 border-black bg-white py-2.5 pl-9 pr-3 text-xs sm:text-sm font-medium text-black placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((t) => {
                const isSelected = t.id === currentTemplateId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onSelect(t);
                      onClose();
                    }}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-black bg-[#FEF08A] shadow-[4px_4px_0px_#18181B] -translate-y-0.5'
                        : 'border-black/30 bg-white hover:border-black hover:shadow-[3px_3px_0px_#18181B]'
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden border-b-2 border-black/20 bg-stone-900">
                      <img
                        src={t.url}
                        alt={t.name}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border border-black bg-[#2563EB] text-white">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <span className="block font-display font-black text-xs text-black line-clamp-1">
                        {t.name}
                      </span>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">
                        {t.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
