import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import CreateMemory from './CreateMemory';

const MemoryCard = ({ memory }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {memory.imageData && (
        <img
          src={memory.imageData}
          alt={memory.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{memory.title}</h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{memory.story}</p>
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <span className="font-medium">📍 Location:</span>
            <span className="ml-2">{memory.location?.name || 'Unknown location'}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium">📅 Created:</span>
            <span className="ml-2">{formatDate(memory.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Journal = () => {
  const [user] = useAuthState(auth);
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'title'

  useEffect(() => {
    if (user) {
      loadMemories();
    }
  }, [user]);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'memories'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const memoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMemories(memoriesData);
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedMemories = [...memories].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt?.toDate?.() || a.createdAt) - new Date(b.createdAt?.toDate?.() || b.createdAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'newest':
      default:
        return new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt);
    }
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to access your journal</h1>
      </div>
    );
  }

  if (view === 'create') {
    return <CreateMemory onBack={() => setView('list')} onSuccess={() => {
      setView('list');
      loadMemories();
    }} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Journal</h1>
          <p className="text-gray-600">Your collection of memories and experiences</p>
        </div>
        
        <button
          onClick={() => setView('create')}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center"
        >
          <span className="mr-2">✏️</span>
          Create New Memory
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-xl text-gray-600">Loading your memories...</div>
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold mb-4">Your journal is empty</h2>
          <p className="text-gray-600 mb-6">Start creating memories to build your personal collection!</p>
          <button
            onClick={() => setView('create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Create Your First Memory
          </button>
        </div>
      ) : (
        <>
          {/* Stats and Controls */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <div className="text-3xl font-bold text-blue-600">{memories.length}</div>
                <div className="text-gray-600">
                  {memories.length === 1 ? 'Memory' : 'Memories'} in your journal
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Memory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Journal;