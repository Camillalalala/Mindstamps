import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import Login from '../components/Auth/Login';

const Home = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Mindstamps
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Turn your memories into an interactive game. Upload photos and stories from your travels, 
          then test your memory by guessing locations on a map.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">📖 My Journal</h2>
          <p className="text-gray-600 mb-4">
            View your collection of memories, create new entries, and manage your personal journal.
          </p>
          <a 
            href="#journal" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block"
          >
            Open Journal
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">🎮 Play & Remember</h2>
          <p className="text-gray-600 mb-4">
            Test your memory! Guess the locations of your uploaded memories in this fun quiz game.
          </p>
          <a 
            href="#play" 
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 inline-block"
          >
            Start Playing
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;