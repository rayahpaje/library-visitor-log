'use server';
/**
 * @fileOverview A Genkit flow for suggesting common purposes of visit or intelligently categorizing a free-text entry for library visitors.
 *
 * - suggestVisitorPurpose - A function that handles the suggestion process for visitor purposes.
 * - VisitorPurposeSuggestionInput - The input type for the suggestVisitorPurpose function.
 * - VisitorPurposeSuggestionOutput - The return type for the suggestVisitorPurpose function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisitorPurposeSuggestionInputSchema = z
  .string()
  .describe("Visitor's free-text description of their purpose of visit.");
export type VisitorPurposeSuggestionInput = z.infer<
  typeof VisitorPurposeSuggestionInputSchema
>;

const VisitorPurposeSuggestionOutputSchema = z.object({
  primaryCategory: z
    .string()
    .describe('The most fitting primary category for the visit purpose.'),
  suggestions: z
    .array(z.string())
    .describe('A list of other relevant or suggested purposes of visit.'),
});
export type VisitorPurposeSuggestionOutput = z.infer<
  typeof VisitorPurposeSuggestionOutputSchema
>;

export async function suggestVisitorPurpose(
  input: VisitorPurposeSuggestionInput
): Promise<VisitorPurposeSuggestionOutput> {
  return visitorPurposeSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'visitorPurposeSuggestionPrompt',
  input: {schema: VisitorPurposeSuggestionInputSchema},
  output: {schema: VisitorPurposeSuggestionOutputSchema},
  prompt: `You are an AI assistant for a library visitor sign-in system. Your task is to analyze a visitor's free-text description of their purpose of visit and categorize it into a primary purpose.

Common primary purposes for a library visit include: 'Reading books', 'Research in thesis', 'Use of computer', 'Doing assignments', 'Other'.
Prioritize the primary category based on the most direct interpretation of the visitor's input. The suggestions should be related but distinct options from the primary category and each other.

Visitor's purpose: {{{input}}}`,
});

const visitorPurposeSuggestionFlow = ai.defineFlow(
  {
    name: 'visitorPurposeSuggestionFlow',
    inputSchema: VisitorPurposeSuggestionInputSchema,
    outputSchema: VisitorPurposeSuggestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
