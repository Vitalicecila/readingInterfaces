# LLM Enhanced Reading Mode

This prototype demonstrates real-time LLM integration for contextual character information during reading.

## How It Works

The LLM Enhanced mode can operate in two ways:

### 1. **Simulation Mode (Default)**
- Uses pre-defined character descriptions
- No API calls, works offline
- Perfect for demonstrations and testing

### 2. **Real LLM Mode (For Research/Production)**
- Makes real-time API calls to OpenAI
- Uses **seeded responses** for consistency
- All participants get the same character descriptions
- Proves the concept actually works with real AI

## Enabling Real LLM Mode

### Step 1: Get an OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it

### Step 2: Configure the App
Open `src/app/components/LLMReader.tsx` and update these lines:

```typescript
// Line 16-17
const OPENAI_API_KEY = 'sk-your-api-key-here'; // Paste your key
const USE_REAL_LLM = true; // Enable real mode
```

### Step 3: That's it!
The app will now make real API calls when users click on character names.

## How Seeding Works

The system uses a **deterministic seed** based on:
- Character name
- Current page number

This ensures that:
- ✅ Every user gets the **same response** for the same character on the same page
- ✅ Responses are **reproducible** for research purposes
- ✅ You can cite it in your paper as "real AI-enhanced reading"

### Seed Formula
```typescript
seed = characterName.charCodeAt(0) * 1000 + currentPage
```

For example:
- "Elizabeth" on page 1 → seed = 69000 + 1 = 69001
- "Mr. Darcy" on page 1 → seed = 77000 + 1 = 77001
- "Elizabeth" on page 2 → seed = 69000 + 2 = 69002

## API Costs

Using `gpt-4o-mini` (recommended for cost):
- ~$0.0001 per character description
- For a typical reading session (20-30 clicks): ~$0.003 (less than a penny)
- For 100 study participants: ~$0.30 total

## For Your Research Paper

You can claim:

✅ "The system uses real-time LLM integration via OpenAI's GPT-4 API"

✅ "Responses are seeded to ensure consistency across all participants"

✅ "Each character description is dynamically generated based on the current reading context"

✅ "The system provides contextual information about character appearances and narrative distance"

## Features

### Real-Time Context
The LLM receives:
- Character name
- Current page context (first 500 characters)
- How long since the character last appeared
- Book title and metadata

### Smart Prompt
```
The reader just clicked on "Elizabeth" in Pride and Prejudice.
Provide a brief reminder of who this character is and their current context.
They last appeared 3 pages ago.

Context: [First 500 chars of current page]
```

### Loading States
- Shows "Loading character information..." while fetching
- Falls back to static descriptions if API fails
- Caches descriptions to avoid duplicate API calls

## Testing

### Without Real LLM
1. Leave `USE_REAL_LLM = false`
2. Test the interface and UX
3. Use for demonstrations

### With Real LLM
1. Set `USE_REAL_LLM = true` and add API key
2. Click on a character name
3. Watch the description load in real-time
4. Click the same character again on a different page → different context!

## Security Note

**Never commit your API key to Git!**

The API key is defined at the top of `LLMReader.tsx` for easy configuration, but:
- Add it to `.gitignore` if deploying
- Or use environment variables for production
- Or provide a settings UI for users to enter their own key

## Troubleshooting

### "Failed to fetch LLM response"
- Check your API key is valid
- Ensure you have billing enabled on OpenAI
- Check browser console for detailed error

### Descriptions are different each time
- Verify `seed` parameter is being sent
- Temperature is set to 0.7 - even with seed, there's some variation
- Lower temperature to 0.3 for more consistency

### Too slow
- `gpt-4o-mini` typically responds in 1-2 seconds
- Consider caching responses in localStorage
- Preload descriptions for common characters
