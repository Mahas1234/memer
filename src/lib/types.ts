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

export interface MemeStoryPanel {
    imageUrl: string;
    caption: string;
    imagePrompt: string;
}

export interface MemeStory {
    id: string;
    title: string;
    panels: MemeStoryPanel[];
    createdAt: string;
}

export type MemeTone = "funny" | "sarcastic" | "inspirational" | "whimsical";

export type MemeInputType = "headline" | "url" | "upload" | "custom" | "ai-image" | "remove-bg" | "story" | "mood";
