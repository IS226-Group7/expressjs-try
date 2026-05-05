export default function CategoryBreakdown ({ data }) {
  // 1. Guard Clause: Ensure data is an array
  if (!data || !Array.isArray(data)) {
    return <p className="text-gray-500 text-xs italic">Awaiting manifest data...</p>;
  }

  // 2. Grouping logic
  const grouped = data.reduce((acc, item) => {
    // Note: Backend 'nest: true' means it's item.Category.category_name
    const catName = item.Category?.category_name || "Uncategorized";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="bg-black/40 border border-gray-800 p-5 rounded-2xl">
          <h4 className="text-green-500 font-black uppercase text-[10px] mb-4 tracking-[0.2em] border-b border-gray-800 pb-2">
            {category}
          </h4>
          <div className="space-y-3">
            {items.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">{s.status}</span>
                <span className="text-xs font-mono font-black text-white bg-gray-900 px-3 py-1 rounded-md border border-gray-800">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
          {/* Visual Bar showing total for the category */}
          <div className="mt-4 pt-3 border-t border-gray-800/50 flex justify-between items-center">
             <span className="text-[9px] text-gray-600 uppercase font-black">Total Units</span>
             <span className="text-xs font-black text-gray-300">
                {items.reduce((sum, i) => sum + parseInt(i.count), 0)}
             </span>
          </div>
        </div>
      ))}
    </div>
  );
};

