"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PostgraduateForm from "@/components/data-management/postgraduate/PostgraduateForm";
import { PostgraduateData } from "@/types/data-management";

export default function NewPostgraduatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: Partial<PostgraduateData>) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: เชื่อมต่อกับ Firebase/Database
      console.log("Form Data:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("บันทึกข้อมูลสำเร็จ! (นี่เป็น UI sample - ยังไม่ได้เชื่อมต่อ Database จริง)");
      router.push("/data-management/postgraduate");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/data-management/postgraduate");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sarabun">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/data-management/postgraduate" className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">เพิ่มข้อมูลนิสิตบัณฑิตศึกษา</h1>
                <p className="text-slate-500 text-xs md:text-sm">Add New Postgraduate Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Info Banner */}
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-xl mb-6">
          <p className="text-purple-800 text-sm">
            <strong>ข้อมูลบัณฑิตศึกษา:</strong> กรอกข้อมูลนิสิตระดับบัณฑิตศึกษาตาม Excel structure (58 fields) 
            แบ่งเป็น 5 tabs: ข้อมูลส่วนตัว, การศึกษา, ที่ปรึกษา/วิทยานิพนธ์, การสอบ, และความก้าวหน้า
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
          <PostgraduateForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
