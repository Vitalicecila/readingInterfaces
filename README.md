# Character-Enhanced Reading Interface

A research tool for studying how different character information interfaces affect reading comprehension. Features 4 reading modes with Latin square counterbalancing for experimental studies.

## Live Demo

🔗 **[https://reading-interfaces.vercel.app](https://reading-interfaces.vercel.app)**

## Features

### 4 Reading Interfaces
1. **Tabbed View** - Switch between reading and character info tabs
2. **Clickable Names** - Click character names for popup information
3. **Network View** - Interactive character relationship network
4. **LLM Enhanced** - AI-generated character descriptions inline

### Experimental Design
- **Latin square counterbalancing** (4x4 design)
- Each participant sees 4 different excerpts across 4 interfaces
- Button order rotates to guide participants through excerpts A→B→C→D
- URL parameter `?condition=1` (or 2, 3, 4) determines assignment

## Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### Build for Production
```bash
npm run build
```

## Study URLs

Distribute these to participants (Qualtrics integration):
- **Condition 1**: `https://reading-interfaces.vercel.app/?condition=1`
- **Condition 2**: `https://reading-interfaces.vercel.app/?condition=2`
- **Condition 3**: `https://reading-interfaces.vercel.app/?condition=3`
- **Condition 4**: `https://reading-interfaces.vercel.app/?condition=4`

## Counterbalancing Matrix

| Condition | Interface 1 | Interface 2 | Interface 3 | Interface 4 |
|-----------|-------------|-------------|-------------|-------------|
| 1         | Tabbed (A)  | Clickable (B) | Network (C) | LLM (D)    |
| 2         | LLM (A)     | Tabbed (B)  | Clickable (C) | Network (D) |
| 3         | Network (A) | LLM (B)     | Tabbed (C)  | Clickable (D) |
| 4         | Clickable (A) | Network (B) | LLM (C)    | Tabbed (D)  |

Each row represents a different condition. Participants go left-to-right through interfaces, experiencing excerpts A→B→C→D in sequence.

## Adding Your Own Excerpts

### 1. Edit Text Excerpts
Edit `src/app/data/bookData.ts`:

```typescript
export const excerptA: PageContent[] = [
  {
    chapter: 'Your Chapter Title',
    text: `Your full excerpt text here...`
  }
];

export const excerptB: PageContent[] = [
  {
    chapter: 'Another Chapter',
    text: `Your second excerpt...`
  }
];

// Repeat for excerptC and excerptD
```

### 2. Extract Characters with AI

Create `.openai_key` file with your OpenAI API key:
```bash
echo "sk-your-key-here" > .openai_key
```

Run character extraction:
```bash
python extract_characters.py
```

This automatically:
- Detects all named characters in your excerpts
- Extracts relationships (family, romantic, social)
- Creates bidirectional relationships
- Updates `bookData.ts` with character data

### 3. Manual Review (Important!)
After AI extraction, review and fix:
- Character names match text exactly
- All key characters are included
- Relationships are accurate
- Family trees are correct

### 4. Test & Deploy
```bash
npm run build   # Check for errors
git add .
git commit -m "Update excerpts"
git push origin main   # Auto-deploys to Vercel
```

## Project Structure

```
src/app/
├── components/
│   ├── TabbedReader.tsx      # Tab-based interface
│   ├── ClickableReader.tsx   # Click for popups
│   ├── NetworkReader.tsx     # Relationship graph
│   └── LLMReader.tsx         # Inline AI descriptions
├── data/
│   ├── bookData.ts           # Excerpts & characters
│   └── excerptLoader.ts      # Counterbalancing logic
└── App.tsx                   # Main app & routing

extract_characters.py          # AI character extraction
```

## Qualtrics Integration

### Option 1: Qualtrics Randomizer (Recommended)
1. Survey Flow → Add Embedded Data field: `condition`
2. Add Randomizer → 4 blocks (25% each)
3. Set `condition = 1, 2, 3, or 4` in each block
4. End of Survey redirect:
   ```
   https://reading-interfaces.vercel.app/?condition=${e://Field/condition}
   ```

### Option 2: Participant ID
Automatically assign based on participant ID:
```
https://reading-interfaces.vercel.app/?participant_id=${e://Field/ResponseID}
```
App calculates: `condition = (participant_id - 1) % 4 + 1`

## Tech Stack

- **React 18** + TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Vercel** - Deployment
- **OpenAI API** - Character extraction

## Development

### File Editing
- **Excerpts**: Edit `src/app/data/bookData.ts`
- **Counterbalancing**: Edit `src/app/data/excerptLoader.ts`
- **Button order**: Edit `src/app/App.tsx` (INTERFACE_ORDER)
- **Styling**: Tailwind classes in components

### Character Data Format
```typescript
characters: {
  'Elizabeth': {
    name: "Elizabeth Bennet",
    description: "Quick-witted and independent protagonist",
    role: "Protagonist",
    appearances: 12,
    relationships: [
      { character: "Jane", type: "sister" },
      { character: "Mr. Darcy", type: "love interest" }
    ]
  }
}
```

## Research Notes

- **Single continuous page** per excerpt (no pagination)
- **Counterbalanced button order** guides participants left-to-right
- **Welcome popup** explains study (shown once via localStorage)
- **Character highlighting** uses exact string matching
- **Network view** requires relationships to display

## Troubleshooting

### Characters not highlighting?
- Check character names match text exactly (case-sensitive)
- Run character extraction again
- Manually add missing characters to `bookData.ts`

### Build errors?
```bash
npm run build
```
Check console for TypeScript errors

### Deployment not updating?
- Verify git push succeeded
- Check Vercel dashboard for build logs
- May take 1-2 minutes to deploy

## License

MIT - Free for research and educational use

## Citation

If you use this tool in your research, please cite:
```
Character-Enhanced Reading Interface (2025)
https://github.com/Vitalicecila/readingInterfaces
```
