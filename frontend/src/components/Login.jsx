import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Pointing to the Express engine via relative path
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });

      const data = await res.json();

      if (res.ok) {
        // 1. Store the JWT for future API calls
        localStorage.setItem('token', data.token);
        // 2. Store user info for the Dashboard display
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 3. Move to the Dashboard
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid Credentials');
      }
    } catch (err) {
      setError('Engine Connection Error. Check Server Console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4 font-sans">
      <div className="w-full max-w-sm">
        {/* Visual Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            ITAM<span className="text-green-500">SYSTEM</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-bold mt-2">
            Secure Asset Logistics
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">
                Operator Username
              </label>
              <input
                type="text"
                required
                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-green-600 font-mono transition-all"
                placeholder="ID-0000"
                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">
                Security Key
              </label>
              <input
                type="password"
                required
                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-green-600 transition-all"
                placeholder="••••••••"
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="text-red-500 text-xs font-bold text-center bg-red-900/10 py-2 rounded border border-red-900/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[9px] text-gray-600 uppercase tracking-widest">
          Authorized Personnel Only // Session Monitored
        </p>
      </div>
    </div>
  );
}