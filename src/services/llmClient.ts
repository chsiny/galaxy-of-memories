import { API_BASE_URL, DEFAULT_MODEL, DEFAULT_TEMPERATURE } from "../config/api";

export interface GenerateOptions {
  systemPrompt?: string;
  temperature?: number;
  model?: string;
}

/**
 * Generates a completion using the Next.js backend with Google Gemini
 * 
 * @param prompt - The user prompt to send to the LLM
 * @param options - Optional configuration (system prompt, temperature, model)
 * @returns The generated response text
 * @throws Error if API call fails
 */
export async function generateCompletion(
  prompt: string,
  options?: GenerateOptions
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Optional: Add auth token here
        // 'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        prompt,
        systemPrompt: options?.systemPrompt,
        temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
        model: options?.model || DEFAULT_MODEL,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API error: ${response.status}. ${errorData.error || "Unknown error"}`
      );
    }

    const data = await response.json();
    
    if (!data.response) {
      throw new Error("Invalid response format from API");
    }

    return data.response || "";
  } catch (error) {
    // Re-throw with more context if it's already an Error
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle network errors
    throw new Error(
      `Failed to generate completion: ${typeof error === "string" ? error : "Network error"}`
    );
  }
}

/**
 * Classifies the emotion of a diary conversation
 * 
 * @param conversation - The full conversation text from the diary
 * @returns Object with emotion and color
 * @throws Error if API call fails
 */
export async function classifyEmotion(conversation: string): Promise<{ emotion: string; color: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/classify-emotion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API error: ${response.status}. ${errorData.error || "Unknown error"}`
      );
    }

    const data = await response.json();
    
    return {
      emotion: data.emotion || "neutral",
      color: data.color || "#FFFFFF",
    };
  } catch (error) {
    // Return default values on error
    console.error("Emotion classification error:", error);
    return {
      emotion: "neutral",
      color: "#FFFFFF",
    };
  }
}

/**
 * Generates a title/summary for a diary conversation
 * 
 * @param conversation - The full conversation text from the diary
 * @returns The generated title
 * @throws Error if API call fails
 */
export async function generateTitle(conversation: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-title`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API error: ${response.status}. ${errorData.error || "Unknown error"}`
      );
    }

    const data = await response.json();
    
    if (!data.title) {
      throw new Error("Invalid response format from API");
    }

    return data.title || "Untitled Reflection";
  } catch (error) {
    // Re-throw with more context if it's already an Error
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle network errors
    throw new Error(
      `Failed to generate title: ${typeof error === "string" ? error : "Network error"}`
    );
  }
}



