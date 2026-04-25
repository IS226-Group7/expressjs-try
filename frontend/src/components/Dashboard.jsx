import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Parse user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Auto-focus the scanner input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setMessage('');
    setAsset(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/assets/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setAsset(data);
        setQuery(''); // Clear for next scan
      } else {
        setMessage(data.message || 'Asset not found in database.');
      }
    } catch (err) {
      setMessage('Engine connection error.');
    } finally {
      setLoading(false);
      inputRef.current?.focus(); // Refocus for next scan
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 font-sans">
      {/* Top Navigation Bar */}
      <nav className="max-w-5xl mx-auto flex justify-between items-center mb-10 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-green-500">ITAM ENGINE v1.0</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Operator: {user.name || 'Unknown'} | Role: {user.role || 'User'}
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-950/20 border border-red-900 text-red-500 text-xs font-bold rounded hover:bg-red-900 hover:text-white transition-all"
        >
          TERMINATE SESSION
        </button>
      </nav>

      <main className="max-w-2xl mx-auto">
        {/* Scan Entry Area */}
        <div className="mb-10">
          <form onSubmit={handleSearch} className="relative">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">
              Awaiting Scan (Asset Tag / Serial)
            </label>
            <div className="flex gap-2">
              <input 
                ref={inputRef}
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-black border-2 border-gray-800 p-4 rounded-lg text-green-400 font-mono focus:outline-none focus:border-green-600 transition-colors"
                placeholder="000000000000"
              />
              <button 
                type="submit" 
                className="bg-green-600 px-8 py-4 rounded-lg font-black text-black hover:bg-green-400 active:scale-95 transition-all"
              >
                EXECUTE
              </button>
            </div>
          </form>
        </div>

        {/* Status Messages */}
        {loading && <div className="text-center py-10 animate-pulse text-green-500 font-mono uppercase text-sm">Searching MariaDB Records...</div>}
        {message && <div className="p-4 bg-red-900/10 border border-red-900/50 text-red-400 text-center rounded-lg mb-6">{message}</div>}

        {/* Asset Card */}
        {asset && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-300">
            <div className="bg-gray-700/50 p-4 border-b border-gray-600 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase">System Record #{asset.asset_id}</span>
              <span className="px-2 py-1 bg-green-900 text-green-300 text-[10px] font-black rounded uppercase">
                {asset.status}
              </span>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[10px] text-gray-500 uppercase font-bold mb-1">Nomenclature</h3>
                  <p className="text-xl font-bold text-white">{asset.asset_name}</p>
                </div>
                <div>
                  <h3 className="text-[10px] text-gray-500 uppercase font-bold mb-1">Serial Number</h3>
                  <p className="text-xl font-mono text-white">{asset.serial_number}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-700 grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-[10px] text-gray-500 uppercase font-bold">Category</h3>
                  <p className="text-sm">{asset.Asset_Category_Record?.category_name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-[10px] text-gray-500 uppercase font-bold">Location</h3>
                  <p className="text-sm">Main Storage</p>
                </div>
                <div>
                  <h3 className="text-[10px] text-gray-500 uppercase font-bold">Last Inventory</h3>
                  <p className="text-sm">Today</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/40 border-t border-gray-700">
              <button className="w-full py-3 bg-gray-800 border border-gray-600 rounded-lg text-xs font-bold hover:bg-gray-700 transition-all uppercase tracking-widest">
                Edit Asset Details
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}