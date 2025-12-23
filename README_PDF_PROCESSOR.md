# PDF Chapter Processor

Automatically extract text from PDF chapters and use AI to identify characters and their relationships.

## Quick Start

### Option 1: Interactive Mode (Recommended)

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Run the script:**
```bash
python process_pdf.py
```

3. **Follow the prompts:**
   - Enter your OpenAI API key (will be saved to `.openai_key`)
   - Enter book metadata (title, author, year)
   - Add chapters one by one
   - Extract characters after each chapter or at the end
   - Export to `bookData.ts`

### Option 2: Batch Mode (Process All at Once)

1. **Create a `chapters/` directory** and put all your chapter PDFs there:
```
chapters/
  ├── chapter1.pdf
  ├── chapter2.pdf
  ├── chapter3.pdf
  └── ...
```

2. **Run the script:**
```bash
python process_pdf.py
```

The script will detect the PDFs and ask if you want to process them all in batch mode.

## How It Works

### Progressive Character Building

The script builds up character information progressively:

1. **Chapter 1:** Extract all characters mentioned
2. **Chapter 2:** Add NEW characters + update appearance counts for existing ones
3. **Chapter 3:** Continue building the database...

This way, you get:
- Accurate appearance counts across the whole book
- Character descriptions that consider their full role
- Relationships that emerge over multiple chapters

### What Gets Extracted

For each character, the AI identifies:
- **Name:** How they appear in the text (e.g., "Mr. Darcy")
- **Full Name:** Their complete name
- **Description:** 1-2 sentence summary of who they are
- **Role:** Protagonist, Supporting Character, Antagonist, etc.
- **Appearances:** Number of times mentioned in text
- **Relationships:** Connections to other characters (optional)

## Example Session

```bash
$ python process_pdf.py

============================================================
  PDF Chapter Processor - Character Extraction
============================================================

Enter your OpenAI API key: sk-...
Save API key to .openai_key file? (y/n): y
API key saved to .openai_key
✓ OpenAI API configured

=== Book Metadata ===
Book title: Pride and Prejudice
Author name: Jane Austen
Publication year: 1813

=== Chapter 1 ===
Options:
  1. Add chapter 1 PDF
  2. Extract characters from current chapters
  3. Export and finish
  4. Quit without saving

Choice: 1
Path to chapter 1 PDF: chapter1.pdf
📄 Reading chapter1.pdf...
   Extracted 12,543 characters
✓ Chapter added! Total chapters: 1

=== Chapter 2 ===
Options:
  1. Add chapter 2 PDF
  2. Extract characters from current chapters
  3. Export and finish
  4. Quit without saving

Choice: 2
✨ Extracting characters with AI...
✓ Found 8 characters in this batch
✓ Total unique characters: 8

=== Chapter 2 ===
Options:
  1. Add chapter 2 PDF
  2. Extract characters from current chapters
  3. Export and finish
  4. Quit without saving

Choice: 3
💾 Exporting to src/app/data/bookData.ts...
✓ Exported successfully!

Generated:
  - 1 chapters
  - 8 characters

✓ All done! Your reading app will automatically reload with the new book.
```

## Tips

### When to Extract Characters

You can extract after each chapter or wait until you've added several. The AI will:
- Identify new characters in new chapters
- Update appearance counts for characters that reappear
- Maintain relationships across chapters

### API Costs

Using `gpt-4o-mini` is very cost-effective:
- ~$0.01-0.05 per chapter (depending on length)
- A full novel might cost $1-3 total

### File Organization

Create a `chapters/` folder and name files sequentially:
```
chapters/
  ├── 01-chapter1.pdf
  ├── 02-chapter2.pdf
  ├── 03-chapter3.pdf
```

The script will process them in order.

## Troubleshooting

### "No module named 'PyPDF2'"
Run: `pip install -r requirements.txt`

### "API key not found"
Make sure you have a valid OpenAI API key from https://platform.openai.com

### Characters not matching text
The AI uses the character names as they appear in the text. If your book uses "Elizabeth" instead of "Elizabeth Bennet", the key in the character object should be "Elizabeth".

### PDF text extraction issues
Some PDFs (scanned images) may not extract text well. Try using a different PDF or convert to text first.

## Output

The script generates `src/app/data/bookData.ts` with:
- All character definitions
- All chapters/pages with extracted text
- Book metadata

Your React app will automatically reload with the new book!
