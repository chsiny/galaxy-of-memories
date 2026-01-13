import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function createAIModel() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('Google API key not configured');
  }

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  return google("gemini-2.5-flash");
}

export const AI_CONFIG = {
  temperature: 0.7,
  maxTokens: 4000,
  toolChoice: 'auto' as const,
  maxSteps: 5,
};
