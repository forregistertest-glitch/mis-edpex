"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function NewResearchPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // TODO: Implement save logic to Firestore here using ResearchService.addResearch(data)
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
            alert("บันทึกข้อมูลแบบร่างสำเร็จ (ยังไม่เซฟลงฐานข้อมูลจริง)");
            router.push('/research');
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto p-6 font-sarabun max-w-4xl">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/research" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                            <BookOpen size={24} className="text-white" />
                        </div>
                        เพิ่มข้อมูลงานวิจัยใหม่ (Manual Entry)
                    </h1>
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">ข้อมูลทั่วไป (General Information)</h2>
                    <p className="text-sm text-gray-500 mt-1">กรอกข้อมูลพื้นฐานของงานวิจัยหรือบทความวิชาการ</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-400 mb-2">บริเวณส่วนสร้างแบบฟอร์ม (Form Builder Area)</h3>
                        <p className="text-sm text-gray-500">
                            (โครงสร้างเตรียมพร้อมสำหรับเชื่อมต่อกับ ResearchRecord Interface) <br />
                            <b>ตัวอย่างฟิลด์ที่ต้องมี:</b> Title, Year, Journal, Authors List, DOI, etc.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <Link
                        href="/research"
                        className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-70"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        บันทึกข้อมูล
                    </button>
                </div>
            </form>
        </div>
    );
}
