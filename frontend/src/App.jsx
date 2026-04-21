import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Search, Package, CheckCircle } from 'lucide-react';
import AssetTable from './components/AssetTable'; // Make sure this path is correct
import Scanner from './components/Scanner'; // Import the scanner we built
import { Camera, LayoutDashboard } from 'lucide-react';

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
    const assetTag = decodedText.split('/').pop();
    const res = await axios.get(`/api/assets/search?q=${assetTag}`);
    if (res.data.length > 0) {
      const asset = res.data[0];
      // We can use a custom modal or a simple prompt for now
      const newStatus = window.prompt(
        `Asset: ${asset.assetTag}\nCurrent Status: ${asset.status}\n\nEnter new status (In Stock, Deployed, Repair):`,
        asset.status
      );

      if (newStatus && newStatus !== asset.status) {
        await axios.patch(`/api/assets/${asset.assetTag}/status`, { "newStatus": newStatus });
        alert("Updated!");
        window.location.reload(); // Refresh to show changes in the table
      }
    }
  };

  const [isScanning, setIsScanning] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">ITAM Inventory</h1>
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
      
      <div className="space-x-4">
        <button 
          onClick={downloadLabels}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FileText className="mr-2 w-4 h-4" /> Export Labels
        </button>
      </div>

      {/* THE SCANNER BUTTON */}
      <button
        onClick={() => setIsScanning(!isScanning)}
        className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
          isScanning 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isScanning ? (
          <> <LayoutDashboard className="mr-2" /> Back to List </>
        ) : (
          <> <Camera className="mr-2" /> Scan QR Code </>
        )}
      </button>

      <section className="mt-6">
          {isScanning ? (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
              <Scanner onScanSuccess={(tag) => {
                handleScanSuccess(tag);
                setIsScanning(false); // Close scanner after success
              }} />
            </div>
          ) : (
            <AssetTable />
          )}
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