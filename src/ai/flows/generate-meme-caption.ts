'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating meme captions.
 *
 * - generateMemeCaption - A function that generates a meme caption based on the provided context (headline or image description) and tone.
 * - GenerateMemeCaptionInput - The input type for the generateMemeCaption function.
 * - GenerateMemeCaptionOutput - The return type for the generateMemeCaption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMemeCaptionInputSchema = z.object({
  context: z.string().describe('The context to generate a meme caption for. This can be a news headline or an image description.'),
  tone: z.enum(['funny', 'sarcastic', 'inspirational']).describe('The desired tone of the meme caption.'),
});
export type GenerateMemeCaptionInput = z.infer<typeof GenerateMemeCaptionInputSchema>;

const GenerateMemeCaptionOutputSchema = z.object({
  caption: z.string().describe('The generated meme caption.'),
});
export type GenerateMemeCaptionOutput = z.infer<typeof GenerateMemeCaptionOutputSchema>;

export async function generateMemeCaption(input: GenerateMemeCaptionInput): Promise<GenerateMemeCaptionOutput> {
  return generateMemeCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMemeCaptionPrompt',
  input: {schema: GenerateMemeCaptionInputSchema},
  output: {schema: GenerateMemeCaptionOutputSchema},
  prompt: `Generate a {{tone}} meme caption under 10 words for this context: '{{context}}'.`,
});

const generateMemeCaptionFlow = ai.defineFlow(
  {
    name: 'generateMemeCaptionFlow',
    inputSchema: GenerateMemeCaptionInputSchema,
    outputSchema: GenerateMemeCaptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
