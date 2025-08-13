import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import GuessMap from '../components/Map/GuessMap';

const Play = () => {
  const [user] = useAuthState(auth);
  const [memories, setMemories] = useState([]);
  const [currentMemory, setCurrentMemory] = useState(null);
  const [gameState, setGameState] = useState('loading'); // loading, playing, result, finished
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userGuess, setUserGuess] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (user) {
      loadMemories();
    }
  }, [user]);

  const loadMemories = async () => {
    try {
      const q = query(collection(db, 'memories'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const memoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (memoriesData.length === 0) {
        setGameState('no-memories');
        return;
      }

      // Shuffle memories for random order
      const shuffled = memoriesData.sort(() => Math.random() - 0.5);
      setMemories(shuffled);
      setCurrentMemory(shuffled[0]);
      setGameState('playing');
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateScore = (distance) => {
    if (distance < 1) return 1000; // Perfect score for < 1km
    if (distance < 10) return 800;
    if (distance < 50) return 600;
    if (distance < 100) return 400;
    if (distance < 500) return 200;
    return 100; // Minimum score
  };

  const handleMapGuess = (guessPosition) => {
    setUserGuess(guessPosition);
  };

  const submitGuess = () => {
    if (!userGuess) {
      alert('Please click on the map to make your guess');
      return;
    }

    const actualLat = currentMemory.location.lat;
    const actualLng = currentMemory.location.lng;

    const dist = calculateDistance(userGuess.lat, userGuess.lng, actualLat, actualLng);
    const points = calculateScore(dist);
    
    setDistance(dist);
    setScore(score + points);
    setGameState('result');
  };

  const nextMemory = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= memories.length) {
      setGameState('finished');
    } else {
      setCurrentIndex(nextIndex);
      setCurrentMemory(memories[nextIndex]);
      setUserGuess(null);
      setDistance(null);
      setGameState('playing');
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setUserGuess(null);
    setDistance(null);
    loadMemories();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to play</h1>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-xl">Loading your memories...</div>
      </div>
    );
  }

  if (gameState === 'no-memories') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">No Memories Yet!</h1>
        <p className="text-gray-600 mb-6">You need to create some memories before you can play.</p>
        <a 
          href="#journal" 
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Open Journal to Create Memories
        </a>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="container mx-auto px-4 py-8 text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Game Complete! 🎉</h1>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl font-bold text-blue-600 mb-4">{score}</div>
          <div className="text-xl text-gray-600 mb-6">Total Score</div>
          <div className="text-lg mb-6">
            You completed {memories.length} memories with an average score of{' '}
            {Math.round(score / memories.length)} points per memory!
          </div>
          <div className="space-y-4">
            <button
              onClick={restartGame}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Play Again
            </button>
            
            <button
              onClick={() => window.location.hash = 'journal'}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              Open Journal
            </button>
            
            <button
              onClick={() => window.location.hash = 'home'}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Memory Challenge</h1>
        <div className="text-right">
          <div className="text-sm text-gray-600">Score: {score}</div>
          <div className="text-sm text-gray-600">
            Memory {currentIndex + 1} of {memories.length}
          </div>
        </div>
      </div>

      {currentMemory && (
        <div className="space-y-8">
          {/* Memory Display */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">{currentMemory.title}</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {currentMemory.imageData && (
                  <img
                    src={currentMemory.imageData}
                    alt={currentMemory.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Your Story:</h3>
                <p className="text-gray-700">{currentMemory.story}</p>
              </div>
            </div>
          </div>

          {/* Guess Interface */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Where was this memory created?</h3>
            
            {gameState === 'playing' && (
              <>
                <p className="text-gray-600 mb-4">
                  Click on the map to guess where you think this memory was taken:
                </p>
                
                <GuessMap
                  onGuess={handleMapGuess}
                  guessPosition={userGuess}
                  disabled={false}
                />
                
                {userGuess && (
                  <div className="mt-4">
                    <button
                      onClick={submitGuess}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-semibold"
                    >
                      Submit Guess
                    </button>
                  </div>
                )}
              </>
            )}

            {gameState === 'result' && (
              <>
                <GuessMap
                  guessPosition={userGuess}
                  actualPosition={currentMemory.location}
                  showResult={true}
                  disabled={true}
                />
                
                <div className="mt-6 space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {calculateScore(distance)} points
                    </div>
                    <div className="text-lg text-gray-600">
                      Distance: {distance.toFixed(1)} km
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      Actual location: {currentMemory.location.name}
                    </div>
                  </div>
                  
                  <button
                    onClick={nextMemory}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-semibold"
                  >
                    {currentIndex + 1 >= memories.length ? 'Finish Game' : 'Next Memory'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Play;