"use client";

import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";

interface LoginPageProps {
    onSignIn: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

export default function LoginPage({ onSignIn, loading, error }: LoginPageProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full -ml-40 -mb-40 blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <img
                            src="https://vet.ku.ac.th/vv2018/download/KU/KU_logo.png"
                            alt="KU Logo"
                            className="w-16 h-16 object-contain drop-shadow-lg"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">KUVMIS</h1>
                    <p className="text-blue-200/80 text-sm leading-relaxed">
                        ระบบสารสนเทศเพื่อการจัดการ (MIS)<br />
                        และการวิเคราะห์ KPI (EdPEx)
                    </p>
                    <p className="text-blue-300/50 text-xs mt-2">
                        คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเกษตรศาสตร์
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={28} className="text-blue-300" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">เข้าสู่ระบบ</h2>
                        <p className="text-blue-200/60 text-sm">ใช้ Google Account ที่ได้รับอนุญาต</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl flex items-start gap-3">
                            <AlertCircle size={18} className="text-red-300 mt-0.5 flex-shrink-0" />
                            <p className="text-red-200 text-sm leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* Google Sign-In Button */}
                    <button
                        onClick={onSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-slate-800 rounded-2xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        {loading ? "กำลังเข้าสู่ระบบ..." : "Sign in with Google"}
                    </button>

                    <p className="text-center text-blue-300/40 text-xs mt-6">
                        เฉพาะบุคลากรที่ได้รับอนุญาตเท่านั้น (@ku.th)
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-blue-300/30 text-[11px] mt-6">
                    KUVMIS v1.0 · ปีการศึกษา 2568
                </p>
            </div>
        </div>
    );
}
