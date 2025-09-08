import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase';
import Header from './components/Layout/Header';
import Home from './pages/Home';
import CreateMemory from './pages/CreateMemory';
import Play from './pages/Play';
import Journal from './pages/Journal';

function App() {
  const [user, loading] = useAuthState(auth);
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || 'home';
  });

  // Simple routing based on URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setCurrentPage(hash || 'home');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'create':
        return <CreateMemory />;
      case 'journal':
        return <Journal />;
      case 'play':
        return <Play />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="cozy-container">
      {user && <Header />}
      <main className="flex-1 min-h-0 overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;