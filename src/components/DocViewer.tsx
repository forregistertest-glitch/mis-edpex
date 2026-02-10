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
    codeBlocks.push(
      `<pre class="md-code-block"><code class="language-${lang || "text"}">${code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</code></pre>`
    );
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
export default function DocViewer({ lang, onClose }: { lang: "th" | "en"; onClose: () => void }) {
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [docContent, setDocContent] = useState("");
  const [docLoading, setDocLoading] = useState(false);

  const t = lang === "th";

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((data) => setDocs(data.docs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openDoc = async (fileName: string) => {
    setDocLoading(true);
    setSelectedDoc(fileName);
    try {
      const res = await fetch(`/api/docs?file=${encodeURIComponent(fileName)}`);
      const data = await res.json();
      setDocContent(data.content || "");
    } catch (err) {
      setDocContent("Error loading document");
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

  const iconMap: Record<string, string> = {
    "app_architecture": "🏗️",
    "database_design": "🗄️",
    "data_dictionary": "📖",
    "features_list": "⭐",
    "input_manual": "📝",
    "firebase_capacity": "🔥",
  };

  const getIcon = (name: string) => {
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) return icon;
    }
    return "📄";
  };

  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // ── Full-screen overlay ──
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 mx-auto my-6 w-full max-w-6xl flex bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200" style={{ maxHeight: "calc(100vh - 48px)" }}>
        
        {/* Sidebar — File List */}
        <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={20} className="text-blue-600" />
                {t ? "เอกสารประกอบ" : "Documentation"}
              </h3>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t ? `${docs.length} ไฟล์ในโฟลเดอร์ doc/` : `${docs.length} files in doc/`}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loading ? (
              <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-400" size={24} /></div>
            ) : (
              docs.map((doc) => (
                <button
                  key={doc.name}
                  onClick={() => openDoc(doc.name)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                    selectedDoc === doc.name
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "hover:bg-white hover:shadow-md text-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">{getIcon(doc.name)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${selectedDoc === doc.name ? "text-white" : "text-slate-800"}`}>
                        {doc.title}
                      </p>
                      <div className={`flex items-center gap-2 mt-1 text-[11px] ${selectedDoc === doc.name ? "text-white/70" : "text-slate-400"}`}>
                        <span className="flex items-center gap-0.5"><HardDrive size={10} />{fmtSize(doc.size)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Clock size={10} />{new Date(doc.modified).toLocaleDateString("th-TH")}</span>
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
          {selectedDoc && (
            <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-slate-800">{selectedDoc}</span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Markdown</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => downloadDoc(selectedDoc)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600" title={t ? "ดาวน์โหลด" : "Download"}>
                  <Download size={16} />
                </button>
                <button onClick={() => { navigator.clipboard.writeText(docContent); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600" title={t ? "คัดลอก" : "Copy"}>
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {!selectedDoc ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 p-12">
                <BookOpen size={48} className="text-slate-300" />
                <p className="text-lg font-semibold">{t ? "เลือกเอกสารจากรายการด้านซ้าย" : "Select a document from the list"}</p>
                <p className="text-sm text-center max-w-sm">
                  {t
                    ? "คลิกที่ชื่อเอกสารเพื่อดู preview แบบสวยงาม พร้อมดาวน์โหลดและคัดลอก"
                    : "Click a document name to see a beautifully rendered preview, download or copy."}
                </p>
              </div>
            ) : docLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-blue-400" size={32} />
              </div>
            ) : (
              <div className="p-8 lg:p-12 max-w-4xl mx-auto">
                <style>{`
                  .md-preview-root { font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', 'Consolas', monospace; font-size: 0.8125rem; line-height: 1.8; color: #475569; }
                  .md-h1 { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e2e8f0; line-height: 1.3; }
                  .md-h2 { font-size: 1.2rem; font-weight: 700; color: #334155; margin: 1.75rem 0 0.75rem; padding-bottom: 0.375rem; border-bottom: 1px solid #f1f5f9; }
                  .md-h3 { font-size: 1rem; font-weight: 700; color: #475569; margin: 1.25rem 0 0.5rem; }
                  .md-h4 { font-size: 0.9rem; font-weight: 600; color: #64748b; margin: 1rem 0 0.375rem; }
                  .md-p { color: #475569; line-height: 1.8; margin: 0.5rem 0; }
                  .md-inline-code { background: #f1f5f9; color: #6366f1; padding: 0.125rem 0.375rem; border-radius: 0.375rem; font-weight: 600; }
                  .md-code-block { background: #1e293b; color: #e2e8f0; padding: 1.25rem 1.5rem; border-radius: 0.75rem; overflow-x: auto; margin: 1rem 0; line-height: 1.7; border: 1px solid #334155; }
                  .md-code-block code { white-space: pre; }
                  .md-blockquote { border-left: 4px solid #6366f1; padding: 0.75rem 1.25rem; margin: 1rem 0; background: #f8fafc; border-radius: 0 0.5rem 0.5rem 0; color: #475569; font-style: italic; }
                  .md-alert { padding: 0.75rem 1.25rem; margin: 0.75rem 0; border-radius: 0.75rem; border-left: 4px solid; }
                  .md-alert-NOTE { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }
                  .md-alert-TIP { background: #f0fdf4; border-color: #22c55e; color: #166534; }
                  .md-alert-IMPORTANT { background: #faf5ff; border-color: #a855f7; color: #6b21a8; }
                  .md-alert-WARNING { background: #fffbeb; border-color: #f59e0b; color: #92400e; }
                  .md-alert-CAUTION { background: #fef2f2; border-color: #ef4444; color: #991b1b; }
                  .md-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, #cbd5e1, transparent); margin: 2rem 0; }
                  .md-table-wrap { overflow-x: auto; margin: 1rem 0; border-radius: 0.75rem; border: 1px solid #e2e8f0; }
                  .md-table { width: 100%; border-collapse: collapse; }
                  .md-table th { background: #f8fafc; padding: 0.5rem 0.75rem; text-align: left; font-weight: 700; color: #334155; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
                  .md-table td { padding: 0.375rem 0.75rem; border-bottom: 1px solid #f1f5f9; color: #64748b; white-space: pre; }
                  .md-table tr:hover td { background: #f8fafc; }
                  .md-ul, .md-ol { margin: 0.5rem 0; padding-left: 1.5rem; }
                  .md-li, .md-oli { color: #475569; line-height: 1.8; margin: 0.25rem 0; }
                  .md-ul { list-style-type: disc; }
                  .md-ol { list-style-type: decimal; }
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
