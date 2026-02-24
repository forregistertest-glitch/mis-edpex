"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Search, Edit, Trash2, Download, Upload, ArrowUpAZ, ArrowDownAZ, Calendar, Hash, RefreshCw, ChevronUp, ChevronDown, FileDown, Globe, FlaskConical, Plus } from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "@/contexts/AuthContext";
import { ResearchService } from "@/services/researchService";

export default function ResearchPage() {
  const { user, userRole } = useAuth();
  const router = useRouter();

  // -- Database State --
  const [researchData, setResearchData] = useState<any[]>([]);
  const [loadingDB, setLoadingDB] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewTab, setViewTab] = useState<'active' | 'disabled' | 'all'>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // -- Sorting State --
  const [sortBy, setSortBy] = useState<'id' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // -- Scroll State --
  const [showFloatingTop, setShowFloatingTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowFloatingTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // -- Import State --
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, viewTab]);

  useEffect(() => {
    fetchResearchData();
  }, []);

  const fetchResearchData = async () => {
    setLoadingDB(true);
    try {
      const data = await ResearchService.getAllResearch();
      const formatted = data.map(item => ({
        ...item,
        authors: item.authors || item.authors_raw || "Unknown",
        class: item.publish_class || "-"
      }));
      setResearchData(formatted);
    } catch (error) {
      console.error("Failed to fetch research data:", error);
    } finally {
      setLoadingDB(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!user?.email) { alert("กรุณาเข้าสู่ระบบเพื่อดำเนินการ"); return; }
    if (!confirm(`คุณต้องการลบข้อมูลงานวิจัย "${name}" ใช่หรือไม่?`)) return;

    try {
      await ResearchService.deleteResearch(id, user.email);
      alert("ลบข้อมูลสำเร็จ (ย้ายไปอยู่รายการที่ยกเลิก)");
      await fetchResearchData();
    } catch (error) {
      alert("ลบข้อมูลไม่สำเร็จ: " + (error as Error).message);
    }
  };

  const handleExportDB = async () => {
    if (filteredData.length === 0) {
      alert("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }

    // Convert to Excel format with deep columns (FULL)
    const exportData = filteredData.map((r, index) => {
      let firstAuthor = r.authors || "";
      let coAuthors = "";

      if (r.authors && r.authors.includes(',')) {
        const parts = r.authors.split(',');
        firstAuthor = parts[0].trim();
        coAuthors = parts.slice(1).map((p: string) => p.trim()).join(', ');
      }

      return {
        "ลำดับ (No.)": index + 1,
        "รหัสอ้างอิง (ID)": r.id,
        "Scopus EID": r.scopus_eid || "-",
        "แหล่งข้อมูล (Data Source)": r.imported_from === 'scopus_api' ? 'Scopus' : (r.imported_from === 'ncbi_api' ? 'NCBI' : (r.imported_from === 'excel' ? 'Excel Import' : 'Manual Entry')),
        "ปีที่พิมพ์ (Year)": r.year,
        "ชื่อบทความวิจัย (Title)": r.title,
        "DOI": r.doi || "-",
        "ผู้แต่ง (Authors)": r.authors || "-",
        "ผู้แต่งหลัก (First Author)": firstAuthor,
        "ผู้แต่งร่วม (Co-authors)": coAuthors || "-",
        "รวมจำนวนผู้แต่ง (Total Authors)": r.authors ? (r.authors.includes(',') ? r.authors.split(',').length : 1) : 0,
        "ชื่อวารสาร/แหล่งตีพิมพ์ (Journal)": r.journal || "-",
        "ระดับ (Class)": r.class || "-",
        "จำนวนการอ้างอิง (Citation Count)": r.citation_count || 0,
        "การเข้าถึง (Open Access)": r.is_open_access ? "Yes" : "No",
        "สังกัดสถาบัน (Affiliations)": r.affiliations || "-",
        "ผู้ให้ทุน (Funding Sponsor)": r.funding_sponsor || "-",
        "บทคัดย่อ (Abstract)": r.abstract || "-",
        "สถานะ (Status)": r.is_deleted ? "ยกเลิก (Deleted)" : "ปกติ (Active)"
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto-fit roughly
    ws['!cols'] = [
      { wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 60 }, { wch: 25 },
      { wch: 35 }, { wch: 60 }, { wch: 22 }, { wch: 40 }, { wch: 15 }, { wch: 25 },
      { wch: 18 }, { wch: 40 }, { wch: 25 }, { wch: 80 }, { wch: 18 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Research Data");
    XLSX.writeFile(wb, `Research_Full_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) { alert("กรุณาเข้าสู่ระบบเพื่อดำเนินการ"); return; }
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`ยืนยันการนำเข้าข้อมูลงานวิจัยจากไฟล์: ${file.name}?`)) {
      if (e.target) e.target.value = "";
      return;
    }
    alert("ระบบนำเข้ากำลังพัฒนา (รันจำลองเพื่อการแสดงผล)");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScopusAction = () => {
    if (userRole !== 'admin') {
      alert("สิทธิ์ของคุณไม่เพียงพอสำหรับการเชื่อมต่อ API ของ Scopus (เฉพาะผู้ดูแลระบบเท่านั้น)");
      return;
    }
    router.push('/research/scopus');
  };

  // -- Pagination Data --
  const currentDataSource = researchData;
  const filteredData = currentDataSource.filter(r => {
    if (viewTab === 'active' && r.is_deleted) return false;
    if (viewTab === 'disabled' && !r.is_deleted) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const sourceLabel = r.imported_from === 'scopus_api' ? 'scopus' :
      r.imported_from === 'ncbi_api' ? 'ncbi' :
        r.imported_from === 'excel' ? 'excel' : 'manual';

    return (r.title && r.title.toLowerCase().includes(term)) ||
      (r.doi && r.doi.toLowerCase().includes(term)) ||
      (r.authors && r.authors.toLowerCase().includes(term)) ||
      sourceLabel.includes(term);
  }).sort((a, b) => {
    if (sortBy === 'id') {
      const valA = String(a.id || "");
      const valB = String(b.id || "");
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const startEntry = filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * itemsPerPage, filteredData.length);

  const PaginationControls = ({ showBackToTop = true }: { showBackToTop?: boolean }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            แสดง <span className="font-medium">{startEntry}</span> ถึง <span className="font-medium">{endEntry}</span> จาก <span className="font-medium">{filteredData.length}</span> รายการ
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
            <button disabled className="relative inline-flex items-center px-4 py-2 border text-sm font-medium z-10 bg-amber-50 border-amber-500 text-amber-600">
              {currentPage}
            </button>
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
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-amber-600 border border-slate-200 rounded-lg text-sm font-medium transition-all group"
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
      {/* === ACTION BAR === */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/?tab=Input" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="bg-amber-600 p-2 rounded-lg shadow-sm">
                <FlaskConical size={24} className="text-white" />
              </div>
              งานวิจัย
            </h1>
          </div>
          <div className="flex items-center gap-2">

            {/* SCOPUS API */}
            <button
              onClick={handleScopusAction}
              className={`flex items-center gap-2 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 px-3 py-2 rounded-lg transition-all shadow-sm text-sm group`}
            >
              <Globe size={16} className="text-blue-500 group-hover:text-blue-600 transition-colors" />
              <span className="font-medium hidden lg:inline">SCOPUS API</span>
            </button>

            {/* NCBI API */}
            <button
              onClick={() => {
                if (userRole !== 'admin') {
                  alert("สิทธิ์ของคุณไม่เพียงพอสำหรับการเชื่อมต่อ API ของ NCBI (เฉพาะผู้ดูแลระบบเท่านั้น)");
                  return;
                }
                router.push('/research/ncbi');
              }}
              className={`flex items-center gap-2 bg-white border border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-700 px-3 py-2 rounded-lg transition-all shadow-sm text-sm group`}
            >
              <Globe size={16} className="text-orange-500 group-hover:text-orange-600 transition-colors" />
              <span className="font-medium hidden lg:inline">NCBI API</span>
            </button>

            {/* ORCiD API */}
            <button
              onClick={() => {
                if (userRole !== 'admin') {
                  alert("สิทธิ์ของคุณไม่เพียงพอสำหรับการเชื่อมต่อ API ของ ORCiD (เฉพาะผู้ดูแลระบบเท่านั้น)");
                  return;
                }
                router.push('/research/orcid');
              }}
              className={`flex items-center gap-2 bg-white border border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 px-3 py-2 rounded-lg transition-all shadow-sm text-sm group`}
            >
              <Globe size={16} className="text-purple-500 group-hover:text-purple-600 transition-colors" />
              <span className="font-medium hidden lg:inline">ORCiD API</span>
            </button>

            <div className="w-px h-8 bg-gray-200 mx-1" />

            {/* Template Button */}
            <button
              onClick={() => alert("ระบบดาวน์โหลด Template กำลังสร้าง...")}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:border-slate-400 hover:bg-slate-50 text-gray-700 px-3 py-2 rounded-lg transition-all shadow-sm text-sm"
            >
              <FileDown size={16} className="text-slate-500" />
              <span className="font-medium">แบบฟอร์ม (Template)</span>
            </button>

            {/* Import Dropdown */}
            <div className="relative group/import">
              <button
                className="flex items-center gap-2 bg-white border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 text-gray-700 px-3 py-2 rounded-lg transition-all shadow-sm text-sm"
              >
                <Upload size={16} className="text-emerald-500" />
                <span className="font-medium">นำเข้าข้อมูล</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover/import:opacity-100 group-hover/import:visible transition-all z-50">
                <button onClick={() => alert("ระบบนำเข้า ThaiJO กำลังสร้าง...")} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> ThaiJO (XML)
                </button>
                <button onClick={() => alert("ระบบนำเข้า OAI-PMH กำลังสร้าง...")} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> OAI-PMH
                </button>
                <button onClick={() => alert("ระบบนำเข้า Excel กำลังสร้าง...")} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" /> Excel (.xlsx)
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button onClick={() => alert("ระบบนำเข้าอื่นๆ กำลังสร้าง...")} className="w-full text-left px-4 py-2 text-sm italic text-gray-400 hover:bg-slate-50">
                  Coming soon...
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />

            <Link
              href="/research/new"
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-medium"
            >
              <Plus size={16} /> <span className="hidden lg:inline">เพิ่มงานวิจัย</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">

        {/* === FILTER BAR === */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="flex flex-1 gap-2 max-w-lg w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="[Database] ค้นหา DOI, ชื่องานวิจัย, ชื่อผู้แต่ง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchResearchData}
              className="flex items-center gap-2 px-3 py-2 bg-white text-slate-500 hover:bg-amber-50 hover:text-amber-600 border border-slate-200 rounded-lg text-sm font-medium transition-all shadow-sm group"
            >
              <RefreshCw className={`text-amber-600 ${loadingDB ? 'animate-spin' : ''}`} size={18} />
            </button>
            <button
              onClick={handleExportDB}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-green-600 border border-slate-200 rounded-lg text-sm font-medium transition-all"
            >
              <Download size={14} /> Export
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (sortBy === 'id') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('id'); setSortOrder('asc'); }
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'id' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              <Hash size={16} /> ID
              {sortBy === 'id' && (sortOrder === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />)}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'updated') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('updated'); setSortOrder('desc'); }
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'updated' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              <Calendar size={16} /> Latest
              {sortBy === 'updated' && (sortOrder === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />)}
            </button>
          </div>

          <div className="flex border-b border-gray-100 px-2 lg:px-4">
            <button onClick={() => setViewTab('active')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'active' ? 'border-amber-600 text-amber-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>รายการปกติ ({researchData.filter(r => !r.is_deleted).length})</button>
            <button onClick={() => setViewTab('disabled')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'disabled' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>รายการที่ยกเลิก ({researchData.filter(r => r.is_deleted).length})</button>
            <button onClick={() => setViewTab('all')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'all' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>ทั้งหมด ({researchData.length})</button>
          </div>
        </div>

        {/* === MAIN DATA TABLE === */}
        <div className="overflow-x-auto min-h-[400px]">
          <PaginationControls showBackToTop={false} />
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="p-4 border-b font-semibold w-24">ปีที่พิมพ์</th>
                <th className="p-4 border-b font-semibold">ชื่องานวิจัย / DOI</th>
                <th className="p-4 border-b font-semibold w-48">ผู้แต่ง / Author ID</th>
                <th className="p-4 border-b font-semibold w-64">ชื่อวารสาร / แหล่งพิมพ์</th>
                <th className="p-4 border-b font-semibold w-24">ระดับ (Class)</th>
                <th className="p-4 border-b font-semibold w-24">แหล่งข้อมูล</th>
                <th className="p-4 border-b font-semibold w-24">สถานะ (Status)</th>
                <th className="p-4 border-b font-semibold w-24 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingDB ? (
                <tr><td colSpan={7} className="p-16 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-amber-600" size={32} />
                    <span className="font-medium text-lg text-amber-700">กำลังโหลดข้อมูล Database...</span>
                  </div>
                </td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={7} className="p-16 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-medium">ไม่พบข้อมูลงานวิจัยในฐานข้อมูลระบบ</span>
                    {searchTerm && <span className="text-sm">ลองค้นหาด้วยคำอื่น หรือกดรีเฟรช</span>}
                  </div>
                </td></tr>
              ) : (
                paginatedData.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-gray-900 font-mono text-sm font-bold">{s.year || "-"}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900 border-b border-transparent group-hover:border-blue-200 transition-all inline-block leading-tight">{s.title}</div>
                      <div className="text-xs text-blue-600 mt-1 font-mono">{s.doi || "No DOI"}</div>
                    </td>

                    <td className="p-4 text-sm text-gray-600 font-medium">
                      {s.authors}
                    </td>

                    <td className="p-4 text-gray-700 text-sm">
                      <span className="font-bold text-slate-800">{s.journal}</span>
                    </td>

                    <td className="p-4 text-gray-700 font-medium">
                      <span className="text-sm font-bold bg-slate-100 px-2 py-1 rounded">{s.class || "-"}</span>
                    </td>

                    <td className="p-4">
                      {s.imported_from === 'scopus_api' ? (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded w-max flex items-center gap-1 border border-blue-200"><Globe size={12} /> Scopus</span>
                      ) : s.imported_from === 'ncbi_api' ? (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded w-max flex items-center gap-1 border border-orange-200"><Globe size={12} /> NCBI</span>
                      ) : s.imported_from === 'excel' ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded w-max flex items-center gap-1 border border-emerald-200"><FileDown size={12} /> Excel</span>
                      ) : s.imported_from === 'orcid_api' ? (
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded w-max flex items-center gap-1 border border-purple-200"><Globe size={12} /> ORCiD</span>
                      ) : (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded w-max flex items-center gap-1 border border-slate-200"><Edit size={12} /> Manual</span>
                      )}
                    </td>

                    <td className="p-4 text-gray-700">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded w-max flex items-center gap-1 border ${s.is_deleted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                        {s.is_deleted ? 'ยกเลิก' : 'ปกติ'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-all">
                        <Link href={`/research/${s.id}/edit`} title="แก้ไข" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit size={18} /></Link>
                        <button onClick={() => handleDelete(s.id, s.title)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบข้อมูล">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <PaginationControls showBackToTop={true} />
        </div>
      </div>

      {showFloatingTop && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg transition-transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-slate-300"
            aria-label="Back to top"
          >
            <ChevronUp size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
