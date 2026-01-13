import { generateText } from 'ai';
import { createAIModel } from '@/lib/ai/config/model';

const EMOTION_CLASSIFICATION_PROMPT = `Analyze the following diary entry conversation and classify the primary emotion. 
Return ONLY a single word from this list: happy, sad, angry, anxious, calm, excited, grateful, lonely, hopeful, neutral.

The emotion should reflect the overall sentiment and feeling expressed in the diary entry.

Diary conversation:
{conversation}

Return only the emotion word, nothing else.`;

const EMOTION_COLORS: Record<string, string> = {
  happy: '#FFD700',      // Gold
  sad: '#4169E1',        // Royal Blue
  angry: '#FF4500',      // Orange Red
  anxious: '#9370DB',    // Medium Purple
  calm: '#87CEEB',       // Sky Blue
  excited: '#FF69B4',    // Hot Pink
  grateful: '#32CD32',   // Lime Green
  lonely: '#708090',     // Slate Gray
  hopeful: '#FFA500',    // Orange
  neutral: '#FFFFFF',    // White
};

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
    
    const systemPrompt = 'You are an emotion classification system. Analyze conversations and return only a single emotion word.';
    const userPrompt = EMOTION_CLASSIFICATION_PROMPT.replace('{conversation}', conversation);
    
    const { text } = await generateText({
      model: model,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3, // Lower temperature for more consistent classification
    });

    // Clean the response - extract just the emotion word
    const emotion = text.trim().toLowerCase().split(/\s+/)[0];
    
    // Validate emotion is in our list
    const validEmotion = Object.keys(EMOTION_COLORS).includes(emotion) 
      ? emotion 
      : 'neutral';
    
    const color = EMOTION_COLORS[validEmotion];

    return Response.json({ 
      emotion: validEmotion,
      color: color
    });
    
  } catch (error) {
    console.error('Emotion classification error:', error);
    return Response.json(
      { 
        error: 'Failed to classify emotion',
        emotion: 'neutral',
        color: EMOTION_COLORS.neutral
      },
      { status: 500 }
    );
  }
}

