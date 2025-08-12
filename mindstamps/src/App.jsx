import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase';
import Header from './components/Layout/Header';
import Home from './pages/Home';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Header />}
      <main>
        <Home />
      </main>
    </div>
  );
}

export default App;