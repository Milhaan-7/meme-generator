import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { CURATED_MEMES, MemeTemplate } from './server/memeData.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Safe text generation helper with automatic timeout and fallback
async function callGeminiText(prompt: string, systemInstruction?: string, responseSchema?: any): Promise<string> {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (responseSchema) {
        config.responseMimeType = 'application/json';
        config.responseSchema = responseSchema;
      }

      // 7-second timeout race per model to prevent hanging
      const callPromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after 7s on ${model}`)), 7000)
      );

      const response = await Promise.race([callPromise, timeoutPromise]);

      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini] Model ${model} failed with: ${err.message}. Trying next fallback...`);
    }
  }

  throw lastError || new Error('All Gemini text models failed to respond.');
}

// In-memory cache for live Imgflip memes combined with curated metadata
let cachedAllMemes: MemeTemplate[] = [...CURATED_MEMES];
let lastFetchTime = 0;

async function getAllMemes(): Promise<MemeTemplate[]> {
  const now = Date.now();
  if (now - lastFetchTime < 1000 * 60 * 30 && cachedAllMemes.length > CURATED_MEMES.length) {
    return cachedAllMemes;
  }

  try {
    const res = await fetch('https://api.imgflip.com/get_memes');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.memes)) {
        const liveMemes = data.data.memes;
        const curatedMap = new Map(CURATED_MEMES.map((m) => [m.id, m]));

        const combined: MemeTemplate[] = [];

        // Add curated first with rich metadata
        for (const curated of CURATED_MEMES) {
          combined.push(curated);
        }

        // Add any additional top memes from live feed not in curated list
        for (const item of liveMemes) {
          if (!curatedMap.has(item.id)) {
            const cleanName = item.name.trim();
            combined.push({
              id: item.id,
              name: cleanName,
              url: item.url,
              width: item.width,
              height: item.height,
              box_count: item.box_count || 2,
              description: `Classic meme template: ${cleanName}`,
              category: 'relatable',
              tags: cleanName.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2),
              emotions: ['relatable', 'funny'],
              situations: [`Situations fitting ${cleanName}`],
              sourceUrl: `https://imgflip.com/meme/${item.id}`,
              defaultTopText: 'Top Text',
              defaultBottomText: 'Bottom Text',
            });
          }
        }

        cachedAllMemes = combined;
        lastFetchTime = now;
      }
    }
  } catch (err) {
    console.warn('[Imgflip] Failed to fetch live memes, using curated list:', err);
  }

  return cachedAllMemes;
}

// In-memory recent generations store (session-scoped)
interface GenerationRecord {
  id: string;
  prompt: string;
  tone: string;
  punchline: string;
  topText: string;
  bottomText: string;
  captionHeader: string;
  templateName?: string;
  imageUrl?: string;
  generatedImageData?: string;
  createdAt: string;
}
const recentGenerations: GenerationRecord[] = [];

