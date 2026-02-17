"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { StudentService } from "@/services/studentService";
import { GraduateStudent } from "@/types/student";

export default function StudentSearchPage() {
  const router = useRouter();
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    student?: GraduateStudent;
    searched: boolean;
  }>({ found: false, searched: false });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    try {
      const student = await StudentService.getStudentByStudentId(searchId.trim());
      setSearchResult({
        found: !!student,
        student: student || undefined,
        searched: true,
      });
    } catch (error) {
      console.error("Search error:", error);
      setSearchResult({ found: false, searched: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToEdit = () => {
    if (searchResult.student) {
      router.push(`/student/${searchResult.student.student_id}/edit`);
    }
  };

  const handleGoToNew = () => {
    router.push(`/student/new?student_id=${encodeURIComponent(searchId.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-600" />
            ค้นหาข้อมูลนิสิต
          </h1>
          <p className="text-sm text-gray-500 mt-1">กรอกรหัสนิสิตเพื่อค้นหาและแก้ไขข้อมูล หรือเพิ่มนิสิตใหม่</p>
        </div>
      </div>

      {/* Search Area */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => {
                  setSearchId(e.target.value);
                  setSearchResult({ found: false, searched: false });
                }}
                placeholder="กรอกรหัสนิสิต เช่น 6214900083"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg 
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none
                  transition-all duration-200"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchId.trim()}
              className="px-6 py-3.5 bg-emerald-600 text-white rounded-xl font-medium
                hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200 flex items-center gap-2 min-w-[120px] justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  ค้นหา
                </>
              )}
            </button>
          </form>

          {/* Search Results */}
          {searchResult.searched && (
            <div className="mt-8">
              {searchResult.found && searchResult.student ? (
                /* Found Student */
                <div className="border-2 border-emerald-200 bg-emerald-50 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          พบข้อมูล
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {searchResult.student.full_name_th}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">รหัสนิสิต:</span>{" "}
                          {searchResult.student.student_id}
                        </p>
                        <p>
                          <span className="font-medium">ระดับ:</span>{" "}
                          {searchResult.student.degree_level}
                        </p>
                        <p>
                          <span className="font-medium">สาขา:</span>{" "}
                          {searchResult.student.major_name}
                        </p>
                        <p>
                          <span className="font-medium">สถานะ:</span>{" "}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            searchResult.student.current_status?.includes("จบ") || searchResult.student.current_status?.includes("สำเร็จ")
                              ? "bg-blue-100 text-blue-800"
                              : searchResult.student.current_status?.includes("ศึกษา")
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}>
                            {searchResult.student.current_status}
                          </span>
                        </p>
                        {searchResult.student.advisor_name && (
                          <p>
                            <span className="font-medium">อาจารย์ที่ปรึกษา:</span>{" "}
                            {searchResult.student.advisor_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleGoToEdit}
                      className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-medium
                        hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      แก้ไขข้อมูล
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Not Found */
                <div className="border-2 border-amber-200 bg-amber-50 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <span className="text-amber-800 font-medium">
                          ไม่พบข้อมูลนิสิตรหัส &quot;{searchId}&quot;
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        ต้องการเพิ่มนิสิตใหม่ด้วยรหัสนี้หรือไม่?
                      </p>
                    </div>
                    <button
                      onClick={handleGoToNew}
                      className="px-5 py-3 bg-amber-500 text-white rounded-xl font-medium
                        hover:bg-amber-600 transition-colors duration-200 flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      เพิ่มนิสิตใหม่
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 text-center text-sm text-gray-400">
          💡 พิมพ์รหัสนิสิต 10 หลัก แล้วกดค้นหา ระบบจะตรวจสอบฐานข้อมูลให้อัตโนมัติ
        </div>
      </div>
    </div>
  );
}
