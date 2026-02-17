"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { StudentService } from "@/services/studentService";
import { useAuth } from "@/contexts/AuthContext";
import StudentForm from "@/components/student/StudentForm";
import { GraduateStudent } from "@/types/student";

export default function NewStudentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: Partial<GraduateStudent>) => {
    if (!user?.email) {
      setError("Please login to continue");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await StudentService.addStudent(formData as GraduateStudent, user.email);
      router.push("/student");
      router.refresh();
    } catch (err: any) {
      console.error("Add failed:", err);
      setError(err.message || "Failed to add student. Please check for duplicate Student ID.");
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">เพิ่มนิสิตใหม่</h1>
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

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <StudentForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/student")}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
