import { useState } from 'react';
import { Upload, FileText, Download, Sparkles, Trash2, Users } from 'lucide-react';
import { Character, PageContent } from '../data/bookData';

interface ProcessedChapter {
  chapterNumber: number;
  text: string;
  fileName: string;
}

export function PDFProcessor() {
  const [chapters, setChapters] = useState<ProcessedChapter[]>([]);
  const [characters, setCharacters] = useState<Record<string, Character>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookYear, setBookYear] = useState('');

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Import PDF.js dynamically
      const pdfjsLib = await import('pdfjs-dist');

      // Set worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      // Add as new chapter
      const newChapter: ProcessedChapter = {
        chapterNumber: chapters.length + 1,
        text: fullText.trim(),
        fileName: file.name
      };

      setChapters([...chapters, newChapter]);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractCharactersWithLLM = async () => {
    if (!apiKey) {
      alert('Please enter your OpenAI API key first');
      return;
    }

    if (chapters.length === 0) {
      alert('Please upload at least one chapter first');
      return;
    }

    setIsProcessing(true);
    try {
      // Get all chapter texts
      const allText = chapters.map(ch => ch.text).join('\n\n');

      // Build context about existing characters
      const existingCharacters = Object.keys(characters).length > 0
        ? `\n\nExisting characters already identified:\n${Object.keys(characters).join(', ')}\n\nPlease identify any NEW characters not in this list, and also update appearance counts for existing characters if they appear in this chapter.`
        : '';

      const prompt = `Analyze this chapter from a book and extract character information. Return a JSON object where each key is the character's name as it appears in the text, and the value contains:
- name: Full character name
- description: Brief 1-2 sentence description of who they are and their role
- role: Their role (Protagonist, Supporting Character, Antagonist, etc.)
- appearances: Estimated number of times they appear in this text (count mentions)
- relationships: Array of {character: "name", type: "relationship type"} (optional)

${existingCharacters}

Only extract main characters, not minor mentions. Return ONLY valid JSON, no markdown or explanation.

Text:
${allText}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a literary analysis assistant. Extract character information from book chapters and return it as valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse the JSON response
      let newCharacters;
      try {
        // Remove markdown code blocks if present
        const jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        newCharacters = JSON.parse(jsonText);
      } catch (e) {
        console.error('Failed to parse LLM response:', content);
        throw new Error('Failed to parse character data from LLM response');
      }

      // Merge with existing characters (add new ones, update appearance counts for existing)
      const mergedCharacters = { ...characters };

      for (const [key, char] of Object.entries(newCharacters) as [string, Character][]) {
        if (mergedCharacters[key]) {
          // Update existing character - add appearance count
          mergedCharacters[key] = {
            ...mergedCharacters[key],
            appearances: mergedCharacters[key].appearances + char.appearances
          };
        } else {
          // Add new character
          mergedCharacters[key] = char;
        }
      }

      setCharacters(mergedCharacters);
      alert(`Successfully processed! Found ${Object.keys(newCharacters).length} characters in this chapter.`);
    } catch (error) {
      console.error('Error extracting characters:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToBookData = () => {
    if (Object.keys(characters).length === 0 && chapters.length === 0) {
      alert('Nothing to export. Upload chapters and extract characters first.');
      return;
    }

    // Convert chapters to pages format
    const pages: PageContent[] = chapters.map(ch => ({
      chapter: `Chapter ${ch.chapterNumber}`,
      text: ch.text
    }));

    const bookData = {
      characters,
      pages,
      bookMetadata: {
        title: bookTitle || 'My Book',
        author: bookAuthor || 'Unknown Author',
        year: parseInt(bookYear) || new Date().getFullYear()
      }
    };

    // Create TypeScript file content
    const tsContent = `/**
 * BOOK DATA CONFIGURATION
 * Generated by PDF Processor
 */

export interface Character {
  name: string;
  description: string;
  role: string;
  appearances: number;
  relationships?: Array<{
    character: string;
    type: string;
  }>;
}

export interface PageContent {
  text: string;
  chapter: string;
}

// ============================================
// CHARACTER DEFINITIONS
// ============================================
export const characters: Record<string, Character> = ${JSON.stringify(characters, null, 2)};

// ============================================
// BOOK PAGES/CHAPTERS
// ============================================
export const pages: PageContent[] = ${JSON.stringify(pages, null, 2)};

// ============================================
// BOOK METADATA
// ============================================
export const bookMetadata = ${JSON.stringify(bookData.bookMetadata, null, 2)};
`;

    // Download the file
    const blob = new Blob([tsContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookData.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Exported! Replace src/app/data/bookData.ts with the downloaded file.');
  };

  const clearAll = () => {
    if (confirm('Clear all chapters and characters? This cannot be undone.')) {
      setChapters([]);
      setCharacters({});
    }
  };

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDF Chapter Processor</h1>
              <p className="text-sm text-gray-600">Upload chapters progressively and extract characters with AI</p>
            </div>
          </div>

          {/* Book Metadata */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <input
              type="text"
              placeholder="Book Title"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Author Name"
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Year"
              value={bookYear}
              onChange={(e) => setBookYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* API Key Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key (for character extraction)
            </label>
            <input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key is only used in your browser and never stored on any server
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Chapters */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Chapters ({chapters.length})
            </h2>

            {/* Upload Button */}
            <label className="block">
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <Upload className="w-12 h-12 mx-auto text-purple-600 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {isProcessing ? 'Processing PDF...' : 'Upload Chapter PDF'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click to select a PDF file
                </p>
              </div>
            </label>

            {/* Chapter List */}
            <div className="mt-4 space-y-2">
              {chapters.map((chapter, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-700">
                        {chapter.chapterNumber}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{chapter.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {chapter.text.length.toLocaleString()} characters
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeChapter(index)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>

            {/* Extract Characters Button */}
            {chapters.length > 0 && (
              <button
                onClick={extractCharactersWithLLM}
                disabled={isProcessing || !apiKey}
                className="w-full mt-4 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {isProcessing ? 'Processing...' : 'Extract Characters with AI'}
              </button>
            )}
          </div>

          {/* Right Column - Characters */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Extracted Characters ({Object.keys(characters).length})
            </h2>

            {Object.keys(characters).length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">
                  No characters extracted yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Upload chapters and click "Extract Characters"
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {Object.entries(characters).map(([key, char]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{char.name}</h3>
                      <span className="text-xs text-gray-500">{char.role}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{char.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Appearances: {char.appearances}</span>
                      {char.relationships && char.relationships.length > 0 && (
                        <span>{char.relationships.length} relationships</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <button
                onClick={exportToBookData}
                disabled={Object.keys(characters).length === 0 && chapters.length === 0}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export to bookData.ts
              </button>

              <button
                onClick={clearAll}
                disabled={chapters.length === 0 && Object.keys(characters).length === 0}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Enter your book metadata (title, author, year) at the top</li>
            <li>Add your OpenAI API key (get one at platform.openai.com)</li>
            <li>Upload Chapter 1 PDF - text will be extracted automatically</li>
            <li>Click "Extract Characters with AI" - AI will identify characters and their info</li>
            <li>Upload Chapter 2 PDF - AI will add new characters and update existing ones</li>
            <li>Continue uploading chapters progressively</li>
            <li>When done, click "Export to bookData.ts" and replace the file in src/app/data/</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
