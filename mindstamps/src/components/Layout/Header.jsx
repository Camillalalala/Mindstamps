import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';

const Header = () => {
  const [user] = useAuthState(auth);

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mindstamps</h1>
        
        <nav className="flex items-center space-x-6">
          <a href="/" className="hover:text-blue-200">Home</a>
          <a href="/create" className="hover:text-blue-200">Create Memory</a>
          <a href="/play" className="hover:text-blue-200">Play</a>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">Hello, {user.displayName || user.email}</span>
              <button 
                onClick={handleSignOut}
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <a href="/login" className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded">
              Sign In
            </a>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;