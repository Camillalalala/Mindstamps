import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import CreateMemory from './CreateMemory';

const MemoryPage = ({ memory, isLeft = true }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'A moment in time';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`journal-page paper-texture h-full p-8 ${isLeft ? 'border-r border-opacity-20' : ''}`} 
         style={{ borderColor: 'var(--warm-brown)' }}>
      {/* Page header with date */}
      <div className="mb-6 pb-4 border-b border-opacity-20" style={{ borderColor: 'var(--warm-brown)' }}>
        <div className="text-sm font-journal italic" style={{ color: 'var(--warm-brown)' }}>
          {formatDate(memory.createdAt)}
        </div>
      </div>

      {/* Memory content */}
      <div className="space-y-6">
        <h3 className="text-2xl font-journal font-semibold leading-tight" style={{ color: 'var(--deep-brown)' }}>
          {memory.title}
        </h3>
        
        {memory.imageData && (
          <div className="relative">
            <img
              src={memory.imageData}
              alt={memory.title}
              className="w-full h-48 object-cover rounded-lg shadow-md"
              style={{ filter: 'sepia(10%) saturate(90%)' }}
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--dusty-rose)' }}></div>
            </div>
          </div>
        )}
        
        <div className="prose prose-sm">
          <p className="font-journal leading-relaxed text-base" style={{ color: 'var(--ink-black)' }}>
            {memory.story}
          </p>
        </div>
        
        <div className="text-sm font-medium" style={{ color: 'var(--warm-brown)' }}>
          {memory.location?.name || 'Somewhere special'}
        </div>
      </div>
    </div>
  );
};

// Navigation Footer Component
const NavigationFooter = ({ currentPage, totalPages, onPrevPage, onNextPage, onPageSelect, showKeyboardHint = true }) => (
  <div className="paper-texture border-t border-opacity-20 px-8 py-5 flex justify-between items-center flex-shrink-0 bg-opacity-95" style={{ borderColor: 'var(--warm-brown)', backgroundColor: 'var(--paper-white)' }}>
    <div className="flex items-center space-x-4">
      <button
        onClick={onPrevPage}
        disabled={currentPage === 0}
        className={`flex items-center space-x-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${
          currentPage === 0 
            ? 'opacity-30 cursor-not-allowed' 
            : 'hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100 hover:shadow-md'
        }`}
        style={{ color: 'var(--warm-brown)' }}
      >
        <span className="text-lg">←</span>
        <span>Previous</span>
      </button>
      
      {showKeyboardHint && (
        <div className="text-sm font-medium px-3 py-2 rounded-full bg-gradient-to-r from-orange-50 to-yellow-50" style={{ color: 'var(--warm-brown)' }}>
          Use arrow keys or A/D to flip pages
        </div>
      )}
    </div>

    <div className="flex space-x-3">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageSelect(i)}
          className={`w-4 h-4 rounded-full transition-all duration-300 ${
            i === currentPage 
              ? 'bg-gradient-to-r from-orange-300 to-yellow-300 shadow-md' 
              : 'bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200'
          }`}
        />
      ))}
    </div>

    <button
      onClick={onNextPage}
      disabled={currentPage >= totalPages - 1}
      className={`flex items-center space-x-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${
        currentPage >= totalPages - 1 
          ? 'opacity-30 cursor-not-allowed' 
          : 'hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100 hover:shadow-md'
      }`}
      style={{ color: 'var(--warm-brown)' }}
    >
      <span>Next</span>
      <span className="text-lg">→</span>
    </button>
  </div>
);

