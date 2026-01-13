# Setting Up GitHub Repository for Memory of Galaxy

## Step 1: Commit Your Changes

All your changes have been staged. Now commit them:

```bash
git commit -m "Initial commit: Galaxy Diary app with 3D galaxy interface"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository settings:
   - **Repository name**: `memory-of-galaxy` (or `memory-of-galaxy` - GitHub will convert spaces to hyphens)
   - **Description**: "A beautiful diary app with a 3D galaxy interface. Write your thoughts with Aurora, your spiritual AI mentor."
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 3: Connect and Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

### If this is a NEW repository (no existing remote):

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/memory-of-galaxy.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### If you already have a remote (to update it):

```bash
# Remove old remote (if exists)
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/memory-of-galaxy.git

# Push to GitHub
git push -u origin main
```

## Step 4: Verify

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/memory-of-galaxy`
2. You should see all your files there

## Important Notes

### Files NOT Committed (by design):
- `.env` and `.env.local` files (contains API keys - should NEVER be committed)
- `node_modules/` (dependencies - will be installed via `npm install`)
- `.expo/` (Expo build files)

### After Pushing:

1. **Add API Key Instructions**: Make sure your README mentions that users need to:
   - Create `backend/.env.local` with their Google AI API key
   - Configure `src/config/api.ts` with their backend URL

2. **Optional: Add Topics/Tags** on GitHub:
   - Click on the gear icon next to "About" section
   - Add topics: `react-native`, `expo`, `threejs`, `diary-app`, `ai`, `galaxy`

3. **Optional: Add License**: If you want to add a license file (MIT, etc.)

## Troubleshooting

### Authentication Issues

If you get authentication errors when pushing:

**Option 1: Use Personal Access Token**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

**Option 2: Use SSH**
```bash
# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/memory-of-galaxy.git
```

### If You Need to Rename Later

If you want to rename the repository on GitHub:
1. Go to repository Settings → General
2. Scroll to "Repository name" section
3. Change name and click "Rename"
4. Update your local remote:
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/new-name.git
   ```

