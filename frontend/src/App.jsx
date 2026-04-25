import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import the components we just drafted
import Login from './components/Login';
import Dashboard from './components/Dashboard';

/**
 * The Security Guard (ProtectedRoute)
 * It checks localStorage for the 'token' we saved during handleLogin.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // If no token exists, redirect to Login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, let them through to the component
  return children;
};

function App() {
  return (
    <Router>
      {/* The main container. 
          The bg-gray-900 here prevents white flashes between page loads. 
      */}
      <div className="min-h-screen bg-gray-900">
        <Routes>
          {/* Public: Login Page */}
          <Route path="/" element={<Login />} />

          {/* Protected: Dashboard Page */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback: Any unknown URL sends them to Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;