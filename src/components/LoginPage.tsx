"use client";

import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface LoginPageProps {
    onSignIn: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

export default function LoginPage({ onSignIn, loading, error }: LoginPageProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ backgroundColor: '#71C5E8' }}>
            {/* Subtle decorations — lighter/darker circles */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full -ml-40 -mb-40 blur-3xl"
                style={{ backgroundColor: 'rgba(19,48,69,0.10)' }} />

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Title — White + text-shadow */}
                {/* Login Card — White card on light blue bg */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 p-2 bg-white/80 shadow-sm border border-slate-100">
                             <Image
                                src="https://vet.ku.ac.th/vv2018/download/KU/KU_logo.png"
                                alt="KU Logo"
                                width={96}
                                height={96}
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                        <h2 className="text-xl font-bold mb-1 text-slate-800">
                            ระบบสารสนเทศเพื่อการจัดการ (MIS)<br/>
                            และการวิเคราะห์ KPI (EdPEx)
                        </h2>
                        <p className="text-sm font-medium text-slate-600 mt-2">
                            คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเกษตรศาสตร์
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-red-600 text-sm leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* Google Sign-In Button */}
                    <button
                        onClick={onSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 rounded-2xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
                        style={{ color: '#133045' }}
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

                    <p className="text-center text-xs mt-6" style={{ color: '#5ab0d5' }}>
                        เฉพาะบุคลากรที่ได้รับอนุญาตเท่านั้น (@ku.th)
                    </p>

                    {/* Features Checklist */}
                    <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
                         <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <ShieldCheck size={14} className="text-green-400" />
                            <span>Audit Logging (ALCOA+): ระบบบันทึกการเปลี่ยนแปลงข้อมูล</span>
                         </div>
                         <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <ShieldCheck size={14} className="text-green-400" />
                            <span>Google Authorization</span>
                         </div>
                         <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <ShieldCheck size={14} className="text-green-400" />
                            <span>Permission and User management</span>
                         </div>
                         <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <ShieldCheck size={14} className="text-green-400" />
                            <span>Login record: log</span>
                         </div>
                    </div>

                    {/* Quote */}
                    <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                        <p className="text-xl font-serif italic text-slate-300 leading-relaxed">
                            &ldquo;ไม่ต้องรู้ทุกเรื่อง แต่รู้ให้จริงในสิ่งที่ควรรู้&rdquo;
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] mt-6" style={{ color: '#133045', opacity: 0.6 }}>
                    KUVMIS v1.0 · Last update: 16 Feb 2026 12:11 TH
                </p>
            </div>
        </div>
    );
}
