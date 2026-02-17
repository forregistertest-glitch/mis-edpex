"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GraduateStudent } from "@/types/student";
import { StudentService } from "@/services/studentService";
import { Plus, Search, Edit, Trash2, Download, Upload, ArrowLeft, GraduationCap, BarChart3, ArrowUpAZ, ArrowDownAZ, Calendar, Hash, FileSpreadsheet, RefreshCw, Grid2X2Check, ChevronUp, Users } from "lucide-react";
import { exportStudentsToExcel } from "@/utils/studentExport";
import { parseStudentExcel } from "@/utils/studentImport";
import { useAuth } from "@/contexts/AuthContext";
import StudentForm from "@/components/student/StudentForm";

export default function StudentPage() {
  const { user, userRole } = useAuth();
  const [students, setStudents] = useState<GraduateStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await StudentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      alert("ไม่สามารถโหลดข้อมูลนิสิตได้");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!user?.email) { alert("กรุณาเข้าสู่ระบบเพื่อดำเนินการ"); return; }
    if (!confirm(`คุณต้องการลบข้อมูลของ ${name} ใช่หรือไม่?`)) return;
    try {
      await StudentService.deleteStudent(id, user.email);
      setStudents(students.filter((s) => s.student_id !== id));
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert("ลบข้อมูลไม่สำเร็จ");
    }
  };

  const [sortBy, setSortBy] = useState<'student_id' | 'updated_at'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewTab, setViewTab] = useState<'active' | 'disabled' | 'all'>('active');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    setCurrentPage(1); // Reset on search or tab change
  }, [searchTerm, viewTab]);

  const filteredStudents = students.filter((s) => {
    if (viewTab === 'active' && s.is_deleted === true) return false;
    if (viewTab === 'disabled' && s.is_deleted !== true) return false;

    const searchLower = searchTerm.toLowerCase();
    const fullName = `${s.title_th || ''}${s.first_name_th || ''} ${s.last_name_th || ''}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      (s.full_name_th || '').toLowerCase().includes(searchLower) ||
      s.student_id.toLowerCase().includes(searchLower) ||
      (s.major_name || '').toLowerCase().includes(searchLower) ||
      (s.advisor_name || '').toLowerCase().includes(searchLower) ||
      (s.advisor_department || '').toLowerCase().includes(searchLower) ||
      (s.degree_level || '').toLowerCase().includes(searchLower) ||
      (s.program_type || '').toLowerCase().includes(searchLower) ||
      (s.current_status || '').toLowerCase().includes(searchLower) ||
      (s.major_code || '').toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    if (sortBy === 'student_id') {
        const valA = String(a.student_id || "");
        const valB = String(b.student_id || "");
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB, undefined, { numeric: true })
          : valB.localeCompare(valA, undefined, { numeric: true });
    } else {
       const timeA = a.updated_at ? new Date(a.updated_at.toDate ? a.updated_at.toDate() : a.updated_at).getTime() : 0;
       const timeB = b.updated_at ? new Date(b.updated_at.toDate ? b.updated_at.toDate() : b.updated_at).getTime() : 0;
       return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, filteredStudents.length);

  const handleExport = async (all: boolean = false) => {
    try {
      setLoading(true);
      const studentData = all ? students : filteredStudents;
      let pubs: any[] = [];
      let progs: any[] = [];

      if (all) {
         const { AcademicService } = await import("@/services/academicService");
         const [fetchedPubs, fetchedProgs] = await Promise.all([
            AcademicService.getAllPublications(),
            AcademicService.getAllProgress()
         ]);
         pubs = fetchedPubs;
         progs = fetchedProgs;
      }
      
      exportStudentsToExcel(studentData, pubs, progs);
    } catch (error) {
       console.error("Export failed:", error);
       alert("การส่งออกข้อมูลล้มเหลว");
    } finally {
       setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const [importType, setImportType] = useState<'student' | 'publication' | 'progress'>('student');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) { alert("กรุณาเข้าสู่ระบบเพื่อดำเนินการ"); return; }
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`ยืนยันการนำเข้าข้อมูลจากไฟล์: ${file.name}?`)) {
       if (e.target) e.target.value = "";
       return;
    }

    setLoading(true);
    setImportProgress({ current: 0, total: 0 });

    try {
      // Dynamic imports
      const { parseStudentExcel, parsePublicationsExcel, parseProgressExcel, parseMultiSheetExcel } = await import("@/utils/studentImport");
      const { StudentService } = await import("@/services/studentService");
      const { AcademicService } = await import("@/services/academicService");

      let successCount = 0;
      let errorMsgs: string[] = [];

      if (importType === 'student') {
         const result = await parseStudentExcel(file, user.email, (processed, total) => setImportProgress({ current: processed, total }));
         if (result.success && result.data && result.data.length > 0) {
            await StudentService.addStudentBatch(result.data, user.email);
            successCount = result.data.length;
         }
         errorMsgs = result.errors || [];
      } 
      else if (importType === 'publication') {
         const result = await parsePublicationsExcel(file, user.email, (processed, total) => setImportProgress({ current: processed, total }));
         if (result.success && result.data && result.data.length > 0) {
            await AcademicService.addPublicationBatch(result.data, user.email);
            successCount = result.count;
         }
         errorMsgs = result.errors || [];
      }
      else if (importType === 'progress') {
         const result = await parseProgressExcel(file, user.email, (processed, total) => setImportProgress({ current: processed, total }));
         if (result.success && result.data && result.data.length > 0) {
             await AcademicService.addProgressBatch(result.data, user.email);
             successCount = result.count;
         }
         errorMsgs = result.errors || [];
      }
      else if (importType === 'smart') {
         const result = await parseMultiSheetExcel(file, user.email);
         if (result.success) {
            if (result.students?.length) await StudentService.addStudentBatch(result.students, user.email);
            if (result.publications?.length) await AcademicService.addPublicationBatch(result.publications, user.email);
            if (result.progress?.length) await AcademicService.addProgressBatch(result.progress, user.email);
            successCount = (result.students?.length || 0) + (result.publications?.length || 0) + (result.progress?.length || 0);
         }
         errorMsgs = result.errors;
      }
      
      let msg = `นำเข้าเสร็จสิ้น!\nสำเร็จ: ${successCount} รายการ\nข้อผิดพลาด: ${errorMsgs.length}`;
      if (errorMsgs.length > 0) {
        msg += `\nตัวอย่างข้อผิดพลาด:\n${errorMsgs.slice(0, 5).join("\n")}`;
      }
      alert(msg);
      fetchStudents();
    } catch (error) {
      console.error("Import failed:", error);
      alert("การนำเข้าข้อมูลล้มเหลว กรุณาตรวจสอบ Console");
    } finally {
      setLoading(false);
      setImportProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFixData = async () => {
    if (!confirm("Fix data visibility for existing records?")) return;
    setLoading(true);
    try {
      const count = await StudentService.migrateData();
      alert(`Successfully fixed visibility and backfilled ${count} records.`);
      fetchStudents();
    } catch (error) {
      console.error("Fix failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!user?.email) { alert("กรุณาเข้าสู่ระบบเพื่อดำเนินการ"); return; }
    if (!confirm("⚠️ คำเตือน: ระบบจะลบข้อมูลนิสิตทั้งหมด! ต้องการดำเนินการต่อหรือไม่?")) return;
    setLoading(true);
    try {
      await StudentService.deleteAllStudents(user.email);
      setStudents([]);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const PaginationControls = ({ showBackToTop = true }: { showBackToTop?: boolean }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            แสดง <span className="font-medium">{startEntry}</span> ถึง <span className="font-medium">{endEntry}</span> จาก <span className="font-medium">{filteredStudents.length}</span> รายการ
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              ก่อนหน้า
            </button>
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
              disabled={currentPage === totalPages || totalPages === 0}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              ถัดไป
            </button>
          </nav>
        </div>
        {showBackToTop && (
          <div>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 border border-slate-200 rounded-lg text-sm font-medium transition-all group"
              title="Back to Top"
            >
              <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden md:inline">Back to Top</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 font-sarabun">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/?tab=Input" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
             <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3">
             <div className="bg-green-600 p-2 rounded-lg shadow-sm">
                <GraduationCap size={24} className="text-white" />
             </div>
             ระบบข้อมูลนิสิต (Academic)
          </h1>
        </div>
        <div className="flex gap-2">
          {importProgress && (
             <span className="text-sm text-blue-600 flex items-center bg-blue-50 px-3 rounded-lg animate-pulse">
                กำลังนำเข้า... {importProgress.current} / {importProgress.total} รายการ
             </span>
          )}
          {userRole === 'admin' && (
            <div className="flex items-center gap-2 mr-2">
               <button onClick={handleFixData} className="text-slate-300 hover:text-[#236c96] transition-colors p-1 hover:bg-slate-100 rounded" title="Fix visibility (Experimental)">
                 <Grid2X2Check size={16} />
               </button>
               <button onClick={handleDeleteAll} className="text-slate-300 hover:text-red-500 transition-colors p-1 hover:bg-slate-100 rounded" title="ลบข้อมูลทั้งหมด">
                 <Trash2 size={16} />
               </button>
            </div>
          )}
          {/* Original file input removed as new UI has it embedded */}
          {/* <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls, .csv" /> */}
          
          <div className="flex gap-2">
            <select 
              value={importType} 
              onChange={(e) => setImportType(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="student">นำเข้า: ข้อมูลนิสิต (Profile)</option>
              <option value="publication">นำเข้า: ผลงานตีพิมพ์ (Publications)</option>
              <option value="progress">นำเข้า: ความก้าวหน้า (Progress)</option>
              <option value="smart">Smart Import (รวมหลาย Sheet)</option>
            </select>
            <label className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">
              <Upload size={18} />
              <span className="font-medium text-sm">นำเข้า Excel</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading} // Using 'loading' state for 'isImporting'
              />
            </label>
            <button
               onClick={() => handleExport(false)}
               className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Download size={18} />
              <span className="font-medium text-sm">ส่งออก (แสดงผล)</span>
            </button>
            <button
               onClick={() => handleExport(true)}
               className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Download size={18} />
              <span className="font-medium text-sm">ส่งออก (ทั้งหมด)</span>
            </button>
          </div>
          <Link href="/advisor" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm">
             <Users size={18} />
             อาจารย์
          </Link>
          <Link href="/student/report" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm">
             <BarChart3 size={18} />
             รายงาน
          </Link>
           <Link 
             href="/student/new"
             className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-medium"
           >
              <Plus size={18} />
              เพิ่มนิสิตใหม่
           </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-1 gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหา รหัส, ชื่อ, สาขา, อาจารย์, ภาควิชา, ระดับ, สถานะ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={fetchStudents}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 border border-slate-200 rounded-lg text-sm font-medium transition-all"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} size={16} /> 
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (sortBy === 'student_id') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('student_id'); setSortOrder('asc'); }
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'student_id' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              <Hash size={16} /> ID
              {sortBy === 'student_id' && (sortOrder === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />)}
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

          <div className="flex border-b border-gray-100 px-4">
            <button onClick={() => setViewTab('active')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'active' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>รายการปกติ ({students.filter(s => !s.is_deleted).length})</button>
            <button onClick={() => setViewTab('disabled')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'disabled' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>รายการที่ยกเลิก ({students.filter(s => s.is_deleted).length})</button>
            <button onClick={() => setViewTab('all')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'all' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>ทั้งหมด ({students.length})</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <PaginationControls showBackToTop={false} />
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="p-4 border-b font-semibold w-24">รหัสนิสิต</th>
                <th className="p-4 border-b font-semibold w-64">ชื่อ-นามสกุล</th>
                <th className="p-4 border-b font-semibold">ระดับ/หลักสูตร</th>
                <th className="p-4 border-b font-semibold">สาขาวิชา</th>
                <th className="p-4 border-b font-semibold w-32">Created</th>
                <th className="p-4 border-b font-semibold w-32">Updated</th>
                <th className="p-4 border-b font-semibold w-24">สถานะ</th>
                <th className="p-4 border-b font-semibold text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center text-gray-500">
                   <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="animate-spin text-blue-600" size={24} />
                      {importProgress ? 'กำลังนำเข้าข้อมูล...' : 'กำลังโหลดข้อมูล...'}
                   </div>
                </td></tr>
              ) : paginatedStudents.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-gray-500 font-medium">ไม่พบข้อมูลนิสิต</td></tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.student_id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-gray-900 font-mono text-sm font-bold">{s.student_id}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900 border-b border-transparent group-hover:border-blue-200 transition-all inline-block">{s.full_name_th}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.advisor_name}</div>
                      {s.is_deleted && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold border border-red-200 uppercase">Cancelled</span>}
                    </td>
                    <td className="p-4 text-gray-700">
                      <div className="font-bold text-slate-800">{s.degree_level}</div>
                      <div className="text-xs text-slate-500 font-medium">{s.program_type}</div>
                    </td>
                    <td className="p-4 text-gray-700">
                      <span className="block text-sm font-bold">{s.major_name}</span>
                      <span className="text-xs text-gray-500 font-medium">{s.major_code}</span>
                    </td>
                    <td className="p-4 text-[11px] text-gray-500">
                       <div className="flex flex-col">
                         <span className="font-medium text-slate-700">
                           {s.created_at ? new Date(s.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                         </span>
                         <span className="text-gray-400">{s.created_by?.includes('@') ? s.created_by.split('@')[0] : (s.created_by || '-')}</span>
                       </div>
                    </td>
                    <td className="p-4 text-[11px] text-gray-500">
                       <div className="flex flex-col">
                         <span className="font-medium text-slate-700">
                           {s.updated_at ? new Date(s.updated_at.toDate ? s.updated_at.toDate() : s.updated_at).getTime() > 0 ? new Date(s.updated_at.toDate ? s.updated_at.toDate() : s.updated_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-' : '-'}
                         </span>
                         <span className="text-gray-400">{s.updated_by?.includes('@') ? s.updated_by.split('@')[0] : (s.updated_by || '-')}</span>
                       </div>
                    </td>
                    <td className="p-4">
                       <div className={`text-xs font-bold px-3 py-1 rounded-full inline-block border ${
                         s.current_status === 'สำเร็จ' ? 'bg-green-50 text-green-700 border-green-200' : 
                         s.current_status === 'กำลังศึกษา' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                         'bg-gray-100 text-gray-600 border-gray-200'
                       }`}>
                          {s.current_status}
                       </div>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-all">
                        <Link href={`/student/${s.student_id}/edit`} title="แก้ไข" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={18} /></Link>
                        <button onClick={() => handleDelete(s.student_id, s.full_name_th)} title="ลบ/ยกเลิก" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
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
    </div>
  );
}
