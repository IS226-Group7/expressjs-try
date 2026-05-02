import React from 'react';

/**
 * AssetTable Component
 * @param {Array} assets - The array of asset objects from the paginated backend response
 * @param {Function} onSelect - Function to jump back to Search View with a specific Serial Number
 */
export default function AssetTable({ assets, onSelect }) {
  return (
    <div className="w-full">
      {/* Table Container with horizontal scroll for mobile */}
      <div className="overflow-x-auto bg-gray-900/40 border border-gray-800 rounded-2xl shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-black/60 border-b border-gray-800">
            <tr>
              <th className="p-4 text-[9px] font-black uppercase text-gray-500 tracking-[0.2em]">Hardware / Serial</th>
              <th className="p-4 text-[9px] font-black uppercase text-gray-500 tracking-[0.2em]">Category</th>
              <th className="p-4 text-[9px] font-black uppercase text-gray-500 tracking-[0.2em]">Status</th>
              <th className="p-4 text-[9px] font-black uppercase text-gray-500 tracking-[0.2em]">Custodian</th>
              <th className="p-4 text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {assets && assets.length > 0 ? (
              assets.map((item) => (
                <tr 
                  key={item.asset_id} 
                  className="hover:bg-green-500/[0.03] transition-colors group"
                >
                  {/* HARDWARE & SN */}
                  <td className="p-4">
                    <div className="font-bold text-sm text-white uppercase leading-tight group-hover:text-green-400 transition-colors">
                      {item.asset_name}
                    </div>
                    <div className="font-mono text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">
                      {item.serial_number}
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td className="p-4">
                    <span className="text-[10px] bg-gray-800/50 px-2 py-1 rounded text-gray-400 border border-gray-700 uppercase font-bold">
                      {item.Category?.category_name || 'N/A'}
                    </span>
                  </td>

                  {/* STATUS INDICATOR */}
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-[9px] font-black uppercase ${
                      item.status === 'Workable' ? 'border-green-900 text-green-400 bg-green-900/10' :
                      item.status === 'Under Repair' ? 'border-yellow-900 text-yellow-400 bg-yellow-900/10' :
                      'border-red-900 text-red-400 bg-red-900/10'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        item.status === 'Workable' ? 'bg-green-500' :
                        item.status === 'Under Repair' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      {item.status}
                    </div>
                  </td>

                  {/* CUSTODIAN */}
                  <td className="p-4">
                    {item.User ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">
                          {item.User.rank} {item.User.last_name}
                        </span>
                        <span className="text-[8px] text-gray-600 font-mono italic uppercase">Issued</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-600 font-black uppercase italic tracking-tighter opacity-60">
                        In Storage
                      </span>
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => onSelect(item.serial_number)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 hover:bg-green-600 text-gray-400 hover:text-black transition-all border border-gray-700"
                      title="Inspect Asset"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-gray-700 font-bold">!</span>
                    </div>
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.4em]">
                      Registry Empty
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}