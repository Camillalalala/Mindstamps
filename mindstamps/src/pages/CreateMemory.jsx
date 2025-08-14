import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import LocationPicker from '../components/Map/LocationPicker';

const CreateMemory = ({ onBack = null, onSuccess = null }) => {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [location, setLocation] = useState({ lat: '', lng: '', name: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdMemoryTitle, setCreatedMemoryTitle] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug logging
    console.log('Form submission attempt:', {
      user: !!user,
      title: title,
      story: story,
      location: location,
      image: !!image
    });

    if (!user) {
      alert('You must be signed in to create memories');
      return;
    }
    
    if (!title.trim()) {
      alert('Please enter a memory title');
      return;
    }
    
    if (!story.trim()) {
      alert('Please enter your story');
      return;
    }
    
    if (!location.lat || !location.lng) {
      alert('Please select a location on the map or search for an address');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Starting Firebase operations...');
      
      // Convert image to base64 for storage in Firestore (temporary solution)
      let imageData = null;
      if (image) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(image);
        });
      }

      // Save memory to Firestore
      console.log('Saving to Firestore...');
      const docRef = await addDoc(collection(db, 'memories'), {
        title: title.trim(),
        story: story.trim(),
        location,
        imageData, // Store base64 image data directly (not recommended for production)
        userId: user.uid,
        createdAt: new Date(),
      });
      console.log('Memory saved successfully:', docRef.id);

      setCreatedMemoryTitle(title.trim());
      setSuccess(true);
    } catch (error) {
      console.error('Detailed error creating memory:', error);
      alert(`Error creating memory: ${error.message}`);
    }
    setLoading(false);
  };

  const createAnotherMemory = () => {
    setSuccess(false);
    setCreatedMemoryTitle('');
    setTitle('');
    setStory('');
    setLocation({ lat: '', lng: '', name: '' });
    setImage(null);
    setImagePreview(null);
  };

  const goToPlay = () => {
    window.location.hash = 'play';
  };

  const handleBackToJournal = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = 'journal';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">You'll need to sign in first</h1>
        <p className="text-base" style={{ color: 'var(--warm-brown)' }}>
          This is your personal space for memories
        </p>
      </div>
    );
  }

  // Show success screen
  if (success) {
    return (
      <div className="side-by-side h-full">
          {/* Left Side - Success Message */}
          <div className="flex flex-col justify-center items-center p-12 relative overflow-hidden">
            <div className="text-center z-10">
              <h1 className="text-4xl font-journal font-semibold mb-4" style={{ color: 'var(--deep-brown)' }}>
                Nice work
              </h1>
              <p className="text-lg mb-8" style={{ color: 'var(--warm-brown)' }}>
                Your memory is now part of your collection
              </p>
              
              <div className="paper-texture cozy-shadow rounded-2xl p-6 mb-8">
                <h2 className="text-2xl font-journal font-semibold mb-2" style={{ color: 'var(--deep-brown)' }}>
                  "{createdMemoryTitle}"
                </h2>
                <p className="text-sm" style={{ color: 'var(--warm-brown)' }}>
                  Saved to your journal
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex flex-col justify-center items-center p-12" style={{ background: 'linear-gradient(135deg, var(--soft-beige) 0%, var(--warm-cream) 100%)' }}>
            <div className="w-full max-w-sm space-y-4">
              <button
                onClick={createAnotherMemory}
                className="btn-warm w-full py-4 rounded-full font-medium text-lg"
              >
                Write another one
              </button>
              
              <button
                onClick={goToPlay}
                className="btn-sage w-full py-4 rounded-full font-medium text-lg"
              >
                Try the guessing game
              </button>
              
              <button
                onClick={handleBackToJournal}
                className="w-full py-4 rounded-full font-medium text-lg transition-all duration-300"
                style={{ 
                  background: 'var(--paper-white)',
                  color: 'var(--warm-brown)',
                  border: '2px solid var(--soft-beige)'
                }}
              >
                Back to your journal
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="paper-texture border-b border-opacity-20 px-8 py-4 flex items-center flex-shrink-0" style={{ borderColor: 'var(--warm-brown)' }}>
        {onBack && (
          <button
            onClick={onBack}
            className="mr-4 flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100"
            style={{ color: 'var(--warm-brown)' }}
          >
            <span>←</span>
            <span>Back to your journal</span>
          </button>
        )}
        <h1 className="text-2xl font-journal font-semibold flex-1 text-center" style={{ color: 'var(--deep-brown)' }}>
          Write a new memory
        </h1>
      </div>

      <div className="side-by-side">
        {/* Left Side - Form */}
        <div className="paper-texture p-8 overflow-y-auto border-r border-opacity-20" style={{ borderColor: 'var(--warm-brown)' }}>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--deep-brown)' }}>
                What should we call this memory?
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="vintage-input w-full"
                placeholder="Something like 'That amazing sunset in Paris'"
                required
              />
            </div>

            {/* Story */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--deep-brown)' }}>
                Tell me what happened
              </label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={4}
                className="vintage-input w-full resize-none"
                placeholder="Write about what made this moment special..."
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--deep-brown)' }}>
                Got a photo? (totally optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="vintage-input w-full"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-warm w-full py-3 rounded-full font-medium text-lg disabled:opacity-50"
            >
              {loading ? 'Saving this memory...' : 'Save this memory'}
            </button>
          </form>
        </div>

        {/* Right Side - Map and Preview */}
        <div className="flex flex-col pb-8" style={{ background: 'linear-gradient(135deg, var(--soft-beige) 0%, var(--warm-cream) 100%)' }}>
          {/* Image Preview */}
          {imagePreview && (
            <div className="p-6 border-b border-opacity-20" style={{ borderColor: 'var(--warm-brown)' }}>
              <h3 className="text-lg font-journal font-semibold mb-3" style={{ color: 'var(--deep-brown)' }}>
                Your photo
              </h3>
              <div className="paper-texture cozy-shadow rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                  style={{ filter: 'sepia(10%) saturate(90%)' }}
                />
              </div>
            </div>
          )}

          {/* Location Picker */}
          <div className="flex-1 p-6">
            <h3 className="text-lg font-journal font-semibold mb-3" style={{ color: 'var(--deep-brown)' }}>
              Where did this happen?
            </h3>
            <div className="h-full max-h-80">
              <LocationPicker 
                onLocationSelect={handleLocationSelect}
                initialLocation={location.lat ? location : null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMemory;