"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit2, Save, X, Loader2, Users, Search, ArrowLeft, ChevronUp, RefreshCw, UserStar } from "lucide-react";
import { InstructorService } from "@/services/instructorService";
import { Advisor as Instructor } from "@/types/advisor";
import { useAuth } from "@/contexts/AuthContext";

export default function InstructorPage() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [formData, setFormData] = useState<Partial<Instructor>>({
    full_name: "",
    prefix: "",
    department: "",
    advisor_id: "",
    email: "",
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const data = await InstructorService.getAllInstructors();
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name?.trim()) return;
    setSaving(true);
    try {
      await InstructorService.addInstructor(formData as Instructor, user?.email || "system");
      await fetchInstructors();
      setShowAddForm(false);
      setFormData({ full_name: "", prefix: "", department: "", advisor_id: "", email: "" });
    } catch (error) {
      console.error("Error adding instructor:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.full_name?.trim()) return;
    setSaving(true);
    try {
      await InstructorService.updateInstructor(editingId, formData, user?.email || "system");
      await fetchInstructors();
      setEditingId(null);
      setFormData({ full_name: "", prefix: "", department: "", advisor_id: "", email: "" });
    } catch (error) {
      console.error("Error updating instructor:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ต้องการลบข้อมูลอาจารย์ "${name}" ?`)) return;
    try {
      await InstructorService.deleteInstructor(id, user?.email || "system");
      await fetchInstructors();
    } catch (error) {
      console.error("Error deleting instructor:", error);
    }
  };

  const startEdit = (instructor: Instructor) => {
    setEditingId(instructor.id || null);
    setFormData({
      full_name: instructor.full_name,
      prefix: instructor.prefix || "",
      department: instructor.department || "",
      advisor_id: instructor.advisor_id || "",
      email: instructor.email || "",
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ full_name: "", prefix: "", department: "", advisor_id: "", email: "" });
  };

  const filteredInstructors = instructors.filter((a) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      a.full_name.toLowerCase().includes(searchLower) ||
      (a.department || "").toLowerCase().includes(searchLower) ||
      (a.advisor_id || "").toLowerCase().includes(searchLower) ||
      (a.email || "").toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);
  const paginatedInstructors = filteredInstructors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, filteredInstructors.length);

  const PaginationControls = ({ showBackToTop = true }: { showBackToTop?: boolean }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            แสดง <span className="font-medium">{startEntry}</span> ถึง <span className="font-medium">{endEntry}</span> จาก <span className="font-medium">{filteredInstructors.length}</span> รายการ
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
                   className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pNum ? 'z-10 bg-teal-50 border-teal-500 text-teal-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                 >
                  {pNum}
                </button>
               );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              ถัดไป
            </button>
          </nav>
        </div>
        {showBackToTop && (
          <div>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-teal-600 border border-slate-200 rounded-lg text-sm font-medium transition-all group"
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
    <div className="container mx-auto p-6 font-sarabun min-h-screen bg-slate-50/30">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/?tab=Input" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
             <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3">
             <div className="bg-teal-600 p-2 rounded-lg shadow-sm">
                <UserStar size={24} className="text-white" />
             </div>
             อาจารย์ผู้สอน
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              setFormData({ full_name: "", prefix: "", department: "", advisor_id: "", email: "" });
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            เพิ่มอาจารย์
          </button>
        </div>
      </div>
 
      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border-2 border-teal-200 p-6 mb-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-gray-800 mb-4">เพิ่มข้อมูลอาจารย์</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
              <input
                type="text"
                value={formData.full_name || ""}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none"
                placeholder="เช่น ผศ.ดร.สมชาย ใจดี"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสอาจารย์ / บุคลากร</label>
              <input
                type="text"
                value={formData.advisor_id || ""}
                onChange={(e) => setFormData({ ...formData, advisor_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none"
                placeholder="เช่น I1006"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ภาควิชา/สังกัด</label>
              <input
                type="text"
                value={formData.department || ""}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none"
                placeholder="เช่น ภาควิชาสรีรวิทยา"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none"
                placeholder="email@ku.th"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm flex items-center gap-2 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search + Refresh */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
          <div className="flex flex-1 gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ, รหัส, ภาควิชา, อีเมล..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={fetchInstructors}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white text-slate-500 hover:bg-teal-50 hover:text-teal-600 border border-slate-200 rounded-lg text-sm font-medium transition-all shadow-sm group"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw size={18} className={`text-teal-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <PaginationControls showBackToTop={false} />
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4 border-b font-semibold w-24">รหัส</th>
                <th className="p-4 border-b font-semibold">ชื่อ-นามสกุล</th>
                <th className="p-4 border-b font-semibold">ภาควิชา</th>
                <th className="p-4 border-b font-semibold">อีเมล</th>
                <th className="p-4 border-b font-semibold text-right w-36">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                    <span className="text-gray-500 text-sm">กำลังโหลดข้อมูลอาจารย์...</span>
                  </div>
                </td></tr>
              ) : paginatedInstructors.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-400 text-sm">{searchTerm ? "ไม่พบผลลัพธ์การค้นหา" : "ไม่มีข้อมูลอาจารย์ในระบบ"}</td></tr>
              ) : (
                paginatedInstructors.map((instructor) => (
                  <tr key={instructor.id} className="hover:bg-slate-50/50 transition-colors group">
                    {editingId === instructor.id ? (
                      <>
                        <td className="p-3">
                          <input type="text" value={formData.advisor_id || ""} onChange={(e) => setFormData({ ...formData, advisor_id: e.target.value })} className="w-full px-2 py-1.5 border rounded focus:border-teal-500 outline-none text-sm" />
                        </td>
                        <td className="p-3">
                          <input type="text" value={formData.full_name || ""} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-2 py-1.5 border rounded focus:border-teal-500 outline-none text-sm" />
                        </td>
                        <td className="p-3">
                          <input type="text" value={formData.department || ""} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-2 py-1.5 border rounded focus:border-teal-500 outline-none text-sm" />
                        </td>
                        <td className="p-3">
                          <input type="text" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-2 py-1.5 border rounded focus:border-teal-500 outline-none text-sm" />
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={handleUpdate} disabled={saving} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                            </button>
                            <button onClick={cancelEdit} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 text-gray-500 font-mono text-xs">{instructor.advisor_id || "-"}</td>
                        <td className="p-4 font-medium text-slate-800">{instructor.full_name}</td>
                        <td className="p-4 text-gray-600 text-sm">{instructor.department || "-"}</td>
                        <td className="p-4 text-gray-500 text-sm">{instructor.email || "-"}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(instructor)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไข">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => instructor.id && handleDelete(instructor.id, instructor.full_name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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
