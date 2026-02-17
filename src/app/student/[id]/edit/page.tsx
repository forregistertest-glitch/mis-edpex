"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { StudentService } from "@/services/studentService";
import { useAuth } from "@/contexts/AuthContext";
import StudentForm from "@/components/student/StudentForm";
import { GraduateStudent } from "@/types/student";

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const { user } = useAuth();
  
  const [initialData, setInitialData] = useState<GraduateStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const data = await StudentService.getStudentByStudentId(studentId);
      if (data) {
        setInitialData(data);
      } else {
        setError("Student not found");
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Partial<GraduateStudent>) => {
    if (!user?.email) {
      setError("Please login to continue");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await StudentService.updateStudent(studentId, formData, user.email);
      router.push("/student");
      router.refresh();
    } catch (err: any) {
      console.error("Update failed:", err);
      setError(err.message || "Failed to update student data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-500 font-medium">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sarabun">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/student"
                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">แก้ไขข้อมูลนิสิต</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            {error}
          </div>
        )}

        {initialData && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
            <StudentForm
              initialData={initialData}
              isEdit={true}
              onSubmit={handleSubmit}
              onCancel={() => router.push("/student")}
              loading={saving}
            />
          </div>
        )}
      </div>
    </div>
  );
}
