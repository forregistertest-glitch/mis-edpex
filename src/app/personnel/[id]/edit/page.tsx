"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Personnel } from "@/types/personnel";
import { PersonnelService } from "@/services/personnelService";
import { getPersonnelById } from "@/lib/data-service";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, Edit } from "lucide-react";
import Link from "next/link";
import PersonnelForm from "@/components/personnel/PersonnelForm";

export default function EditPersonnelPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPersonnel() {
      if (!id) return;
      try {
        const data = await getPersonnelById(id);
        if (data) {
          setPersonnel(data);
        } else {
          setError("ไม่พบข้อมูลบุคลากร");
        }
      } catch (err) {
        console.error("Error loading personnel:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    loadPersonnel();
  }, [id]);

  const handleSubmit = async (formData: Partial<Personnel>) => {
    if (!user?.email) {
      setError("คุณต้องเข้าสู่ระบบก่อนดำเนินการ");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await PersonnelService.updatePersonnel(id, formData, user.email);
      router.push("/personnel");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Edit size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">แก้ไขข้อมูลบุคลากร</h1>
                <p className="text-slate-500 text-sm">Update personnel record details</p>
              </div>
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
          {personnel ? (
            <PersonnelForm 
              initialData={personnel}
              isEdit={true}
              onSubmit={handleSubmit}
              onCancel={() => router.push("/personnel")}
              loading={saving}
            />
          ) : (
            <div className="text-center py-12">
               <p className="text-slate-400">ไม่พบข้อมูลที่ต้องการแก้ไข</p>
               <Link href="/personnel" className="mt-4 text-blue-600 hover:underline">กลับไปหน้าหลัก</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
