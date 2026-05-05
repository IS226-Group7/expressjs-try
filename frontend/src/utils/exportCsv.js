export const exportToCsv = (filename, rows, view) => {
  if (!rows || !rows.length) return;

  const separator = ',';
  let headers = [];
  let extractData = (item) => [];

  // Define headers and data extraction based on the current view
  switch (view) {
    case 'available components':
      headers = ['Component Type', 'Details', 'System ID'];
      extractData = (item) => [
        item.ComponentType?.component_type_name,
        item.component_details,
        item.component_id
      ];
      break;
    case 'asset assignment':
      headers = ['Asset Name', 'Serial Number', 'Holder', 'Status'];
      extractData = (item) => [
        item.asset_name,
        item.serial_number,
        item.User ? `${item.User.rank} ${item.User.last_name}` : 'N/A',
        item.status
      ];
      break;
    case 'ber':
      headers = ['Defective Asset', 'Serial Number', 'Category', 'Status'];
      extractData = (item) => [
        item.asset_name,
        item.serial_number,
        item.Category?.category_name,
        item.status
      ];
      break;
    default: // overview/recent activity
      headers = ['Asset', 'Serial', 'Event', 'Technician', 'Date'];
      extractData = (item) => [
        item.Asset?.asset_name,
        item.Asset?.serial_number,
        item.toStatus,
        `${item.ModifiedBy?.rank || ''} ${item.ModifiedBy?.last_name || ''}`,
        new Date(item.change_date).toLocaleDateString()
      ];
  }

  // Create CSV content
  const csvContent = [
    headers.join(separator),
    ...rows.map(item => 
      extractData(item)
        .map(val => `"${String(val).replace(/"/g, '""')}"`) // Escape quotes
        .join(separator)
    )
  ].join('\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};