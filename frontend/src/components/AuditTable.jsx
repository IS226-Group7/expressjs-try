export default function AuditTable ({ logs }) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-gray-800 bg-[#111]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-900 text-gray-400 uppercase text-[10px] tracking-widest">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Event</th>
            <th className="px-4 py-3">Technician (Modifier)</th>
            <th className="px-4 py-3">Recipient</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {logs?.map((log) => (
            <tr key={log.id} className="hover:bg-gray-800/30">
              <td className="px-4 py-3 text-gray-500">
                {new Date(log.change_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-green-400">{log?.toStatus}</span>
              </td>
              <td className="px-4 py-3 text-gray-300">
                {log.Modifier ? `${log.ModifiedBy.rank} ${log?.ModifiedBy.last_name}` : 'System'}
              </td>
              <td className="px-4 py-3 text-gray-300">
                {/* Only show recipient if the status involves assignment */}
                {log.Recipient ? `${log.Recipient.rank} ${log?.Recipient?.last_name}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};