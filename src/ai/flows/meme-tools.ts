'use server';

/**
 * @fileOverview This file defines Genkit flows for various meme generation tools.
 *
 * - generateImageFromText - Generates an image from a text prompt.
 * - generateHashtags - Generates social media hashtags for a meme.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';


// Flow for Text-to-Image Generation
const GenerateImageInputSchema = z.object({
    prompt: z.string().describe('A descriptive prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
    imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImageFromText(input: GenerateImageInput): Promise<GenerateImageOutput> {
    return generateImageFromTextFlow(input);
}

const generateImageFromTextFlow = ai.defineFlow(
    {
        name: 'generateImageFromTextFlow',
        inputSchema: GenerateImageInputSchema,
        outputSchema: GenerateImageOutputSchema,
    },
    async ({ prompt }) => {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `A high-resolution, photorealistic meme background image for the text: ${prompt}`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        if (!media?.url) {
            throw new Error('Image generation failed.');
        }

        return { imageUrl: media.url };
    }
);


// Flow for Hashtag Generation
const GenerateHashtagsInputSchema = z.object({
    caption: z.string().describe('The caption of the meme.'),
    context: z.string().describe('The context or headline the meme is based on.'),
});
export type GenerateHashtagsInput = z.infer<typeof GenerateHashtagsInputSchema>;

const GenerateHashtagsOutputSchema = z.object({
    hashtags: z.array(z.string()).describe('An array of relevant social media hashtags, including the # symbol.'),
});
export type GenerateHashtagsOutput = z.infer<typeof GenerateHashtagsOutputSchema>;


export async function generateHashtags(input: GenerateHashtagsInput): Promise<GenerateHashtagsOutput> {
    return generateHashtagsFlow(input);
}

const generateHashtagsPrompt = ai.definePrompt({
    name: 'generateHashtagsPrompt',
    input: { schema: GenerateHashtagsInputSchema },
    output: { schema: GenerateHashtagsOutputSchema },
    prompt: `Based on the meme caption "{{caption}}" and its context "{{context}}", generate a list of 5-7 relevant, trending, and funny social media hashtags. Include a mix of broad and specific tags.`,
});

const generateHashtagsFlow = ai.defineFlow(
  {
    name: 'generateHashtagsFlow',
    inputSchema: GenerateHashtagsInputSchema,
    outputSchema: GenerateHashtagsOutputSchema,
  },
  async input => {
    const {output} = await generateHashtagsPrompt(input);
    return output!;
  }
);

    