# Galaxy of Memories

A beautiful, immersive diary app with a 3D galaxy interface. Write your thoughts with Aurora, your spiritual AI mentor, and watch your emotions become glowing stars in the cosmos.

## Features

- **3D Galaxy Interface**: Interactive rotating galaxy made of glowing particles
- **AI-Powered Diary Writing**: Chat with Aurora, your spiritual mentor, to express your emotions
- **Emotion Visualization**: Each diary entry becomes a star colored by its emotional tone
- **Immersive Experience**: 
  - Dark starry sky background
  - Background ambient music
  - Smooth drag interactions (rotate, zoom, adjust viewing angle)
  - Glowing particle effects
- **Diary Management**: View, read, and delete your diary entries

## Tech Stack

- **Expo** (latest) with TypeScript
- **React Native** for mobile development
- **Three.js** with `@react-three/fiber` and `@react-three/drei` for 3D graphics
- **React Context + useReducer** for state management
- **AsyncStorage** for local data persistence
- **Google Gemini AI** (via Vercel AI SDK) for AI interactions
- **expo-av** for background music playback

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
cd backend && npm install
```

### 2. Configure Backend API

The backend is a Next.js API that handles AI interactions. Set up the backend:

1. Navigate to the `backend` directory
2. Create a `.env.local` file:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```
3. Get your API key from: https://makersuite.google.com/app/apikey
4. Run the backend server:
   ```bash
   npm run dev
   ```

### 3. Configure Frontend API Endpoint

Edit `src/config/api.ts` and set the `API_BASE_URL` to your backend URL:
- Local development: `http://localhost:3000`
- Production: Your deployed backend URL

### 4. Run the App

Start the Expo development server:

```bash
npm start
```

Then:
- Press `i` to open in iOS simulator
- Press `a` to open in Android emulator
- Scan the QR code with Expo Go app on your physical device

Or run directly:

```bash
npm run ios      # iOS
npm run android  # Android
npm run web      # Web
```

## Project Structure

```
src/
├── components/
│   ├── DiaryChatModal.tsx      # Chat interface for writing diaries
│   ├── GalaxyScene.tsx          # 3D galaxy scene with particles and stars
│   └── ReadDiaryModal.tsx       # View diary entries
├── config/
│   └── api.ts                   # API configuration
├── context/
│   └── RecordsContext.tsx       # Global state management with AsyncStorage
├── screens/
│   └── HomeScreen.tsx           # Main screen with galaxy scene
├── services/
│   └── llmClient.ts             # AI API client wrapper
└── types/
    └── index.ts                 # TypeScript type definitions

backend/
├── app/
│   └── api/
│       ├── chat/                # Chat completion endpoint
│       ├── classify-emotion/    # Emotion classification endpoint
│       └── generate-title/      # Title generation endpoint
└── lib/
    └── ai/
        └── config/
            ├── model.ts         # AI model configuration
            └── prompt.ts        # System prompts for Aurora
```

## How to Use

1. **Write a Diary**: Tap the "Write a Diary" button to start chatting with Aurora
2. **Express Yourself**: Have a conversation with Aurora about your thoughts and feelings
3. **Finish Writing**: Tap "Finish" when done - Aurora will classify the emotion and generate a title
4. **View Your Star**: Your diary becomes a glowing star in the galaxy, colored by its emotion
5. **Interact with Galaxy**: 
   - Drag horizontally to rotate the galaxy
   - Drag vertically to adjust viewing angle
   - Pinch to zoom in/out
6. **View Diaries**: Tap on any star to read your diary entry
7. **Delete Diaries**: Delete individual entries when viewing them

## Emotion Colors

Diary stars are colored based on their emotional tone:
- **Happy**: Yellow/Gold
- **Sad**: Blue
- **Angry**: Red
- **Anxious**: Orange
- **Calm**: Green
- **Excited**: Pink
- **Grateful**: Purple
- **Lonely**: Gray
- **Hopeful**: Cyan
- **Neutral**: White

## Development Notes

- All diary entries are stored locally using AsyncStorage
- The app persists data automatically whenever records change
- TypeScript is used throughout for type safety
- 3D graphics use Three.js with React Three Fiber for React Native compatibility
- Background music loops continuously (can be muted/unmuted)

## Troubleshooting

### Backend Connection Issues

If you see API errors:
1. Ensure the backend server is running (`cd backend && npm run dev`)
2. Check that `API_BASE_URL` in `src/config/api.ts` matches your backend URL
3. Verify your Google AI API key is set in `backend/.env.local`

### 3D Rendering Issues

If the galaxy doesn't appear:
1. Ensure you're using a device/simulator that supports WebGL
2. Check that `expo-gl` is properly installed
3. Try restarting the Expo development server

## License

MIT
