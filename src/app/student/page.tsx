"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GraduateStudent } from "@/types/student";
import { StudentService } from "@/services/studentService";
import { Plus, Search, Edit, Trash2, Download, Upload, ArrowLeft, GraduationCap } from "lucide-react";
import { exportStudentsToExcel } from "@/utils/studentExport";
import { parseStudentExcel } from "@/utils/studentImport";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentPage() {
  const { user } = useAuth();
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Edit Modal State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<GraduateStudent>>({});

  useEffect(() => {
    setCurrentPage(1); // Reset on search
  }, [searchTerm]);

  const filteredStudents = students.filter((s) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      s.full_name_th.toLowerCase().includes(searchLower) ||
      s.student_id.toLowerCase().includes(searchLower) ||
      s.major_name.toLowerCase().includes(searchLower) ||
      s.advisor_name.toLowerCase().includes(searchLower)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, filteredStudents.length);

  const handleEditClick = (s: GraduateStudent) => {
    setEditingId(s.student_id);
    setEditForm({ ...s });
  };

  const handleEditSave = async () => {
    if (!user?.email) { alert("กรุณาเข้าสู่ระบบเพื่อดำเนินการ"); return; }
    if (!editingId || !editForm.full_name_th) return;
    try {
      setLoading(true);
      await StudentService.updateStudent(editingId, editForm, user.email);
      setStudents(prev => prev.map(s => s.student_id === editingId ? { ...s, ...editForm } as GraduateStudent : s));
      setEditingId(null);
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Update failed:", error);
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportStudentsToExcel(filteredStudents);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) { alert("กรุณาเข้าสู่ระบบเพื่อดำเนินการ"); return; }
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`กำลังนำเข้าไฟล์ ${file.name} ระบบจะทำการข้ามข้อมูลที่ซ้ำกันหรืออัปเดตข้อมูลเดิมตามรหัสนิสิต ต้องการดำเนินการต่อหรือไม่?`)) {
       if (e.target) e.target.value = "";
       return;
    }

    setLoading(true);
    setImportProgress({ current: 0, total: 0 });
    
    try {
      const result = await parseStudentExcel(file, user.email, (processed, total) => {
        setImportProgress({ current: processed, total: total });
      });
      
      let msg = `นำเข้าข้อมูลเสร็จสิ้น!\nสำเร็จ: ${result.success}\nข้อผิดพลาด: ${result.errors.length}`;
      if (result.errors.length > 0) {
        msg += `\nข้อผิดพลาด 5 รายการแรก:\n${result.errors.slice(0, 5).join("\n")}`;
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

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            แสดง {startEntry} ถึง {endEntry} จากทั้งหมด {filteredStudents.length} รายการ
          </p>
        </div>
        <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded text-sm ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              ย้อนกลับ
            </button>
            <span className="px-4 py-1 text-sm font-medium border rounded bg-blue-50 text-blue-600">
                หน้า {currentPage} จาก {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 border rounded text-sm ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              ถัดไป
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 font-sarabun bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/?tab=Input" className="p-2 hover:bg-white rounded-xl shadow-sm transition-all text-[#236c96]">
             <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-[#E0F2FE] p-2.5 rounded-xl">
               <GraduationCap className="text-[#236c96]" size={28} />
            </div>
            <div>
               <h1 className="text-2xl font-bold text-slate-800">ระบบข้อมูลนิสิต (Academic)</h1>
               <p className="text-xs text-slate-500 font-medium">จัดการข้อมูลนิสิตระดับบัณฑิตศึกษา</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {importProgress && (
             <span className="text-sm text-blue-600 flex items-center bg-blue-50 px-4 rounded-xl font-bold animate-pulse border border-blue-100">
                นำเข้า... {importProgress.current} / {importProgress.total}
             </span>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls, .csv" />
          <button onClick={handleImportClick} disabled={loading} className="bg-white hover:bg-slate-50 text-[#236c96] border border-[#C1EAF9] px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all font-bold">
            <Upload size={20} /> นำเข้า Excel
          </button>
          <button onClick={handleExport} className="bg-[#71C5E8] hover:bg-[#5bb4d7] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all font-bold">
            <Download size={20} /> ส่งออก Excel
          </button>
          <Link href="/student/new" className="bg-[#236c96] hover:bg-[#1a5578] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all font-bold">
             <Plus size={20} /> เพิ่มนิสิตใหม่
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส, สาขา, หรือที่ปรึกษา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#71C5E8] transition-all text-sm"
            />
          </div>
          <div className="text-sm font-semibold text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full">
            ทั้งหมด: <span className="text-[#236c96]">{filteredStudents.length}</span> รายการ
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">รหัสนิสิต</th>
                <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4">ระดับ/หลักสูตร</th>
                <th className="px-6 py-4">สาขาวิชา</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#236c96]"></div>
                    {importProgress ? 'กำลังนำเข้าข้อมูล...' : 'กำลังโหลดข้อมูล...'}
                  </div>
                </td></tr>
              ) : paginatedStudents.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-medium">ไม่พบข้อมูลนิสิต</td></tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-slate-900 font-bold font-mono text-xs">{s.student_id}</td>
                    <td className="px-6 py-4">
                       <div className="font-bold text-slate-700">{s.full_name_th}</div>
                       <div className="text-[10px] text-slate-400">{s.advisor_name}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-slate-600 font-medium">{s.degree_level}</div>
                       <div className="text-[10px] text-slate-400">{s.program_type}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]" title={s.major_name}>
                      {s.major_name}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                         s.current_status === 'สำเร็จ' ? 'bg-green-50 text-green-600 border border-green-100' : 
                         s.current_status === 'กำลังศึกษา' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                         'bg-slate-100 text-slate-500'
                       }`}>
                          {s.current_status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(s)}
                          className="p-2 text-slate-400 hover:text-[#236c96] hover:bg-[#E0F2FE] rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.student_id, s.full_name_th)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
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

      {/* Edit Modal (Simplified for now) */}
      {editingId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-4">แก้ไขข้อมูลนิสิต</h3>
            <div className="grid grid-cols-2 gap-5">
               <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">รหัสนิสิต</label>
                  <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-400 cursor-not-allowed" value={editForm.student_id} disabled />
               </div>
               <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</label>
                  <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold" value={editForm.full_name_th || ''} onChange={e => setEditForm({...editForm, full_name_th: e.target.value})} />
               </div>
               <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">สถานะปัจจุบัน</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold" 
                    value={editForm.current_status || ''} 
                    onChange={e => setEditForm({...editForm, current_status: e.target.value})}
                  >
                    <option value="กำลังศึกษา">กำลังศึกษา</option>
                    <option value="สำเร็จ">สำเร็จ</option>
                    <option value="พ้นสภาพ">พ้นสภาพ</option>
                    <option value="ลาออก">ลาออก</option>
                  </select>
               </div>
               <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">อาจารย์ที่ปรึกษา</label>
                  <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold" value={editForm.advisor_name || ''} onChange={e => setEditForm({...editForm, advisor_name: e.target.value})} />
               </div>
               <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">สังกัดที่ปรึกษา</label>
                  <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold" value={editForm.advisor_department || ''} onChange={e => setEditForm({...editForm, advisor_department: e.target.value})} />
               </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
               <button onClick={() => setEditingId(null)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">ยกเลิก</button>
               <button onClick={handleEditSave} className="px-8 py-2.5 bg-[#236c96] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:bg-[#1a5578] transition-all font-bold">บันทึกการเปลี่ยนแปลง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
