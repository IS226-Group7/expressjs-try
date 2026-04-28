import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // App State
  const [query, setQuery] = useState('');
  const [asset, setAsset] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    assetName: '',
    serialNumber: '',
    categoryId: '',
    status: 'Workable'
  });

  // 1. Initial Data Fetch (Categories)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/assets/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setCategories(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: data[0].category_id }));
          }
        }
      } catch (err) {
        console.error("Critical: Could not sync categories from MariaDB.");
      }
    };
    fetchCategories();
  }, []);

  // 2. Search/Scan Logic
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/assets/search?q=${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAsset(data);
      else setError('No matching record in registry.');
    } catch (err) {
      setError('Engine offline.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Status Update Logic (Quick Action Bar)
  const updateStatus = async (assetId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/assets/update-status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ id: assetId, status: newStatus })
      });

      if (res.ok) {
        // Update local state so UI reflects change immediately
        setAsset(prev => ({ ...prev, status: newStatus }));
      } else {
        alert("Status update failed at database level.");
      }
    } catch (err) {
      alert("Relational connection lost.");
    }
  };

  // 4. Create New Asset Logic
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/assets/create', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const result = await res.json();
        setShowAddModal(false);
        setAsset(result.asset);
        setQuery(formData.serialNumber);
      } else {
        const d = await res.json();
        alert(d.message);
      }
    } catch (err) {
      alert("Registration failed.");
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto min-h-screen font-sans">
      
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Scanner Interface</h2>
          <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Active Database: MariaDB // Protocol: ITAM-E</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-500 text-black px-6 py-2 rounded font-black text-xs uppercase transition-all shadow-lg shadow-green-900/20"
        >
          + Commission Hardware
        </button>
      </div>

      {/* MAIN SCANNER INPUT */}
      <form onSubmit={handleSearch} className="mb-12 relative max-w-2xl mx-auto">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="READY FOR SCAN..."
          className="w-full bg-black border-2 border-gray-800 focus:border-green-500 p-6 rounded-2xl text-2xl font-mono text-green-400 outline-none uppercase placeholder-gray-900 transition-all shadow-inner"
          autoFocus
        />
        {loading && <div className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full"></div>}
      </form>

      {/* ASSET DATA & PRINT PREVIEW */}
      {asset && (
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Hardware Record Found</p>
              <h3 className="text-4xl font-black text-white uppercase tracking-tight leading-none mb-2">{asset.asset_name}</h3>
              <p className="text-green-500 font-mono text-lg tracking-[0.2em]">{asset.serial_number}</p>
              
              <div className="mt-4 flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  asset.status === 'Workable' ? 'bg-green-900/40 text-green-400' : 
                  asset.status === 'Under Repair' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-red-900/40 text-red-400'
                }`}>
                  Status: {asset.status}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">| Category: {asset.Asset_Category_Record?.category_name || 'Unclassified'}</span>
              </div>
            </div>

            <button 
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            >
              Generate ID Tag
            </button>
          </div>

          {/* QUICK ACTION BAR */}
          <div className="mt-10 pt-8 border-t border-gray-700">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Status Update</p>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => updateStatus(asset.id, 'Workable')}
                className="py-3 bg-gray-900/50 hover:bg-green-600 text-green-500 hover:text-black border border-green-900/50 rounded-xl text-[10px] font-black uppercase transition-all"
              >
                Mark Workable
              </button>
              <button 
                onClick={() => updateStatus(asset.id, 'Under Repair')}
                className="py-3 bg-gray-900/50 hover:bg-yellow-600 text-yellow-500 hover:text-black border border-yellow-900/50 rounded-xl text-[10px] font-black uppercase transition-all"
              >
                Set Under Repair
              </button>
              <button 
                onClick={() => updateStatus(asset.id, 'BER')}
                className="py-3 bg-gray-900/50 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/50 rounded-xl text-[10px] font-black uppercase transition-all"
              >
                Set BER
              </button>
            </div>
          </div>

          {/* HIDDEN PRINT BLOCK - 3" x 2" Optimized */}
          <div id="print-section" className="hidden print:flex flex-col items-center justify-center bg-white text-black mx-auto" style={{ width: '3in', height: '2in', padding: '10px' }}>
              <p className="text-[10px] font-black uppercase mb-2 border-b-2 border-black w-full text-center pb-1">ITAM PROPERTY TAG</p>
              <div className="bg-white p-1">
                <QRCodeSVG value={asset.serial_number} size={115} level="H" includeMargin={false} />
              </div>
              <p className="mt-2 font-mono font-black text-[17px] leading-none">{asset.serial_number}</p>
              <p className="text-[8px] font-bold uppercase opacity-80 tracking-tighter mt-1">{asset.asset_name}</p>
              <p className="text-[6px] uppercase mt-auto opacity-50 italic">System Verified: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter">Onboard Hardware</h2>
            <form onSubmit={handleCreateAsset} className="space-y-4">
              
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 ml-1">Asset Nomenclature</label>
                <input type="text" placeholder="e.g. Panasonic Toughbook" className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-white text-sm outline-none focus:border-green-600" 
                  onChange={e => setFormData({...formData, assetName: e.target.value})} required />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 ml-1">Serial Number</label>
                <input type="text" placeholder="SN-XXXXX" className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-green-500 font-mono text-sm outline-none focus:border-green-600" 
                  onChange={e => setFormData({...formData, serialNumber: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 ml-1">Category</label>
                  <select 
                    className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-white text-xs font-bold outline-none"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 ml-1">Initial Status</label>
                  <select 
                    className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-white text-xs font-bold outline-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Workable">Workable</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="BER">BER</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-xs uppercase text-white transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all">Authorize</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}