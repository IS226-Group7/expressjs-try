import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // If a token already exists, skip login and go to dashboard
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });

      const data = await res.json();

      if (res.ok) {
        // Safety First: Store the JWT and User Details
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Mission accomplished: Redirect
        navigate('/dashboard');
      } else {
        setError(data.message || 'Authentication Failed');
      }
    } catch (err) {
      setError('Engine Connection Timeout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-green-900 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative w-full max-w-md p-1 border-t-2 border-green-600 rounded-xl bg-gray-900 shadow-2xl">
        <div className="p-8 bg-gray-900 rounded-lg">
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-black tracking-tighter text-white">
              ITAM<span className="text-green-500">ENGINE</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mt-2">
              Logistics & Asset Control
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">
                Operator ID
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="USERNAME"
                className="w-full bg-gray-800 border border-gray-700 p-4 rounded text-white focus:outline-none focus:border-green-500 transition-colors font-mono uppercase placeholder:text-gray-600"
                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">
                Security Key
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 p-4 rounded text-white focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-600"
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-900 text-red-500 p-3 rounded text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest rounded transition-all active:scale-95 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Verifying...' : 'Authenticate'}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-[9px] text-gray-600 font-mono">
              SECURE ACCESS ONLY. ALL SESSIONS LOGGED.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}