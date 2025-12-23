import { BookOpen, User } from 'lucide-react';
import { characters, bookMetadata } from '../data/bookData';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-semibold">Character Reading Interface</span>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            Reading Interface Prototype
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Four different approaches to character information
          </p>
          <p className="text-sm text-gray-500">
            Use the buttons in the top-right corner to switch between reading modes
          </p>
        </div>

        {/* Character List */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            All Characters ({Object.keys(characters).length})
          </h2>
          <div className="grid gap-4">
            {Object.values(characters).map((character) => (
              <div
                key={character.name}
                className="border border-gray-300 rounded-lg p-6 bg-white hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{character.name}</h3>
                      <span className="text-sm text-gray-500">{character.role}</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-3 text-gray-700">
                      {character.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Appearances:</span>
                      <span className="font-semibold text-gray-700">{character.appearances}</span>
                    </div>
                    {character.relationships && character.relationships.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {character.relationships.map((rel, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                          >
                            {rel.type}: {rel.character}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reading Modes Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
            <h3 className="font-semibold text-lg mb-2 text-blue-900">Tabbed View</h3>
            <p className="text-sm text-blue-800">
              Switch between reading and character info in separate tabs
            </p>
          </div>
          <div className="border border-green-200 rounded-lg p-6 bg-green-50">
            <h3 className="font-semibold text-lg mb-2 text-green-900">Clickable Names</h3>
            <p className="text-sm text-green-800">
              Click on character names to see popover information
            </p>
          </div>
          <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
            <h3 className="font-semibold text-lg mb-2 text-purple-900">Network View</h3>
            <p className="text-sm text-purple-800">
              Visualize character relationships in an interactive network
            </p>
          </div>
          <div className="border border-pink-200 rounded-lg p-6 bg-pink-50">
            <h3 className="font-semibold text-lg mb-2 text-pink-900">LLM Enhanced</h3>
            <p className="text-sm text-pink-800">
              AI-generated contextual character descriptions inserted inline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
