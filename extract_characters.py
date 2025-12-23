#!/usr/bin/env python3
"""
Character Extraction Tool
Automatically extracts characters from text excerpts in bookData.ts
"""

import os
import json
import re
from openai import OpenAI

# ====== CONFIGURATION ======
# Read API key from environment variable or .openai_key file
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY') or open('.openai_key', 'r').read().strip()
BOOK_DATA_PATH = "src/app/data/bookData.ts"
# ===========================


def extract_excerpts_from_bookdata(file_path):
    """Extract all excerpt texts from bookData.ts"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    excerpts = {}

    # Find all excerpt definitions (excerptA, excerptB, etc.)
    pattern = r'export const (excerpt[A-Z]).*?text: `(.*?)`\s*\}'
    matches = re.finditer(pattern, content, re.DOTALL)

    for match in matches:
        excerpt_name = match.group(1)
        excerpt_text = match.group(2)
        excerpts[excerpt_name] = excerpt_text.strip()

    return excerpts


def extract_characters_with_llm(client, text, excerpt_name):
    """Use LLM to extract characters from text"""
    print(f"\n[{excerpt_name}] Extracting characters with AI...")

    prompt = f"""Analyze this literary excerpt and extract ALL named characters AND their relationships.

Return a JSON object where each key is how the character appears in the text, and each value contains:
- name: Full character name
- description: Brief 1-2 sentence description
- role: Their role (Protagonist, Supporting Character, Antagonist, etc.)
- appearances: Estimated number of mentions in this text
- relationships: Array of {{"character": "name", "type": "relationship"}}

CRITICAL - Relationships:
Pay close attention to family relationships and interactions mentioned in the text:
- Family: "father", "mother", "daughter", "son", "sister", "brother", "husband", "wife", "spouse"
- Social: "friend", "enemy", "rival", "ally", "servant", "master"
- Romantic: "lover", "love interest", "betrothed", "suitor"

Extract EVERY relationship mentioned or implied in the text. For example:
- If text says "his wife" or "her husband" → add spouse relationship
- If text says "their daughter" → add daughter/parent relationship
- If characters are described interacting → note the relationship type

