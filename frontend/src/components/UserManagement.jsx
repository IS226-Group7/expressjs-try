import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', rank: 'CIV', 
    username: '', password: '', adminFlag: false
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api('/api/auth/users');
      const data = await res.json();
      if (res.ok) setUsers(data);
      else setError(data.message || 'Access Denied');
    } catch (err) {
      setError('Engine Connection Failure');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await api('/api/auth/users/create', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ firstName: '', lastName: '', rank: 'CIV', username: '', password: '', adminFlag: false });
        fetchUsers();
      } else {
        const d = await res.json();
        alert(d.message);
      }
    } catch (err) {
      alert("Onboarding failed.");
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm("⚠️ REVOKE ACCESS: Are you sure?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await api(`/api/auth/users/${userId}/deactivate`, {
        method: 'POST',
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      alert("Action failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-white">Personnel Registry</h1>
            <p className="text-[10px] text-green-500 font-mono tracking-widest mt-1 italic">Authorized Admin Session</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-400 text-black px-6 py-2 rounded font-black text-xs transition-all uppercase"
          >
            + Onboard Operator
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-700">
                <th className="p-4 font-bold">Rank / Name</th>
                <th className="p-4 font-bold">Username</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.userAccount_id} className="hover:bg-gray-700/20 transition-colors group">
                  <td className="p-4 font-bold text-white uppercase tracking-tight">
                    {user.User?.rank} {user.User?.last_name}, {user.User?.first_name}
                  </td>
                  <td className="p-4 font-mono text-sm text-green-500">{user.username}</td>
                  <td className="p-4">
                    <span className={`text-[9px] px-2 py-1 rounded font-black uppercase ${
                      user.status === 'active' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {user.userAccount_id !== currentUser.id ? (
                      <button 
                        onClick={() => handleDeactivate(user.userAccount_id)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest disabled:opacity-30"
                        disabled={user.status !== 'active'}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-600 uppercase italic">Your Session</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create User Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter">New Operator Authorization</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="bg-gray-900 border border-gray-700 p-3 rounded text-sm text-white" 
                    onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                  <input type="text" placeholder="Last Name" className="bg-gray-900 border border-gray-700 p-3 rounded text-sm text-white" 
                    onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                </div>
                <select className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-sm text-white"
                  onChange={e => setFormData({...formData, rank: e.target.value})}>
                  <option value="CIV">CIV (Civilian)</option>
                  <option value="SGT">SGT (Sergeant)</option>
                  <option value="CPT">CPT (Captain)</option>
                  <option value="MAJ">MAJ (Major)</option>
                </select>
                <input type="text" placeholder="Login Username" className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-sm font-mono text-green-500" 
                  onChange={e => setFormData({...formData, username: e.target.value})} required />
                <input type="password" placeholder="Temp Password" className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-sm text-white" 
                  onChange={e => setFormData({...formData, password: e.target.value})} required />
                
                <label className="flex items-center space-x-3 text-[10px] text-gray-400 py-2 font-bold tracking-widest uppercase cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-green-600"
                    onChange={e => setFormData({...formData, adminFlag: e.target.checked})} />
                  <span>Elevate to Administrative Role</span>
                </label>

                <div className="flex gap-2 pt-6 border-t border-gray-700">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded font-bold text-xs">CANCEL</button>
                  <button type="submit" className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-black rounded font-black text-xs uppercase tracking-widest">Authorize</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}