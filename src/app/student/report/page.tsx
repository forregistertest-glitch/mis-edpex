"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, CheckCircle2, AlertTriangle, GraduationCap, FileText, Download } from "lucide-react";
import { StudentService } from "@/services/studentService";
import { AcademicService } from "@/services/academicService";
import { GraduateStudent } from "@/types/student";
import { StudentPublication, StudentProgress } from "@/types/academic";
import { analyzeStudentStatus, AcademicStatusReport } from "@/utils/academicCalculations";

export default function StudentReportPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<AcademicStatusReport[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    onTrack: 0,
    delayed: 0,
    ready: 0,
    graduated: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [students, publications, progressItems] = await Promise.all([
        StudentService.getAllStudents(),
        AcademicService.getAllPublications(),
        AcademicService.getAllProgress()
      ]);

      const reportData = students.map(student => {
        const studentPubs = publications.filter(p => p.student_id === student.student_id);
        const studentProgress = progressItems.filter(p => p.student_id === student.student_id);
        return analyzeStudentStatus(student, studentPubs, studentProgress);
      });

      setReports(reportData);

      // Calculate Stats
      const statCounts = {
        total: reportData.length,
        onTrack: reportData.filter(r => r.alerts.length === 0 && r.status !== "Graduated" && r.status !== "Reitired").length,
        delayed: reportData.filter(r => r.alerts.length > 0).length,
        ready: reportData.filter(r => r.status.includes("พร้อมจบ") || r.status.includes("Ready")).length,
        graduated: reportData.filter(r => r.status === "สำเร็จ" || r.status === "Graduated").length
      };
      setStats(statCounts);

    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    alert("Functionality to export detailed report as CSV coming soon!");
    // Implement similar to exportStudentsToExcel but with report fields
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 font-sarabun max-w-7xl">
      <div className="flex justify-between items-center mb-8">
         <div className="flex items-center gap-4">
           <Link href="/student" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
              <ArrowLeft size={24} />
           </Link>
           <div>
             <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="text-purple-600" />
                รายงานสถานะนิสิต (Academic Dashboard)
             </h1>
             <p className="text-gray-500 text-sm mt-1">วิเคราะห์ข้อมูลจาก Progress และ Publications</p>
           </div>
         </div>
         <button onClick={exportReport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Download size={16} /> Export Report
         </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">นิสิตทั้งหมด</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</h3>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-400"><GraduationCap size={24} /></div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">ปกติ (On Track)</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.onTrack}</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-green-500"><CheckCircle2 size={24} /></div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">แจ้งเตือน (Needs Attention)</p>
                <h3 className="text-3xl font-bold text-amber-500 mt-2">{stats.delayed}</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-amber-500"><AlertTriangle size={24} /></div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">พร้อมจบ (Ready)</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-2">{stats.ready}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-500"><GraduationCap size={24} /></div>
           </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
           <h3 className="font-bold text-gray-700 flex items-center gap-2">
             <FileText size={18} /> รายละเอียดรายบุคคล
           </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 font-semibold">รหัสนิสิต</th>
                <th className="p-4 font-semibold">ชื่อ-นามสกุล</th>
                <th className="p-4 font-semibold text-center">English</th>
                <th className="p-4 font-semibold text-center">Proposal</th>
                <th className="p-4 font-semibold text-center">Thesis/Defense</th>
                <th className="p-4 font-semibold text-center">Publications</th>
                <th className="p-4 font-semibold">Status Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((r) => (
                <tr key={r.studentId} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono font-medium">{r.studentId}</td>
                  <td className="p-4 ">
                    <div className="font-bold text-gray-800">{r.fullName}</div>
                    <div className="text-xs text-gray-500">{r.degreeLevel}</div>
                  </td>
                  <td className="p-4 text-center">
                    {r.hasPassedEnglish 
                      ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" title="Passed"></span> 
                      : <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-300" title="Not Passed"></span>}
                  </td>
                  <td className="p-4 text-center">
                    {r.hasPassedProposal
                      ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" title="Passed"></span> 
                      : <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-300" title="Not Passed"></span>}
                  </td>
                  <td className="p-4 text-center">
                    {r.hasPassedThesis
                      ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" title="Passed"></span> 
                      : <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-300" title="Not Passed"></span>}
                  </td>
                   <td className="p-4 text-center font-medium text-gray-700">
                    {r.publicationCount} <span className="text-xs text-gray-400 font-normal">({r.journalCount} J / {r.conferenceCount} C)</span>
                  </td>
                  <td className="p-4">
                    {r.alerts.length > 0 ? (
                       <ul className="list-disc list-inside text-xs text-red-600">
                          {r.alerts.map((a, i) => <li key={i}>{a}</li>)}
                       </ul>
                    ) : (
                       <span className="text-green-600 text-xs font-bold border border-green-200 bg-green-50 px-2 py-1 rounded-full">On Track / Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
