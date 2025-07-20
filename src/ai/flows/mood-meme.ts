'use server';
/**
 * @fileOverview A Genkit flow for generating a meme based on user's mood detected from a webcam photo.
 *
 * - generateMoodMeme - A function that handles the mood-based meme generation process.
 * - GenerateMoodMemeInput - The input type for the generateMoodMeme function.
 * - GenerateMoodMemeOutput - The return type for the generateMoodMeme function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMoodMemeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateMoodMemeInput = z.infer<typeof GenerateMoodMemeInputSchema>;

const GenerateMoodMemeOutputSchema = z.object({
  mood: z.string().describe('The detected mood of the user (e.g., happy, sad, surprised).'),
  caption: z.string().describe('A funny and relatable meme caption based on the detected mood.'),
  imagePrompt: z.string().describe('A prompt for an AI image generator to create a funny meme background that matches the mood and caption.'),
});
export type GenerateMoodMemeOutput = z.infer<typeof GenerateMoodMemeOutputSchema>;

export async function generateMoodMeme(input: GenerateMoodMemeInput): Promise<GenerateMoodMemeOutput> {
  return moodMemeFlow(input);
}

const moodPrompt = ai.definePrompt({
  name: 'moodMemePrompt',
  input: { schema: GenerateMoodMemeInputSchema },
  output: { schema: GenerateMoodMemeOutputSchema },
  prompt: `You are a hilarious and empathetic AI that creates memes to match people's moods.
Analyze the provided photo of a person's face.

1.  Detect the primary mood of the person in the photo.
2.  Based on that mood, generate a short, witty, and relatable meme caption.
3.  Create a descriptive prompt for an AI image generator to create a funny, abstract, or surreal meme background image that fits the mood and caption.

Photo of user: {{media url=photoDataUri}}`,
});

const moodMemeFlow = ai.defineFlow(
  {
    name: 'moodMemeFlow',
    inputSchema: GenerateMoodMemeInputSchema,
    outputSchema: GenerateMoodMemeOutputSchema,
  },
  async (input) => {
    const { output } = await moodPrompt(input);
    if (!output) {
      throw new Error("Failed to generate a mood-based meme.");
    }
    return output;
  }
);
