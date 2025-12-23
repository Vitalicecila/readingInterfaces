import { useState } from 'react';
import { BookOpen, Settings, Sun, X } from 'lucide-react';
import { characters, bookMetadata } from '../data/bookData';
import { getExcerptForMode } from '../data/excerptLoader';

// Node positions for the network visualization
const nodePositions: Record<string, { x: number; y: number }> = {
  'Elizabeth': { x: 350, y: 200 },
  'Mr. Darcy': { x: 550, y: 200 },
  'Jane': { x: 250, y: 320 },
  'Mr. Bingley': { x: 650, y: 320 },
  'Mrs. Bennet': { x: 300, y: 450 }
};

export function NetworkReader() {
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'white' | 'sepia'>('sepia');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  // Load excerpt based on condition and mode for counterbalancing
  const pages = getExcerptForMode('network');

  const handleCharacterClick = (characterName: string) => {
    console.log('Character clicked:', characterName);
    if (characters[characterName]) {
      setSelectedCharacter(characterName);
    } else {
      console.error('Character not found:', characterName);
    }
  };

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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCharacterClick(characterName);
          }}
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

  const renderNetwork = () => {
    if (!selectedCharacter) return null;

    const character = characters[selectedCharacter];

    // Handle characters with no relationships
    if (!character.relationships || character.relationships.length === 0) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Character Relationships: {character.name}</h3>
              <button
                onClick={() => setSelectedCharacter(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600">No relationships defined for this character in the current excerpt.</p>
          </div>
        </div>
      );
    }

    const allConnectedChars = new Set([selectedCharacter]);
    character.relationships.forEach(rel => allConnectedChars.add(rel.character));

    const getRelationshipColor = (type: string) => {
      const colors: Record<string, string> = {
        'Love Interest': '#e11d48',
        'Sister': '#8b5cf6',
        'Mother': '#3b82f6',
        'Father': '#0ea5e9',
        'Daughter': '#3b82f6',
        'Husband': '#8b5cf6',
        'Wife': '#a855f7',
        'Friend': '#10b981',
        'Best Friend': '#059669'
      };
      return colors[type] || '#6b7280';
    };

    // Calculate positions in a circle around the center
    const centerX = 400;
    const centerY = 300;
    const radius = 220;
    const angleStep = (2 * Math.PI) / character.relationships.length;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Character Relationships: {character.name}</h3>
            <button
              onClick={() => setSelectedCharacter(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8">
            {/* Network Visualization */}
            <div className="relative w-full h-[600px] flex items-center justify-center">
              {/* SVG for arrows */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#9ca3af" />
                  </marker>
                </defs>
                {character.relationships.map((rel, index) => {
                  const angle = angleStep * index - Math.PI / 2;
                  const endX = centerX + radius * Math.cos(angle);
                  const endY = centerY + radius * Math.sin(angle);
                  
                  // Calculate start and end points accounting for circle sizes
                  const dx = endX - centerX;
                  const dy = endY - centerY;
                  const length = Math.sqrt(dx * dx + dy * dy);
                  
                  const startX = centerX + (dx / length) * 70;
                  const startY = centerY + (dy / length) * 70;
                  const actualEndX = centerX + (dx / length) * (radius - 60);
                  const actualEndY = centerY + (dy / length) * (radius - 60);

                  return (
                    <g key={index}>
                      <line
                        x1={startX}
                        y1={startY}
                        x2={actualEndX}
                        y2={actualEndY}
                        stroke={getRelationshipColor(rel.type)}
                        strokeWidth="3"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Center Character */}
              <div 
                className="absolute"
                style={{ 
                  left: centerX, 
                  top: centerY,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl border-4 border-blue-300">
                    <div className="text-center px-4">
                      <div className="text-white font-bold text-sm">{character.name}</div>
                      <div className="text-blue-100 text-xs mt-1">{character.role}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
                    {character.appearances} appearances
                  </div>
                </div>
              </div>

              {/* Connected Characters in Circle */}
              {character.relationships.map((rel, index) => {
                const angle = angleStep * index - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                const relatedChar = characters[rel.character];

                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{ 
                      left: x, 
                      top: y,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10
                    }}
                  >
                    <div className="flex flex-col items-center">
                      {/* Relationship Label Above */}
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white mb-2 shadow-lg"
                        style={{ backgroundColor: getRelationshipColor(rel.type) }}
                      >
                        {rel.type}
                      </div>
                      
                      {/* Character Circle */}
                      <div 
                        className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform border-2 border-white"
                        onClick={() => handleCharacterClick(rel.character)}
                      >
                        <div className="text-center px-3">
                          <div className="text-white font-semibold text-xs leading-tight">{rel.character}</div>
                          <div className="text-purple-100 text-xs mt-1">{relatedChar.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold mb-3">Relationship Types</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'Love Interest', color: '#e11d48' },
                  { type: 'Family (Parents)', color: '#3b82f6' },
                  { type: 'Sibling', color: '#8b5cf6' },
                  { type: 'Friend', color: '#10b981' },
                  { type: 'Best Friend', color: '#059669' },
                  { type: 'Spouse', color: '#a855f7' }
                ].map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-600">{item.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
            {pages[0].chapter}
          </h2>
          <div
            className="leading-relaxed whitespace-pre-line"
            style={{ fontSize: `${fontSize}px` }}
          >
            {renderTextWithCharacters(pages[0].text)}
          </div>
        </div>
      </div>

      {/* Network Visualization Modal */}
      {selectedCharacter && renderNetwork()}

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