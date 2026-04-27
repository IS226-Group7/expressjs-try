import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

// Component Imports
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';

/**
 * Security Guard: Redirects to Login if no token exists
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return children;
};

/**
 * Layout Wrapper: Adds a Navigation Bar to all protected pages
 */
const Layout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Global Navigation */}
      <nav className="bg-black border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-white tracking-tighter">
              ITAM<span className="text-green-500">ENGINE</span>
            </h1>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              <Link to="/dashboard" className="text-gray-400 hover:text-green-500 transition-colors">Scanner</Link>
              <Link to="/admin/users" className="text-gray-400 hover:text-green-500 transition-colors">Registry</Link>
            </div>
          </div>
          <div className="text-[10px] text-gray-500 font-mono">
            OPERATOR: {user.username} // ROLE: {user.role || 'STAFF'}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Protected User Management */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;