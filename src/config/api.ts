/**
 * Backend API Configuration
 * 
 * TO SET YOUR API URL:
 * 1. Create a file called `.env` in the root of your project
 * 2. Add: EXPO_PUBLIC_API_URL=https://your-nextjs-app.vercel.app
 * 3. Or directly edit the API_BASE_URL constant below
 * 
 * For local development, use: http://localhost:3000
 */

// Backend API URL - Next.js backend in /backend folder
// For physical device testing, use your computer's IP: http://192.168.1.102:3000
// For simulator/emulator, you can use: http://localhost:3000
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  "http://192.168.1.102:3000"; // Your local IP - change if needed

// Default model (Google Gemini)
// Available models: gemini-pro, gemini-1.5-pro
export const DEFAULT_MODEL = "gemini-pro";

export const DEFAULT_TEMPERATURE = 0.7;



