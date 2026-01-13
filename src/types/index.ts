export type Rating = "up" | "down" | null;

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO string
}

export interface LLMRecord {
  id: string;              // uuid or timestamp-based
  messages: ChatMessage[]; // Conversation history
  rating: Rating;
  tags: string[];          // e.g. ["helpful"], ["hallucination"]
  emotion?: string;        // Emotion classification (e.g., "happy", "sad", "neutral")
  emotionColor?: string;   // Color hex code for the emotion
  title?: string;         // Title/summary of the diary entry
  createdAt: string;       // ISO string
  updatedAt: string;       // ISO string
}

// Legacy support - for backward compatibility during migration
export interface LegacyLLMRecord {
  id: string;
  prompt: string;
  response: string;
  rating: Rating;
  tags: string[];
  createdAt: string;
}

export type ExportRecord = {
  messages: ChatMessage[];
  rating: Rating;
  tags: string[];
};



