"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Search, Edit, Trash2, Download, Upload, ArrowUpAZ, ArrowDownAZ, Calendar, Hash, RefreshCw, ChevronUp, FileDown, ChevronDown, Archive, Globe, Loader2, PlayCircle, Building2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ResearchService } from "@/services/researchService";
import { ScopusService } from "@/services/scopusService";

export default function ResearchPage() {
  const { user, userRole } = useAuth();
  
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
  
  // -- Import State --
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- View Mode State --
  const [viewMode, setViewMode] = useState<"database" | "scopus">("database");
  const [scopusAction, setScopusAction] = useState<"search" | "import">("search");

  // -- Scopus Search State --
  const [scopusQuery, setScopusQuery] = useState("");
  const [scopusScope, setScopusScope] = useState("vet"); // 'vet' for Faculty, '60021944' for KU
  const [scopusYear, setScopusYear] = useState(new Date().getFullYear().toString());
  const [scopusResults, setScopusResults] = useState<any[]>([]);
  const [scopusTotal, setScopusTotal] = useState(0);
  const [isSearchingScopus, setIsSearchingScopus] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // -- Progress Modal State --
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [progressAction, setProgressAction] = useState<"search" | "import">("search");
  const modalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll progress logs
    if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = modalScrollRef.current.scrollHeight;
    }
  }, [progressLogs]);

  useEffect(() => {
    setCurrentPage(1); 
  }, [searchTerm, viewTab, viewMode]);

  useEffect(() => {
    fetchResearchData();
  }, []);

  const fetchResearchData = async () => {
    setLoadingDB(true);
    try {
        const data = await ResearchService.getAllResearch();
        const formatted = data.map(item => ({
            ...item,
            authors: item.authors_raw || "Unknown",
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
    alert("ระบบส่งออกกำลังพัฒนา");
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

  const handleScopusSearch = async (action: "search" | "import", isAppend: boolean = false) => {
      if (!isAppend && scopusScope !== 'vet' && scopusYear === 'all' && !scopusQuery.trim()) {
          alert("คำเตือน: การค้นหา 'มหาวิทยาลัยทั้งหมด' แบบ 'ทุกปี' โดยไม่ระบุคำสืบค้น จะได้ข้อมูลมหาศาล (26,000+ รายการ) ซึ่งอาจทำให้ระบบค้าง\n\nแนะนำให้: ระบุปีที่พิมพ์ หรือ ระบุชื่อผู้แต่ง/บทความ เพิ่มเติมครับ");
          return;
      }

      if (!isAppend) {
          setProgressAction(action);
          setIsSearchingScopus(true);
          setShowProgressModal(true);
          setProgressLogs([`เริ่มต้นการเชื่อมต่อ Scopus API... (${action === 'import' ? 'ตรวจสอบสิทธิ์นำเข้า' : 'แสดงผลเท่านั้น'})`]);
          setScopusResults([]); 
      } else {
          setIsLoadingMore(true);
      }

      const offset = isAppend ? scopusResults.length : 0;

      try {
        // 1. ตรวจสอบ API Key ใน Environment
        const response = await ScopusService.searchWithAffiliation(scopusQuery, scopusScope, scopusYear, offset);
        const { results, totalResults } = response;
        
        setTimeout(() => {
            if (!isAppend) {
                setProgressLogs(prev => [...prev, `✅ ประสบความสำเร็จ: พบข้อมูลทั้งหมด ${totalResults} รายการ (ดึงมาแสดง ${results.length} รายการแรก)`]);
            }
            setScopusTotal(totalResults);
            
            // Format results
            const formatted = results.map((item: any) => ({
                id: item.eid || Math.random().toString(),
                doi: item.doi, 
                title: item.title, 
                journal: item.journal, 
                year: item.coverDate ? item.coverDate.substring(0, 4) : "-", 
                authors: item.authorId || "Unknown", 
                class: item.aggregationType || "Journal",
                status: "new", // This will be compared with Database in the next phase
                localId: undefined,
                raw: item.raw // Keep raw document for importing
            }));

            if (isAppend) {
                setScopusResults(prev => [...prev, ...formatted]);
            } else {
                setScopusResults(formatted);
            }

            setIsSearchingScopus(false);
            setIsLoadingMore(false);

            if (!isAppend && action === 'search') {
                 setTimeout(() => setShowProgressModal(false), 1500);
            }
        }, isAppend ? 0 : 1000);

      } catch (error: any) {
          if (!isAppend) {
            setProgressLogs(prev => [...prev, `❌ เกิดข้อผิดพลาด: ${error.message}`]);
            setIsSearchingScopus(false);
          } else {
            alert("ไม่สามารถโหลดข้อมูลเพิ่มได้: " + error.message);
            setIsLoadingMore(false);
          }
      }
  };

  const handleExportA4 = () => {
    if (scopusResults.length === 0) {
      alert("ไม่พบข้อมูลที่จะส่งออก กรุณาสืบค้นข้อมูลก่อนครับ");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Scopus Search Report - ${new Date().toLocaleDateString()}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Prompt:wght@400;700&display=swap');
          
          body {
            font-family: 'Inter', 'Prompt', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 10mm auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            position: relative;
            box-sizing: border-box;
          }

          @media print {
            @page { size: A4; margin: 0; }
            body { background: none; padding: 0; margin: 0; }
            .page { margin: 0; box-shadow: none; width: 100%; padding: 15mm; }
            .no-print { display: none !important; }
          }

          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }

          .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 20px;
          }

          .header p {
            margin: 5px 0 0;
            font-size: 13px;
            color: #475569;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
            margin-top: 10px;
          }

          th {
            background-color: #f8fafc;
            color: #334155;
            font-weight: bold;
            text-align: left;
            padding: 10px 8px;
            border: 1px solid #cbd5e1;
          }

          td {
            padding: 10px 8px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
            line-height: 1.4;
          }

          .doi { color: #2563eb; font-family: monospace; font-size: 9px; margin-top: 4px; }
          .authors { color: #64748b; font-style: italic; }
          .journal { font-weight: bold; color: #0f172a; }
          
          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            text-align: right;
            font-size: 10px;
            color: #94a3b8;
          }

          .btn-print {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-family: inherit;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 100;
          }
          
          .btn-print:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <button class="btn-print no-print" onclick="window.print()">🖨️ พิมพ์รายงาน (Print to PDF/A4)</button>
        <div class="page">
          <div class="header">
            <h1>รายงานสรุปผลการสืบค้นข้อมูลวิจัยจากฐานข้อมูล Scopus</h1>
            <p>
                <strong>แหล่งข้อมูล:</strong> ${scopusScope === 'vet' ? 'คณะสัตวแพทยศาสตร์' : 'มหาวิทยาลัยเกษตรศาสตร์'} | 
                <strong>ปีที่พิมพ์:</strong> ${scopusYear === 'all' ? 'ทุกปี' : `ปี ${parseInt(scopusYear) + 543} (${scopusYear})`}
            </p>
            <p>สืบค้นเมื่อ: ${new Date().toLocaleString('th-TH')}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">ปี</th>
                <th>ชื่องานวิจัย / DOI</th>
                <th style="width: 180px;">ผู้แต่ง (Authors)</th>
                <th style="width: 160px;">วารสาร/แหล่งตีพิมพ์</th>
              </tr>
            </thead>
            <tbody>
              ${scopusResults.map(item => `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${item.year}</td>
                  <td>
                    <div style="font-weight: bold; color: #1e293b; margin-bottom: 2px;">${item.title}</div>
                    <div class="doi">${item.doi || '-'}</div>
                  </td>
                  <td class="authors">${item.authors}</td>
                  <td class="journal">${item.journal}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>พบข้อมูลในระบบ Scopus ทั้งหมด ${scopusTotal} รายการ | นำออกมาแสดงในรายงานนี้ ${scopusResults.length} รายการ</p>
            <p>© KUVET MIS System - Research Records Report</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // -- Pagination Data --
  const filteredData_DB = researchData; 
  const filteredData_Scopus = scopusResults;

  const currentDataSource = viewMode === "scopus" ? filteredData_Scopus : filteredData_DB;
  const totalPages = Math.ceil(currentDataSource.length / itemsPerPage);
  const paginatedData = currentDataSource.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const startEntry = currentDataSource.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * itemsPerPage, currentDataSource.length);

  const PaginationControls = ({ showBackToTop = true }: { showBackToTop?: boolean }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            แสดง <span className="font-medium">{startEntry}</span> ถึง <span className="font-medium">{endEntry}</span> จาก <span className="font-medium">{currentDataSource.length}</span> รายการ
            {viewMode === 'scopus' && (
                <span className="ml-1 text-slate-400">
                    (พบใน Scopus ทั้งหมด <span className="font-bold text-blue-600">{scopusTotal}</span> รายการ)
                </span>
            )}
          </p>

          {viewMode === 'scopus' && scopusResults.length < scopusTotal && (
              <div className="flex flex-col gap-1">
                  <button 
                      onClick={() => handleScopusSearch(scopusAction, true)}
                      disabled={isLoadingMore}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm disabled:opacity-50"
                  >
                      {isLoadingMore ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      โหลดข้อมูลเพิ่ม (+25 รายการ)
                  </button>
                  <span className="text-[10px] text-slate-400 italic font-medium px-1">
                      * ข้อจำกัด Scopus API: ดึงได้ทีละ 25 รายการเพื่อความสมบูรณ์ของข้อมูล
                  </span>
              </div>
          )}

          {viewMode === 'scopus' && scopusResults.length >= scopusTotal && scopusTotal > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold shadow-sm">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  ตรวจสอบแล้ว: ดึงข้อมูลครบถ้วนทั้งหมด {scopusTotal} รายการเรียบร้อยแล้ว
              </div>
          )}
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
            <button disabled className="relative inline-flex items-center px-4 py-2 border text-sm font-medium z-10 bg-indigo-50 border-indigo-500 text-indigo-600">
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
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 rounded-lg text-sm font-medium transition-all group"
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
      {/* === ACTION BAR (แถบคำสั่งหลัก) === */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/?tab=Input" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
               <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-3">
               <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                  <BookOpen size={24} className="text-white" />
               </div>
               ระบบข้อมูลงานวิจัย (Research)
            </h1>
          </div>
          <div className="flex items-center gap-2">
            
            <button
                onClick={() => {
                    setScopusAction('search');
                    setViewMode('scopus');
                }}
                className={`flex items-center gap-2 bg-white border ${viewMode === 'scopus' && scopusAction === 'search' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'} px-3 py-1.5 rounded-lg transition-all shadow-sm text-left group`}
            >
                <Globe size={20} className={`${viewMode === 'scopus' && scopusAction === 'search' ? 'text-blue-600' : 'text-blue-500 group-hover:text-blue-600'}`} />
                <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-bold text-gray-500">SCOPUS API</span>
                    <span className="text-sm font-medium text-gray-800">สืบค้น (แสดงผล)</span>
                </div>
            </button>

            <button
                onClick={() => {
                    setScopusAction('import');
                    setViewMode('scopus');
                }}
                className={`flex items-center gap-2 bg-white border ${viewMode === 'scopus' && scopusAction === 'import' ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'} px-3 py-1.5 rounded-lg transition-all shadow-sm text-left group`}
            >
                <Download size={20} className={`${viewMode === 'scopus' && scopusAction === 'import' ? 'text-amber-600' : 'text-amber-500 group-hover:text-amber-600'}`} />
                <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-bold text-gray-500">SCOPUS API</span>
                    <span className="text-sm font-medium text-gray-800">นำเข้าข้อมูล</span>
                </div>
            </button>

            <div className="w-px h-8 bg-gray-200 mx-1" />

            <button
              onClick={() => alert("ดาวน์โหลด Template (กำลังพัฒนา)")}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700 px-3 py-2 rounded-lg transition-all shadow-sm text-sm"
            >
              <FileDown size={16} className="text-indigo-600" />
              <span className="font-medium hidden lg:inline">Template</span>
            </button>

            <button
                onClick={handleImportClick}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium"
            >
                <Upload size={16} /> <span className="hidden lg:inline">นำเข้า Excel</span>
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
            />
            
            <Link 
              href="/research/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-medium"
            >
               <BookOpen size={16} /> <span className="hidden lg:inline">เพิ่มงานวิจัย</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
        
        {/* === FILTER BAR (แถบค้นหา & ตัวเลือกสลับโหมด) === */}
        {viewMode === "database" ? (
             <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
                <div className="flex flex-1 gap-2 max-w-lg w-full">
                    <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="[Database] ค้นหา DOI, ชื่องานวิจัย, ชื่อผู้แต่ง..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    </div>
                    <button 
                        onClick={fetchResearchData}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 rounded-lg text-sm font-medium transition-all"
                    >
                    <RefreshCw className={loadingDB ? "animate-spin" : ""} size={16} /> 
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
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'id' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                      <Hash size={16} /> ID
                      {sortBy === 'id' && (sortOrder === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />)}
                    </button>
                    <button 
                      onClick={() => {
                        if (sortBy === 'updated') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        else { setSortBy('updated'); setSortOrder('desc'); }
                      }}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'updated' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                      <Calendar size={16} /> Latest
                      {sortBy === 'updated' && (sortOrder === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />)}
                    </button>
                </div>

                <div className="flex border-b border-gray-100 px-2 lg:px-4">
                    <button onClick={() => setViewTab('active')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'active' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>รายการปกติ ({researchData.filter(r => !r.is_deleted).length})</button>
                    <button onClick={() => setViewTab('disabled')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'disabled' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>รายการที่ยกเลิก ({researchData.filter(r => r.is_deleted).length})</button>
                    <button onClick={() => setViewTab('all')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewTab === 'all' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>ทั้งหมด ({researchData.length})</button>
                </div>
            </div>
        ) : (
            <div className="p-4 border-b border-blue-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-blue-50/30">
                <div className="flex flex-1 gap-3 w-full">
                    {/* Scopus Custom Filters */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหา: Author ID, Name, Article Title (เว้นว่างไว้หากต้องการดูทั้งหมด)"
                            value={scopusQuery}
                            onChange={(e) => setScopusQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-slate-400 text-sm"
                        />
                    </div>
                    <div className="relative w-72">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                        <select 
                            value={scopusScope}
                            onChange={(e) => setScopusScope(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium text-slate-700 appearance-none"
                        >
                            <option value="vet">Faculty of Veterinary Med</option>
                            <option value="60021944">Kasetsart University (All)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={16} />
                    </div>

                    <div className="relative w-40">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                        <select 
                            value={scopusYear}
                            onChange={(e) => setScopusYear(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium text-slate-700 appearance-none"
                        >
                            <option value="all">ทุกปี (ระวังข้อมูลเยอะ)</option>
                            {Array.from({ length: 11 }, (_, i) => {
                                const y = new Date().getFullYear() - i;
                                return <option key={y} value={y.toString()}>ปี {y + 543} ({y})</option>;
                            })}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={16} />
                    </div>

                    <button 
                        onClick={() => handleScopusSearch(scopusAction)}
                        className={`flex items-center justify-center gap-2 px-6 py-2 ${scopusAction === 'import' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-sm font-bold shadow-sm transition-colors`}
                    >
                        <PlayCircle size={18} /> {scopusAction === 'import' ? 'ค้นหา & เทียบข้อมูล' : 'ค้นหา Scopus'}
                    </button>
                     <button 
                        onClick={handleExportA4}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold shadow-sm transition-colors"
                    >
                        <FileDown size={18} /> Export (A4)
                    </button>
                </div>
                
                <div className="flex items-center">
                    <button 
                        onClick={() => setViewMode('database')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-bold transition-all shadow-sm"
                    >
                        ปิดหน้าต่าง / กลับสู่ Database หลัก
                    </button>
                </div>
            </div>
        )}

        {/* === MAIN DATA TABLE === */}
        <div className="overflow-x-auto min-h-[400px]">
          <PaginationControls showBackToTop={false} />
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${viewMode === 'scopus' ? 'bg-blue-100/50 text-blue-900 border-b-2 border-blue-200' : 'bg-gray-50 text-gray-600'} text-sm uppercase`}>
                <th className="p-4 border-b font-semibold w-24">ปีที่พิมพ์</th>
                <th className="p-4 border-b font-semibold">ชื่องานวิจัย / DOI</th>
                <th className="p-4 border-b font-semibold w-48">ผู้แต่ง (Authors)</th>
                <th className="p-4 border-b font-semibold w-64">ชื่อวารสาร / แหล่งพิมพ์</th>
                {viewMode === 'database' ? (
                     <>
                        <th className="p-4 border-b font-semibold w-24">ระดับ (Class)</th>
                        <th className="p-4 border-b font-semibold w-24">สถานะ (Status)</th>
                     </>
                ) : (
                     <th className="p-4 border-b font-semibold w-32">Status (นำเข้า)</th>
                )}
                <th className="p-4 border-b font-semibold w-24 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(viewMode === 'database' ? loadingDB : false) ? (
                <tr><td colSpan={6} className="p-16 text-center text-gray-500">
                   <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="animate-spin text-indigo-600" size={32} />
                      <span className="font-medium text-lg">กำลังโหลดข้อมูล Database...</span>
                   </div>
                </td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={6} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        {viewMode === 'scopus' ? (
                            <>
                                <Globe size={48} className="text-blue-200 mb-2" />
                                <span className="font-medium text-lg text-blue-800">โหมด Scopus Search API</span>
                                <span className="text-sm">กรุณากดปุ่ม <b>"ค้นหา Scopus"</b> ด้านบนเพื่อดำเนินการ</span>
                            </>
                        ) : (
                            <span className="font-medium">ไม่พบข้อมูลงานวิจัยในฐานระบบ</span>
                        )}
                    </div>
                </td></tr>
              ) : (
                paginatedData.map((s, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50 transition-colors group ${viewMode === 'scopus' ? (s.status === 'duplicate' ? 'bg-slate-50/50' : 'bg-green-50/20') : ''}`}>
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

                    {viewMode === 'database' ? (
                        <>
                            <td className="p-4 text-gray-700">
                                <span className="text-sm font-bold bg-slate-100 px-2 py-1 rounded">{s.class || "-"}</span>
                            </td>
                            <td className="p-4 text-gray-700">
                                <span className={`text-xs font-bold px-2 py-1 rounded w-max flex items-center gap-1 ${s.is_deleted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {s.is_deleted ? 'ยกเลิก' : 'ปกติ'}
                                </span>
                            </td>
                        </>
                    ) : (
                        <td className="p-4">
                            {s.status === 'new' ? (
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1 w-max"><CheckCircle2 size={12}/> New Data</span>
                            ) : (
                                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded flex flex-col w-max items-start gap-0.5">
                                    <span>Duplicate (มีในระบบ)</span>
                                    <span className="text-[10px] bg-white/50 px-1 rounded-sm border border-amber-200">ID: {s.localId}</span>
                                </span>
                            )}
                        </td>
                    )}

                    <td className="p-4 text-right">
                       <div className={`flex justify-end gap-1 transition-all ${viewMode === 'database' ? 'opacity-10 md:opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                        {viewMode === 'database' ? (
                            <>
                                <Link href={`/research/${s.id}/edit`} title="แก้ไข" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit size={18} /></Link>
                                <button onClick={() => handleDelete(s.id, s.title)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบข้อมูล">
                            <Trash2 size={16} />
                        </button>
                            </>
                        ) : (
                            <button title="นำเข้ารายการนี้" className={`px-3 py-1 text-xs font-bold rounded-lg transition-all shadow-sm border ${s.status === 'new' ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700' : 'bg-white hover:bg-amber-50 text-amber-600 border-amber-300'}`}>
                                {s.status === 'new' ? 'นำเข้า' : 'นำเข้าซ้ำ/อัปเดต'}
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <PaginationControls showBackToTop={false} />
        </div>
      </div>

      {/* Progress Modal (Used for visual feedback of active script/background process) */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        {isSearchingScopus ? <Loader2 size={18} className="animate-spin text-blue-400" /> : <CheckCircle2 size={18} className="text-green-400" />}
                        System Process Running
                    </h3>
                    {!isSearchingScopus && (
                        <button onClick={() => setShowProgressModal(false)} className="text-slate-400 hover:text-white transition-colors">
                            ปิดหน้าต่าง
                        </button>
                    )}
                </div>
                <div 
                    ref={modalScrollRef}
                    className="p-4 h-64 overflow-y-auto bg-slate-900 font-mono text-sm space-y-2"
                >
                    {progressLogs.map((log, idx) => (
                        <div key={idx} className={`${
                            log.includes('✅') ? 'text-green-400 font-bold' : 
                            log.includes('⚠️') ? 'text-yellow-400' : 
                            log.includes('❌') ? 'text-red-400' : 
                            'text-slate-300'
                        }`}>
                            {log}
                        </div>
                    ))}
                    {isSearchingScopus && (
                        <div className="text-slate-500 animate-pulse">กำลังทำงาน...</div>
                    )}
                </div>
                {/* Footer progress bar indicator */}
                <div className="h-1 bg-slate-800 w-full relative overflow-hidden">
                    {isSearchingScopus ? (
                        <div className="absolute top-0 left-0 h-full bg-blue-500 w-1/3 animate-[progress_1s_ease-in-out_infinite] rounded-r-full" />
                    ) : (
                        <div className="absolute top-0 left-0 h-full bg-green-500 w-full" />
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
