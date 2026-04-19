import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Monitor, MapPin, QrCode } from 'lucide-react';

const AssetTable = () => {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch data using the search route we built
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/assets/search?q=${searchTerm}`);
      setAssets(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search: wait 500ms after user stops typing
    const delayDebounceFn = setTimeout(() => {
      fetchAssets();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Tag or Model..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
            <th className="p-4">Asset Tag</th>
            <th className="p-4">Model</th>
            <th className="p-4">Location</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {assets.map((asset) => (
            <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-mono text-blue-600 font-medium">{asset.assetTag}</td>
              <td className="p-4 flex items-center">
                <Monitor className="w-4 h-4 mr-2 text-gray-400" />
                {asset.model}
              </td>
              <td className="p-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  {asset.Location?.name || 'Unassigned'}
                </div>
              </td>
              <td className="p-4">
                <StatusBadge status={asset.status} />
              </td>
              <td className="p-4">
                <button 
                  onClick={() => window.open(`/api/assets/${asset.assetTag}/qr`)}
                  className="p-2 hover:bg-blue-100 rounded-full text-blue-600 transition-colors"
                  title="View QR Code"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {assets.length === 0 && !loading && (
        <div className="p-8 text-center text-gray-500">No assets found. Try a different search.</div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    'In Stock': 'bg-green-100 text-green-700',
    'Deployed': 'bg-blue-100 text-blue-700',
    'Repair': 'bg-red-100 text-red-700',
    'Retired': 'bg-gray-100 text-gray-700'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

export default AssetTable;