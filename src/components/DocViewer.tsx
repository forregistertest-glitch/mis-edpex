"use client";

import { useState, useEffect } from "react";
import {
  X,
  FileText,
  BookOpen,
  Download,
  Loader2,
  ExternalLink,
  Clock,
  HardDrive,
} from "lucide-react";

interface DocFile {
  name: string;
  title: string;
  subtitle?: string;
  size: number;
  modified: string;
}

// ─── Simple Markdown → HTML ────────────────────────────────────
function mdToHtml(md: string): string {
  // Normalize line endings (Windows \r\n → \n)
  let html = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Escape HTML entities inside code blocks first
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    if (lang === "mermaid") {
        codeBlocks.push(`<div class="mermaid">${code.trim()}</div>`);
    } else {
        codeBlocks.push(
          `<pre class="md-code-block"><code class="language-${lang || "text"}">${code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</code></pre>`
        );
    }
    return `%%CODEBLOCK_${idx}%%`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="md-h4">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Blockquotes (including alerts)
  html = html.replace(/^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n> (.+)$/gm, 
    '<div class="md-alert md-alert-$1"><strong>$1:</strong> $2</div>');
  html = html.replace(/^> (.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="md-hr" />');

  // Tables — match header | sep | body rows
  html = html.replace(
    /^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/gm,
    (_, header, body) => {
      const headers = header.split("|").map((h: string) => h.trim()).filter(Boolean);
      const rows = body.trim().split("\n").filter(Boolean).map((row: string) =>
        row.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c: string) => c.trim())
      );
      let table = '<div class="md-table-wrap"><table class="md-table"><thead><tr>';
      headers.forEach((h: string) => { table += `<th>${h}</th>`; });
      table += "</tr></thead><tbody>";
      rows.forEach((row: string[]) => {
        table += "<tr>";
        row.forEach((c: string) => { table += `<td>${c}</td>`; });
        table += "</tr>";
      });
      table += "</tbody></table></div>";
      return table;
    }
  );

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="md-li">$1</li>');
  html = html.replace(/((?:<li class="md-li">.*<\/li>\n?)+)/g, '<ul class="md-ul">$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="md-oli">$1</li>');
  html = html.replace(/((?:<li class="md-oli">.*<\/li>\n?)+)/g, '<ol class="md-ol">$1</ol>');

  // Paragraphs
  html = html.replace(/^(?!<[hublodtp]|<\/|%%|<hr|<div|<pre|<blockquote)(.+)$/gm, '<p class="md-p">$1</p>');

  // Restore code blocks
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`%%CODEBLOCK_${idx}%%`, block);
  });

  return html;
}