const Journal = () => {
  const [user] = useAuthState(auth);
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (user) {
      loadMemories();
    }
  }, [user]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle navigation if we're in list view and have memories
      if (view !== 'list' || memories.length === 0) return;
      
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setCurrentPage(prev => prev > 0 ? prev - 1 : prev);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        const totalPages = Math.ceil(memories.length / 2);
        setCurrentPage(prev => prev < totalPages - 1 ? prev + 1 : prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [view, memories.length]); // Removed currentPage dependency

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

  const nextPage = () => {
    if (currentPage < Math.ceil(memories.length / 2) - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="paper-texture cozy-shadow rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-journal font-semibold mb-4" style={{ color: 'var(--deep-brown)' }}>
            You'll need to sign in first
          </h1>
          <p className="text-base" style={{ color: 'var(--warm-brown)' }}>
            This journal is just for you
          </p>
        </div>
      </div>
    );
  }

  if (view === 'create') {
    return <CreateMemory onBack={() => setView('list')} onSuccess={() => {
      setView('list');
      loadMemories();
    }} />;
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="paper-texture cozy-shadow rounded-2xl p-8 flex items-center space-x-4">
          <div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: 'var(--dusty-rose)' }}></div>
          <div className="text-xl font-journal" style={{ color: 'var(--deep-brown)' }}>
            Finding your pages...
          </div>
        </div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Journal Header */}
        <div className="paper-texture border-b border-opacity-20 px-8 py-4 flex justify-between items-center flex-shrink-0" style={{ borderColor: 'var(--warm-brown)' }}>
          <div>
            <h1 className="text-2xl font-journal font-semibold" style={{ color: 'var(--deep-brown)' }}>
              Your journal
            </h1>
            <p className="text-sm" style={{ color: 'var(--warm-brown)' }}>
              Ready for your first story
            </p>
          </div>
          
          <button
            onClick={() => setView('create')}
            className="btn-warm px-6 py-2 rounded-full font-medium"
          >
            Write something
          </button>
        </div>

        {/* Empty Journal Pages */}
        <div className="side-by-side">
          {/* Left page - Empty journal */}
          <div className="paper-texture flex flex-col justify-center items-center p-12 border-r border-opacity-20" style={{ borderColor: 'var(--warm-brown)' }}>
            <div className="text-center">
              <h2 className="text-3xl font-journal font-semibold mb-4" style={{ color: 'var(--deep-brown)' }}>
                These pages are waiting
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--warm-brown)' }}>
                Every memory you write down becomes part of your story. Start with something simple - a place you went, a moment that mattered.
              </p>
            </div>
          </div>

          {/* Right page - Create invitation */}
          <div className="paper-texture flex flex-col justify-center items-center p-12">
            <div className="text-center">
              <h3 className="text-2xl font-journal font-semibold mb-6" style={{ color: 'var(--deep-brown)' }}>
                What's your first memory?
              </h3>
              <button
                onClick={() => setView('create')}
                className="btn-warm px-8 py-4 rounded-full font-medium text-lg transition-all duration-300"
              >
                Start writing
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Footer - Even for empty state */}
        <NavigationFooter
          currentPage={0}
          totalPages={1}
          onPrevPage={() => {}}
          onNextPage={() => {}}
          onPageSelect={() => {}}
          showKeyboardHint={false}
        />
      </div>
    );
  }

  const leftMemory = memories[currentPage * 2];
  const rightMemory = memories[currentPage * 2 + 1];
  const totalPages = Math.ceil(memories.length / 2);

  return (
    <div className="h-full flex flex-col">
      {/* Journal Header */}
      <div className="paper-texture border-b border-opacity-20 px-8 py-4 flex justify-between items-center flex-shrink-0" style={{ borderColor: 'var(--warm-brown)' }}>
        <div>
          <h1 className="text-2xl font-journal font-semibold" style={{ color: 'var(--deep-brown)' }}>
            Your journal
          </h1>
          <p className="text-sm" style={{ color: 'var(--warm-brown)' }}>
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'} • Page {currentPage + 1} of {totalPages}
          </p>
        </div>
        
        <button
          onClick={() => setView('create')}
          className="btn-warm px-6 py-2 rounded-full font-medium"
        >
          Add another
        </button>
      </div>

      {/* Journal Pages */}
      <div className="side-by-side flex-1">
        {/* Left Page */}
        <div className="relative">
          {leftMemory ? (
            <MemoryPage memory={leftMemory} isLeft={true} />
          ) : (
            <div className="paper-texture h-full p-8 border-r border-opacity-20 flex items-center justify-center" style={{ borderColor: 'var(--warm-brown)' }}>
              <div className="text-center opacity-30">
                <p className="font-journal" style={{ color: 'var(--warm-brown)' }}>Empty page</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Page */}
        <div className="relative">
          {rightMemory ? (
            <MemoryPage memory={rightMemory} isLeft={false} />
          ) : (
            <div className="paper-texture h-full p-8 flex items-center justify-center">
              <div className="text-center opacity-30">
                <p className="font-journal" style={{ color: 'var(--warm-brown)' }}>Empty page</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <NavigationFooter
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={prevPage}
        onNextPage={nextPage}
        onPageSelect={setCurrentPage}
        showKeyboardHint={true}
      />
    </div>
  );
};

export default Journal;