IMPORTANT: Only include characters that are actually NAMED in this text. Do not include:
- Generic references like "the crowd", "people", "soldiers"
- Titles without names like "the king", "the cardinal" (unless that's their primary identifier)

Return ONLY valid JSON, no markdown or explanation.

Text:
{text[:3000]}"""  # Limit to first 3000 chars to avoid token limits

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a literary analysis assistant. Extract character information and return it as valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    content = response.choices[0].message.content
    content = content.replace("```json\n", "").replace("```\n", "").replace("```", "").strip()

    try:
        characters = json.loads(content)
        print(f"[{excerpt_name}] Found {len(characters)} characters")
        return characters
    except json.JSONDecodeError as e:
        print(f"[{excerpt_name}] ERROR parsing JSON: {e}")
        print(f"Response was: {content[:200]}")
        return {}


def merge_characters(all_chars, new_chars):
    """Merge new characters into existing character dict"""
    for key, char in new_chars.items():
        if key in all_chars:
            # Character exists, update appearance count
            all_chars[key]["appearances"] += char.get("appearances", 1)
        else:
            # New character
            all_chars[key] = char
    return all_chars


def make_relationships_bidirectional(characters):
    """Create reverse relationships so networks work properly"""
    # Mapping of relationship types to their reverse
    reverse_relationships = {
        'husband': 'wife',
        'wife': 'husband',
        'father': 'daughter',
        'mother': 'daughter',
        'daughter': 'mother',
        'son': 'father',
        'sister': 'sister',
        'brother': 'brother',
        'friend': 'friend',
        'enemy': 'enemy',
        'rival': 'rival',
        'ally': 'ally',
        'lover': 'lover',
        'love interest': 'love interest',
    }

    # Collect all relationships to add
    relationships_to_add = {}

    for char_key, char_data in characters.items():
        if 'relationships' not in char_data or not char_data['relationships']:
            continue

        for rel in char_data['relationships']:
            target_char = rel['character']
            rel_type = rel['type'].lower()

            # Find reverse relationship type
            reverse_type = reverse_relationships.get(rel_type, rel_type)

            # Handle daughter/son -> need to determine parent gender
            if rel_type in ['daughter', 'son']:
                # If this character is a daughter/son, the reverse should be mother/father
                # We'll use the character name to guess (Mr. = father, Mrs. = mother)
                if 'Mrs.' in char_key or 'mother' in char_data.get('name', '').lower():
                    reverse_type = 'mother'
                elif 'Mr.' in char_key or 'father' in char_data.get('name', '').lower():
                    reverse_type = 'father'
                else:
                    reverse_type = 'parent'

            # Store the reverse relationship to add
            if target_char not in relationships_to_add:
                relationships_to_add[target_char] = []

            # Check if reverse relationship doesn't already exist
            reverse_rel = {'character': char_key, 'type': reverse_type}
            if reverse_rel not in relationships_to_add[target_char]:
                relationships_to_add[target_char].append(reverse_rel)

    # Add the reverse relationships
    for char_key, new_rels in relationships_to_add.items():
        if char_key in characters:
            if 'relationships' not in characters[char_key]:
                characters[char_key]['relationships'] = []

            # Add new relationships that don't already exist
            existing_rels = characters[char_key]['relationships']
            for new_rel in new_rels:
                # Check if this relationship already exists
                already_exists = any(
                    r['character'] == new_rel['character'] and r['type'] == new_rel['type']
                    for r in existing_rels
                )
                if not already_exists:
                    existing_rels.append(new_rel)

    return characters


def generate_typescript_characters(characters):
    """Generate TypeScript code for character definitions"""
    ts_chars = "export const characters: Record<string, Character> = {\n"

    for key, char in characters.items():
        ts_chars += f"  '{key}': {{\n"
        ts_chars += f"    name: {json.dumps(char.get('name', key))},\n"
        ts_chars += f"    description: {json.dumps(char.get('description', 'A character in the story.'))},\n"
        ts_chars += f"    role: {json.dumps(char.get('role', 'Supporting Character'))},\n"
        ts_chars += f"    appearances: {char.get('appearances', 1)}"

        if 'relationships' in char and char['relationships']:
            ts_chars += ",\n    relationships: [\n"
            for rel in char['relationships']:
                ts_chars += f"      {{ character: {json.dumps(rel.get('character', ''))}, type: {json.dumps(rel.get('type', ''))} }},\n"
            ts_chars += "    ]"

        ts_chars += "\n  },\n"

    ts_chars += "};\n"
    return ts_chars


def update_bookdata_file(file_path, new_characters_code):
    """Update bookData.ts with new character definitions"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the character definition section
    pattern = r'export const characters: Record<string, Character> = \{.*?\};'

    # Replace the character definitions (use raw string replacement to avoid regex escaping issues)
    def replacer(match):
        return new_characters_code.strip()

    updated_content = re.sub(pattern, replacer, content, flags=re.DOTALL)

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print(f"\n[OK] Updated {file_path}")


def main():
    print("=" * 60)
    print("  Character Extraction Tool")
    print("=" * 60)

    # Setup OpenAI
    client = OpenAI(api_key=OPENAI_API_KEY)
    print("[OK] OpenAI API configured\n")

    # Extract excerpts from bookData.ts
    print(f"Reading excerpts from {BOOK_DATA_PATH}...")
    excerpts = extract_excerpts_from_bookdata(BOOK_DATA_PATH)
    print(f"[OK] Found {len(excerpts)} excerpts: {', '.join(excerpts.keys())}\n")

    # Extract characters from each excerpt
    all_characters = {}
    for excerpt_name, text in excerpts.items():
        chars = extract_characters_with_llm(client, text, excerpt_name)
        all_characters = merge_characters(all_characters, chars)

    print(f"\n[OK] Total unique characters across all excerpts: {len(all_characters)}")
    print(f"Characters: {', '.join(all_characters.keys())}\n")

    # Make relationships bidirectional (so network graphs work properly)
    print("Making relationships bidirectional...")
    all_characters = make_relationships_bidirectional(all_characters)
    print("[OK] Relationships are now bidirectional\n")

    # Generate TypeScript code
    ts_code = generate_typescript_characters(all_characters)

    # Update bookData.ts
    update_bookdata_file(BOOK_DATA_PATH, ts_code)

    print("\n" + "=" * 60)
    print("  DONE!")
    print("=" * 60)
    print(f"\nExtracted {len(all_characters)} characters from {len(excerpts)} excerpts")
    print("\nYour reading interface will now automatically detect these characters:")
    for name in all_characters.keys():
        print(f"  - {name}")
    print("\nRefresh your browser to see the changes!")


if __name__ == "__main__":
    main()
