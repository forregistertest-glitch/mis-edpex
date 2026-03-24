"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import HRDataForm from "@/components/data-management/hr-data/HRDataForm";

export default function NewHRDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: เชื่อมต่อกับ Firebase/Database
      console.log("Form Data:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("บันทึกข้อมูลสำเร็จ! (นี่เป็น UI sample - ยังไม่ได้เชื่อมต่อ Database จริง)");
      router.push("/data-management/hr-data");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/data-management/hr-data");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sarabun">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/data-management/hr-data" className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">เพิ่มข้อมูลบุคลากร</h1>
                <p className="text-slate-500 text-xs md:text-sm">Add New HR Data</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Info Banner */}
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl mb-6">
          <p className="text-indigo-800 text-sm">
            <strong>ข้อมูลบุคลากร:</strong> Form ครบถ้วนตาม HR_MIS.xlsx (17 sheets) 
            แบ่งเป็น 10 tabs: ข้อมูลทั่วไป, ที่อยู่, การจ้างงาน, บัญชีธนาคาร, วุฒิการศึกษา, ครอบครัว, เครื่องราช, เลื่อนเงินเดือน, ลาศึกษา/ฝึกอบรม, และสถิติเวลาทำงาน
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <HRDataForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
