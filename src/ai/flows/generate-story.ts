'use server';
/**
 * @fileOverview A Genkit flow for generating a 3-panel meme story.
 *
 * - generateMemeStory - A function that generates a meme story from a prompt.
 * - GenerateStoryInput - The input type for the generateMemeStory function.
 * - GenerateStoryOutput - The return type for the generateMemeStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStoryInputSchema = z.object({
  prompt: z.string().describe('The prompt or story idea for the meme series.'),
});
export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

const PanelSchema = z.object({
    imagePrompt: z.string().describe('A detailed prompt for DALL-E to generate an image for this panel. Should be photorealistic or in a specified style.'),
    caption: z.string().describe('The caption for this panel of the meme story. Should be short and witty.'),
});

const GenerateStoryOutputSchema = z.object({
  title: z.string().describe('A creative title for the meme story.'),
  panels: z.array(PanelSchema).length(3).describe('An array of exactly three panels for the meme story.'),
});
export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateMemeStory(input: GenerateStoryInput): Promise<GenerateStoryOutput> {
  return generateMemeStoryFlow(input);
}

const storyPrompt = ai.definePrompt({
  name: 'generateMemeStoryPrompt',
  input: { schema: GenerateStoryInputSchema },
  output: { schema: GenerateStoryOutputSchema },
  prompt: `You are a creative storyteller and meme expert. Based on the user's prompt, create a humorous 3-panel meme story.

User prompt: "{{prompt}}"

Generate a title and three panels. For each panel, provide a detailed image generation prompt and a short, funny caption. The story should have a clear beginning, middle, and end.`,
});


const generateMemeStoryFlow = ai.defineFlow(
  {
    name: 'generateMemeStoryFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async (input) => {
    // Step 1: Generate the story structure
    const { output: storyStructure } = await storyPrompt(input);
    if (!storyStructure) {
        throw new Error("Failed to generate meme story structure.");
    }
    
    // This is a placeholder. In a full implementation, you would generate images here.
    // For now, we will return the prompts.
    return storyStructure;
  }
);
