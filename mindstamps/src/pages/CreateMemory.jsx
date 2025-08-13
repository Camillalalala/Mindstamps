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
      
      // Call onSuccess callback if provided (for Journal integration)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
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
        <h1 className="text-2xl font-bold mb-4">Please sign in to create memories</h1>
      </div>
    );
  }

  // Show success screen
  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-green-600 mb-2">Success!</h1>
            <p className="text-xl text-gray-600">Your memory has been created</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">"{createdMemoryTitle}"</h2>
            <p className="text-gray-600">Memory saved successfully to your collection!</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={createAnotherMemory}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              Create Another Memory
            </button>
            
            <button
              onClick={goToPlay}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold text-lg"
            >
              Play Memory Game
            </button>
            
            <button
              onClick={handleBackToJournal}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-semibold text-lg"
            >
              Back to Journal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mr-4 text-gray-600 hover:text-gray-800 flex items-center"
          >
            <span className="mr-1">←</span> Back to Journal
          </button>
        )}
        <h1 className="text-3xl font-bold flex-1 text-center">Create New Memory</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Memory Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Amazing sunset in Paris"
            required
          />
        </div>

        {/* Story */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Story
          </label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell the story behind this memory..."
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Photo (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-48 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <LocationPicker 
            onLocationSelect={handleLocationSelect}
            initialLocation={location.lat ? location : null}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Creating Memory...' : 'Create Memory'}
        </button>
      </form>
    </div>
  );
};

export default CreateMemory;