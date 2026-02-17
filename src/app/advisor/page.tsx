"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit2, Save, X, Loader2, Users, Search, ArrowLeft, ChevronUp, Eye, RefreshCw } from "lucide-react";
import { AdvisorService } from "@/services/advisorService";
import { Advisor } from "@/types/advisor";
import { useAuth } from "@/contexts/AuthContext";
import { StudentService } from "@/services/studentService";

export default function AdvisorPage() {
  const { user } = useAuth();
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);
  const [advisorStudents, setAdvisorStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [formData, setFormData] = useState<Partial<Advisor>>({
    full_name: "",
    prefix: "",
    department: "",
    advisor_id: "",
    email: "",
  });

  useEffect(() => {
    fetchAdvisors();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchAdvisors = async () => {
    setLoading(true);
    try {
      const data = await AdvisorService.getAllAdvisors();
      setAdvisors(data);
    } catch (error) {
      console.error("Error fetching advisors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name?.trim()) return;
    setSaving(true);
    try {
      await AdvisorService.addAdvisor(formData as Advisor, user?.email || "system");
      await fetchAdvisors();
      setShowAddForm(false);
      setFormData({ full_name: "", prefix: "", department: "", advisor_id: "", email: "" });
    } catch (error) {
      console.error("Error adding advisor:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.full_name?.trim()) return;
    setSaving(true);
    try {
      await AdvisorService.updateAdvisor(editingId, formData, user?.email || "system");
      await fetchAdvisors();
      setEditingId(null);
      setFormData({ full_name: "", prefix: "", department: "", advisor_id: "", email: "" });
    } catch (error) {
      console.error("Error updating advisor:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ต้องการลบข้อมูลอาจารย์ "${name}" ?`)) return;
    try {
      await AdvisorService.deleteAdvisor(id, user?.email || "system");
      await fetchAdvisors();
    } catch (error) {
      console.error("Error deleting advisor:", error);
    }
  };

  const startEdit = (advisor: Advisor) => {
    setEditingId(advisor.id || null);
    setFormData({
      full_name: advisor.full_name,
      prefix: advisor.prefix || "",
      department: advisor.department || "",
      advisor_id: advisor.advisor_id || "",
      email: advisor.email || "",
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ full_name: "", prefix: "", department: "", advisor_id: "", email: "" });
  };

  // View students under an advisor
  const handleViewStudents = async (advisorName: string, advisorId: string | undefined) => {
    if (expandedAdvisor === (advisorId || advisorName)) {
      setExpandedAdvisor(null);
      setAdvisorStudents([]);
      return;
    }
    setExpandedAdvisor(advisorId || advisorName);
    setLoadingStudents(true);
    try {
      const allStudents = await StudentService.getAllStudents();
      const filtered = allStudents.filter(s => 
        s.advisor_name && s.advisor_name.includes(advisorName)
      );
      setAdvisorStudents(filtered);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredAdvisors = advisors.filter((a) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      a.full_name.toLowerCase().includes(searchLower) ||
      (a.department || "").toLowerCase().includes(searchLower) ||
      (a.advisor_id || "").toLowerCase().includes(searchLower) ||
      (a.email || "").toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAdvisors.length / itemsPerPage);
  const paginatedAdvisors = filteredAdvisors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, filteredAdvisors.length);

  const PaginationControls = ({ showBackToTop = true }: { showBackToTop?: boolean }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            แสดง <span className="font-medium">{startEntry}</span> ถึง <span className="font-medium">{endEntry}</span> จาก <span className="font-medium">{filteredAdvisors.length}</span> รายการ
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
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-green-600 border border-slate-200 rounded-lg text-sm font-medium transition-all group"
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
      {/* Header — same style as HR */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/student" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
             <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3">
             <div className="bg-teal-600 p-2 rounded-lg shadow-sm">
                <Users size={24} className="text-white" />
             </div>
             จัดการข้อมูลอาจารย์ที่ปรึกษา
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              setFormData({ full_name: "", prefix: "", department: "", advisor_id: "", email: "" });
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            เพิ่มอาจารย์ใหม่
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border-2 border-teal-200 p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">เพิ่มอาจารย์ใหม่</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสอาจารย์</label>
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
            <div className="md:col-span-2 flex gap-3 justify-end">
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
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                บันทึก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search + Refresh */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-1 gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ, รหัส, ภาควิชา, อีเมล..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={fetchAdvisors}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 border border-slate-200 rounded-lg text-sm font-medium transition-all"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} size={16} /> 
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <PaginationControls showBackToTop={false} />
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="p-4 border-b font-semibold w-24">รหัส</th>
                <th className="p-4 border-b font-semibold">ชื่อ-นามสกุล</th>
                <th className="p-4 border-b font-semibold">ภาควิชา</th>
                <th className="p-4 border-b font-semibold">อีเมล</th>
                <th className="p-4 border-b font-semibold text-right w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
              ) : paginatedAdvisors.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">{searchTerm ? "ไม่พบผลลัพธ์" : "ยังไม่มีข้อมูลอาจารย์"}</td></tr>
              ) : (
                paginatedAdvisors.map((advisor) => (
                  <>
                    <tr key={advisor.id} className="hover:bg-gray-50 transition-colors">
                      {editingId === advisor.id ? (
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
                          <td className="p-4 text-gray-900 font-mono text-sm">{advisor.advisor_id || "-"}</td>
                          <td className="p-4 font-medium text-gray-900">{advisor.full_name}</td>
                          <td className="p-4 text-gray-600">{advisor.department || "-"}</td>
                          <td className="p-4 text-gray-600">{advisor.email || "-"}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleViewStudents(advisor.full_name, advisor.id)} 
                                className={`p-2 rounded-lg transition-colors ${expandedAdvisor === (advisor.id || advisor.full_name) ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                title="ดูนิสิตในสังกัด"
                              >
                                <Eye size={18} />
                              </button>
                              <button onClick={() => startEdit(advisor)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit2 size={18} />
                              </button>
                              <button onClick={() => advisor.id && handleDelete(advisor.id, advisor.full_name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                    {/* Expanded: Show students under this advisor */}
                    {expandedAdvisor === (advisor.id || advisor.full_name) && (
                      <tr key={`${advisor.id}-students`}>
                        <td colSpan={5} className="px-8 py-3 bg-blue-50/50">
                          {loadingStudents ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                              <Loader2 className="animate-spin" size={14} /> กำลังโหลดรายชื่อนิสิต...
                            </div>
                          ) : advisorStudents.length === 0 ? (
                            <p className="text-sm text-gray-500 py-2">ไม่พบนิสิตในสังกัด</p>
                          ) : (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-2">นิสิตในสังกัด ({advisorStudents.length} คน)</p>
                              <div className="space-y-1">
                                {advisorStudents.map((s: any) => (
                                  <div key={s.student_id} className="flex items-center gap-4 text-sm bg-white px-3 py-1.5 rounded border border-gray-100">
                                    <span className="font-mono text-gray-500 w-24">{s.student_id}</span>
                                    <span className="font-medium text-gray-800 flex-1">{s.full_name_th}</span>
                                    <span className="text-gray-500">{s.major_name}</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${s.current_status === 'จบการศึกษา' ? 'bg-green-100 text-green-700' : s.current_status === 'กำลังศึกษา' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                      {s.current_status || "-"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
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
