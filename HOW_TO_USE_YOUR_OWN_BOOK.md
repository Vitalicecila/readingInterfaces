# How to Use Your Own PDF Book

Follow these steps to replace the current book (Pride and Prejudice) with your own PDF:

## Step 1: Extract Text from Your PDF

There are several ways to extract text from a PDF:

### Option A: Online Tools
- **PDF2TXT.com** - Free online converter
- **Adobe Acrobat Online** - If you have an Adobe account
- **Smallpdf.com** - Another popular option

### Option B: Desktop Tools
- **Adobe Acrobat Reader** - Select all text (Ctrl+A) and copy
- **PDF-XChange Editor** - Free PDF viewer with text selection
- **Calibre** - E-book management software with text extraction

### Option C: Command Line (Advanced)
```bash
# Using pdftotext (part of Poppler)
pdftotext yourbook.pdf output.txt
```

## Step 2: Prepare Your Book Data

Open the file: `src/app/data/bookData.ts`

This file contains three main sections you'll need to update:

### A. Book Metadata (Lines 234-238)
```typescript
export const bookMetadata = {
  title: 'Your Book Title',
  author: 'Author Name',
  year: 2024
};
```

### B. Characters (Lines 23-131)

For each character in your book, create an entry following this template:

```typescript
'CharacterName': {
  name: 'Full Character Name',
  description: 'Brief description of who they are and their role in the story',
  role: 'Protagonist/Supporting Character/Antagonist/etc.',
  appearances: 0, // Estimate or leave as 0
  relationships: [ // Optional - for Network View
    { character: 'OtherCharacter', type: 'Friend/Family/Enemy/etc.' }
  ]
}
```

**Example:**
```typescript
'Katniss': {
  name: 'Katniss Everdeen',
  description: 'A skilled archer and the protagonist who volunteers for the Hunger Games to save her sister',
  role: 'Protagonist',
  appearances: 250,
  relationships: [
    { character: 'Peeta', type: 'Love Interest' },
    { character: 'Prim', type: 'Sister' },
    { character: 'Gale', type: 'Friend' }
  ]
}
```

### C. Pages/Chapters (Lines 139-231)

Break your extracted text into readable chunks (pages or scenes):

```typescript
export const pages: PageContent[] = [
  {
    chapter: 'Chapter 1',
    text: `Your extracted text here...

    Make sure to include the full text for this section.
    You can include multiple paragraphs.`
  },
  {
    chapter: 'Chapter 2',
    text: `Continue with the next section...`
  }
  // Add more pages as needed
];
```

## Step 3: Character Name Matching

**Important:** The character names you use as keys in the `characters` object must **exactly match** how they appear in your text.

For example:
- If your text says "Mr. Darcy", use `'Mr. Darcy'` as the key
- If your text says "Elizabeth", use `'Elizabeth'` as the key
- Don't use `'Darcy'` if the text always says "Mr. Darcy"

The system will automatically highlight these names when they appear in the text.

## Step 4: Tips for Best Results

### Text Chunking
- Aim for 200-500 words per page for optimal reading
- Break at natural stopping points (scene changes, chapter breaks)
- Keep related dialogues together

### Character Descriptions
- Keep descriptions concise (1-2 sentences)
- Focus on the most important traits
- Include context that helps readers remember who they are

### Relationships (for Network View)
- Add key relationships to see character connections visualized
- Common relationship types: Friend, Family, Love Interest, Enemy, Mentor, Rival

## Step 5: Save and Test

1. Save `src/app/data/bookData.ts`
2. The app will automatically reload
3. Test all four reading modes:
   - **Tabbed View** - Character info in tabs
   - **Clickable Names** - Popover on click
   - **Network View** - See character relationships
   - **LLM Enhanced** - Dynamic inline descriptions

## Common Issues

### Characters Not Highlighting
- Check that character names in `characters` object match exactly how they appear in text
- Names are case-sensitive
- Include titles (Mr., Mrs., Dr.) if they appear in the text

### Text Formatting Issues
- Use backticks (\`) for multi-line text
- Escape single quotes in text with backslash (`\'`)
- Keep paragraphs separated with blank lines

### App Not Updating
- Make sure you saved the file
- Check browser console (F12) for errors
- Try refreshing the page (Ctrl+R)

## Example: Converting a Chapter

Here's a complete example of converting one chapter:

```typescript
// In bookMetadata section:
export const bookMetadata = {
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  year: 1925
};

// In characters section:
export const characters = {
  'Gatsby': {
    name: 'Jay Gatsby',
    description: 'A mysterious millionaire known for his lavish parties',
    role: 'Protagonist',
    appearances: 89,
    relationships: [
      { character: 'Daisy', type: 'Love Interest' },
      { character: 'Nick', type: 'Friend' }
    ]
  },
  // ... more characters
};

// In pages section:
export const pages = [
  {
    chapter: 'Chapter 1',
    text: `In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.

"Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven't had the advantages that you've had."`
  }
];
```

## Need Help?

If you encounter issues:
1. Check the browser console for errors (F12)
2. Ensure your TypeScript syntax is correct
3. Verify all quotes and brackets are properly closed
4. Make sure character names match exactly

Happy reading! 📚
