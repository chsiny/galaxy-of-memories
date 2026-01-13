# How to Run Galaxy Diary

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- Google AI API key (get from https://makersuite.google.com/app/apikey)

## Step-by-Step Setup

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Set Up Backend

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Configure Backend API Key

Create a `.env.local` file in the `backend` directory:

```bash
cd backend
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here" > .env.local
```

Replace `your_api_key_here` with your actual Google AI API key.

### 4. Start the Backend Server

In the `backend` directory, run:

```bash
npm run dev
```

The backend will start on `http://localhost:3000` by default.

**Keep this terminal window open** - the backend needs to be running for the app to work.

### 5. Configure Frontend API URL

Edit `src/config/api.ts` and set the `API_BASE_URL`:

- **For iOS Simulator / Android Emulator**: Use `http://localhost:3000`
- **For Physical Device**: Use your computer's local IP address (e.g., `http://192.168.1.102:3000`)

To find your local IP:
- **Mac/Linux**: Run `ifconfig | grep "inet "` or `ipconfig getifaddr en0`
- **Windows**: Run `ipconfig` and look for IPv4 Address

Example:
```typescript
export const API_BASE_URL = "http://localhost:3000"; // For simulator
// OR
export const API_BASE_URL = "http://192.168.1.102:3000"; // For physical device
```

Alternatively, you can create a `.env` file in the root directory:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 6. Start the Frontend

In the root directory, run:

```bash
npm start
```

This will start the Expo development server and show a QR code.

### 7. Run on Your Device/Simulator

**Option A: iOS Simulator (Mac only)**
```bash
npm run ios
```
Or press `i` in the Expo terminal.

**Option B: Android Emulator**
```bash
npm run android
```
Or press `a` in the Expo terminal.

**Option C: Physical Device**
1. Install the Expo Go app on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code shown in the terminal with:
   - iOS: Camera app
   - Android: Expo Go app

**Option D: Web Browser**
```bash
npm run web
```
Or press `w` in the Expo terminal.

## Troubleshooting

### Backend Connection Issues

**Problem**: App shows API errors or can't connect to backend.

**Solutions**:
1. Make sure the backend is running (`npm run dev` in `backend` directory)
2. Check that `API_BASE_URL` in `src/config/api.ts` matches your setup
3. For physical devices, ensure your phone and computer are on the same WiFi network
4. Check that your firewall isn't blocking port 3000

### API Key Issues

**Problem**: Backend returns authentication errors.

**Solutions**:
1. Verify your Google AI API key is correct in `backend/.env.local`
2. Make sure the `.env.local` file is in the `backend` directory (not root)
3. Restart the backend server after changing the API key

### Port Already in Use

**Problem**: Error "Port 3000 is already in use"

**Solutions**:
1. Find and stop the process using port 3000:
   ```bash
   # Mac/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
2. Or change the backend port in `backend/package.json`:
   ```json
   "dev": "next dev -p 3001"
   ```
   Then update `API_BASE_URL` to use port 3001.

## Quick Start (TL;DR)

```bash
# Terminal 1: Backend
cd backend
npm install
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key" > .env.local
npm run dev

# Terminal 2: Frontend
cd ..  # back to root
npm install
# Edit src/config/api.ts to set API_BASE_URL
npm start
# Press 'i' for iOS, 'a' for Android, or scan QR code
```

## Development Tips

- **Hot Reload**: Both frontend and backend support hot reload - changes will appear automatically
- **Logs**: Check backend terminal for API request logs
- **Expo DevTools**: Press `j` in Expo terminal to open developer menu
- **Clear Cache**: If you see weird behavior, try:
  ```bash
  npm start -- --clear
  ```

