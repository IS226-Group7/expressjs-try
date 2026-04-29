import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const navigate = useNavigate();

  // --- GLOBAL STATE ---
  const [query, setQuery] = useState('');
  const [asset, setAsset] = useState(null);
  const [categories, setCategories] = useState([]);
  const [compTypes, setCompTypes] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);
  const [components, setComponents] = useState([]);
  const [availableParts, setAvailableParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- UI TOGGLES ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompModal, setShowCompModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeTab, setActiveTab] = useState('new'); // 'new' vs 'inventory'

  // --- FORM STATES ---
  const [formData, setFormData] = useState({ assetName: '', serialNumber: '', categoryId: '', status: 'Workable' });
  const [compFormData, setCompFormData] = useState({ component_details: '', componentTypeId: '' });
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedHarvestedId, setSelectedHarvestedId] = useState('');

  // --- INITIAL LOOKUPS ---
  useEffect(() => {
    const syncData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [catRes, compTypeRes, persRes] = await Promise.all([
          fetch('/api/assets/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/assets/component-types', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/assets/personnel/list', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (catRes.ok) {
            const data = await catRes.json();
            setCategories(data);
            if(data.length > 0) setFormData(prev => ({...prev, categoryId: data[0].category_id}));
        }
        if (compTypeRes.ok) {
            const data = await compTypeRes.json();
            setCompTypes(data);
            if(data.length > 0) setCompFormData(prev => ({...prev, componentTypeId: data[0].component_type_id}));
        }
        if (persRes.ok) setPersonnelList(await persRes.json());
      } catch (err) { console.error("Sync Error:", err); }
    };
    syncData();
  }, []);

  // --- SEARCH LOGIC ---
  const handleSearch = async (e, manualQuery = null) => {
    if (e) e.preventDefault();
    
    // Use manualQuery if provided, otherwise fallback to the state 'query'
    const searchVal = manualQuery || query; 
    console.log('searching for:' + searchVal);
    if (!searchVal) return;

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Use searchVal here instead of query
      const res = await fetch(`/api/assets/search?q=${searchVal}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      const data = await res.json();
      if (res.ok) {
        setAsset(data);
        const compRes = await fetch(`/api/assets/${data.asset_id}/components`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        setComponents(await compRes.json());
      } else { 
        setError('Asset not found.'); 
        setAsset(null); 
      }
    } catch (err) { 
      setError('Connection failure.'); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- ASSET ACTIONS ---
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/assets/create', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_name: formData.assetName,
          serial_number: formData.serialNumber,
          category_id: formData.categoryId,
          status: formData.status
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        handleSearch(null, formData.serialNumber);
      }
    } catch (err) { alert("Registration failed."); }
  };

  const updateStatus = async (assetId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/assets/update-status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assetId, status: newStatus })
      });
      if (res.ok) {
        setAsset(prev => ({ ...prev, status: newStatus }));
        if (newStatus === 'BER') handleReturnToStorage();
      }
    } catch (err) { alert("Status update failed."); }
  };

  const handleReturnToStorage = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/assets/return-to-storage', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.asset_id })
      });
      if (res.ok) setAsset(prev => ({ ...prev, user_id: null, User: null }));
    } catch (err) { console.error("Custody reset failed"); }
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
      if (res.ok) { setShowAssignModal(false); handleSearch(); }
    } catch (err) { alert("Assignment failed."); }
  };

  // --- COMPONENT ACTIONS ---
  const openCompModal = async () => {
    setShowCompModal(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/assets/components/available', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setAvailableParts(await res.json());
  };

  const handleNewComponent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/assets/install-component', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.asset_id, ...compFormData })
      });
      if (res.ok) { handleSearch(); setShowCompModal(false); setCompFormData({component_details: '', componentTypeId: compTypes[0]?.component_type_id}); }
    } catch (err) { alert("Install failed."); }
  };

  const handleRelink = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/assets/relink-component', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId: selectedHarvestedId, assetId: asset.asset_id })
      });
      if (res.ok) { handleSearch(); setShowCompModal(false); }
    } catch (err) { alert("Relink failed."); }
  };

  const handleHarvest = async (compId) => {
    if (!window.confirm("Harvest part to stock?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/assets/harvest-component', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId: compId })
      });
      if (res.ok) setComponents(prev => prev.filter(c => c.component_id !== compId));
    } catch (err) { alert("Harvest failure."); }
  };

  const handleDispose = async (compId) => {
    if (!window.confirm("Permanently Dispose and log to history?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/assets/dispose-component/${compId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setComponents(prev => prev.filter(c => c.component_id !== compId));
    } catch (err) { alert("Disposal failure."); }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-10 border-b border-gray-800 pb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Command <span className="text-green-500">Center</span></h2>
        <button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-500 text-black px-6 py-2 rounded-lg font-black text-[10px] uppercase transition-all shadow-lg shadow-green-900/20">+ Register Asset</button>
      </div>

      {/* SEARCH BOX */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="SCAN TAG OR SERIAL..."
            className="w-full bg-gray-900 border-2 border-gray-800 focus:border-green-500 p-6 rounded-2xl text-2xl font-mono text-green-400 outline-none uppercase shadow-2xl transition-all"
            autoFocus
          />
          {loading && <div className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full"></div>}
        </form>
        {error && <p className="text-red-500 text-center mt-4 font-bold uppercase text-xs tracking-widest">{error}</p>}
      </div>

      {asset && (
        <div className="max-w-5xl mx-auto bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* REFINED HEADER (No Print) */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-800 pb-8 gap-6">
            <div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-2 leading-none text-white">
                {asset.asset_name}
              </h3>
              <div className="flex items-center gap-3">
                <p className="text-green-500 font-mono text-lg tracking-widest selection:bg-green-500 selection:text-black">
                  {asset.serial_number}
                </p>
                {/* Simple copy button is more useful than a print button now */}
                <button 
                  onClick={() => navigator.clipboard.writeText(asset.serial_number)}
                  className="text-[10px] bg-gray-900 hover:bg-gray-700 text-gray-400 px-2 py-1 rounded uppercase border border-gray-700 transition-all"
                >
                  Copy SN
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-xl shadow-green-500/10">
              <QRCodeSVG value={asset.serial_number} size={90} />
            </div>
          </div>

          {/* MIDDLE SECTION: CUSTODY & TRIAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
            
            {/* CUSTODY BOX */}
            <div className="space-y-4">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Chain of Custody</p>
              <div className="bg-black/40 border border-gray-700 p-6 rounded-2xl flex justify-between items-center group">
                <div>
                  <p className="text-xs font-black uppercase text-white">{asset.User ? `${asset.User.rank} ${asset.User.first_name} ${asset.User.last_name}` : "UNASSIGNED / IN STORAGE"}</p>
                  <p className="text-[8px] text-gray-600 font-mono mt-1 uppercase">{asset.User ? `ID: ${asset.user_id}` : "Warehouse Master Manifest"}</p>
                </div>
                <div className="flex gap-2">
                  {asset.User && <button onClick={handleReturnToStorage} className="text-[9px] font-black bg-red-900/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-lg uppercase hover:bg-red-600 transition-all">Return</button>}
                  <button onClick={() => setShowAssignModal(true)} className="text-[9px] font-black bg-white text-black px-4 py-2 rounded-lg uppercase hover:bg-green-500 transition-all">{asset.User ? "Transfer" : "Issue"}</button>
                </div>
              </div>
            </div>

            {/* TRIAGE BOX */}
            <div className="space-y-4">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Quick Triage</p>
              <div className="grid grid-cols-3 gap-2">
                {['Workable', 'Under Repair', 'BER'].map(st => (
                  <button key={st} onClick={() => updateStatus(asset.asset_id, st)}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${asset.status === st ? 'bg-white text-black border-white' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}>{st}</button>
                ))}
              </div>
            </div>

          </div>

          {/* BOTTOM SECTION: MANIFEST */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Internal Manifest</h4>
              <button onClick={openCompModal} className="text-[9px] font-black text-green-500 border border-green-500/30 px-3 py-1 rounded uppercase hover:bg-green-500 hover:text-black transition-all">+ Link Hardware</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {components.map(comp => (
                <div key={comp.component_id} className="bg-black/30 border border-gray-800 p-4 rounded-xl flex justify-between items-center group">
                  <div>
                    <p className="text-xs font-bold uppercase">{comp.component_details}</p>
                    <p className="text-[8px] text-gray-400 font-mono mt-1">{comp.ComponentType?.component_type_name} — ID: {comp.component_id}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => handleHarvest(comp.component_id)} className="text-[8px] font-black text-blue-400 bg-blue-900/20 px-2 py-1 rounded uppercase border border-blue-500/20">Harvest</button>
                    <button onClick={() => handleDispose(comp.component_id)} className="text-[8px] font-black text-red-500 bg-red-900/20 px-2 py-1 rounded uppercase border border-red-500/20">Dispose</button>
                  </div>
                </div>
              ))}
              {components.length === 0 && <div className="col-span-2 py-10 text-center border-2 border-dashed border-gray-800 rounded-2xl text-[10px] text-gray-700 uppercase font-bold tracking-[0.5em]">No Internals Logged</div>}
            </div>
          </div>
        </div>
      )}

      {/* --- REGISTRATION MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <form onSubmit={handleCreateAsset} className="bg-gray-800 border border-gray-700 p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-xl font-black mb-6 uppercase italic text-green-500 tracking-tighter">New Hardware Entry</h3>
            <input type="text" placeholder="MODEL NAME (e.g. MacBook Pro)" className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-sm outline-none focus:border-green-500" value={formData.assetName} onChange={e => setFormData({...formData, assetName: e.target.value})} required />
            <input type="text" placeholder="SERIAL NUMBER" className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-sm font-mono outline-none focus:border-green-500" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} required />
            <select className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-xs font-bold uppercase" value={formData.categoryId} onChange={e => setFormData({...formData, category_id: e.target.value})}>
              {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}
            </select>
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-gray-700 rounded-xl font-bold text-[10px] uppercase">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-green-600 text-black rounded-xl font-black text-[10px] uppercase">Save to Registry</button>
            </div>
          </form>
        </div>
      )}

      {/* --- ASSIGNMENT MODAL --- */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <form onSubmit={handleAssign} className="bg-gray-800 border border-gray-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black mb-2 uppercase italic text-blue-400 tracking-tighter">Transfer Custody</h3>
            <p className="text-[9px] text-gray-500 font-bold mb-8 uppercase tracking-widest">Target: {asset.serial_number}</p>
            <select className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-xs font-bold uppercase" value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required>
              <option value="">-- SELECT RECIPIENT --</option>
              {personnelList.map(p => <option key={p.user_id} value={p.user_id}>{p.rank} {p.last_name}, {p.first_name}</option>)}
            </select>
            <div className="flex gap-2 pt-6">
              <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 py-4 bg-gray-700 rounded-xl font-bold text-[10px] uppercase">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase">Confirm Issue</button>
            </div>
          </form>
        </div>
      )}

      {/* --- COMPONENT MODAL (NEW & STOCK) --- */}
      {showCompModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase tracking-tighter italic">Hardware Link</h3>
            
            {/* TABS */}
            <div className="flex bg-black p-1 rounded-xl mb-6">
              <button onClick={() => setActiveTab('new')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'new' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-500'}`}>New Component</button>
              <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>From Stock</button>
            </div>

            {activeTab === 'new' ? (
              <form onSubmit={handleNewComponent} className="space-y-4">
                <input type="text" placeholder="SPECS (e.g. 16GB DDR4)" className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-xs uppercase" value={compFormData.component_details} onChange={e => setCompFormData({...compFormData, component_details: e.target.value})} required />
                <select className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-xs font-bold uppercase" value={compFormData.componentTypeId} onChange={e => setCompFormData({...compFormData, componentTypeId: e.target.value})}>
                  {compTypes.map(t => <option key={t.component_type_id} value={t.component_type_id}>{t.component_type_name}</option>)}
                </select>
                <button type="submit" className="w-full py-4 bg-green-600 text-black rounded-xl font-black text-[10px] uppercase">Register & Link</button>
              </form>
            ) : (
              <form onSubmit={handleRelink} className="space-y-4">
                <select className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-xs font-bold uppercase" value={selectedHarvestedId} onChange={e => setSelectedHarvestedId(e.target.value)} required>
                  <option value="">-- SELECT HARVESTED PART --</option>
                  {availableParts.map(p => <option key={p.component_id} value={p.component_id}>[{p.ComponentType?.component_type_name}] {p.component_details}</option>)}
                </select>
                {availableParts.length === 0 && <p className="text-center text-[9px] text-yellow-500 font-bold uppercase py-2 tracking-widest">Spare Stock is Empty</p>}
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase" disabled={!selectedHarvestedId}>Install from Stock</button>
              </form>
            )}
            <button type="button" onClick={() => setShowCompModal(false)} className="w-full mt-4 text-[9px] text-gray-500 font-bold uppercase">Back to Chassis</button>
          </div>
        </div>
      )}

    </div>
  );
}