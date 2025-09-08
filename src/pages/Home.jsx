import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import Login from '../components/Auth/Login';

const Home = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="paper-texture cozy-shadow rounded-2xl p-8 flex items-center space-x-4">
          <div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: 'var(--dusty-rose)' }}></div>
          <div className="text-xl font-journal" style={{ color: 'var(--deep-brown)' }}>
            Just a moment...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="side-by-side h-full">
      {/* Left Side - Welcome & Journal */}
      <div className="flex flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="max-w-lg text-center z-10">
          <div className="mb-8">
            <h1 className="text-5xl font-journal font-semibold mb-4" style={{ color: 'var(--deep-brown)' }}>
              Hey there
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--warm-brown)' }}>
              This is your space for keeping memories. Write down the moments that matter, the places you've been, and the stories you want to remember.
            </p>
          </div>

          <div className="paper-texture cozy-shadow rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-journal font-semibold mb-4" style={{ color: 'var(--deep-brown)' }}>
              Your journal
            </h2>
            <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--warm-brown)' }}>
              All your memories live here. You can add new ones, flip through old ones, or just browse around and see what you've collected.
            </p>
            <a
              href="#journal"
              className="btn-warm px-8 py-3 rounded-full font-medium text-lg inline-block transition-all duration-300"
            >
              Open it up
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Play & Adventure */}
      <div className="flex flex-col justify-center items-center p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--soft-beige) 0%, var(--warm-cream) 100%)' }}>
        <div className="max-w-lg text-center z-10">
          <div className="paper-texture cozy-shadow rounded-2xl p-8">
            <h2 className="text-2xl font-journal font-semibold mb-4" style={{ color: 'var(--deep-brown)' }}>
              Want to play?
            </h2>
            <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--warm-brown)' }}>
              I made this little game where you try to guess where your memories happened. It's pretty fun once you have a few stories written down.
            </p>
            <a
              href="#play"
              className="btn-sage px-8 py-3 rounded-full font-medium text-lg inline-block transition-all duration-300"
            >
              Let's try it
            </a>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm italic" style={{ color: 'var(--warm-brown)' }}>
              The best stories are the ones we almost forgot
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;