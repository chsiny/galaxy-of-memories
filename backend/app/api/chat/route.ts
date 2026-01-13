import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { createAIModel } from '@/lib/ai/config/model';
import { SYSTEM_PROMPT } from '@/lib/ai/config/prompt';


export async function POST(req: Request) {
  try {
    const { prompt, systemPrompt, temperature } = await req.json();

    // Use gemini-pro as default (most stable model)
    const model = createAIModel();
    
    // Log for debugging
    console.log('Using model:', model);

    // The prompt can be a full conversation context string
    // or we can accept messages array in the future for better structure
    const { text } = await generateText({
      model: model,
      system: SYSTEM_PROMPT,
      prompt: prompt, // This can be the formatted conversation history
      temperature: temperature || 0.7,
    });

    return Response.json({ response: text });
    
  } catch (error) {
    console.error('AI SDK error:', error);
    return Response.json(
      { error: 'Failed to generate completion' },
      { status: 500 }
    );
  }
}

