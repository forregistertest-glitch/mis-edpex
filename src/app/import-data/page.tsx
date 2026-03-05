"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { Personnel } from "@/types/personnel";
import { Plus, Search, Edit, Trash2, Download, Upload, BarChart3, ArrowLeft, ArrowUpAZ, ArrowDownAZ, Calendar, Hash, FileSpreadsheet, RefreshCw, Users, Grid2X2Check, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";

function ImportDataContent() {
    const router = useRouter();
    const { user, userRole } = useAuth();
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(false);
    const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Dummy fetch for UI
        setPersonnel([]);
    }, []);

    const searchParams = useSearchParams();
    useEffect(() => {
        const editId = searchParams.get("edit");
        if (editId) {
            router.push(`/import-data/${editId}/edit`);
        }
    }, [searchParams]);

    const fetchPersonnel = async () => {
        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!user?.email) { alert("You must be logged in to delete."); return; }
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        // Dummy action
        alert("Delete disabled in UI-only mode.");
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const [sortBy, setSortBy] = useState<'personnel_id' | 'updated_at'>('updated_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [viewTab, setViewTab] = useState<'active' | 'disabled' | 'all'>('active');

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const filteredPersonnel = personnel.filter((p) => {
        if (viewTab === 'active' && p.is_deleted === true) return false;
        if (viewTab === 'disabled' && p.is_deleted !== true) return false;

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
            const valA = String(a.personnel_id || "");
            const valB = String(b.personnel_id || "");
            return sortOrder === 'asc'
                ? valA.localeCompare(valB, undefined, { numeric: true })
                : valB.localeCompare(valA, undefined, { numeric: true });
        } else {
            const timeA = a.updated_at ? new Date(a.updated_at.toDate ? a.updated_at.toDate() : a.updated_at).getTime() : 0;
            const timeB = b.updated_at ? new Date(b.updated_at.toDate ? b.updated_at.toDate() : b.updated_at).getTime() : 0;
            return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        }
    });

    const totalPages = Math.ceil(filteredPersonnel.length / itemsPerPage);
    const paginatedPersonnel = filteredPersonnel.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const startEntry = filteredPersonnel.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, filteredPersonnel.length);

    const PaginationControls = ({ showBackToTop = true }: { showBackToTop?: boolean }) => (
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
                            disabled={currentPage === 1 || totalPages === 0}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.min(5, Math.max(1, totalPages)) }, (_, i) => {
                            let pNum = i + 1;
                            if (totalPages > 5 && currentPage > 3) pNum = currentPage - 2 + i;
                            if (pNum > totalPages && totalPages > 0) return null;

                            return (
                                <button
                                    key={pNum}
                                    onClick={() => setCurrentPage(pNum)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pNum ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
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
                            Next
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user?.email) { alert("You must be logged in to import."); return; }
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm(`Importing ${file.name}. This might take a while. Continue?`)) {
            if (e.target) e.target.value = "";
            return;
        }

        setLoading(true);
        setImportProgress({ current: 0, total: 100 });
        // Dummy progress
        let it = 0;
        const interval = setInterval(() => {
            it += 10;
            setImportProgress({ current: it, total: 100 });
            if (it >= 100) {
                clearInterval(interval);
                setLoading(false);
                setImportProgress(null);
                alert("Import UI simulated.");
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }, 200);
    };

    const handleDeleteAll = async () => {
        if (!user?.email) { alert("You must be logged in to delete all."); return; }
        if (!confirm("⚠️ WARNING: This will delete ALL imported records! Are you sure?")) return;
        alert("Delete All disabled in UI-only mode.");
    };

    const handleFixData = async () => {
        if (!confirm("Fix data visibility for existing records?")) return;
        alert("Fix Data disabled in UI-only mode.");
    };

    return (
        <div className="container mx-auto p-6 font-sarabun">
            <div className="flex justify-between items-start mb-6">

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4">
                        <Link href="/?tab=Input" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-lg shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-600">
                                <Upload size={24} className="text-white" />
                            </div>
                            ข้อมูลนำเข้า
                        </h1>
                    </div>
                    <div className="ml-14 mt-1">
                        <p className="text-slate-500 text-sm">จัดการฐานข้อมูลบุคลากรของคณะสัตวแพทยศาสตร์ โดยการนำเข้าจากแอปพลิเคชันอื่น</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {importProgress && (
                        <span className="text-sm text-indigo-600 flex items-center bg-indigo-50 px-3 rounded-lg animate-pulse">
                            กำลังนำเข้า... {importProgress.current} / {importProgress.total} รายการ
                        </span>
                    )}
                    {userRole === 'admin' && (
                        <div className="flex items-center gap-2 mr-2">
                            <button onClick={handleFixData} className="text-slate-300 hover:text-green-600 transition-colors p-1 hover:bg-slate-100 rounded" title="Fix visibility (Experimental)">
                                <Grid2X2Check size={16} />
                            </button>
                            <button onClick={handleDeleteAll} className="text-slate-300 hover:text-red-500 transition-colors p-1 hover:bg-slate-100 rounded" title="ล้างข้อมูลทั้งหมด">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls, .csv" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={loading} className={`bg-white border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Upload size={20} className="text-indigo-600" /> นำเข้าข้อมูล (Excel)
                    </button>
                    <div className="flex gap-1">
                        <button
                            onClick={() => alert('Export disabled in UI')}
                            className="bg-white border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700 px-4 py-2 rounded-l-lg flex items-center gap-2 shadow-sm transition-all border-r border-gray-200 text-sm group"
                            title="ส่งออกผลที่เลือก"
                        >
                            <Download size={18} className="text-indigo-600" /> ส่งออกผลการค้นหา
                        </button>
                        <button
                            onClick={() => alert('Export disabled in UI')}
                            className="bg-white border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700 px-4 py-2 rounded-r-lg shadow-sm transition-all flex items-center gap-2 text-sm group"
                            title="ส่งออกข้อมูลทั้งหมด"
                        >
                            <FileSpreadsheet size={18} className="text-indigo-600" /> ส่งออกข้อมูลดิบ
                        </button>
                    </div>
                    <button onClick={() => alert('Reports disabled in UI')} className="bg-white border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700 px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium">
                        <BarChart3 size={18} className="text-indigo-600" /> รายงาน
                    </button>
                    <Link href="/import-data/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium">
                        <Plus size={18} /> เพิ่มข้อมูลใหม่
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
                                placeholder="ค้นหาชื่อ, สกุล, หรือสังกัด..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={fetchPersonnel}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700 rounded-lg text-sm font-medium transition-all shadow-sm"
                            title="รีเฟรชข้อมูล"
                        >
                            <RefreshCw size={18} className={`text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (sortBy === 'personnel_id') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                                else { setSortBy('personnel_id'); setSortOrder('asc'); }
                            }}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'personnel_id' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            <Hash size={16} /> ID
                            {sortBy === 'personnel_id' && (sortOrder === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />)}
                        </button>
                        <button
                            onClick={() => {
                                if (sortBy === 'updated_at') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                                else { setSortBy('updated_at'); setSortOrder('desc'); }
                            }}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'updated_at' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            <Calendar size={16} /> Latest
                            {sortBy === 'updated_at' && (sortOrder === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />)}
                        </button>
                    </div>

                    <div className="flex border-b border-gray-100 px-4">
                        <button onClick={() => setViewTab('active')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'active' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>รายการปกติ ({personnel.filter(p => !p.is_deleted).length})</button>
                        <button onClick={() => setViewTab('disabled')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'disabled' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>รายการที่ยกเลิก ({personnel.filter(p => p.is_deleted).length})</button>
                        <button onClick={() => setViewTab('all')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'all' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>ทั้งหมด ({personnel.length})</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <PaginationControls showBackToTop={false} />
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
                                <tr><td colSpan={8} className="p-8 text-center text-gray-500">ไม่พบตารางข้อมูลนำเข้า (Staging Area is empty)</td></tr>
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
                                                <span className="font-medium text-slate-700">
                                                    {p.created_at ? new Date(p.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                                </span>
                                                <span className="text-gray-400">{p.created_by?.includes('@') ? p.created_by.split('@')[0] : (p.created_by || '-')}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[11px] text-gray-500">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-700">
                                                    {p.updated_at ? new Date(p.updated_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                                </span>
                                                <span className="text-gray-400">{p.updated_by?.includes('@') ? p.updated_by.split('@')[0] : (p.updated_by || '-')}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-indigo-700 whitespace-pre-line">
                                                {p.employment_status || "-"}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => router.push(`/import-data/${p.id}/edit`)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(p.id!, `${p.first_name_th} ${p.last_name_th}`)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
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

        </div >
    );
}

export default function ImportDataPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>}>
            <ImportDataContent />
        </Suspense>
    );
}
