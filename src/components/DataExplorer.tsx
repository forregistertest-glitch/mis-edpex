import { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  FileJson, 
  FileSpreadsheet, 
  FileCode,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface DataExplorerProps {
  data: any[];
  title: string;
  onClose: () => void;
  lang: 'th' | 'en';
}

export default function DataExplorer({ data, title, onClose, lang }: DataExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Filter logic
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [data, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Export functions
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_Export.xlsx`);
    setShowExportOptions(false);
  };

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_Database_Dump.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportOptions(false);
  };

  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_Legacy_CSV.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportOptions(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 font-medium">{filteredData.length} {lang === 'th' ? 'รายการที่พบ' : 'records found'}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-blue-700 transition-all"
              >
                <Download size={18} />
                {lang === 'th' ? 'ส่งออกข้อมูล' : 'Export Data'}
              </button>
              
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-10 animate-in zoom-in-95 duration-200">
                  <button onClick={exportToExcel} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                    <FileSpreadsheet className="text-green-600" size={18} />
                    Excel (.xlsx)
                  </button>
                  <button onClick={exportToJSON} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                    <FileJson className="text-blue-600" size={18} />
                    JSON (DB Ready)
                  </button>
                  <button onClick={exportToCSV} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                    <FileCode className="text-orange-600" size={18} />
                    CSV (Legacy)
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={lang === 'th' ? 'ค้นหาในตาราง...' : 'Search in table...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{lang === 'th' ? 'แถวต่อหน้า:' : 'Rows per page:'}</span>
            <select 
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-slate-100 border-none rounded-lg py-1 px-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          {filteredData.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                <tr>
                  {Object.keys(data[0] || {}).map(key => (
                    <th key={key} className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((row, idx) => {
                  const columns = Object.keys(data[0] || {});
                  return (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      {columns.map((col, cIdx) => (
                        <td key={cIdx} className="px-6 py-4 text-xs text-slate-600">
                          {row[col] === null ? "—" : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p>{lang === 'th' ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหา' : 'No data matching your search'}</p>
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500 font-medium">
            {lang === 'th' ? `หน้า ${currentPage} จาก ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
