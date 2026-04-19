import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Search, Package, CheckCircle } from 'lucide-react';
import AssetTable from './components/AssetTable'; // Make sure this path is correct

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, deployed: 0, inStock: 0 });

  // 1. Function to trigger that PDF we just built
  const downloadLabels = async () => {
    window.open('/api/assets/generate-labels', '_blank');
  };

  // 2. Handle File Upload (Connecting to your Multer route)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/assets/bulk-import', formData);
      alert(res.data.message);
    } catch (err) {
      alert("Import failed: " + err.response?.data?.message);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      // 1. The QR code usually contains the Asset Tag (e.g., "LAP-101")
      // We hit your search endpoint using the relative path
      const response = await axios.get(`/api/assets/search?q=${decodedText}`);
      
      if (response.data.length > 0) {
        const asset = response.data[0];
        alert(`
          Asset Found!
          Tag: ${asset.assetTag}
          Model: ${asset.model}
          Location: ${asset.Location?.name || 'Unknown'}
          Status: ${asset.status}
        `);
      } else {
        alert("Asset not found in database.");
      }
    } catch (error) {
      console.error("Lookup error:", error);
      alert("Error connecting to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">ITAM Inventory</h1>
        <div className="space-x-4">
          <button 
            onClick={downloadLabels}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FileText className="mr-2 w-4 h-4" /> Export Labels
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Assets" value="124" icon={<Package />} color="bg-blue-500" />
        <StatCard title="In Stock" value="45" icon={<CheckCircle />} color="bg-green-500" />
        <StatCard title="Under Repair" value="12" icon={<Search />} color="bg-yellow-500" />
      </div>

      {/* Main Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Inventory Operations</h2>
        <div className="flex items-center space-x-4">
          <label className="flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-50">
            <Upload className="w-8 h-8 text-blue-600" />
            <span className="mt-2 text-base leading-normal text-blue-600 font-semibold">Bulk Import Excel</span>
            <input type='file' className="hidden" onChange={handleFileUpload} />
          </label>
          
          <a 
            href="/api/assets/template" 
            className="text-gray-500 hover:underline text-sm"
          >
            Download Empty Template
          </a>
        </div>
      </div>
      
      <section className="mt-6">
          <AssetTable />
      </section>

    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
    <div className={`${color} p-4 rounded-lg text-white mr-4`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500 uppercase font-bold">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default Dashboard;