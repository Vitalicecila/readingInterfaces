import { useState } from 'react';
import { BookOpen, Settings, Sun, User } from 'lucide-react';
import { characters, bookMetadata } from '../data/bookData';
import { getExcerptForMode } from '../data/excerptLoader';

export function TabbedReader() {
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'white' | 'sepia'>('sepia');
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'reading' | 'characters'>('reading');

  // Load excerpt based on condition and mode for counterbalancing
  const pages = getExcerptForMode('tabbed');

  const renderTextWithCharacters = (text: string) => {
    const parts: React.JSX.Element[] = [];
    let lastIndex = 0;
    let key = 0;

    const sortedCharacterNames = Object.keys(characters).sort((a, b) => b.length - a.length);

    const findNextCharacter = (startIndex: number): { name: string; index: number } | null => {
      let closestMatch: { name: string; index: number } | null = null;
      let closestIndex = text.length;

      for (const name of sortedCharacterNames) {
        const index = text.indexOf(name, startIndex);
        if (index !== -1 && index < closestIndex) {
          closestIndex = index;
          closestMatch = { name, index };
        }
      }

      return closestMatch;
    };

    let match = findNextCharacter(lastIndex);
    while (match !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${key++}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      const characterName = match.name;
      parts.push(
        <span
          key={`char-${key++}`}
          className="character-name"
          onClick={() => setActiveTab('characters')}
        >
          {match.name}
        </span>
      );

      lastIndex = match.index + match.name.length;
      match = findNextCharacter(lastIndex);
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${key++}`}>
          {text.substring(lastIndex)}
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

      {/* Tabs */}
      <div className="border-b border-gray-300">
        <div className="flex">
          <button
            onClick={() => setActiveTab('reading')}
            className={`px-6 py-3 transition-colors relative ${
              activeTab === 'reading'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reading
            {activeTab === 'reading' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-6 py-3 transition-colors relative ${
              activeTab === 'characters'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Character Info
            {activeTab === 'characters' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && activeTab === 'reading' && (
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

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'reading' ? (
          <div className="max-w-3xl mx-auto px-8 py-12">
            <h2 className="mb-8 text-center opacity-60">
              {pages[0].chapter}
            </h2>
            <div
              className="leading-relaxed whitespace-pre-line"
              style={{ fontSize: `${fontSize}px` }}
            >
              {renderTextWithCharacters(pages[0].text)}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-8 py-12">
            {(() => {
              // Determine which characters appear on current page
              const currentPageText = pages[0].text;
              const charactersOnPage: typeof characters = {};
              const charactersNotOnPage: typeof characters = {};

              Object.entries(characters).forEach(([key, character]) => {
                // Check if any form of the character name appears in the text
                const characterNames = [key, character.name];
                const appearsOnPage = characterNames.some(name =>
                  currentPageText.includes(name)
                );

                if (appearsOnPage) {
                  charactersOnPage[key] = character;
                } else {
                  charactersNotOnPage[key] = character;
                }
              });

              return (
                <>
                  {/* Characters on current page */}
                  {Object.keys(charactersOnPage).length > 0 && (
                    <>
                      <h2 className="mb-4 text-xl font-semibold">Characters on This Page</h2>
                      <div className="grid gap-4 mb-8">
                        {Object.values(charactersOnPage).map((character) => (
                          <div
                            key={character.name}
                            className="border border-green-300 bg-green-50/50 rounded-lg p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                <User className="w-7 h-7 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-baseline gap-3 mb-2">
                                  <h3 className="font-semibold">{character.name}</h3>
                                  <span className="text-sm text-gray-500">{character.role}</span>
                                </div>
                                <p className="text-sm leading-relaxed mb-3 text-gray-700">
                                  {character.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span>Appearances:</span>
                                  <span className="font-semibold text-gray-700">{character.appearances}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Characters not on current page */}
                  {Object.keys(charactersNotOnPage).length > 0 && (
                    <>
                      <h2 className="mb-4 text-xl font-semibold text-gray-500">Other Characters</h2>
                      <div className="grid gap-4 opacity-60">
                        {Object.values(charactersNotOnPage).map((character) => (
                          <div
                            key={character.name}
                            className="border border-gray-300 rounded-lg p-6 bg-white/50 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0">
                                <User className="w-7 h-7 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-baseline gap-3 mb-2">
                                  <h3 className="font-semibold">{character.name}</h3>
                                  <span className="text-sm text-gray-500">{character.role}</span>
                                </div>
                                <p className="text-sm leading-relaxed mb-3 text-gray-700">
                                  {character.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span>Appearances:</span>
                                  <span className="font-semibold text-gray-700">{character.appearances}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      <style>{`
        .character-name {
          color: #0066cc;
          cursor: pointer;
          border-bottom: 1px dashed #0066cc;
          text-decoration: none;
          transition: all 0.2s;
        }
        .character-name:hover {
          color: #0052a3;
          border-bottom-color: #0052a3;
          background-color: rgba(0, 102, 204, 0.1);
        }
      `}</style>
    </div>
  );
}