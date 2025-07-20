export interface NewsHeadline {
  title: string;
  url: string;
  source: string;
}

export interface Meme {
  id: string;
  imageUrl: string;
  caption: string;
  headline: string;
  createdAt: string;
  aiHint: string;
}

export type MemeTone = "funny" | "sarcastic" | "inspirational";
