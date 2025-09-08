import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="cozy-container">
      <div className="side-by-side h-full">
        {/* Left Side - Welcome */}
        <div className="flex flex-col justify-center items-center p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-8 left-8 text-6xl opacity-20">🌸</div>
          <div className="absolute bottom-8 right-8 text-4xl opacity-20">📚</div>
          <div className="absolute top-1/3 right-12 text-3xl opacity-15">✨</div>

          <div className="text-center z-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 flex items-center justify-center text-3xl">
              ✨
            </div>
            <h1 className="text-4xl font-journal font-semibold mb-4" style={{ color: 'var(--deep-brown)' }}>
              Welcome to Mindstamps
            </h1>
            <p className="text-lg leading-relaxed max-w-md" style={{ color: 'var(--warm-brown)' }}>
              Your personal sanctuary for memories. A cozy space where every moment finds its home.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center items-center p-12" style={{ background: 'linear-gradient(135deg, var(--soft-beige) 0%, var(--warm-cream) 100%)' }}>
          <div className="paper-texture cozy-shadow rounded-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-journal font-semibold" style={{ color: 'var(--deep-brown)' }}>
                {showForgotPassword ? 'Reset Password' : isSignUp ? 'Create Your Space' : 'Welcome Back'}
              </h2>
              <p className="text-sm mt-2" style={{ color: 'var(--warm-brown)' }}>
                {showForgotPassword ? 'Enter your email to reset your password' : isSignUp ? 'Begin your memory journey' : 'Enter your cozy corner'}
              </p>
            </div>

            {showForgotPassword ? (
              <form className="space-y-6" onSubmit={handleForgotPassword}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    required
                    className="vintage-input w-full"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-warm w-full py-3 rounded-full font-medium text-lg"
                >
                  Send Reset Email
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError('');
                      setMessage('');
                    }}
                    className="text-sm transition-colors duration-300 hover:underline"
                    style={{ color: 'var(--warm-brown)' }}
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    required
                    className="vintage-input w-full"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <input
                    type="password"
                    required
                    className="vintage-input w-full"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-warm w-full py-3 rounded-full font-medium text-lg"
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm transition-colors duration-300 hover:underline block w-full"
                    style={{ color: 'var(--warm-brown)' }}
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>

                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError('');
                        setMessage('');
                      }}
                      className="text-sm transition-colors duration-300 hover:underline"
                      style={{ color: 'var(--warm-brown)' }}
                    >
                      Forgot your password?
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;