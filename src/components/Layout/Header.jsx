import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';

const Header = () => {
  const [user] = useAuthState(auth);
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || 'home';
  });

  const handleSignOut = () => {
    signOut(auth);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'journal', label: 'Journal', icon: '📖' },
    { id: 'play', label: 'Play', icon: '🎮' }
  ];

  return (
    <header className="paper-texture border-b-2 border-opacity-20" style={{ borderColor: 'var(--warm-brown)' }}>
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 flex items-center justify-center text-xl">
            ✨
          </div>
          <h1 className="text-2xl font-journal font-semibold" style={{ color: 'var(--deep-brown)' }}>
            Mindstamps
          </h1>
        </div>
        
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-orange-200 to-yellow-200 shadow-md'
                  : 'hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100'
              }`}
              style={{ color: 'var(--deep-brown)' }}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
          
          {user && (
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-opacity-30" style={{ borderColor: 'var(--warm-brown)' }}>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center text-sm">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--deep-brown)' }}>
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-md"
                style={{ 
                  background: 'linear-gradient(135deg, var(--dusty-rose) 0%, var(--warm-brown) 100%)',
                  color: 'white'
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;