// ─── DocViewer Component ───────────────────────────────────────
export default function DocViewer({ onClose, t, userEmail }: { onClose: () => void; t?: any; userEmail?: string | null }) {
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [docContent, setDocContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const isSolarized = selectedDoc === "user_hr_manual.md";

  // Mermaid Support
  useEffect(() => {
    if (isSolarized && !docLoading && docContent) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js";
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        window.mermaid.initialize({ 
          startOnLoad: false, 
          theme: isSolarized ? 'base' : 'neutral',
          themeVariables: isSolarized ? {
            primaryColor: '#eee8d5',
            primaryTextColor: '#586e75',
            primaryBorderColor: '#93a1a1',
            lineColor: '#93a1a1',
            secondaryColor: '#fdf6e3',
            tertiaryColor: '#eee8d5'
          } : {},
          securityLevel: 'loose',
          fontFamily: 'Sarabun, sans-serif'
        });
        // @ts-ignore
        window.mermaid.init(undefined, document.querySelectorAll('.mermaid'));
      };
      document.body.appendChild(script);
      
      return () => {
         // Cleanup if needed, but script can stay
      };
    }
  }, [selectedDoc, docLoading, docContent, isSolarized]);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/docs");
      const data = await res.json();
      
      // Filter out system docs for non-superadmin
      const restrictedDocs = [
        "database_design.md",
        "app_architecture.md", 
        "data_dictionary.md",
        "firebase_capacity.md",
        "data_integrity_plan.md"
      ];

      const isSuperAdmin = userEmail === "nipon.w@ku.th";
      const filteredDocs = isSuperAdmin 
        ? data.docs 
        : data.docs?.filter((d: { name: string }) => !restrictedDocs.includes(d.name));

      setDocs(filteredDocs || []);
      if (filteredDocs?.length > 0) {
        openDoc(filteredDocs[0].name);
      }
    } catch (error) {
      console.error("Failed to fetch docs", error);
    } finally {
      setLoading(false);
    }
  };

  const openDoc = async (name: string) => {
    setSelectedDoc(name);
    setDocLoading(true);
    try {
      const res = await fetch(`/api/docs?file=${name}`);
      const data = await res.json();
      setDocContent(data.content || "");
    } catch (error) {
      console.error("Failed to fetch doc content", error);
    } finally {
      setDocLoading(false);
    }
  };

  const downloadDoc = (fileName: string) => {
    const blob = new Blob([docContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };



  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // ── Full-screen overlay ──
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm print:hidden" onClick={onClose} />

      {/* Panel */}
      <div 
        className={`relative z-10 bg-white shadow-2xl overflow-hidden border border-slate-200 transition-all duration-300 flex print:hidden ${
          isMaximized 
            ? "inset-0 m-0 rounded-none w-screen h-screen" 
            : "mx-auto my-6 w-full max-w-6xl rounded-3xl"
        }`} 
        style={{ maxHeight: isMaximized ? "100vh" : "calc(100vh - 48px)" }}
      >
        
        {/* Sidebar — File List */}
        <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={20} className="text-blue-600" />
                {t ? "เอกสารประกอบ" : "Documentation"}
              </h3>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600 lg:hidden">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t ? `${docs.length} รายการในคลังเอกสาร` : `${docs.length} items in repository`}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-400" size={24} /></div>
            ) : (
              docs.map((doc) => (
                <button
                  key={doc.name}
                  onClick={() => openDoc(doc.name)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 group ${
                    selectedDoc === doc.name
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "hover:bg-white hover:shadow-md text-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText size={18} className={`mt-0.5 shrink-0 ${selectedDoc === doc.name ? "text-white/80" : "text-blue-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-bold leading-tight ${selectedDoc === doc.name ? "text-white" : "text-slate-800"}`}>
                        {doc.title}
                      </p>
                      {doc.subtitle && (
                        <p className={`text-[10px] mt-1 truncate ${selectedDoc === doc.name ? "text-white/80" : "text-slate-400"}`}>
                          {doc.subtitle}
                        </p>
                      )}
                      <div className={`flex items-center gap-2 mt-1 text-[10px] ${selectedDoc === doc.name ? "text-white/60" : "text-slate-400"}`}>
                        <span className="flex items-center gap-0.5"><HardDrive size={10} />{fmtSize(doc.size)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Clock size={10} />{new Date(doc.modified).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content — Markdown Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Title Bar */}
          <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-blue-600" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-none">
                  {selectedDoc || "Select Document"}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Markdown View</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {selectedDoc && (
                <>
                  <button 
                    onClick={() => {
                      const printWin = window.open('', '_blank');
                      if (printWin) {
                        const content = mdToHtml(docContent);
                        const docInfo = docs.find(d => d.name === selectedDoc);
                        const solarizedStyles = isSolarized ? `
                          body { background: #fdf6e3; color: #586e75; font-family: 'JetBrains Mono', monospace; }
                          .md-h1 { border-bottom: 2px solid #eee8d5; color: #b58900; }
                          .meta { color: #93a1a1; }
                          .md-table th { background: #eee8d5; color: #586e75; border-bottom-color: #93a1a1; }
                          .md-table td { border-bottom-color: #eee8d5; color: #657b83; }
                          .md-alert-NOTE { background: #eee8d5; border-left-color: #268bd2; color: #268bd2; }
                          .mermaid { background: transparent; }
                        ` : `
                          body { color: #334155; }
                          .md-h1 { border-bottom: 2px solid #e2e8f0; }
                          .meta { color: #64748b; }
                          .md-table th { background: #f8fafc; }
                          .md-alert { border-left: 4px solid #3b82f6; background: #eff6ff; }
                        `;

                        printWin.document.write(`
                          <html>
                            <head>
                              <title>${selectedDoc}</title>
                              <style>
                                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
                                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');
                                body { padding: 40px; line-height: 1.6; font-size: 10pt; }
                                .md-h1 { font-size: 18pt; font-weight: 800; padding-bottom: 10px; margin-bottom: 20px; }
                                .meta { font-size: 9pt; margin-bottom: 30px; font-weight: bold; }
                                .md-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 8pt; }
                                .md-table th, .md-table td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
                                .md-alert { padding: 15px; margin: 20px 0; border-radius: 4px; border-left-width: 4px; border-left-style: solid; }
                                .mermaid { text-align: center; margin: 20px 0; }
                                @page { size: A4; margin: 15mm; }
                                @media print { 
                                  body { padding: 0; } 
                                  button { display: none; }
                                }
                                ${solarizedStyles}
                              </style>
                            </head>
                            <body>
                              <div class="md-h1">${docInfo?.title || selectedDoc}</div>
                              <div class="meta">อัปเดตล่าสุด: ${new Date(docInfo?.modified || '').toLocaleDateString('th-TH')} | ขนาด: ${fmtSize(docInfo?.size || 0)}</div>
                              <div id="print-content">${content}</div>
                              <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
                              <script>
                                window.onload = () => {
                                  mermaid.initialize({ 
                                    startOnLoad: true, 
                                    theme: '${isSolarized ? 'base' : 'neutral'}',
                                    themeVariables: ${isSolarized ? JSON.stringify({
                                      primaryColor: '#eee8d5',
                                      primaryTextColor: '#586e75',
                                      primaryBorderColor: '#93a1a1',
                                      lineColor: '#93a1a1',
                                      secondaryColor: '#fdf6e3',
                                      tertiaryColor: '#eee8d5'
                                    }) : '{}'}
                                  });
                                  setTimeout(() => {
                                    window.print();
                                    // window.close();
                                  }, 1500);
                                };
                              </script>
                            </body>
                          </html>
                        `);
                        printWin.document.close();
                      }
                    }}
                    className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-blue-600 flex items-center gap-2 text-xs font-semibold"
                    title="พิมพ์เป็น PDF / Print to PDF"
                  >
                    <Download size={18} />
                    <span className="hidden sm:inline">พิมพ์ PDF</span>
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block" />
                </>
              )}
              <button 
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800"
                title={isMaximized ? "ย่อหน้าต่าง" : "ขยายเต็มจอ"}
              >
                <ExternalLink size={18} />
              </button>
              <button 
                onClick={onClose}
                className="p-2.5 hover:bg-red-50 rounded-xl transition-colors text-slate-500 hover:text-red-500 ml-1"
                title="ปิด"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50">
            {!selectedDoc ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 p-12">
                <BookOpen size={64} className="text-slate-200" />
                <p className="text-sm font-medium">เลือกเอกสารที่ต้องการดูจากเมนูด้านซ้าย</p>
              </div>
            ) : docLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-blue-500">
                <Loader2 className="animate-spin" size={40} />
                <p className="text-sm mt-4 font-semibold text-slate-400">กำลังโหลดเนื้อหา...</p>
              </div>
            ) : (
              <div className={`${isMaximized ? "max-w-none px-12 lg:px-24" : "max-w-5xl px-8 lg:px-16"} mx-auto ${isSolarized ? 'bg-[#fdf6e3]' : 'bg-white'} min-h-full shadow-sm border-x border-slate-100 py-12`}>
                {/* Metadata positioned right under the Title (h1) */}
                <div className="mb-8">
                  <h1 className={`${isSolarized ? 'text-[#b58900]' : 'text-slate-800'} text-2xl font-extrabold mb-1`}>
                    {docs.find(d => d.name === selectedDoc)?.title}
                  </h1>
                  <div className={`flex items-center gap-3 ${isSolarized ? 'text-[#93a1a1]' : 'text-slate-400'} text-xs font-semibold`}>
                    <span className="flex items-center gap-1"><Clock size={12} /> อัปเดตเมื่อ {new Date(docs.find(d => d.name === selectedDoc)?.modified || '').toLocaleDateString("th-TH")}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><HardDrive size={12} /> {fmtSize(docs.find(d => d.name === selectedDoc)?.size || 0)}</span>
                  </div>
                  <div className={`mt-6 border-b-2 ${isSolarized ? 'border-[#eee8d5]' : 'border-slate-100'}`} />
                </div>

                <style>{`
                  .md-preview-root { font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', 'Consolas', monospace; font-size: 0.8125rem; line-height: 1.8; color: ${isSolarized ? '#586e75' : '#334155'}; }
                  .md-h1 { display: none; } /* Hidden inside root if already shown in the manual metadata block above */
                  .md-preview-root .md-h1 { display: block; font-size: 1.6rem; font-weight: 800; color: ${isSolarized ? '#b58900' : '#0f172a'}; margin: 0 0 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid ${isSolarized ? '#eee8d5' : '#f1f5f9'}; line-height: 1.2; }
                  .md-h2 { font-size: 1.3rem; font-weight: 700; color: ${isSolarized ? '#b58900' : '#1e293b'}; margin: 2.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid ${isSolarized ? '#eee8d5' : '#f8fafc'}; }
                  .md-h3 { font-size: 1.15rem; font-weight: 700; color: ${isSolarized ? '#cb4b16' : '#334155'}; margin: 1.8rem 0 0.8rem; }
                  .md-p { margin-bottom: 1.25rem; text-align: justify; }
                  .md-blockquote { border-left: 4px solid ${isSolarized ? '#93a1a1' : '#e2e8f0'}; padding: 1rem 1.5rem; color: ${isSolarized ? '#93a1a1' : '#64748b'}; font-style: italic; background: ${isSolarized ? '#eee8d5' : '#f8fafc'}; border-radius: 0 0.75rem 0.75rem 0; margin: 1.5rem 0; }
                  .md-code-block { background: ${isSolarized ? '#eee8d5' : '#0f172a'}; color: ${isSolarized ? '#657b83' : '#f8fafc'}; padding: 1.5rem; border-radius: 1rem; margin: 1.5rem 0; overflow-x: auto; font-size: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid ${isSolarized ? '#93a1a1/20' : 'transparent'}; }
                  .md-inline-code { background: ${isSolarized ? '#eee8d5' : '#f1f5f9'}; color: ${isSolarized ? '#dc322f' : '#e11d48'}; padding: 0.2rem 0.4rem; border-radius: 0.4rem; font-weight: 600; }
                  .md-table-wrap { overflow-x: auto; margin: 1.5rem 0; border-radius: 1rem; border: 1px solid ${isSolarized ? '#93a1a1' : '#e2e8f0'}; background: ${isSolarized ? '#fdf6e3' : 'white'}; max-height: none; display: block; }
                  .md-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
                  .md-table th { background: ${isSolarized ? '#eee8d5' : '#f8fafc'}; padding: 1rem; text-align: left; font-weight: 700; color: ${isSolarized ? '#586e75' : '#475569'}; border-bottom: 2px solid ${isSolarized ? '#93a1a1' : '#e2e8f0'}; }
                  .md-table td { padding: 1rem; border-bottom: 1px solid ${isSolarized ? '#eee8d5' : '#f1f5f9'}; color: ${isSolarized ? '#657b83' : '#64748b'}; white-space: pre; }
                  .md-table tr:hover td { background: ${isSolarized ? '#eee8d5/50' : '#f1f5f9/30'}; color: ${isSolarized ? '#073642' : '#0f172a'}; }
                  .md-alert { padding: 1rem 1.5rem; border-radius: 0.75rem; border-left: 4px solid transparent; margin: 1.5rem 0; }
                  .md-alert-NOTE { background: ${isSolarized ? '#eff6ff' : '#eff6ff'}; border-left-color: #3b82f6; color: #1e40af; }
                  .md-hr { border: 0; border-top: 2px solid ${isSolarized ? '#eee8d5' : '#f1f5f9'}; margin: 2rem 0; }
                  .md-ul, .md-ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
                  .md-li, .md-oli { margin-bottom: 0.4rem; }
                  .md-ul { list-style-type: disc; }
                  .md-ol { list-style-type: decimal; }
                  .mermaid { background: ${isSolarized ? '#eee8d5' : 'white'}; padding: 1.5rem; border-radius: 1rem; margin: 1.5rem 0; text-align: center; }
                  .mermaid svg { max-width: 100%; height: auto; }
                `}</style>
                <div className="md-preview-root" dangerouslySetInnerHTML={{ __html: mdToHtml(docContent) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
