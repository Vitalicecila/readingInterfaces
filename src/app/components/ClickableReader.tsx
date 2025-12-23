import { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Settings, Sun } from 'lucide-react';
import { CharacterPopover } from './CharacterPopover';
import { characters, bookMetadata } from '../data/bookData';
import { getExcerptForMode } from '../data/excerptLoader';

export function ClickableReader() {
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'white' | 'sepia'>('sepia');
  const [showSettings, setShowSettings] = useState(false);

  // Load excerpt based on condition and mode for counterbalancing
  const pages = getExcerptForMode('clickable');

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderTextWithCharacters = (text: string) => {
    const parts: React.JSX.Element[] = [];
    let lastIndex = 0;
    let key = 0;

    // Sort character names by length (longest first) to match longer names first
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
      // Add text before the character name
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${key++}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add the character name as a clickable element
      parts.push(
        <CharacterPopover key={`char-${key++}`} character={characters[match.name]}>
          <span className="character-name">
            {match.name}
          </span>
        </CharacterPopover>
      );

      lastIndex = match.index + match.name.length;
      match = findNextCharacter(lastIndex);
    }

    // Add remaining text
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
        <div className="max-w-3xl mx-auto px-8 py-12">
          <h2 className="mb-8 text-center opacity-60">
            {pages[currentPage].chapter}
          </h2>
          <div
            className="leading-relaxed whitespace-pre-line"
            style={{ fontSize: `${fontSize}px` }}
          >
            {renderTextWithCharacters(pages[currentPage].text)}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="border-t border-gray-300 px-4 py-4 flex items-center justify-between">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        <div className="text-sm opacity-60">
          Page {currentPage + 1} of {pages.length}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>

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