// API: Get all meme templates
app.get('/api/templates', async (_req: Request, res: Response) => {
  try {
    const memes = await getAllMemes();
    res.json({ success: true, count: memes.length, templates: memes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Image proxy to eliminate CORS issues on client HTML canvas
app.get('/api/proxy-image', async (req: Request, res: Response) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing url query parameter' });
    }

    // Only allow verified domains or standard http/https
    const parsed = new URL(imageUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid URL protocol' });
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (MemeForge-AI)',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch source image' });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Generate Meme
app.post('/api/generate-meme', async (req: Request, res: Response) => {
  try {
    const { prompt, tone = 'Relatable', language = 'English', mode = 'auto', templateId } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a valid meme description or scenario.' });
    }

    if (prompt.length > 500) {
      return res.status(400).json({ error: 'Prompt is too long (maximum 500 characters).' });
    }

    const allMemes = await getAllMemes();

    // Step 1: Use Gemini to analyze the scenario and generate crisp captions + template selection
    const systemPrompt = `You are MemeForge AI, an expert comedic scriptwriter, internet meme historian, and visual satirist.
Given a user's scenario description and desired tone (${tone}) in ${language}:
1. Interpret the underlying comedic conflict, irony, or relatable frustration.
2. Formulate sharp, concise text:
   - "punchline": A one-line killer summary of the joke.
   - "topText": The setup or situational hook (under 12 words, punchy).
   - "bottomText": The twist, punchline, or reaction (under 12 words).
   - "captionHeader": A modern social media/Twitter meme caption format (e.g. "Nobody: / Me:", "My brain at 3 AM:", "When you...").
   - "visualConcept": A vivid description of what the visual scene or character looks like.
   - "recommendedTemplateId": Choose the ID of the best matching meme template from this list:
     ${CURATED_MEMES.map((m) => `${m.id}: "${m.name}" (${m.description})`).join('\n     ')}
   - "templateReasoning": 1 sentence explaining why this template captures the exact comedic dynamic.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        punchline: { type: Type.STRING },
        topText: { type: Type.STRING },
        bottomText: { type: Type.STRING },
        captionHeader: { type: Type.STRING },
        visualConcept: { type: Type.STRING },
        recommendedTemplateId: { type: Type.STRING },
        templateReasoning: { type: Type.STRING },
      },
      required: ['punchline', 'topText', 'bottomText', 'captionHeader', 'visualConcept', 'recommendedTemplateId'],
    };

    const userPrompt = `User scenario: "${prompt}"\nTone: ${tone}\nLanguage: ${language}`;

    let parsedHumor: any;
    try {
      const textResult = await callGeminiText(userPrompt, systemPrompt, schema);
      parsedHumor = JSON.parse(textResult);
    } catch (geminiErr: any) {
      console.warn('[Gemini Text Generation Fallback]:', geminiErr.message);
      // Smart local heuristic fallback
      const words = prompt.trim().split(/\s+/);
      const half = Math.ceil(words.length / 2);
      const topHalf = words.slice(0, half).join(' ');
      const bottomHalf = words.slice(half).join(' ');

      // Pick template based on prompt keywords
      const lower = prompt.toLowerCase();
      let bestId = '181913649'; // Drake
      if (lower.includes('exam') || lower.includes('study') || lower.includes('homework')) {
        bestId = '55311130'; // This is fine
      } else if (lower.includes('friend') || lower.includes('cancel') || lower.includes('disappoint')) {
        bestId = '222403160'; // Disappointed fan
      } else if (lower.includes('choose') || lower.includes('decision') || lower.includes('button')) {
        bestId = '87743120'; // Two buttons
      } else if (lower.includes('bug') || lower.includes('code') || lower.includes('program')) {
        bestId = '97984'; // Disaster girl
      } else if (lower.includes('cat') || lower.includes('yell') || lower.includes('blame')) {
        bestId = '188390772'; // Woman yelling at cat
      }

      parsedHumor = {
        punchline: prompt,
        topText: topHalf || 'When this happens',
        bottomText: bottomHalf || 'Realizing the truth',
        captionHeader: `When: ${prompt}`,
        visualConcept: `A relatable meme scenario capturing: ${prompt}`,
        recommendedTemplateId: bestId,
        templateReasoning: 'Matches key themes of the scenario.',
      };
    }

    // Resolve template
    const selectedTemplateId = templateId || parsedHumor.recommendedTemplateId || '181913649';
    let matchedTemplate = allMemes.find((m) => m.id === selectedTemplateId) || CURATED_MEMES[0];

    let generatedImageData: string | null = null;
    let imageGenStatus: 'success' | 'quota_limited' | 'skipped' = 'skipped';
    let imageGenMessage: string | null = null;

    // Step 2: Attempt image generation if mode is 'ai_scene'
    if (mode === 'ai_scene') {
      try {
        const imagePrompt = `A high quality, vivid, hilarious satirical meme illustration. ${parsedHumor.visualConcept}. Clean comic/satirical art style, bright lighting, funny expressive faces, no distorted text.`;
        const imgResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: imagePrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: '1:1',
            },
          },
        });

        for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData && part.inlineData.data) {
            generatedImageData = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            imageGenStatus = 'success';
            break;
          }
        }
      } catch (imgErr: any) {
        console.warn('[Gemini Image Gen Notice]:', imgErr.message);
        imageGenStatus = 'quota_limited';
        imageGenMessage =
          'Google Gemini visual model free-tier quota is limited (requires billing setup). LOLLAB has preserved a fully functional caption-over-template canvas.';
      }
    }

    const record: GenerationRecord = {
      id: 'gen_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      prompt,
      tone,
      punchline: parsedHumor.punchline,
      topText: parsedHumor.topText,
      bottomText: parsedHumor.bottomText,
      captionHeader: parsedHumor.captionHeader,
      templateName: matchedTemplate.name,
      imageUrl: matchedTemplate.url,
      generatedImageData: generatedImageData || undefined,
      createdAt: new Date().toISOString(),
    };

    // Store in recent list
    recentGenerations.unshift(record);
    if (recentGenerations.length > 50) recentGenerations.pop();

    res.json({
      success: true,
      data: {
        id: record.id,
        prompt,
        tone,
        punchline: parsedHumor.punchline,
        topText: parsedHumor.topText,
        bottomText: parsedHumor.bottomText,
        captionHeader: parsedHumor.captionHeader,
        visualConcept: parsedHumor.visualConcept,
        matchedTemplate,
        templateReasoning: parsedHumor.templateReasoning,
        generatedImageData,
        imageGenStatus,
        imageGenMessage,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/generate-meme:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred while generating the meme.',
    });
  }
});

// API: Discover Memes (Semantic search)
app.post('/api/discover-memes', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a search query or scenario.' });
    }

    const allMemes = await getAllMemes();

    // Step 1: Use Gemini to extract semantic concepts, emotions, and meme archetypes
    const systemPrompt = `You are a meme discovery and semantic search engine.
Analyze the user's description of a situation, reaction, or emotion:
- Extract key keywords, emotional states, situational archetypes, and comedic themes.
- Return 5-10 search keywords or related terms.
- From the given list of iconic meme IDs, rank the top matching template IDs that genuinely fit this situation, along with a 1-sentence explanation of why it fits.

Available meme templates:
${allMemes.slice(0, 35).map((m) => `ID ${m.id}: "${m.name}" - ${m.description} [Tags: ${m.tags.join(', ')}]`).join('\n')}`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        interpretedIntent: { type: Type.STRING },
        keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        emotions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        matchedRecommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              templateId: { type: Type.STRING },
              relevanceScore: { type: Type.NUMBER, description: 'Score between 60 and 99' },
              explanation: { type: Type.STRING },
            },
            required: ['templateId', 'relevanceScore', 'explanation'],
          },
        },
      },
      required: ['interpretedIntent', 'keywords', 'emotions', 'matchedRecommendations'],
    };

    let searchAnalysis: any;
    try {
      const searchAnalysisRaw = await callGeminiText(`Query: "${query}"`, systemPrompt, schema);
      searchAnalysis = JSON.parse(searchAnalysisRaw);
    } catch (geminiErr: any) {
      console.warn('[Gemini Discovery Fallback]:', geminiErr.message);
      searchAnalysis = {
        interpretedIntent: query,
        keywords: query.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
        emotions: ['relatable', 'humorous'],
        matchedRecommendations: [],
      };
    }

    // Step 2: Combine AI recommendations with local semantic scoring across all templates
    const searchTerms = [
      ...query.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
      ...(searchAnalysis.keywords || []).map((k: string) => k.toLowerCase()),
      ...(searchAnalysis.emotions || []).map((e: string) => e.toLowerCase()),
    ];

    const aiRecMap = new Map<string, { score: number; explanation: string }>();
    for (const rec of searchAnalysis.matchedRecommendations || []) {
      aiRecMap.set(rec.templateId, {
        score: rec.relevanceScore || 85,
        explanation: rec.explanation,
      });
    }

    const scoredResults = allMemes.map((template) => {
      let score = 0;
      let explanation = '';

      // Check if AI explicitly recommended this template
      if (aiRecMap.has(template.id)) {
        const aiRec = aiRecMap.get(template.id)!;
        score = aiRec.score;
        explanation = aiRec.explanation;
      } else {
        // Keyword & semantic tag matching
        const hayStack = (
          template.name +
          ' ' +
          template.description +
          ' ' +
          template.tags.join(' ') +
          ' ' +
          template.emotions.join(' ') +
          ' ' +
          template.situations.join(' ')
        ).toLowerCase();

        for (const term of searchTerms) {
          if (hayStack.includes(term)) {
            score += 15;
          }
        }

        // Cap keyword score between 20 and 80
        score = Math.min(score + 30, 80);
        explanation = `Matches relevant comedic traits: "${template.tags.slice(0, 3).join(', ')}".`;
      }

      return {
        ...template,
        relevanceScore: Math.min(Math.round(score), 99),
        explanation,
      };
    });

    // Sort by relevance score descending
    scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topResults = scoredResults.slice(0, 16);

    res.json({
      success: true,
      query,
      interpretedIntent: searchAnalysis.interpretedIntent,
      keywords: searchAnalysis.keywords,
      emotions: searchAnalysis.emotions,
      totalFound: topResults.length,
      results: topResults,
    });
  } catch (error: any) {
    console.error('Error in /api/discover-memes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search meme library.',
    });
  }
});

// API: Get history / recent generations
app.get('/api/history', (_req: Request, res: Response) => {
  res.json({
    success: true,
    history: recentGenerations,
  });
});

// Setup Vite middleware for local dev
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MemeForge AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
