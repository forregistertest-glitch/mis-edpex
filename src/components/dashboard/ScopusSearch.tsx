
"use client";

import { useState } from "react";
import { Search, Loader2, BookOpen, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { ScopusService, ScopusPublication } from "@/services/scopusService";
import ScopusAutoSync from "./ScopusAutoSync";

interface Props {
    lang: "th" | "en";
}

export default function ScopusSearch({ lang }: Props) {
    const [activeTab, setActiveTab] = useState<'search' | 'autosync'>('search');
    const [mode, setMode] = useState<'author' | 'query'>('author');
    const [input, setInput] = useState("");
    const [results, setResults] = useState<ScopusPublication[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setError("");
        setSearched(true);
        setResults([]);

        try {
            let data: ScopusPublication[] = [];
            if (mode === 'author') {
                if (!/^\d+$/.test(input.trim())) {
                    throw new Error(lang === 'th' ? "Author ID ต้องเป็นตัวเลขเท่านั้น" : "Author ID must be numeric");
                }
                data = await ScopusService.searchByAuthorId(input.trim());
            } else {
                data = await ScopusService.searchByQuery(input.trim());
            }
            setResults(data);
        } catch (err: any) {
            setError(err.message || "Search failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 pb-0 space-y-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen className="text-blue-600" size={24} />
                            Scopus Research Manager
                        </h2>
                        <p className="text-sm text-slate-500">
                            {lang === 'th' 
                                ? "จัดการและสืบค้นข้อมูลงานวิจัยจากฐานข้อมูล Scopus" 
                                : "Manage and search research publications from Scopus database"}
                        </p>
                    </div>

                    {/* Main Tabs */}
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
                                activeTab === 'search' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {lang === 'th' ? 'สืบค้น (Manual Search)' : 'Manual Search'}
                        </button>
                        <button
                            onClick={() => setActiveTab('autosync')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                                activeTab === 'autosync' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <RefreshCw size={14} />
                            {lang === 'th' ? 'ดึงข้อมูลอัตโนมัติ (Auto-Sync)' : 'Auto Sync'}
                        </button>
                    </div>
                </div>
                
                {/* Search Inputs (Only in Search Tab) */}
                {activeTab === 'search' && (
                    <div className="p-6 pt-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex rounded-xl bg-slate-100 p-1 shrink-0">
                                <button
                                    onClick={() => setMode('author')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        mode === 'author' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Author ID
                                </button>
                                <button
                                    onClick={() => setMode('query')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        mode === 'query' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Advanced Query
                                </button>
                            </div>

                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder={mode === 'author' 
                                        ? "e.g., 57200508544" 
                                        : "e.g., AUTHOR-NAME(Wongkasemjit) AND AFFIL(Kasetsart)"}
                                    className="w-full pl-4 pr-12 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
                                />
                                <button 
                                    onClick={handleSearch}
                                    disabled={loading || !input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Hints */}
                        <div className="text-xs text-slate-400 flex flex-col gap-1">
                            {mode === 'author' && (
                                <p>ℹ️ {lang === 'th' ? "ค้นหาด้วยรหัส Scopus ID ของผู้แต่ง (แม่นยำที่สุด)" : "Search by exact Scopus Author ID (Most accurate)"}</p>
                            )}
                            {mode === 'query' && (
                                <p>ℹ️ Examples: <code>AUTHOR-NAME(Smith)</code>, <code>TITLE(Neural Networks)</code>, <code>AFFIL(Kasetsart University)</code></p>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {/* AutoSync Content */}
                {activeTab === 'autosync' && (
                     <div className="p-6 pt-6">
                        <ScopusAutoSync lang={lang} />
                     </div>
                )}
            </div>

            {/* Results (Only in Search Tab) */}
            {activeTab === 'search' && searched && !loading && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-slate-700">
                            {lang === 'th' ? `ผลการค้นหา (${results.length})` : `Search Results (${results.length})`}
                        </h3>
                    </div>

                    {results.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-400">{lang === 'th' ? "ไม่พบข้อมูล" : "No results found"}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {results.map((item) => (
                                <div key={item.eid} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                                    {item.subtypeDescription || item.aggregationType || 'Article'}
                                                </span>
                                                <span className="text-slate-400 text-xs">
                                                    {new Date(item.coverDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { year: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-1 italic">
                                                {item.journal}
                                            </p>
                                            {item.doi && (
                                                <p className="text-xs text-slate-400 mt-1 font-mono">
                                                    DOI: {item.doi}
                                                </p>
                                            )}
                                        </div>
                                        <a 
                                            href={item.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View in Scopus"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
