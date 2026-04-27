import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';

// The Layout creates the persistent Top Navigation Bar
const Layout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* GLOBAL NAVIGATION */}
      <nav className="bg-black border-b border-gray-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-10">
            <h1 className="text-xl font-black text-white tracking-tighter">
              ITAM<span className="text-green-500">ENGINE</span>
            </h1>
            <div className="flex gap-6">
              <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-500 transition-all">Scanner</Link>
              <Link to="/admin/users" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-500 transition-all">Personnel</Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              OP: {user.username}
            </span>
            <button onClick={handleLogout} className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Actual Page Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <Layout><UserManagement /></Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}