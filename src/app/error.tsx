"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("App error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 max-w-md w-full text-center space-y-5">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} className="text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">เกิดข้อผิดพลาด</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    ระบบพบปัญหาที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
                </p>
                {error.digest && (
                    <p className="text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg inline-block">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="flex gap-3 justify-center pt-2">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95"
                    >
                        <RotateCcw size={16} />
                        ลองใหม่
                    </button>
                    <a
                        href="/"
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all"
                    >
                        <Home size={16} />
                        หน้าแรก
                    </a>
                </div>
            </div>
        </div>
    );
}
