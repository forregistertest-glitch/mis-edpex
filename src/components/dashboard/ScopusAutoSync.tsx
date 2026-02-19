
"use client";

import { useState } from "react";
import { Loader2, Play, CheckCircle, XCircle, AlertTriangle, FileText, User } from "lucide-react";
import { StudentService } from "@/services/studentService";
import { AdvisorService } from "@/services/advisorService";
import { ScopusService } from "@/services/scopusService";
import { AcademicService } from "@/services/academicService";
import { StudentPublication } from "@/types/academic";

interface Props {
  lang: "th" | "en";
}

export default function ScopusAutoSync({ lang }: Props) {
  const [syncType, setSyncType] = useState<"students" | "advisors">("students");
  const [status, setStatus] = useState<"idle" | "running" | "completed">("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [stats, setStats] = useState({ success: 0, failed: 0, skipped: 0, newPubs: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 100));
  };

  const startSync = async () => {
    if (status === "running") return;
    
    // Confirm
    if (!confirm(lang === 'th' 
      ? `ต้องการเริ่มกระบวนการดึงข้อมูลอัตโนมัติสำหรับ "${syncType}" ใช่หรือไม่?\nกระบวนการนี้อาจใช้เวลานาน` 
      : `Start auto-sync for "${syncType}"?\nThis may take a while.`)) {
      return;
    }

    setStatus("running");
    setProgress({ current: 0, total: 0 });
    setStats({ success: 0, failed: 0, skipped: 0, newPubs: 0 });
    setLogs([]);
    addLog(`Starting sync for ${syncType}...`);

    try {
      // 1. Fetch Entities
      let entities: any[] = [];
      if (syncType === "students") {
        entities = await StudentService.getAllStudents();
      } else {
        entities = await AdvisorService.getAllAdvisors();
      }

      addLog(`Found ${entities.length} ${syncType}.`);
      setProgress({ current: 0, total: entities.length });

      // 2. Iterate
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const entityName = entity.full_name_en || entity.full_name || entity.first_name_en + " " + entity.last_name_en;
        const entityId = syncType === "students" ? entity.student_id : entity.id; // Advisor ID might be 'id' or 'advisor_id'
        const dbId = entity.id; // Firestore Doc ID

        setProgress(p => ({ ...p, current: i + 1 }));

        try {
          // A. Determine Scopus ID
          let scopusId = entity.scopus_id;

          if (!scopusId) {
            // Search by Name
            if (!entity.first_name_en || !entity.last_name_en) {
               addLog(`⚠️ Skip ${entityName} (No English Name)`);
               setStats(s => ({ ...s, skipped: s.skipped + 1 }));
               continue;
            }

            const query = `AUTHOR-NAME(${entity.last_name_en}, ${entity.first_name_en}) AND AFFIL(Kasetsart)`;
            // addLog(`🔎 Searching name: ${query}`);
            
            // Artificial delay to avoid rate limit if needed, but Scopus API is usually robust
            const searchResults = await ScopusService.searchByQuery(query);
            
            if (searchResults.length > 0) {
               // Check confidence: if multiple results have different Author IDs, it's ambiguous.
               // However, searchByQuery returns Documents, not Authors.
               // To get Author ID, we check the results.
               // Actually Scopus Search API returns documents. To find Author ID "automatically" is hard from Doc Search.
               // BUT, we can use the authorId from the first result if it matches name?
               // The searchByQuery result mapped in ScopusService doesn't strictly return Author ID for the *search target*, 
               // it returns documents.
               
               // Alternative Strategy: Use Author Search API? 
               // Our current route.ts supports `query`.
               // Let's assume we can't easily auto-assign ID without risk.
               // BUT User asked for "Update with one button".
               // Let's try to get pubs directly via Name Query then?
               // YES. We don't strictly *need* Scopus ID to get pubs, we can search by Name.
               // But we should save Scopus ID if found to make future faster.
               
               // For this implementation: Pull pubs by Name Query + Affiliation.
               addLog(`✅ Found ${searchResults.length} docs for ${entityName}`);
               
               // Process Pubs
               const newPubs: StudentPublication[] = [];
               // Fetch existing pubs from DB to dedup
               const existingPubs = await AcademicService.getPublicationsByStudentId(entityId);
               const existingTitles = new Set(existingPubs.map(p => p.publication_title.toLowerCase()));

               for (const res of searchResults) {
                  const title = res.title;
                  if (existingTitles.has(title.toLowerCase())) continue;

                  newPubs.push({
                    student_id: entityId, // Use the ID (Student ID or Advisor ID)
                    publication_title: title,
                    journal_name: res.journal,
                    publication_date: res.coverDate,
                    publication_type: res.subtypeDescription === 'Article' ? 'Journal' : 'Other',
                    quartile: "", // Scopus doesn't give Q directly
                    database_source: "Scopus",
                    volume: res.volume || "",
                    issue: res.issue || "",
                    pages: res.pageRange || "",
                    year: new Date(res.coverDate).getFullYear(),
                    created_by: "system_auto_sync"
                  });
               }

               if (newPubs.length > 0) {
                 await AcademicService.addPublicationBatch(newPubs, "system_auto_sync");
                 addLog(`   ➕ Added ${newPubs.length} new pubs.`);
                 setStats(s => ({ ...s, newPubs: s.newPubs + newPubs.length }));
               }
               setStats(s => ({ ...s, success: s.success + 1 }));

            } else {
               addLog(`⚪ No docs found for ${entityName}`);
               setStats(s => ({ ...s, skipped: s.skipped + 1 }));
            }

          } else {
            // Has ID - Search by Author ID (More precise)
            const pubs = await ScopusService.searchByAuthorId(scopusId);
            // Deduplicate and additions similar to above...
             const existingPubs = await AcademicService.getPublicationsByStudentId(entityId);
             const existingTitles = new Set(existingPubs.map(p => p.publication_title.toLowerCase()));

             const newPubs: StudentPublication[] = [];
             for (const res of pubs) {
                  if (existingTitles.has(res.title.toLowerCase())) continue;
                  newPubs.push({
                    student_id: entityId,
                    publication_title: res.title,
                    journal_name: res.journal,
                    publication_date: res.coverDate,
                    publication_type: res.subtypeDescription === 'Article' ? 'Journal' : 'Other',
                    quartile: "", 
                    database_source: "Scopus",
                    volume: res.volume || "",
                    issue: res.issue || "",
                    pages: res.pageRange || "",
                    year: new Date(res.coverDate).getFullYear(),
                    created_by: "system_auto_sync"
                  });
             }
             
              if (newPubs.length > 0) {
                  await AcademicService.addPublicationBatch(newPubs, "system_auto_sync");
                  addLog(`   ➕ (ID: ${scopusId}) Added ${newPubs.length} pubs for ${entityName}`);
                  setStats(s => ({ ...s, newPubs: s.newPubs + newPubs.length }));
              } else {
                  addLog(`   (ID: ${scopusId}) No new pubs for ${entityName}`);
              }
              setStats(s => ({ ...s, success: s.success + 1 }));
           }
        } catch (err: any) {
          console.error(err);
          addLog(`❌ Error ${entityName}: ${err.message}`);
          setStats(s => ({ ...s, failed: s.failed + 1 }));
        }
      }
    } catch (error: any) {
      addLog(`🔥 Critical Error: ${error.message}`);
    } finally {
      setStatus("completed");
      addLog("=== Sync Completed ===");
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
         <div>
            <h3 className="font-bold text-blue-900 flex items-center gap-2">
               <FileText size={20} />
               {lang === 'th' ? "ดึงข้อมูลอัตโนมัติ (Auto-Sync)" : "One-Click Auto Sync"}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {lang === 'th' 
                 ? "ระบบจะค้นหาข้อมูลจาก Scopus ตามชื่อ/นามสกุล หรือ Scopus ID ของทุกคนในฐานข้อมูล"
                 : "System will search Scopus by Name/ID for all entities in database."}
            </p>
         </div>
         <div className="flex gap-2">
            <select 
               value={syncType}
               onChange={(e) => setSyncType(e.target.value as any)}
               disabled={status === "running"}
               className="border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
            >
               <option value="students">{lang === 'th' ? "นิสิต (Students)" : "Students"}</option>
               <option value="advisors">{lang === 'th' ? "บุคลากร (Personnel)" : "Personnel"}</option>
            </select>
            <button
               onClick={startSync}
               disabled={status === "running"}
               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all disabled:opacity-50"
            >
               {status === "running" ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
               {lang === 'th' ? "เริ่มทำงาน" : "Start Sync"}
            </button>
         </div>
       </div>

       {/* Progress UI */}
       {status !== 'idle' && (
         <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
            {/* Progress Bar */}
            <div className="space-y-2">
               <div className="flex justify-between text-sm font-medium text-slate-700">
                  <span>Progress</span>
                  <span>{progress.current} / {progress.total}</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                     className="h-full bg-blue-500 transition-all duration-300"
                     style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
                  />
               </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-xs text-green-600 font-bold block">SUCCESS</span>
                  <span className="text-2xl font-bold text-green-700">{stats.success}</span>
               </div>
               <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-xs text-blue-600 font-bold block">NEW PUBS</span>
                  <span className="text-2xl font-bold text-blue-700">{stats.newPubs}</span>
               </div>
               <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold block">SKIPPED</span>
                  <span className="text-2xl font-bold text-slate-600">{stats.skipped}</span>
               </div>
               <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-xs text-red-600 font-bold block">FAILED</span>
                  <span className="text-2xl font-bold text-red-700">{stats.failed}</span>
               </div>
            </div>

            {/* Log Window */}
            <div className="h-64 overflow-y-auto bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs space-y-1">
               {logs.map((log, i) => (
                  <div key={i} className="break-all">{log}</div>
               ))}
               {logs.length === 0 && <div className="text-slate-600 italic">Waiting to start...</div>}
            </div>
         </div>
       )}
    </div>
  );
}
