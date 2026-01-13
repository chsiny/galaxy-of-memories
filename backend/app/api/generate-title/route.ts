import { generateText } from 'ai';
import { createAIModel } from '@/lib/ai/config/model';

const TITLE_GENERATION_PROMPT = `Analyze the following diary conversation and create a concise, meaningful title that captures the essence of the user's emotional journey and reflections.

The title should:
- Be 3-8 words long
- Capture the core emotion, theme, or insight from the conversation
- Be poetic, reflective, or meaningful (not just a summary)
- Feel personal and authentic to what the user shared

Examples of good titles:
- "Finding Peace in Uncertainty"
- "A Moment of Gratitude"
- "Navigating Through Sadness"
- "The Weight of Tomorrow"
- "Small Joys, Big Heart"

Diary conversation:
{conversation}

Return only the title, nothing else.`;

export async function POST(req: Request) {
  try {
    const { conversation } = await req.json();

    if (!conversation || typeof conversation !== 'string') {
      return Response.json(
        { error: 'Conversation text is required' },
        { status: 400 }
      );
    }

    const model = createAIModel();
    
    const systemPrompt = 'You are a thoughtful title generator for personal diary entries. Create meaningful, poetic titles that capture the emotional essence of conversations.';
    const userPrompt = TITLE_GENERATION_PROMPT.replace('{conversation}', conversation);
    
    const { text } = await generateText({
      model: model,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7, // Creative but focused
    });

    // Clean the response - extract just the title
    const title = text.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present

    return Response.json({ 
      title: title
    });
    
  } catch (error) {
    console.error('Title generation error:', error);
    return Response.json(
      { 
        error: 'Failed to generate title',
        title: 'Untitled Reflection'
      },
      { status: 500 }
    );
  }
}

