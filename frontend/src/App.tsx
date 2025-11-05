import { useState } from 'react';
import { Greet } from '../wailsjs/go/app/App';

function App() {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [error, setError] = useState('');

  const handleGreet = async () => {
    try {
      setError('');
      setGreeting('');
      const result = await Greet(name);
      setGreeting(result);
    } catch (err) {
      setError('Failed to connect to backend. Please try again.');
      console.error('Error calling Greet:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Fuknotion</h1>
        <p className="text-gray-600 mb-4">
          Welcome to Fuknotion - Your Notion-like note-taking app
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGreet}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-md w-full transition-colors"
          >
            Greet
          </button>
          {greeting && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{greeting}</p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
