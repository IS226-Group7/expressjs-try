import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import CategoryBreakdown from './CategoryBreakdown.jsx';
import { exportToCsv } from '../utils/exportCsv';

export default function Reports() {
  const [view, setView] = useState('overview'); // 'overview', 'inventory', 'available components', 'asset assignment', 'ber'
  const [reportList, setReportList] = useState([]); // Always an array for .map()
  const [summaryStats, setSummaryStats] = useState(null); // Object for the cards
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [view]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (view) {
        case 'inventory': endpoint = '/api/reports/category-status-breakdown'; break;
        case 'available components': endpoint = '/api/reports/ghost-report'; break;
        case 'asset assignment': endpoint = '/api/reports/custody-report'; break;
        case 'ber': endpoint = '/api/reports/ber-report'; break;
        default: endpoint = '/api/reports/dashboard-stats';
      }

      const res = await api(endpoint);

      if (view === 'overview') {
        setSummaryStats(res.statusStats || []);
        setReportList(res.recentActivity || []);
      } else {
        // Ensure res is an array before setting
        setReportList(Array.isArray(res) ? res : []);
      }
    } catch (err) {
      console.error("Report Fetch Error:", err);
      setReportList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Pass the current view and the data list to the exporter
    exportToCsv(`Logistics_Report_${view.replace(' ', '_')}`, reportList, view);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
          Asset <span className="text-green-500">Reports</span>
        </h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Auditor-Ready Logistics Reports</p>
      </div>

      {/* VIEW SELECTOR */}
      <div className="max-w-6xl mx-auto flex flex-wrap gap-3 mb-10">
        {['overview', 'inventory', 'asset assignment', 'available components', 'ber'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
              view === v 
                ? 'bg-green-600 border-green-600 text-black shadow-lg shadow-green-900/20' 
                : 'border-gray-800 text-gray-500 hover:border-gray-600'
            }`}
          >
            {v === 'overview' ? '📊 Overview' : `${v} Report`}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Compiling Manifest...</p>
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS (Only show on Overview) */}
            {view === 'overview' && summaryStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {summaryStats.map((stat, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{stat.status}</p>
                    <p className="text-4xl font-black mt-1 text-white">{stat.total}</p>
                  </div>
                ))}
              </div>
            )}
            {view === 'inventory' ? (
                <div className="p-6">
                  <CategoryBreakdown data={reportList} />
                </div>
            ) : (
              <>
              {/* MAIN REPORT TABLE */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/80">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                    {view === 'overview' ? 'Recent System Activity' : `${view} Master List`}
                  </h3>
                  <button 
                    onClick={handleDownload}
                    disabled={reportList.length === 0}
                    className="text-[9px] font-black text-green-500 hover:text-white transition-colors uppercase disabled:text-gray-700"
                  >
                    Download CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-black/50 text-gray-500 uppercase text-[10px] tracking-tighter">
                      <tr>
                        {view === 'overview' && (
                          <>
                            <th className="px-6 py-4">Asset / Serial</th>
                            <th className="px-6 py-4">Event</th>
                            <th className="px-6 py-4">Technician</th>
                            <th className="px-6 py-4 text-right">Date</th>
                          </>
                        )}
                        {view === 'available components' && (
                          <>
                            <th className="px-6 py-4">Component Type</th>
                            <th className="px-6 py-4">Technical Details</th>
                            <th className="px-6 py-4 text-right">System ID</th>
                          </>
                        )}
                        {view === 'asset assignment' && (
                          <>
                            <th className="px-6 py-4">Asset Name</th>
                            <th className="px-6 py-4">Serial Number</th>
                            <th className="px-6 py-4">Current Holder</th>
                            <th className="px-6 py-4 text-right">Status</th>
                          </>
                        )}
                        {view === 'ber' && (
                          <>
                            <th className="px-6 py-4">Defective Asset</th>
                            <th className="px-6 py-4">Serial Number</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Action Required</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {reportList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                          {view === 'overview' && (
                            <>
                              <td className="px-6 py-4">
                                <p className="font-bold">{item.Asset?.asset_name}</p>
                                <p className="text-[10px] text-gray-500 font-mono">{item.Asset?.serial_number}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-black px-2 py-1 bg-green-900/20 text-green-500 rounded border border-green-800/30">
                                  {item.toStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-400">
                                {item.ModifiedBy?.rank} {item.ModifiedBy?.last_name}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-600 text-xs">
                                {new Date(item.change_date).toLocaleDateString()}
                              </td>
                            </>
                          )}
                          {view === 'available components' && (
                            <>
                              <td className="px-6 py-4 font-bold text-blue-400">
                                {item.ComponentType?.component_type_name}
                              </td>
                              <td className="px-6 py-4 text-gray-300">{item.component_details}</td>
                              <td className="px-6 py-4 text-right font-mono text-gray-600">{item.component_id}</td>
                            </>
                          )}
                          {view === 'asset assignment' && (
                            <>
                              <td className="px-6 py-4 font-bold">{item.asset_name}</td>
                              <td className="px-6 py-4 font-mono text-green-500">{item.serial_number}</td>
                              <td className="px-6 py-4">
                                <span className="text-white uppercase font-black tracking-tighter">
                                  {item.User ? `${item.User.rank} ${item.User.last_name}` : 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-xs text-gray-500">{item.status}</td>
                            </>
                          )}
                          {view === 'ber' && (
                            <>
                              <td className="px-6 py-4 font-bold text-red-500">{item.asset_name}</td>
                              <td className="px-6 py-4 font-mono text-gray-400">{item.serial_number}</td>
                              <td className="px-6 py-4 text-gray-400">{item.Category?.category_name}</td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-[9px] font-black text-white bg-red-600 px-2 py-1 rounded">DISPOSE</span>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportList.length === 0 && (
                    <div className="py-20 text-center text-gray-700 font-bold uppercase tracking-[0.5em] text-[10px]">
                      No Data Found
                    </div>
                  )}
                </div>
              </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}