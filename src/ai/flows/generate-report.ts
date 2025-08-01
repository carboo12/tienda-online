'use server';

/**
 * @fileOverview Generates a report on key metrics using a GenAI tool.
 *
 * - generateReport - A function that generates the report.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportInputSchema = z.object({
  metrics: z
    .string()
    .describe(
      'The metrics to include in the report. Examples: sales, inventory, user activity'
    ),
  storesData: z
    .string()
    .describe(
      'Data for all the stores, it must be a comprehensive data containing sales, inventory, user activity.'
    )
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  report: z.string().describe('The generated report.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an expert business analyst. Generate a report based on the following metrics and stores data:

Metrics: {{{metrics}}}
Stores Data: {{{storesData}}}

Consider pertinent data to include in the report.
`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
