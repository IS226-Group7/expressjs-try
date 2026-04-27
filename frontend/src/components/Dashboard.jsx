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

  // 1. DYNAMIC CATEGORY FETCH
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
        console.error("Database Link Failure: Categories unreachable.");
      }
    };
    fetchCategories();
  }, []);

  // 2. SEARCH / SCAN LOGIC
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
      else setError('No Record Found.');
    } catch (err) {
      setError('Engine Offline.');
    } finally {
      setLoading(false);
    }
  };

  // 3. COMMISSION ASSET (Relational Handshake)
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
      alert("Relational Insert Failed.");
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto min-h-screen">
      
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Scanner Interface</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-500 text-black px-6 py-2 rounded font-black text-xs uppercase transition-all"
        >
          + Commission Hardware
        </button>
      </div>

      {/* SCANNER INPUT */}
      <form onSubmit={handleSearch} className="mb-12 relative max-w-2xl mx-auto">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="READY FOR SCAN..."
          className="w-full bg-black border-2 border-gray-800 focus:border-green-500 p-5 rounded-xl text-xl font-mono text-green-400 outline-none uppercase placeholder-gray-800"
          autoFocus
        />
        {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>}
      </form>

      {/* ASSET DATA & PRINT PREVIEW */}
      {asset && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Hardware Record</p>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight">{asset.asset_name}</h3>
              <p className="text-green-500 font-mono text-sm tracking-widest mt-1">{asset.serial_number}</p>
              <span className={`inline-block mt-4 px-3 py-1 rounded text-[10px] font-black uppercase ${
                asset.status === 'Workable' ? 'bg-green-900/40 text-green-400' : 
                asset.status === 'Under Repair' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-red-900/40 text-red-400'
              }`}>
                {asset.status}
              </span>
            </div>
            <button 
              onClick={() => window.print()}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Generate ID Tag
            </button>
          </div>

          {/* HIDDEN PRINT BLOCK - Optimized for 3" x 2" or large 2.5" x 1.5" labels */}
          <div 
            id="print-section" 
            className="hidden print:flex flex-col items-center justify-center bg-white text-black mx-auto"
            style={{ width: '3in', height: '2in', padding: '10px' }}
          >
              {/* Header Line */}
              <p className="text-[10px] font-black uppercase mb-2 border-b-2 border-black w-full text-center pb-1">
                ITAM PROPERTY TAG
              </p>

              {/* The QR Code - Increased size from 65 to 110 */}
              <div className="bg-white p-1 border border-gray-200">
                <QRCodeSVG 
                  value={asset.serial_number} 
                  size={110} 
                  level="H" 
                  includeMargin={false}
                />
              </div>

              {/* Metadata */}
              <div className="text-center mt-2">
                <p className="font-mono font-black text-[16px] leading-none uppercase">
                  {asset.serial_number}
                </p>
                <p className="text-[9px] font-bold uppercase opacity-80 tracking-tighter mt-1">
                  {asset.asset_name}
                </p>
              </div>

              {/* Footer timestamp for audit */}
              <p className="text-[6px] uppercase mt-auto opacity-50">
                Registered: {new Date(asset.createdAt).toLocaleDateString()}
              </p>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter">Onboard New Asset</h2>
            <form onSubmit={handleCreateAsset} className="space-y-4">
              
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 ml-1">Nomenclature</label>
                <input type="text" placeholder="e.g. DELL PRECISION" className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-white text-sm" 
                  onChange={e => setFormData({...formData, assetName: e.target.value})} required />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 ml-1">Serial Number</label>
                <input type="text" placeholder="SN-XXXXX" className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-green-500 font-mono text-sm" 
                  onChange={e => setFormData({...formData, serialNumber: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 ml-1">Category</label>
                  <select 
                    className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-white text-xs font-bold"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 ml-1">Status</label>
                  <select 
                    className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-white text-xs font-bold"
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
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-xs uppercase">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-black rounded-xl font-black text-xs uppercase tracking-widest">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}