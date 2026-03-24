"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ResidencyForm from "@/components/data-management/academic/ResidencyForm";
import InternForm from "@/components/data-management/academic/InternForm";
import { ResidencyData, InternData } from "@/types/data-management";

export default function NewAcademicPage() {
  const router = useRouter();
  const [dataType, setDataType] = useState<"residency" | "intern">("residency");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResidencySubmit = async (formData: ResidencyData) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: เชื่อมต่อกับ Firebase/Database
      console.log("Residency Data:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("บันทึกข้อมูล Residency สำเร็จ! (นี่เป็น UI sample - ยังไม่ได้เชื่อมต่อ Database จริง)");
      router.push("/data-management/academic");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleInternSubmit = async (formData: InternData) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: เชื่อมต่อกับ Firebase/Database
      console.log("Intern Data:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("บันทึกข้อมูล Intern สำเร็จ! (นี่เป็น UI sample - ยังไม่ได้เชื่อมต่อ Database จริง)");
      router.push("/data-management/academic");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/data-management/academic");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sarabun">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/data-management/academic" className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">เพิ่มข้อมูลการศึกษา</h1>
                <p className="text-slate-500 text-xs md:text-sm">Add New Academic Data</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Info Banner */}
        <div className="bg-sky-50 border-l-4 border-sky-500 p-4 rounded-r-xl mb-6">
          <p className="text-sky-800 text-sm">
            <strong>ข้อมูลการศึกษา:</strong> เลือกประเภทข้อมูลที่ต้องการเพิ่ม - 
            <span className="font-semibold"> Residency</span> (สัตวแพทย์ประจำบ้าน) หรือ 
            <span className="font-semibold"> Intern</span> (นักศึกษาฝึกงาน)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {/* Type Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">เลือกประเภทข้อมูล</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDataType("residency")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  dataType === "residency"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-100"
                    : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                }`}
              >
                <div className="text-lg font-bold mb-1">🩺 Residency</div>
                <div className="text-sm text-slate-600">สัตวแพทย์ประจำบ้าน</div>
                <div className="text-xs text-slate-500 mt-2">ข้อมูลการฝึกอบรม อาจารย์ที่ปรึกษา การสอบ และผลงานวิจัย</div>
              </button>
              <button
                type="button"
                onClick={() => setDataType("intern")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  dataType === "intern"
                    ? "border-sky-600 bg-sky-50 text-sky-700 shadow-lg shadow-sky-100"
                    : "border-slate-200 hover:border-sky-300 hover:bg-slate-50"
                }`}
              >
                <div className="text-lg font-bold mb-1">👨‍🎓 Intern</div>
                <div className="text-sm text-slate-600">นักศึกษาฝึกงาน</div>
                <div className="text-xs text-slate-500 mt-2">ข้อมูลการศึกษา การสมัคร และการคัดเลือก</div>
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          {dataType === "residency" ? (
            <ResidencyForm
              onSubmit={handleResidencySubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          ) : (
            <InternForm
              onSubmit={handleInternSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
