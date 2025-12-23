#!/usr/bin/env python3
"""
PDF Chapter Processor with LLM Character Extraction

This script progressively processes PDF chapters and uses OpenAI's API to extract
character information, building up a character database across multiple chapters.

Usage:
    python process_pdf.py

Requirements:
    pip install PyPDF2 openai
"""

import os
import json
import PyPDF2
from openai import OpenAI

# Configuration
OUTPUT_FILE = "src/app/data/bookData.ts"
CHAPTERS_DIR = "chapters"  # Put your chapter PDFs here
API_KEY_FILE = ".openai_key"  # Store your API key here (gitignored)

class PDFProcessor:
    def __init__(self):
        self.chapters = []
        self.characters = {}
        self.book_metadata = {
            "title": "",
            "author": "",
            "year": 2024
        }
        self.client = None

    def setup_api(self):
        """Setup OpenAI API client"""
        # Try to read API key from file
        if os.path.exists(API_KEY_FILE):
            with open(API_KEY_FILE, 'r') as f:
                api_key = f.read().strip()
        else:
            # Ask user for API key
            api_key = input("Enter your OpenAI API key: ").strip()
            save = input("Save API key to .openai_key file? (y/n): ").lower()
            if save == 'y':
                with open(API_KEY_FILE, 'w') as f:
                    f.write(api_key)
                print(f"API key saved to {API_KEY_FILE}")

        self.client = OpenAI(api_key=api_key)
        print("✓ OpenAI API configured\n")

    def get_book_metadata(self):
        """Get book metadata from user"""
        print("=== Book Metadata ===")
        self.book_metadata["title"] = input("Book title: ").strip() or "My Book"
        self.book_metadata["author"] = input("Author name: ").strip() or "Unknown Author"
        year_input = input("Publication year: ").strip()
        self.book_metadata["year"] = int(year_input) if year_input.isdigit() else 2024
        print()

    def extract_text_from_pdf(self, pdf_path):
        """Extract text from a PDF file"""
        print(f"📄 Reading {os.path.basename(pdf_path)}...")

        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"

        print(f"   Extracted {len(text):,} characters")
        return text.strip()

    def process_chapter(self, pdf_path, chapter_number):
        """Process a single chapter PDF"""
        text = self.extract_text_from_pdf(pdf_path)

        self.chapters.append({
            "number": chapter_number,
            "text": text,
            "fileName": os.path.basename(pdf_path)
        })

        return text

    def extract_characters_with_llm(self):
        """Use LLM to extract characters from all chapters"""
        print("\n✨ Extracting characters with AI...")

        # Combine all chapter texts
        all_text = "\n\n".join(ch["text"] for ch in self.chapters)

        # Build context about existing characters
        existing_context = ""
        if self.characters:
            char_names = list(self.characters.keys())
            existing_context = f"\n\nExisting characters already identified:\n{', '.join(char_names)}\n\nPlease identify any NEW characters not in this list, and also update appearance counts for existing characters if they appear in this chapter."

        prompt = f"""Analyze this chapter from a book and extract character information. Return a JSON object where each key is the character's name as it appears in the text, and the value contains:
- name: Full character name
- description: Brief 1-2 sentence description of who they are and their role
- role: Their role (Protagonist, Supporting Character, Antagonist, etc.)
- appearances: Estimated number of times they appear in this text (count mentions)
- relationships: Array of {{"character": "name", "type": "relationship type"}} (optional)

{existing_context}

Only extract main characters, not minor mentions. Return ONLY valid JSON, no markdown or explanation.

Text:
{all_text}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a literary analysis assistant. Extract character information from book chapters and return it as valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7
            )

            content = response.choices[0].message.content

            # Remove markdown code blocks if present
            content = content.replace("```json\n", "").replace("```\n", "").replace("```", "").strip()

            new_characters = json.loads(content)

            # Merge with existing characters
            for key, char in new_characters.items():
                if key in self.characters:
                    # Update existing character - add appearance count
                    self.characters[key]["appearances"] += char["appearances"]
                else:
                    # Add new character
                    self.characters[key] = char

            print(f"✓ Found {len(new_characters)} characters in this batch")
            print(f"✓ Total unique characters: {len(self.characters)}")

        except Exception as e:
            print(f"✗ Error extracting characters: {e}")
            raise

    def export_to_typescript(self):
        """Export data to TypeScript file"""
        print(f"\n💾 Exporting to {OUTPUT_FILE}...")

        # Convert chapters to pages format
        pages = [
            {
                "chapter": f"Chapter {ch['number']}",
                "text": ch["text"]
            }
            for ch in self.chapters
        ]

        ts_content = f'''/**
 * BOOK DATA CONFIGURATION
 * Generated by PDF Processor
 */

export interface Character {{
  name: string;
  description: string;
  role: string;
  appearances: number;
  relationships?: Array<{{
    character: string;
    type: string;
  }}>;
}}

export interface PageContent {{
  text: string;
  chapter: string;
}}

// ============================================
// CHARACTER DEFINITIONS
// ============================================
export const characters: Record<string, Character> = {json.dumps(self.characters, indent=2)};

// ============================================
// BOOK PAGES/CHAPTERS
// ============================================
export const pages: PageContent[] = {json.dumps(pages, indent=2)};

// ============================================
// BOOK METADATA
// ============================================
export const bookMetadata = {json.dumps(self.book_metadata, indent=2)};
'''

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(ts_content)

        print(f"✓ Exported successfully!")
        print(f"\nGenerated:")
        print(f"  - {len(self.chapters)} chapters")
        print(f"  - {len(self.characters)} characters")

    def run_interactive(self):
        """Run in interactive mode"""
        print("=" * 60)
        print("  PDF Chapter Processor - Character Extraction")
        print("=" * 60)
        print()

        # Setup
        self.setup_api()
        self.get_book_metadata()

        chapter_num = 1

        while True:
            print(f"\n=== Chapter {chapter_num} ===")
            print("Options:")
            print(f"  1. Add chapter {chapter_num} PDF")
            print("  2. Extract characters from current chapters")
            print("  3. Export and finish")
            print("  4. Quit without saving")

            choice = input("\nChoice: ").strip()

            if choice == "1":
                pdf_path = input(f"Path to chapter {chapter_num} PDF: ").strip()

                if not os.path.exists(pdf_path):
                    print(f"✗ File not found: {pdf_path}")
                    continue

                try:
                    self.process_chapter(pdf_path, chapter_num)
                    chapter_num += 1
                    print(f"✓ Chapter added! Total chapters: {len(self.chapters)}")
                except Exception as e:
                    print(f"✗ Error processing PDF: {e}")

            elif choice == "2":
                if not self.chapters:
                    print("✗ No chapters added yet!")
                    continue

                try:
                    self.extract_characters_with_llm()
                except Exception as e:
                    print(f"✗ Error: {e}")

            elif choice == "3":
                if not self.chapters:
                    print("✗ No chapters to export!")
                    continue

                self.export_to_typescript()
                print("\n✓ All done! Your reading app will automatically reload with the new book.")
                break

            elif choice == "4":
                print("Cancelled.")
                break

            else:
                print("Invalid choice")

    def run_batch(self, chapter_pdfs):
        """Run in batch mode with list of PDF paths"""
        print("=" * 60)
        print("  PDF Chapter Processor - Batch Mode")
        print("=" * 60)
        print()

        self.setup_api()
        self.get_book_metadata()

        # Process all chapters
        for idx, pdf_path in enumerate(chapter_pdfs, 1):
            if not os.path.exists(pdf_path):
                print(f"✗ File not found: {pdf_path}")
                continue

            try:
                self.process_chapter(pdf_path, idx)
            except Exception as e:
                print(f"✗ Error processing {pdf_path}: {e}")

        # Extract characters
        if self.chapters:
            self.extract_characters_with_llm()
            self.export_to_typescript()
            print("\n✓ All done!")
        else:
            print("✗ No chapters processed successfully")


def main():
    processor = PDFProcessor()

    # Check if chapters directory exists with PDFs
    if os.path.exists(CHAPTERS_DIR):
        pdf_files = sorted([
            os.path.join(CHAPTERS_DIR, f)
            for f in os.listdir(CHAPTERS_DIR)
            if f.lower().endswith('.pdf')
        ])

        if pdf_files:
            print(f"Found {len(pdf_files)} PDF files in {CHAPTERS_DIR}/")
            print("Files:", [os.path.basename(f) for f in pdf_files])
            mode = input("\nProcess all in batch mode? (y/n): ").lower()

            if mode == 'y':
                processor.run_batch(pdf_files)
                return

    # Otherwise run interactive mode
    processor.run_interactive()


if __name__ == "__main__":
    main()
