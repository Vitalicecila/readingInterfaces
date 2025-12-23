import { useState, useEffect } from 'react';
import { BookOpen, Settings, Sun, Sparkles } from 'lucide-react';
import { characters, bookMetadata } from '../data/bookData';
import { getExcerptForMode } from '../data/excerptLoader';

interface CharacterDescription {
  description: string;
  loading: boolean;
  originalSentence?: string;
  sentenceStart?: number;
  sentenceEnd?: number;
}

// Configuration - Add your OpenAI API key here for real-time LLM responses
const OPENAI_API_KEY = ''; // Leave empty to use fallback descriptions - DO NOT commit API keys!
const USE_REAL_LLM = false; // Set to true to enable real API calls (requires API key)

const ScrambleText = ({ text }: { text: string }) => {
  const [scrambled, setScrambled] = useState(text);

  useEffect(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyz ';
    let iteration = 0;
    const interval = setInterval(() => {
      setScrambled(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <>{scrambled}</>;
};

export function LLMReader() {
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'white' | 'sepia'>('sepia');
  const [showSettings, setShowSettings] = useState(false);
  const [expandedCharacters, setExpandedCharacters] = useState<Set<string>>(new Set());
  const [showInstructions, setShowInstructions] = useState(true);
  const [llmDescriptions, setLlmDescriptions] = useState<Record<string, CharacterDescription>>({});

  // Load excerpt based on condition and mode for counterbalancing
  const pages = getExcerptForMode('llm');

  // Generate unique key for each character occurrence by position
  const getOccurrenceKey = (characterName: string, position: number) => `${characterName}-${position}`;

  const toggleCharacterDescription = async (characterName: string, position: number, sentenceContext?: string, sentenceStart?: number, sentenceEnd?: number) => {
    const occurrenceKey = getOccurrenceKey(characterName, position);
    const isExpanding = !expandedCharacters.has(occurrenceKey);

    setExpandedCharacters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(occurrenceKey)) {
        newSet.delete(occurrenceKey);
      } else {
        newSet.add(occurrenceKey);
      }
      return newSet;
    });

    // If expanding and using real LLM, fetch description
    if (isExpanding && USE_REAL_LLM && OPENAI_API_KEY && !llmDescriptions[occurrenceKey] && sentenceContext && sentenceStart !== undefined && sentenceEnd !== undefined) {
      await fetchLLMDescription(occurrenceKey, characterName, sentenceContext, sentenceStart, sentenceEnd);
    }
  };

  const getSentenceBoundaries = (text: string, characterIndex: number): { start: number; end: number; sentence: string } => {
    // Find sentence start (look backwards for . ! ? or start of text)
    let sentenceStart = 0;
    for (let i = characterIndex - 1; i >= 0; i--) {
      if (text[i] === '.' || text[i] === '!' || text[i] === '?') {
        sentenceStart = i + 1;
        break;
      }
    }

    // Find sentence end (look forwards for . ! ? or end of text)
    let sentenceEnd = text.length;
    for (let i = characterIndex; i < text.length; i++) {
      if (text[i] === '.' || text[i] === '!' || text[i] === '?') {
        sentenceEnd = i + 1;
        break;
      }
    }

    return {
      start: sentenceStart,
      end: sentenceEnd,
      sentence: text.substring(sentenceStart, sentenceEnd).trim()
    };
  };

  const fetchLLMDescription = async (occurrenceKey: string, characterName: string, sentenceContext: string, sentenceStart: number, sentenceEnd: number) => {
    // Set loading state
    setLlmDescriptions(prev => ({
      ...prev,
      [occurrenceKey]: {
        description: '',
        loading: true,
        originalSentence: sentenceContext,
        sentenceStart,
        sentenceEnd
      }
    }));

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a literary assistant helping readers remember characters. Generate a brief, natural-sounding phrase that identifies who a character is. This phrase will be inserted after the character\'s name. Keep the author\'s voice and write in a way that feels like it could have been in the original text.'
            },
            {
              role: 'user',
              content: `Character: "${characterName}"\n\nContext sentence: "${sentenceContext}"\n\nGenerate a SHORT identifying phrase (5-10 words) that tells readers who ${characterName} is. Include:\n- Their key relationship OR role OR defining characteristic\n- Match the tone and period of the original text\n\nExamples of good phrases:\n- "the witty father of five daughters"\n- "her eldest and most beautiful sister"\n- "the anxious mother"\n- "his wealthy and cheerful friend"\n\nReturn ONLY the short identifying phrase (no quotes, no extra explanation).`
            }
          ],
          temperature: 0.7,
          seed: characterName.charCodeAt(0) * 1000, // Deterministic seed
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch LLM response');
      }

      const data = await response.json();
      const description = data.choices[0].message.content;

      setLlmDescriptions(prev => ({
        ...prev,
        [occurrenceKey]: {
          description,
          loading: false,
          originalSentence: sentenceContext,
          sentenceStart,
          sentenceEnd
        }
      }));
    } catch (error) {
      console.error('Error fetching LLM description:', error);
      // Fallback to static description
      setLlmDescriptions(prev => ({
        ...prev,
        [occurrenceKey]: {
          description: characters[characterName]?.description || 'Character information unavailable',
          loading: false
        }
      }));
    }
  };

  const renderFormattedText = (text: string) => {
    const parts: React.ReactElement[] = [];
    let key = 0;

    const sortedCharacterNames = Object.keys(characters).sort((a, b) => b.length - a.length);
    const matches = findAllCharacterMatches(text, sortedCharacterNames, 0);
    parts.push(...renderTextWithCharacters(text, matches, 0, key));

    return parts;
  };

  const findAllCharacterMatches = (text: string, characterNames: string[], offset: number) => {
    const matches: Array<{ name: string; index: number }> = [];
    for (const name of characterNames) {
      let index = text.indexOf(name);
      while (index !== -1) {
        matches.push({ name, index: index + offset });
        index = text.indexOf(name, index + 1);
      }
    }
    return matches.sort((a, b) => a.index - b.index);
  };

  const renderTextWithCharacters = (text: string, matches: Array<{ name: string; index: number }>, textOffset: number, keyOffset: number) => {
    const parts: React.ReactElement[] = [];
    let lastIdx = 0;

    for (const match of matches) {
      const localIndex = match.index - textOffset;

      const occurrenceKey = getOccurrenceKey(match.name, match.index);
      const isExpanded = expandedCharacters.has(occurrenceKey);
      const llmDesc = llmDescriptions[occurrenceKey];

      // Add text before character
      if (localIndex > lastIdx) {
        parts.push(
          <span key={`t-${keyOffset++}`}>
            {text.substring(lastIdx, localIndex)}
          </span>
        );
      }

      // Add character name as clickable with optional description
      const boundaries = getSentenceBoundaries(pages[0].text, match.index);
      parts.push(
        <span key={`c-${keyOffset++}`}>
          <span
            className="character-name-llm"
            onClick={() => {
              toggleCharacterDescription(match.name, match.index, boundaries.sentence, boundaries.start, boundaries.end);
            }}
          >
            {match.name}
          </span>
          {isExpanded && (
            <span className="character-description-inline">
              {llmDesc?.loading ? (
                <> — <ScrambleText text="generating context" /></>
              ) : llmDesc?.description ? (
                <>, {llmDesc.description},</>
              ) : (
                <>, {characters[match.name]?.description},</>
              )}
            </span>
          )}
        </span>
      );

      lastIdx = localIndex + match.name.length;
    }

    // Add remaining text
    if (lastIdx < text.length) {
      parts.push(
        <span key={`t-${keyOffset++}`}>
          {text.substring(lastIdx)}
        </span>
      );
    }

    return parts;
  };

  const themeColors = {
    white: {
      bg: 'bg-white',
      text: 'text-gray-900'
    },
    sepia: {
      bg: 'bg-[#f4f1ea]',
      text: 'text-[#5f4b32]'
    }
  };

  return (
    <div className={`min-h-screen ${themeColors[theme].bg} ${themeColors[theme].text} flex flex-col`}>
      {/* Header */}
      <header className="border-b border-gray-300 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-semibold">{bookMetadata.title}</span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            LLM Enhanced
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'white' ? 'sepia' : 'white')}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            <Sun className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-gray-300 px-4 py-3 bg-black/5">
          <div className="flex items-center gap-4">
            <span className="text-sm">Font Size:</span>
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="px-3 py-1 border border-gray-400 rounded hover:bg-black/10 transition-colors"
            >
              A-
            </button>
            <span className="text-sm">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              className="px-3 py-1 border border-gray-400 rounded hover:bg-black/10 transition-colors"
            >
              A+
            </button>
          </div>
        </div>
      )}

      {/* Reading Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h2 className="mb-8 text-center opacity-60">
            {pages[0].chapter}
          </h2>
          <div
            className="leading-relaxed whitespace-pre-line"
            style={{ fontSize: `${fontSize}px` }}
          >
            {renderFormattedText(pages[0].text)}
          </div>
        </div>
      </div>

      {/* Instructions Popup Overlay */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-slideIn">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">LLM Enhanced Mode</h3>
                <p className="text-sm text-gray-600">
                  Click on any character name (shown in <span className="text-purple-600 font-semibold">purple</span>) to dynamically insert their description inline. Click again to remove it.
                </p>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-purple-900">
                {USE_REAL_LLM
                  ? 'This uses real-time AI to provide contextual character information. Each response is seeded for consistency across readers.'
                  : 'This simulates how an LLM might enhance text with contextual information on demand, directly modifying what you see in the reading experience.'}
              </p>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full bg-purple-600 text-white py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <style>{`
        .character-name-llm {
          color: #7c3aed;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid #7c3aed;
          transition: all 0.2s;
        }
        .character-name-llm:hover {
          color: #6b21a8;
          background-color: rgba(124, 58, 237, 0.1);
        }
        .character-description-inline {
          color: #6b21a8;
          font-style: italic;
          font-size: 0.95em;
          animation: fadeIn 0.3s ease-in;
        }
        .rewritten-sentence {
          color: #6b21a8;
          font-style: italic;
          animation: fadeIn 0.3s ease-in;
          background-color: rgba(124, 58, 237, 0.05);
          padding: 2px 4px;
          border-radius: 4px;
        }
        .character-context-note {
          color: #059669;
          font-style: italic;
          font-size: 0.9em;
          animation: fadeIn 0.3s ease-in;
          opacity: 0.9;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
