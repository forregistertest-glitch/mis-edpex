"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, BookOpen, AlertCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function EditResearchPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const researchId = params.id as string;

    // States
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mockTitle, setMockTitle] = useState("");

    // ดึงข้อมูลเดิม (จำลอง)
    useEffect(() => {
        if (!researchId) return;

        const fetchExistingData = async () => {
            try {
                // TODO: ResearchService.getResearchById(researchId)
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
                setMockTitle(`งานวิจัยรหัส (Mock) ID: ${researchId}`);
            } catch (err: any) {
                setError("ไม่พบข้อมูลงานวิจัยที่ระบุ หรือเกิดข้อผิดพลาด");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchExistingData();
    }, [researchId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // TODO: ResearchService.updateResearch(researchId, data)
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate update
            alert("อัปเดตข้อมูลแบบร่างสำเร็จ (ยังไม่เซฟลงฐานข้อมูลจริง)");
            router.push('/research');
        } catch (err) {
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 text-gray-500">
                    <Loader2 className="animate-spin text-indigo-500" size={48} />
                    <p>กำลังโหลดข้อมูลงานวิจัยรหัส {researchId}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 max-w-4xl text-center mt-20">
                <AlertCircle size={64} className="text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">{error}</h2>
                <Link href="/research" className="inline-block mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">กลับหน้าหลัก</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 font-sarabun max-w-4xl">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/research" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <div className="bg-amber-600 p-2 rounded-lg shadow-sm">
                            <BookOpen size={24} className="text-white" />
                        </div>
                        แก้ไขข้อมูลงานวิจัย
                    </h1>
                </div>
                <div className="ml-[60px] text-gray-500 text-sm">รหัสเอกสารอ้างอิง: {researchId}</div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-amber-50/30">
                    <h2 className="text-lg font-bold text-gray-800">{mockTitle || "กำลังโหลด..."}</h2>
                    <p className="text-sm text-gray-500 mt-1">สามารถปรับปรุงแก้ไขข้อมูลทั่วไปและรายชื่อผู้แต่งได้</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-400 mb-2">บริเวณส่วนสร้างแบบฟอร์ม (Form Builder Area)</h3>
                        <p className="text-sm text-gray-500">
                            (รอฟอร์มสำหรับการแก้ไขข้อมูล เช่นเดียวกับหน้าเพิ่มข้อมูลใหม่)
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
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors disabled:opacity-70"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        บันทึกการแก้ไข
                    </button>
                </div>
            </form>
        </div>
    );
}
