import React, { useState, useEffect } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get current logged-in user data from storage to prevent self-deactivation
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setUsers(data);
      } else {
        setError(data.message || 'Access Denied');
      }
    } catch (err) {
      setError('Engine Connection Failure');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm("⚠️ ATTENTION: Are you sure you want to revoke access for this operator?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auth/users/${userId}/deactivate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        // Refresh the list to show updated status
        fetchUsers();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to update record.");
      }
    } catch (err) {
      alert("Network error. Action aborted.");
    }
  };

  const handleResetPassword = async (userId) => {
    const newPass = window.prompt("Enter NEW Temporary Password:");
    if (!newPass) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auth/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: newPass })
      });

      if (res.ok) {
        alert("Success: Credentials Updated.");
      }
    } catch (err) {
      alert("Failed to reach engine.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Personnel Registry</h1>
            <p className="text-xs text-green-500 font-mono tracking-widest mt-1">SECURE DATABASE ACCESS // LEVEL 4 ADMIN</p>
          </div>
          <button className="bg-green-600 hover:bg-green-400 text-black px-6 py-2 rounded font-black text-xs transition-all uppercase">
            Create New Operator
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-400 p-4 rounded-lg mb-6 text-sm font-bold">
            SYSTEM ALERT: {error}
          </div>
        )}

        {/* Data Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-700">
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Rank / Name</th>
                <th className="p-4 font-bold">System Username</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Directives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.userAccount_id} className="hover:bg-gray-700/20 transition-colors group">
                  <td className="p-4 font-mono text-gray-500 text-xs">#{user.userAccount_id}</td>
                  <td className="p-4">
                    <div className="font-bold text-white tracking-tight">
                      {user.User?.rank || 'CIV'} {user.User?.last_name || 'UNKNOWN'}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase">{user.User?.first_name}</div>
                  </td>
                  <td className="p-4 font-mono text-sm text-green-700 group-hover:text-green-500 transition-colors">
                    {user.username}
                  </td>
                  <td className="p-4">
                    <span className={`text-[9px] px-2 py-1 rounded font-black uppercase tracking-tighter ${
                      user.status === 'active' 
                        ? 'bg-green-900/30 text-green-400 border border-green-900' 
                        : 'bg-red-900/30 text-red-400 border border-red-900'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button 
                      onClick={() => handleResetPassword(user.userAccount_id)}
                      className="text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-widest"
                    >
                      Reset
                    </button>

                    {/* Disable Deactivate button if it's the current user */}
                    {user.userAccount_id !== currentUser.id ? (
                      <button 
                        onClick={() => handleDeactivate(user.userAccount_id)}
                        className={`text-[10px] font-bold uppercase tracking-widest ${
                          user.status === 'active' ? 'text-red-500 hover:text-red-400' : 'text-gray-600 cursor-not-allowed'
                        }`}
                        disabled={user.status !== 'active'}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-blue-500 uppercase italic opacity-50">Current Session</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent mb-2"></div>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Polling MariaDB User Records...</p>
            </div>
          )}

          {!loading && users.length === 0 && !error && (
            <div className="p-12 text-center text-gray-500 text-xs uppercase tracking-widest">
              No operator records found in this sector.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}