export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
  description: string;
  category: 'relatable' | 'sarcasm' | 'struggle' | 'reaction' | 'decision' | 'comparison' | 'absurd';
  tags: string[];
  emotions: string[];
  situations: string[];
  sourceUrl: string;
  defaultTopText?: string;
  defaultBottomText?: string;
  relevanceScore?: number;
  explanation?: string;
}

export type MemeTone = 'Relatable' | 'Sarcastic' | 'Wholesome' | 'Dark' | 'Absurd' | 'Witty';

export interface GeneratedMemeResponse {
  id: string;
  prompt: string;
  tone: MemeTone;
  punchline: string;
  topText: string;
  bottomText: string;
  captionHeader: string;
  visualConcept: string;
  matchedTemplate: MemeTemplate;
  templateReasoning?: string;
  generatedImageData?: string | null;
  imageGenStatus: 'success' | 'quota_limited' | 'skipped';
  imageGenMessage?: string | null;
}

export interface DiscoveryResponse {
  success: boolean;
  query: string;
  interpretedIntent: string;
  keywords: string[];
  emotions: string[];
  totalFound: number;
  results: MemeTemplate[];
}
