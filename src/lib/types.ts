export interface NewsHeadline {
  title: string;
  url: string;
  source: string;
}

export interface Meme {
  id: string;
  imageUrl: string;
  caption: string;
  headline: string; // Context, could be headline or "user image"
  createdAt: string;
  aiHint: string;
}

export type MemeTone = "funny" | "sarcastic" | "inspirational" | "whimsical";

export type MemeInputType = "headline" | "url" | "upload" | "custom" | "ai-image";

    