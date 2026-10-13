import React, { useRef, useEffect, useState } from 'react';
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Share2,
  AlertCircle
} from 'lucide-react';
import { GeneratedMemeResponse } from '../types.ts';

interface MemeCanvasStudioProps {
  memeData: GeneratedMemeResponse;
  onRegenerate: () => void;
  onChangeTemplate: () => void;
  isRegenerating: boolean;
}

export const MemeCanvasStudio: React.FC<MemeCanvasStudioProps> = ({
  memeData,
  onRegenerate,
  onChangeTemplate,
  isRegenerating,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Editable fields
  const [layoutMode, setLayoutMode] = useState<'classic' | 'modern_header'>('classic');
  const [topText, setTopText] = useState(memeData.topText || '');
  const [bottomText, setBottomText] = useState(memeData.bottomText || '');
  const [headerText, setHeaderText] = useState(memeData.captionHeader || memeData.punchline || '');
  const [fontSize, setFontSize] = useState<number>(38);
  const [fontFamily, setFontFamily] = useState<'Anton' | 'Space Grotesk' | 'Inter'>('Anton');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setTopText(memeData.topText || '');
    setBottomText(memeData.bottomText || '');
    setHeaderText(memeData.captionHeader || memeData.punchline || '');
  }, [memeData]);

  const getSafeImageSrc = (): string => {
    if (memeData.generatedImageData) {
      return memeData.generatedImageData;
    }
    const rawUrl = memeData.matchedTemplate?.url;
    if (!rawUrl) return '';
    return `/api/proxy-image?url=${encodeURIComponent(rawUrl)}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setLoadError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const naturalW = img.naturalWidth || 800;
      const naturalH = img.naturalHeight || 800;

      const maxW = 900;
      let targetW = naturalW;
      let targetH = naturalH;

      if (targetW > maxW) {
        const ratio = maxW / targetW;
        targetW = maxW;
        targetH = Math.round(naturalH * ratio);
      }

      let headerHeight = 0;
      if (layoutMode === 'modern_header') {
        headerHeight = Math.max(120, Math.round(targetH * 0.22));
      }

      canvas.width = targetW;
      canvas.height = targetH + headerHeight;

      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (layoutMode === 'modern_header') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, headerHeight);

        // Border line under header
        ctx.fillStyle = '#18181B';
        ctx.fillRect(0, headerHeight - 2, targetW, 2);

        ctx.fillStyle = '#18181B';
        ctx.font = `bold ${Math.round(fontSize * 0.72)}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const padding = 24;
        const maxTextW = targetW - padding * 2;
        wrapAndDrawText(ctx, headerText, padding, padding, maxTextW, Math.round(fontSize * 0.95), false);

        ctx.drawImage(img, 0, headerHeight, targetW, targetH);
      } else {
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const chosenFont = fontFamily === 'Anton' ? "'Anton', Impact, 'Arial Black', sans-serif" : `'${fontFamily}', sans-serif`;
        ctx.font = `900 ${fontSize}px ${chosenFont}`;
        ctx.fillStyle = textColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.15));
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.textAlign = 'center';

        const topStr = uppercase ? topText.toUpperCase() : topText;
        const bottomStr = uppercase ? bottomText.toUpperCase() : bottomText;

        if (topStr) {
          ctx.textBaseline = 'top';
          wrapAndDrawText(ctx, topStr, targetW / 2, 20, targetW * 0.9, fontSize * 1.15, true);
        }

        if (bottomStr) {
          ctx.textBaseline = 'bottom';
          wrapAndDrawText(ctx, bottomStr, targetW / 2, targetH - 24, targetW * 0.9, fontSize * 1.15, true, true);
        }
      }
    };

    img.onerror = () => {
      setLoadError('Failed to load meme base image. Please select another template.');
    };

    img.src = getSafeImageSrc();
  }, [
    memeData,
    layoutMode,
    topText,
    bottomText,
    headerText,
    fontSize,
    fontFamily,
    textColor,
    strokeColor,
    uppercase,
  ]);

  const wrapAndDrawText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    isStroke: boolean,
    fromBottom = false
  ) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    if (fromBottom) {
      const totalH = lines.length * lineHeight;
      let startY = y - totalH + lineHeight;
      for (const line of lines) {
        if (isStroke) ctx.strokeText(line, x, startY);
        ctx.fillText(line, x, startY);
        startY += lineHeight;
      }
    } else {
      let startY = y;
      for (const line of lines) {
        if (isStroke) ctx.strokeText(line, x, startY);
        ctx.fillText(line, x, startY);
        startY += lineHeight;
      }
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const cleanName = (memeData.punchline || memeData.matchedTemplate?.name || 'lollab')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 30);
      const link = document.createElement('a');
      link.download = `lollab-${cleanName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setLoadError('Unable to export image. Try right-clicking on the canvas to save.');
    }
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2200);
        } else {
          handleDownload();
        }
      }, 'image/png');
    } catch {
      handleDownload();
    }
  };

  const handleCopyCaption = () => {
    const fullCaption = `${topText}\n${bottomText}`.trim() || memeData.punchline;
    navigator.clipboard.writeText(fullCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2200);
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 animate-in fade-in duration-300">
      {/* Editorial Studio Wrapper Card */}
      <div className="rounded-2xl border-2 border-black bg-white shadow-[8px_8px_0px_#18181B] overflow-hidden">
        
        {/* Studio Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black bg-[#FEF08A] px-5 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            {memeData.generatedImageData ? (
              <span className="rounded-md border-2 border-black bg-[#2563EB] px-2.5 py-0.5 font-mono text-[11px] font-black uppercase text-white shadow-[1px_1px_0px_#18181B]">
                ORIGINAL AI GENERATED IMAGE 🤖
              </span>
            ) : (
              <span className="rounded-md border-2 border-black bg-[#EF4444] px-2.5 py-0.5 font-mono text-[11px] font-black uppercase text-white shadow-[1px_1px_0px_#18181B]">
                CULTURE ARCHIVE COMPOSITION 🎭
              </span>
            )}
            <span className="font-display font-black text-sm sm:text-base text-black">
              {memeData.matchedTemplate?.name || 'Custom Reaction'}
            </span>
            <span className="hidden sm:inline font-mono text-xs text-stone-700">
              ({memeData.tone} Tone)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onChangeTemplate}
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-bold text-black neo-btn"
            >
              <ImageIcon className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>Swap Template</span>
            </button>

            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#2563EB] px-3 py-1.5 text-xs font-bold text-white neo-btn disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Punchline</span>
            </button>
          </div>
        </div>

        {/* Actionable Fallback / Generation Transparency Banner */}
        {memeData.imageGenMessage && (
          <div className="border-b-2 border-black bg-[#FEF08A] px-4 py-2.5 text-xs font-bold text-black flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-black text-white px-2 py-0.5 font-mono text-[10px] font-black uppercase">
                AI ENGINE NOTICE
              </span>
              <span>{memeData.imageGenMessage}</span>
            </div>
            <span className="text-[10px] font-mono text-stone-700 hidden sm:inline">
              Format: High-Res Typography Canvas
            </span>
          </div>
        )}

        {/* Studio Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 bg-[#FAF7F2]">
          
          {/* Left Canvas Preview Area (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[540px] flex items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-stone-900 p-2 sm:p-4 shadow-[4px_4px_0px_#18181B] min-h-[380px]">
              {loadError ? (
                <div className="text-center p-6 text-white">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-[#EF4444]" />
                  <p className="text-sm font-bold">{loadError}</p>
                  <button
                    onClick={onChangeTemplate}
                    className="mt-3 rounded-lg border-2 border-black bg-[#FEF08A] px-3 py-1.5 text-xs font-bold text-black neo-btn"
                  >
                    Select Another Template
                  </button>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="max-h-[500px] w-auto max-w-full rounded-lg shadow-xl object-contain"
                />
              )}
            </div>

            {/* AI Comedic Logic Note */}
            {memeData.templateReasoning && (
              <div className="mt-3 w-full max-w-[540px] rounded-xl border-2 border-black bg-white p-3 text-xs font-medium text-black shadow-[2px_2px_0px_#18181B]">
                <span className="font-black text-[#2563EB]">WHY THIS WORKS: </span>
                {memeData.templateReasoning}
              </div>
            )}

            {/* Canvas Actions Bar */}
            <div className="mt-4 flex w-full max-w-[540px] flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black neo-btn"
                >
                  {copiedCaption ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-stone-500" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyImage}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black neo-btn"
                >
                  {copiedImage ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700">Image Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 text-stone-500" />
                      <span>Copy Image</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-xl border-2 border-black bg-[#EF4444] px-5 py-2.5 text-xs sm:text-sm font-black text-white neo-btn shadow-[3px_3px_0px_#18181B]"
              >
                <Download className="h-4 w-4" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>

          {/* Right Editor Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 rounded-xl border-2 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#18181B]">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#2563EB]" />
                <span className="font-display font-black text-sm text-black">
                  Type Customizer
                </span>
              </div>

              {/* Layout Switcher */}
              <div className="flex rounded-lg border-2 border-black bg-[#FAF7F2] p-0.5 text-[11px] font-black">
                <button
                  onClick={() => setLayoutMode('classic')}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    layoutMode === 'classic'
                      ? 'bg-[#FEF08A] text-black shadow-sm'
                      : 'text-stone-600 hover:text-black'
                  }`}
                >
                  Classic Overlay
                </button>
                <button
                  onClick={() => setLayoutMode('modern_header')}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    layoutMode === 'modern_header'
                      ? 'bg-[#FEF08A] text-black shadow-sm'
                      : 'text-stone-600 hover:text-black'
                  }`}
                >
                  Header Card
                </button>
              </div>
            </div>

            {/* Text Inputs */}
            {layoutMode === 'classic' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    Top Text Setup
                  </label>
                  <textarea
                    rows={2}
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    placeholder="Top punchline..."
                    className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] p-2.5 text-xs sm:text-sm font-bold text-black focus:bg-white focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    Bottom Text Punchline
                  </label>
                  <textarea
                    rows={2}
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    placeholder="Bottom punchline..."
                    className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] p-2.5 text-xs sm:text-sm font-bold text-black focus:bg-white focus:outline-none resize-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Card Header Text
                </label>
                <textarea
                  rows={3}
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="e.g. Nobody: / Me at 3 AM: ..."
                  className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] p-2.5 text-xs sm:text-sm font-bold text-black focus:bg-white focus:outline-none resize-none"
                />
              </div>
            )}

            {/* Typography Controls */}
            <div className="space-y-3 pt-2 border-t-2 border-black/10">
              {/* Font Choice */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-black">Font Family</span>
                <div className="flex gap-1">
                  {(['Anton', 'Space Grotesk', 'Inter'] as const).map((font) => (
                    <button
                      key={font}
                      onClick={() => setFontFamily(font)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold border-2 transition-all ${
                        fontFamily === font
                          ? 'border-black bg-[#FEF08A] text-black shadow-[2px_2px_0px_#18181B]'
                          : 'border-black/20 bg-white text-stone-600 hover:border-black'
                      }`}
                    >
                      {font === 'Anton' ? 'Impact' : font}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-black uppercase text-black">Scale: {fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="22"
                  max="62"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              {/* Uppercase Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-black">Force Uppercase</span>
                <button
                  type="button"
                  onClick={() => setUppercase(!uppercase)}
                  className={`h-6 w-11 rounded-full border-2 border-black transition-colors relative ${
                    uppercase ? 'bg-[#2563EB]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white border border-black transition-transform ${
                      uppercase ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Colors */}
              {layoutMode === 'classic' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-stone-600 mb-1">
                      Text Fill
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-7 w-7 rounded cursor-pointer border-2 border-black bg-transparent p-0"
                      />
                      <span className="text-xs font-mono font-bold text-black">{textColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-stone-600 mb-1">
                      Outline Stroke
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="h-7 w-7 rounded cursor-pointer border-2 border-black bg-transparent p-0"
                      />
                      <span className="text-xs font-mono font-bold text-black">{strokeColor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cultural Reference Link */}
            <div className="mt-auto pt-3 border-t-2 border-black/10 text-xs text-stone-600 flex items-center justify-between">
              <span className="font-bold">Template: {memeData.matchedTemplate?.name}</span>
              {memeData.matchedTemplate?.sourceUrl && (
                <a
                  href={memeData.matchedTemplate.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#2563EB] hover:underline"
                >
                  KnowYourMeme →
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
