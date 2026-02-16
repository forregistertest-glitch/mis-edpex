"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { Personnel } from "@/types/personnel";
import { PersonnelService } from "@/services/personnelService";
import { Plus, Search, Edit, Trash2, Download, Upload, BarChart3, ArrowLeft, ArrowUpAZ, ArrowDownAZ, Calendar, Hash } from "lucide-react";
import { exportPersonnelToExcel } from "@/utils/personnelExport";
import { parsePersonnelExcel } from "@/utils/personnelImport";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { useSearchParams } from "next/navigation"; // Import useSearchParams

function PersonnelContent() {
  const { user } = useAuth(); // Get user
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  // Handle Edit via Query Param
  const searchParams = useSearchParams();
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && personnel.length > 0) {
      const p = personnel.find(item => item.id === editId);
      if (p) {
        handleEditClick(p);
      }
    }
  }, [searchParams, personnel]);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const data = await PersonnelService.getAllPersonnel();
      setPersonnel(data);
    } catch (error) {
      console.error("Failed to fetch personnel:", error);
      alert("Failed to load personnel data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!user?.email) { alert("You must be logged in to delete."); return; }
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await PersonnelService.deletePersonnel(id, user.email);
      setPersonnel(personnel.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete personnel:", error);
      alert("Failed to delete personnel.");
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Edit Modal State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Personnel>>({});

  // Sorting State
  const [sortBy, setSortBy] = useState<'personnel_id' | 'updated_at'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // View Tab State
  const [viewTab, setViewTab] = useState<'active' | 'disabled' | 'all'>('active');

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on search
  }, [searchTerm]);

  const filteredPersonnel = personnel.filter((p) => {
    // 1. Tab Filter
    if (viewTab === 'active' && p.is_deleted === true) return false;
    if (viewTab === 'disabled' && p.is_deleted !== true) return false;

    // 2. Search Filter
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${p.title_th || ''}${p.first_name_th || ''} ${p.last_name_th || ''}`.toLowerCase();
    const pId = String(p.personnel_id || '').toLowerCase();
    const dept = String(p.department || '').toLowerCase();
    const affil = String(p.affiliation || '').toLowerCase();
    return (
      fullName.includes(searchLower) ||
      pId.includes(searchLower) ||
      dept.includes(searchLower) ||
      affil.includes(searchLower)
    );
  }).sort((a, b) => {
    if (sortBy === 'personnel_id') {
       return sortOrder === 'asc' 
         ? a.personnel_id.localeCompare(b.personnel_id)
         : b.personnel_id.localeCompare(a.personnel_id);
    } else {
       // Sort by Updated At (Handling Firestore Timestamp or Date string)
       const timeA = a.updated_at ? new Date(a.updated_at.toDate ? a.updated_at.toDate() : a.updated_at).getTime() : 0;
       const timeB = b.updated_at ? new Date(b.updated_at.toDate ? b.updated_at.toDate() : b.updated_at).getTime() : 0;
       return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredPersonnel.length / itemsPerPage);
  const paginatedPersonnel = filteredPersonnel.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, filteredPersonnel.length);

  const handleEditClick = (p: Personnel) => {
    setEditingId(p.id!);
    setEditForm({ ...p });
  };

  const handleEditSave = async () => {
    if (!user?.email) { alert("You must be logged in to update."); return; }
    if (!editingId || !editForm.first_name_th) return;
    try {
      setLoading(true);
      await PersonnelService.updatePersonnel(editingId, editForm, user.email);
      setPersonnel(prev => prev.map(p => p.id === editingId ? { ...p, ...editForm } as Personnel : p));
      setEditingId(null);
      alert("Updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startEntry}</span> to <span className="font-medium">{endEntry}</span> of <span className="font-medium">{filteredPersonnel.length}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Previous
            </button>
            {/* Simple Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
               let pNum = i + 1;
               if (totalPages > 5 && currentPage > 3) pNum = currentPage - 2 + i;
               if (pNum > totalPages) return null;
               
               return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pNum ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                >
                  {pNum}
                </button>
               );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  const handleExport = () => {
    exportPersonnelToExcel(filteredPersonnel);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) { alert("You must be logged in to import."); return; }
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`Importing ${file.name}. This might take a while. Continue?`)) {
       if (e.target) e.target.value = ""; // Reset
       return;
    }

    setLoading(true);
    setImportProgress({ current: 0, total: 0 }); // Init progress
    
    try {
      const result = await parsePersonnelExcel(file, user.email, (processed, total) => {
        setImportProgress({ current: processed, total: total });
      });
      
      let msg = `Import complete!\nSuccess: ${result.success}\nErrors: ${result.errors.length}`;
      if (result.errors.length > 0) {
        msg += `\nFirst 5 errors:\n${result.errors.slice(0, 5).join("\n")}`;
      }
      alert(msg);
      fetchPersonnel(); // Refresh list
    } catch (error) {
      console.error("Import failed:", error);
      alert("Import failed. Check console for details.");
    } finally {
      setLoading(false);
      setImportProgress(null); // Reset progress
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset
    }
  };

  const handleDeleteAll = async () => {
    if (!user?.email) { alert("You must be logged in to delete all."); return; }
    if (!confirm("⚠️ WARNING: This will delete ALL personnel records! Are you sure?")) return;
    if (!confirm("Unique ID check: Please confirm again to DELETE EVERYTHING.")) return;
    
    setLoading(true);
    try {
      await PersonnelService.deleteAllPersonnel(user.email);
      alert("All records deleted successfully.");
      setPersonnel([]);
    } catch (error) {
      console.error("Delete all failed:", error);
      alert("Failed to delete all records.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    // ... existing ...
  };

  const handleFixData = async () => {
    if (!confirm("Fix data visibility for existing records?")) return;
    setLoading(true);
    try {
      const count = await PersonnelService.migrateData();
      alert(`Successfully fixed visibility for ${count} records.`);
      fetchPersonnel();
    } catch (error) {
      console.error("Fix failed:", error);
      alert("Failed to fix data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 font-sarabun">
      {/* ... Header ... */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/?tab=Input" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
             <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
             ระบบบุคลากร (HR)
          </h1>
        </div>
        <div className="flex gap-2">
          {importProgress && (
             <span className="text-sm text-blue-600 flex items-center bg-blue-50 px-3 rounded-lg animate-pulse">
                กำลังนำเข้า... {importProgress.current} / {importProgress.total} รายการ
             </span>
          )}
          <button onClick={handleFixData} className="text-blue-500 hover:text-blue-700 px-3 py-2 text-sm underline">Fix Visibility</button>
          <button onClick={handleSeedData} className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm underline">+ Sample Data</button>
          <button onClick={handleDeleteAll} className="text-red-400 hover:text-red-600 px-3 py-2 text-sm underline">Delete All</button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls, .csv" />
          <button onClick={handleImportClick} disabled={loading} className={`bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Upload size={20} /> Import Excel
          </button>
          <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
            <Download size={20} /> Export Excel
          </button>
          <Link href="/personnel/report" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
             <BarChart3 size={20} /> Reports
          </Link>
          <Link href="/personnel/new" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
             <Plus size={20} /> เพิ่มบุคลากรใหม่
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search Bar & Top Pagination */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, สกุล, หรือสังกัด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          {/* Sorting Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (sortBy === 'personnel_id') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('personnel_id'); setSortOrder('asc'); }
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'personnel_id' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              <Hash size={16} /> ID
              {sortBy === 'personnel_id' && (sortOrder === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />)}
            </button>
            <button 
              onClick={() => {
                if (sortBy === 'updated_at') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('updated_at'); setSortOrder('desc'); }
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'updated_at' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              <Calendar size={16} /> Latest
              {sortBy === 'updated_at' && (sortOrder === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />)}
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-gray-100 px-4">
            <button 
              onClick={() => setViewTab('active')}
              className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'active' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              รายการปกติ ({personnel.filter(p => p.is_deleted !== true).length})
            </button>
            <button 
              onClick={() => setViewTab('disabled')}
              className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'disabled' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              รายการที่ยกเลิก ({personnel.filter(p => p.is_deleted === true).length})
            </button>
            <button 
              onClick={() => setViewTab('all')}
              className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'all' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              ทั้งหมด ({personnel.length})
            </button>
          </div>

          <div className="text-sm text-gray-500">
            {viewTab === 'active' ? 'แสดงเฉพาะรายการที่ใช้งานอยู่' : viewTab === 'disabled' ? 'แสดงรายการที่ถูกยกเลิก (Soft Deleted)' : 'แสดงข้อมูลทั้งหมด'}: {filteredPersonnel.length} records
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <PaginationControls />
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="p-4 border-b font-semibold w-24">ID</th>
                <th className="p-4 border-b font-semibold w-64">ชื่อ-นามสกุล</th>
                <th className="p-4 border-b font-semibold">ตำแหน่ง</th>
                <th className="p-4 border-b font-semibold">สังกัด</th>
                <th className="p-4 border-b font-semibold w-32">Created</th>
                <th className="p-4 border-b font-semibold w-32">Updated</th>
                <th className="p-4 border-b font-semibold w-32">Status</th>
                <th className="p-4 border-b font-semibold text-right w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">{importProgress ? 'กำลังนำเข้าข้อมูล...' : 'กำลังโหลดข้อมูล...'}</td></tr>
              ) : paginatedPersonnel.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">ไม่พบข้อมูลบุคลากร</td></tr>
              ) : (
                paginatedPersonnel.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-900 font-mono text-sm">{p.personnel_id}</td>
                    <td className="p-4 font-medium text-gray-900">
                      <div>{p.title_th}{p.first_name_th} {p.last_name_th}</div>
                      {p.is_deleted && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded uppercase font-bold">Deleted</span>}
                    </td>
                    <td className="p-4 text-gray-600">{p.position}</td>
                    <td className="p-4 text-gray-600">
                      <span className="block text-sm">{p.department}</span>
                      <span className="text-xs text-gray-400">{p.affiliation}</span>
                    </td>
                    <td className="p-4 text-[11px] text-gray-500">
                       <div className="flex flex-col">
                         <span className="font-medium">{p.created_at ? new Date(p.created_at.toDate ? p.created_at.toDate() : p.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</span>
                         <span className="text-gray-400">{p.created_by?.split('@')[0] || '-'}</span>
                       </div>
                    </td>
                    <td className="p-4 text-[11px] text-gray-500">
                       <div className="flex flex-col">
                         <span className="font-medium">{p.updated_at ? new Date(p.updated_at.toDate ? p.updated_at.toDate() : p.updated_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</span>
                         <span className="text-gray-400">{p.updated_by?.split('@')[0] || '-'}</span>
                       </div>
                    </td>
                    <td className="p-4">
                      {p.employment_status.includes("(") ? (
                        <div>
                          <span className={`block text-sm font-medium ${p.employment_status.includes("พนักงาน") ? "text-blue-700" : "text-gray-900"}`}>
                             {p.employment_status.split("(")[0]}
                          </span>
                          <span className="text-xs text-gray-500">
                             ({p.employment_status.split("(")[1]}
                          </span>
                        </div>
                      ) : (
                        <span className={`text-sm font-medium ${p.employment_status.includes("พนักงาน") ? "text-blue-700" : "text-gray-900"}`}>
                          {p.employment_status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id!, `${p.first_name_th} ${p.last_name_th}`)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบ (Soft Delete)"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <PaginationControls />
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-800">Edit Personnel</h3>
            
            {/* Read-only ID Alert */}
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-200 flex gap-2 items-center">
               <Hash size={16} />
               <span>Personnel ID cannot be changed once created.</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-semibold text-gray-500">ID</label>
                  <input 
                    className="w-full border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed" 
                    value={editForm.personnel_id} 
                    disabled 
                    title="ID cannot be edited"
                  />
               </div>
               <div>
                  <label className="text-xs font-semibold text-gray-500">Title</label>
                  <input className="w-full border p-2 rounded" value={editForm.title_th || ''} onChange={e => setEditForm({...editForm, title_th: e.target.value})} />
               </div>
               <div>
                  <label className="text-xs font-semibold text-gray-500">First Name</label>
                  <input className="w-full border p-2 rounded" value={editForm.first_name_th || ''} onChange={e => setEditForm({...editForm, first_name_th: e.target.value})} />
               </div>
               <div>
                  <label className="text-xs font-semibold text-gray-500">Last Name</label>
                  <input className="w-full border p-2 rounded" value={editForm.last_name_th || ''} onChange={e => setEditForm({...editForm, last_name_th: e.target.value})} />
               </div>
               <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500">Position</label>
                  <input className="w-full border p-2 rounded" value={editForm.position || ''} onChange={e => setEditForm({...editForm, position: e.target.value})} />
               </div>
               <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500">Department</label>
                  <input className="w-full border p-2 rounded" value={editForm.department || ''} onChange={e => setEditForm({...editForm, department: e.target.value})} />
               </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
               <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
               <button onClick={handleEditSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function PersonnelPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PersonnelContent />
    </Suspense>
  );
}
