# Galaxy Diary API

Next.js backend API for the Galaxy Diary mobile app using Vercel AI SDK with Google's Gemini models.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Create `.env.local` file
   - Add your Google AI API key:
     ```bash
     GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
     ```
   - Get your API key from: https://makersuite.google.com/app/apikey

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Deploy to Vercel:**
   ```bash
   vercel deploy
   ```
   
   Make sure to set `GOOGLE_GENERATIVE_AI_API_KEY` in your Vercel project settings.

## API Endpoints

### POST `/api/chat`

Generate AI completion using Google's Gemini models with Aurora's spiritual mentor persona.

**Request body:**
```json
{
  "prompt": "Your message here",
  "systemPrompt": "Optional system prompt override",
  "temperature": 0.7,
  "model": "gemini-1.5-flash"
}
```

**Response:**
```json
{
  "response": "Aurora's response"
}
```

### POST `/api/classify-emotion`

Classify the primary emotion from a diary conversation.

**Request body:**
```json
{
  "conversation": "User: ...\n\nAurora: ..."
}
```

**Response:**
```json
{
  "emotion": "happy",
  "color": "#fbbf24"
}
```

### POST `/api/generate-title`

Generate a concise, meaningful title for a diary entry.

**Request body:**
```json
{
  "conversation": "User: ...\n\nAurora: ..."
}
```

**Response:**
```json
{
  "title": "Finding Peace in the Storm"
}
```

## Models Available

- `gemini-1.5-flash` (default) - Fast and efficient
- `gemini-1.5-pro` - More capable
- `gemini-pro` - Legacy model

See Google AI documentation for full list: https://ai.google.dev/models
