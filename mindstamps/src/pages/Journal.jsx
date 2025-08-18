import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import CreateMemory from './CreateMemory';

const MemoryPage = ({ memory, isLeft = true, onEdit, onSave, onCancelEdit, isEditing = false }) => {
  const [editTitle, setEditTitle] = useState(memory.title);
  const [editStory, setEditStory] = useState(memory.story);
  const [saving, setSaving] = useState(false);

  // Sync edit state with current memory when memory prop changes
  useEffect(() => {
    setEditTitle(memory.title);
    setEditStory(memory.story);
  }, [memory.id, memory.title, memory.story]);

  // Log when MemoryPage receives isEditing prop changes
  useEffect(() => {
    if (isEditing) {
      console.log('MemoryPage: Entering edit mode for memory:', {
        id: memory.id,
        title: memory.title,
        isLeft: isLeft
      });
    }
  }, [isEditing, memory.id, memory.title, isLeft]);

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

  const handleSave = async () => {
    if (!editTitle.trim() || !editStory.trim()) {
      alert('Please fill in both the title and story');
      return;
    }

    setSaving(true);
    try {
      await onSave(memory.id, {
        title: editTitle.trim(),
        story: editStory.trim()
      });
    } catch (error) {
      console.error('Error saving memory:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(memory.title);
    setEditStory(memory.story);
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <div className={`journal-page paper-texture h-full p-8 flex flex-col ${isLeft ? 'border-r border-opacity-20' : ''} relative`} 
           style={{ 
             borderColor: 'var(--warm-brown)',
             boxShadow: '0 0 0 3px rgba(255, 165, 0, 0.3), 0 0 20px rgba(255, 165, 0, 0.2)',
             background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.8), rgba(255, 245, 238, 0.9))'
           }}>
        {/* Visual editing indicator */}
        <div className="absolute -top-2 -left-2 -right-2 -bottom-2 border-2 border-dashed rounded-lg pointer-events-none animate-pulse"
             style={{ borderColor: 'var(--dusty-rose)' }} />
        
        {/* Page header with date */}
        <div className="mb-6 pb-4 border-b border-opacity-20 flex-shrink-0 flex items-center justify-between" style={{ borderColor: 'var(--warm-brown)' }}>
          <div className="text-sm font-journal italic" style={{ color: 'var(--warm-brown)' }}>
            {formatDate(memory.createdAt)} • Editing
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium"
               style={{ 
                 background: 'var(--dusty-rose)', 
                 color: 'white',
                 boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
               }}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>EDITING</span>
          </div>
        </div>

        {/* Edit form - constrained to available height */}
        <div className="flex flex-col flex-1 min-h-0 space-y-4">
          {/* Title input */}
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-2xl font-journal font-semibold leading-tight bg-transparent border-none outline-none w-full flex-shrink-0"
            style={{ color: 'var(--deep-brown)' }}
            placeholder="Memory title..."
          />
          
          {memory.imageData && (
            <div className="relative flex-shrink-0">
              <img
                src={memory.imageData}
                alt={memory.title}
                className="w-full h-32 object-cover rounded-lg shadow-md"
                style={{ filter: 'sepia(10%) saturate(90%)' }}
              />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--dusty-rose)' }}></div>
              </div>
            </div>
          )}
          
          {/* Story textarea - takes remaining space */}
          <textarea
            value={editStory}
            onChange={(e) => setEditStory(e.target.value)}
            className="flex-1 font-journal leading-relaxed text-base bg-transparent border-none outline-none resize-none w-full min-h-0"
            style={{ color: 'var(--ink-black)' }}
            placeholder="Tell your story..."
          />
          
          {/* Location - fixed at bottom of content */}
          <div className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--warm-brown)' }}>
            {memory.location?.name || 'Somewhere special'}
          </div>

          {/* Edit buttons - fixed within page content area */}
          <div className="flex space-x-3 pt-4 border-t border-opacity-20 flex-shrink-0" style={{ borderColor: 'var(--warm-brown)' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-warm px-4 py-2 rounded-full font-medium text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-full font-medium text-sm transition-all duration-300"
              style={{ 
                background: 'var(--paper-white)',
                color: 'var(--warm-brown)',
                border: '2px solid var(--soft-beige)'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`journal-page paper-texture h-full p-8 relative ${isLeft ? 'border-r border-opacity-20' : ''} group hover:shadow-lg transition-all duration-300`} 
         style={{ borderColor: 'var(--warm-brown)' }}>
      {/* Edit button */}
      <button
        onClick={() => {
          console.log('Edit button clicked for memory:', {
            id: memory.id,
            title: memory.title,
            isLeft: isLeft
          });
          onEdit(memory.id);
        }}
        className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 opacity-60 hover:opacity-100 group-hover:opacity-90 hover:scale-105"
        style={{ 
          background: 'var(--soft-beige)',
          color: 'var(--warm-brown)',
          border: '1px solid var(--warm-brown)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        ✏️ Edit
      </button>

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
  const [editingMemoryId, setEditingMemoryId] = useState(null);

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

  // Clear editing state when navigating between pages to prevent stale edit state
  useEffect(() => {
    if (editingMemoryId) {
      console.log('Page changed while editing memory ID:', editingMemoryId, 'Clearing edit state');
      setEditingMemoryId(null);
    }
  }, [currentPage]); // Only depend on currentPage, not editingMemoryId to avoid infinite loops

  // Additional safety check: Clear edit state if the memory being edited is no longer on current page
  useEffect(() => {
    if (editingMemoryId && memories.length > 0) {
      const leftMemory = memories[currentPage * 2];
      const rightMemory = memories[currentPage * 2 + 1];
      const isEditingMemoryOnCurrentPage = 
        (leftMemory && leftMemory.id === editingMemoryId) ||
        (rightMemory && rightMemory.id === editingMemoryId);
      
      if (!isEditingMemoryOnCurrentPage) {
        console.log('Editing memory not found on current page, clearing edit state:', {
          editingMemoryId,
          currentPage,
          leftMemoryId: leftMemory?.id,
          rightMemoryId: rightMemory?.id
        });
        setEditingMemoryId(null);
      }
    }
  }, [editingMemoryId, memories, currentPage]);

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

  const handleEditMemory = (memoryId) => {
    // Console logging to track which memory ID is being edited
    console.log('handleEditMemory called with memoryId:', memoryId);
    
    // Calculate current page memories for validation
    const currentLeftMemory = memories[currentPage * 2];
    const currentRightMemory = memories[currentPage * 2 + 1];
    
    console.log('Current memories on page:', {
      leftMemory: currentLeftMemory?.id || 'none',
      rightMemory: currentRightMemory?.id || 'none',
      currentPage: currentPage,
      memoryTitles: {
        left: currentLeftMemory?.title || 'none',
        right: currentRightMemory?.title || 'none'
      }
    });
    
    // Validation to ensure the correct memory is being edited
    if (!memoryId) {
      console.error('handleEditMemory: No memory ID provided');
      return;
    }
    
    // Defensive check to prevent editing wrong memory
    const memoryExists = memories.find(memory => memory.id === memoryId);
    if (!memoryExists) {
      console.error('handleEditMemory: Memory with ID', memoryId, 'not found in memories array');
      return;
    }
    
    console.log('handleEditMemory: Found memory to edit:', {
      id: memoryExists.id,
      title: memoryExists.title
    });
    
    // Additional validation to ensure the memory is on the current page
    const isOnCurrentPage = (currentLeftMemory && currentLeftMemory.id === memoryId) || 
                           (currentRightMemory && currentRightMemory.id === memoryId);
    
    if (!isOnCurrentPage) {
      console.error('handleEditMemory: CRITICAL - Memory', memoryId, 'is not on current page. Refusing to edit to prevent wrong memory editing.');
      console.log('Expected memories on current page:', {
        left: currentLeftMemory?.id,
        right: currentRightMemory?.id,
        leftTitle: currentLeftMemory?.title,
        rightTitle: currentRightMemory?.title
      });
      console.log('Attempted to edit memory:', {
        id: memoryExists.id,
        title: memoryExists.title
      });
      // Don't set editing state if memory is not on current page
      return;
    }
    
    // Clear any existing edit state first to prevent conflicts
    if (editingMemoryId && editingMemoryId !== memoryId) {
      console.log('handleEditMemory: Clearing previous edit state for memory:', editingMemoryId);
    }
    
    console.log('handleEditMemory: Setting editingMemoryId to:', memoryId, 'for memory titled:', memoryExists.title);
    setEditingMemoryId(memoryId);
  };

  const handleSaveMemory = async (memoryId, updates) => {
    console.log('handleSaveMemory: Saving memory ID:', memoryId, 'with updates:', updates);
    
    // Validation to ensure we're saving the correct memory
    if (editingMemoryId !== memoryId) {
      console.error('handleSaveMemory: Mismatch between editingMemoryId and memoryId being saved', {
        editingMemoryId,
        memoryId
      });
      throw new Error('Memory ID mismatch during save operation');
    }
    
    try {
      const memoryRef = doc(db, 'memories', memoryId);
      await updateDoc(memoryRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      // Update local state
      setMemories(prevMemories => 
        prevMemories.map(memory => 
          memory.id === memoryId 
            ? { ...memory, ...updates, updatedAt: new Date() }
            : memory
        )
      );
      
      console.log('handleSaveMemory: Successfully saved memory ID:', memoryId, 'Clearing edit state');
      
      // Ensure edit state is properly reset after successful save
      setEditingMemoryId(null);
    } catch (error) {
      console.error('Error updating memory:', error);
      // Don't clear edit state on error so user can retry
      throw error;
    }
  };

  const handleCancelEdit = () => {
    console.log('handleCancelEdit: Canceling edit for memory ID:', editingMemoryId);
    
    // Ensure edit state is properly reset
    if (editingMemoryId) {
      console.log('handleCancelEdit: Clearing edit state and resetting form data');
      setEditingMemoryId(null);
    } else {
      console.warn('handleCancelEdit: No memory was being edited');
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
      <div className={`side-by-side flex-1 ${editingMemoryId ? 'editing-mode' : ''}`}>
        {/* Left Page */}
        <div className="relative">
          {leftMemory ? (
            <MemoryPage 
              memory={leftMemory} 
              isLeft={true}
              onEdit={handleEditMemory}
              onSave={handleSaveMemory}
              onCancelEdit={handleCancelEdit}
              isEditing={(() => {
                const isEditing = editingMemoryId === leftMemory.id;
                if (editingMemoryId) {
                  console.log('Left memory isEditing calculation:', {
                    editingMemoryId,
                    leftMemoryId: leftMemory.id,
                    leftMemoryTitle: leftMemory.title,
                    isEditing
                  });
                }
                return isEditing;
              })()}
            />
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
            <MemoryPage 
              memory={rightMemory} 
              isLeft={false}
              onEdit={handleEditMemory}
              onSave={handleSaveMemory}
              onCancelEdit={handleCancelEdit}
              isEditing={(() => {
                const isEditing = editingMemoryId === rightMemory.id;
                if (editingMemoryId) {
                  console.log('Right memory isEditing calculation:', {
                    editingMemoryId,
                    rightMemoryId: rightMemory.id,
                    rightMemoryTitle: rightMemory.title,
                    isEditing
                  });
                }
                return isEditing;
              })()}
            />
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