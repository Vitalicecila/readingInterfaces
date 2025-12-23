import { useState, useEffect } from 'react';
import { ClickableReader } from './components/ClickableReader';
import { TabbedReader } from './components/TabbedReader';
import { NetworkReader } from './components/NetworkReader';
import { LLMReader } from './components/LLMReader';
import { X } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'clickable' | 'tabbed' | 'network' | 'llm'>('tabbed');
  const [showWelcome, setShowWelcome] = useState(true);

  // Show welcome popup on first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <div className="min-h-screen">
      {/* Welcome Popup */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome to the Character Reading Study</h2>
              <button
                onClick={closeWelcome}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Thank you for participating in this study! You will be reading literary excerpts with different
                character information interfaces.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What to expect:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>You will read <strong>4 different text excerpts</strong> (A, B, C, D)</li>
                  <li>Each excerpt uses a different reading interface</li>
                  <li>Character names are highlighted and clickable for more information</li>
                  <li>You can switch between interfaces using the buttons in the top-right corner</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Available Interfaces:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Tabbed View:</strong> Switch between reading and character info tabs</li>
                  <li><strong>Clickable Names:</strong> Click character names for popup information</li>
                  <li><strong>Network View:</strong> Visualize character relationships as a network</li>
                  <li><strong>LLM Enhanced:</strong> AI-generated contextual descriptions inline</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                The excerpts are counterbalanced using URL parameters (?condition=1, 2, 3, or 4). Each condition
                presents excerpts in a different order across the interfaces. Your study coordinator will provide
                you with the correct link for your session.
              </p>
            </div>

            <button
              onClick={closeWelcome}
              className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Start Reading
            </button>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
        <button
          onClick={() => setMode('tabbed')}
          className={`px-4 py-2 rounded transition-colors ${
            mode === 'tabbed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tabbed View
        </button>
        <button
          onClick={() => setMode('clickable')}
          className={`px-4 py-2 rounded transition-colors ${
            mode === 'clickable'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Clickable Names
        </button>
        <button
          onClick={() => setMode('network')}
          className={`px-4 py-2 rounded transition-colors ${
            mode === 'network'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Network View
        </button>
        <button
          onClick={() => setMode('llm')}
          className={`px-4 py-2 rounded transition-colors ${
            mode === 'llm'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          LLM Enhanced
        </button>
      </div>

      {/* Render the selected page */}
      {mode === 'clickable' && <ClickableReader />}
      {mode === 'tabbed' && <TabbedReader />}
      {mode === 'network' && <NetworkReader />}
      {mode === 'llm' && <LLMReader />}
    </div>
  );
}