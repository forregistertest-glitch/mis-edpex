"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Personnel } from "@/types/personnel";
import { PersonnelService } from "@/services/personnelService";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PersonnelForm from "@/components/personnel/PersonnelForm";
import { checkPersonnelIdExists } from "@/lib/data-service";

export default function NewPersonnelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: Partial<Personnel>) => {
    if (!user?.email) {
      setError("คุณต้องเข้าสู่ระบบก่อนดำเนินการ");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check duplicate ID
      const existingId = await checkPersonnelIdExists(formData.personnel_id || "");
      if (existingId) {
         if (confirm(`พบรหัสบุคลากร ${formData.personnel_id} ในระบบแล้ว คุณต้องการไปที่หน้าแก้ไขข้อมูลของรหัสดังกล่าวหรือไม่?`)) {
          router.push(`/personnel?edit=${existingId}`);
          return;
        }
        setLoading(false);
        return;
      }

      await PersonnelService.addPersonnel(formData as Personnel, user.email);
      router.push("/personnel");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/personnel"
              className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">เพิ่มบุคลากรใหม่</h1>
              <p className="text-slate-500 text-sm">Create a new personnel record</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <PersonnelForm 
            onSubmit={handleSubmit}
            onCancel={() => router.push("/personnel")}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
