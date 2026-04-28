import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [query, setQuery] = useState('');
  const [asset, setAsset] = useState(null);
  const [categories, setCategories] = useState([]);
  const [compTypes, setCompTypes] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal Toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompModal, setShowCompModal] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    assetName: '',
    serialNumber: '',
    categoryId: '',
    status: 'Workable'
  });

  const [compFormData, setCompFormData] = useState({
    component_details: '',
    componentTypeId: ''
  });

  const [personnelList, setPersonnelList] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  // Fetch Personnel alongside Categories/CompTypes in your useEffect
  useEffect(() => {
    const fetchPersonnel = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/assets/personnel/list', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setPersonnelList(data);
    };
    fetchPersonnel();
  }, []);


  // --- INITIALIZATION (Sync with MariaDB) ---
  useEffect(() => {
    const syncLookups = async () => {
      const token = localStorage.getItem('token');
      try {
        // Fetch Asset Categories
        const catRes = await fetch('/api/assets/categories', { headers: { 'Authorization': `Bearer ${token}` } });
        const catData = await catRes.json();
        if (catRes.ok) {
          setCategories(catData);
          if (catData.length > 0) setFormData(f => ({ ...f, categoryId: catData[0].category_id }));
        }

        // Fetch Component Types
        const compTypeRes = await fetch('/api/assets/component-types', { headers: { 'Authorization': `Bearer ${token}` } });
        const compTypeData = await compTypeRes.json();
        if (compTypeRes.ok) {
          setCompTypes(compTypeData);
          if (compTypeData.length > 0) setCompFormData(f => ({ ...f, componentTypeId: compTypeData[0].component_type_id }));
        }
      } catch (err) {
        console.error("Lookup Sync Failure");
      }
    };
    syncLookups();
  }, []);

  // --- LOGIC HANDLERS ---

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
      
      if (res.ok) {
        setAsset(data);
        // Fetch child components for this asset
        const compRes = await fetch(`/api/assets/${data.asset_id}/components`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const compData = await compRes.json();
        setComponents(compData);
      } else {
        setError('No record found.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (assetId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/assets/update-status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assetId, status: newStatus })
      });
      if (res.ok) setAsset(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert("Status update failed.");
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

  const handleInstallComponent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/assets/install-component', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.asset_id, ...compFormData })
      });
      if (res.ok) {
        const result = await res.json();
        setComponents(prev => [...prev, result.component]);
        setShowCompModal(false);
        setCompFormData(f => ({ ...f, component_details: '' }));
      }
    } catch (err) {
      alert("Hardware link failed.");
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/assets/assign', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.asset_id, personnelId: selectedUser })
      });
      if (res.ok) {
        // Re-run search to refresh the asset object with new user data
        handleSearch(); 
        setShowAssignModal(false);
      }
    } catch (err) {
      alert("Custody transfer failed.");
    }
  };

  const handleReturnToStorage = async () => {
    if (!window.confirm("Confirm return to storage? This clears current custody.")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/assets/return-to-storage', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.asset_id })
      });
      
      if (res.ok) {
        // Refresh local asset state to show UNASSIGNED
        setAsset(prev => ({ ...prev, User: null }));
      }
    } catch (err) {
      alert("Return protocol failed.");
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto min-h-screen text-white font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Command <span className="text-green-500">Center</span></h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-500 text-black px-6 py-2 rounded-lg font-black text-xs uppercase"
        >
          + Register Asset
        </button>
      </div>

      {/* SEARCH/SCAN INPUT */}
      <form onSubmit={handleSearch} className="mb-12 relative max-w-2xl mx-auto">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SCAN TAG OR ENTER SERIAL..."
          className="w-full bg-black border-2 border-gray-800 focus:border-green-500 p-6 rounded-2xl text-2xl font-mono text-green-400 outline-none uppercase shadow-2xl"
          autoFocus
        />
        {loading && <div className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full"></div>}
      </form>

      {/* ASSET RECORD DISPLAY */}
      {asset && (
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start border-b border-gray-700 pb-8">
            <div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-2">{asset.asset_name}</h3>
              <p className="text-green-500 font-mono text-lg tracking-widest">{asset.serial_number}</p>
              <div className="mt-4 flex gap-3">
                <span className={`px-3 py-1 rounded text-[10px] font-black uppercase ${
                  asset.status === 'Workable' ? 'bg-green-900 text-green-400' : 
                  asset.status === 'Under Repair' ? 'bg-yellow-900 text-yellow-400' : 'bg-red-900 text-red-400'
                }`}>
                  {asset.status}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase py-1">Type: {asset.Asset_Category_Record?.category_name}</span>
              </div>
            </div>
            <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-xl text-[10px] font-black uppercase">Print Tag</button>
          </div>

          {/* STATUS UPDATES */}
          <div className="mt-8">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Quick Triage</p>
            <div className="grid grid-cols-3 gap-3">
              {['Workable', 'Under Repair', 'BER'].map(st => (
                <button 
                  key={st}
                  onClick={() => updateStatus(asset.asset_id, st)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${asset.status === st ? 'bg-white text-black border-white' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* HARDWARE MANIFEST */}
          <div className="mt-10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Internal Components</h4>
              <button onClick={() => setShowCompModal(true)} className="text-[9px] font-black text-green-500 border border-green-500/30 px-3 py-1 rounded uppercase hover:bg-green-500 hover:text-black">+ Link Part</button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {components.length > 0 ? components.map(comp => (
                <div key={comp.id} className="bg-black/30 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold uppercase">{comp.component_details}</p>
                    <p className="text-[8px] text-gray-600 font-mono mt-1">ID: {comp.component_id}</p>
                  </div>
                  <span className="text-[8px] font-black text-blue-400 bg-blue-900/20 border border-blue-500/30 px-2 py-1 rounded uppercase">
                    {comp.ComponentType?.component_type_name}
                  </span>
                </div>
              )) : (
                <div className="py-6 text-center border-2 border-dashed border-gray-700 rounded-2xl text-[9px] text-gray-600 uppercase font-bold tracking-widest">Manifest Empty</div>
              )}
            </div>
          </div>

          {/* PRINT BLOCK */}
          <div id="print-section" className="hidden print:flex flex-col items-center justify-center bg-white text-black mx-auto" style={{ width: '3in', height: '2in' }}>
            <QRCodeSVG value={asset.serial_number} size={110} level="H" />
            <p className="mt-2 font-mono font-black text-lg">{asset.serial_number}</p>
            <p className="text-[8px] font-bold uppercase">{asset.asset_name}</p>
          </div>

          {/* CUSTODY / ASSIGNMENT */}
          <div className="mt-10 pt-8 border-t border-gray-700">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Current Custody</p>
            <div className="bg-black/30 border border-gray-800 p-6 rounded-2xl flex justify-between items-center group">
              <div>
                <p className="text-xs font-black uppercase tracking-tight text-white">
                  {asset.User ? `${asset.User.rank} ${asset.User.first_name} ${asset.User.last_name}` : "UNASSIGNED / IN STORAGE"}
                </p>
                <p className="text-[8px] text-gray-600 font-mono mt-1 uppercase">
                  {asset.User ? `Personnel ID: ${asset.User.user_id}` : "Ready for Field Deployment"}
                </p>
              </div>
              
              <div className="flex gap-2">
                {asset.User && (
                  <button 
                    onClick={handleReturnToStorage}
                    className="text-[9px] font-black bg-red-900/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-lg uppercase hover:bg-red-600 hover:text-white transition-all"
                  >
                    Return to Storage
                  </button>
                )}
                <button 
                  onClick={() => setShowAssignModal(true)}
                  className="text-[9px] font-black bg-white text-black px-4 py-2 rounded-lg uppercase hover:bg-green-500 transition-all"
                >
                  {asset.User ? "Transfer Custody" : "Issue Hardware"}
                </button>
              </div>
            </div>
          </div>      
        </div>
      )}

      {/* MODAL: COMMISSION ASSET */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-800 border bor
          der-gray-700 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase">Register New Hardware</h3>
            <form onSubmit={handleCreateAsset} className="space-y-4">
              <input type="text" placeholder="NAME (e.g. DELL G15)" className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-sm" onChange={e => setFormData({...formData, assetName: e.target.value})} required />
              <input type="text" placeholder="SERIAL NUMBER" className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-green-500 font-mono text-sm" onChange={e => setFormData({...formData, serialNumber: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-gray-900 border border-gray-700 p-4 rounded-xl text-xs font-bold" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                  {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                </select>
                <select className="bg-gray-900 border border-gray-700 p-4 rounded-xl text-xs font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Workable">Workable</option>
                  <option value="Under Repair">Under Repair</option>
                  <option value="BER">BER</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-green-600 text-black rounded-xl font-black uppercase text-xs">Authorize Entry</button>
              <button type="button" onClick={() => setShowAddModal(false)} className="w-full text-[10px] text-gray-500 font-bold uppercase">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSTALL COMPONENT */}
      {showCompModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase">Link Component</h3>
            <form onSubmit={handleInstallComponent} className="space-y-4">
              <input type="text" placeholder="PART SPECS (e.g. 16GB DDR4)" className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-sm" onChange={e => setCompFormData({...compFormData, component_details: e.target.value})} required />
              <select className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-xs font-bold" value={compFormData.componentTypeId} onChange={e => setCompFormData({...compFormData, componentTypeId: e.target.value})}>
                {compTypes.map(t => <option key={t.component_type_id} value={t.component_type_id}>{t.component_type_name}</option>)}
              </select>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs">Link to Chassis</button>
              <button type="button" onClick={() => setShowCompModal(false)} className="w-full text-[10px] text-gray-500 font-bold uppercase">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[120] p-4">
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black mb-2 uppercase italic text-blue-400">Transfer Custody</h3>
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-6">Assigning SN: {asset.serial_number}</p>
            
            <form onSubmit={handleAssign} className="space-y-6">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-2 ml-1">Select Personnel</label>
                <select 
                  className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-white text-xs font-bold outline-none focus:border-blue-500"
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="">-- SELECT RECIPIENT --</option>
                  {personnelList.map(p => (
                    <option key={p.user_id} value={p.user_id}>
                      {p.rank} {p.last_name}, {p.first_name} ({p.user_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 py-4 bg-gray-700 rounded-xl font-bold text-[10px] uppercase text-white">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/30">Confirm Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}