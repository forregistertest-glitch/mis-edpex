"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Personnel } from "@/types/personnel";
import { PersonnelService } from "@/services/personnelService";
import { ArrowLeft, BarChart3, PieChart, Users, Download } from "lucide-react";
import * as XLSX from 'xlsx';

export default function PersonnelReportPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const data = await PersonnelService.getAllPersonnel();
      setPersonnel(data);
    } catch (error) {
      console.error("Failed to fetch personnel:", error);
    } finally {
      setLoading(false);
    }
  };

  // Compute Stats
  const stats = {
    total: personnel.length,
    byStatus: {} as Record<string, number>,
    byPosition: {} as Record<string, number>,
    byDegree: {} as Record<string, number>,
    byDepartment: {} as Record<string, number>,
  };

  personnel.forEach(p => {
    // Status
    const status = p.employment_status || "Unknown";
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

    // Position
    const pos = p.position || "Unknown";
    stats.byPosition[pos] = (stats.byPosition[pos] || 0) + 1;

    // Degree
    const degree = p.education_level || "Unknown";
    stats.byDegree[degree] = (stats.byDegree[degree] || 0) + 1;

    // Department
    const dept = p.department || "Unknown";
    stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
  });

  const handleExportReport = () => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ["Category", "Value", "Count"],
      ...Object.entries(stats.byStatus).map(([k, v]) => ["Employment Status", k, v]),
      ...Object.entries(stats.byPosition).map(([k, v]) => ["Position", k, v]),
      ...Object.entries(stats.byDegree).map(([k, v]) => ["Education", k, v]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws, "Summary Report");

    XLSX.writeFile(wb, "Personnel_Summary_Report.xlsx");
  };

  if (loading) return <div className="p-8 text-center">Loading Report...</div>;

  return (
    <div className="container mx-auto p-6 font-sarabun">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/personnel" className="text-gray-500 hover:text-blue-600">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          สรุปข้อมูลบุคลากร (Personnel Summary)
        </h1>
        <div className="ml-auto">
            <button onClick={handleExportReport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <Download size={18} /> Export Report
            </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
                <p className="text-sm font-semibold text-gray-700">บุคลากรทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <Users className="text-blue-200" size={40} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-1">สายวิชาการ (คาดการณ์)</p>
            <p className="text-2xl font-bold text-gray-900">
                {(stats.byPosition["อาจารย์"] || 0) + (stats.byPosition["ผู้ช่วยศาสตราจารย์"] || 0) + (stats.byPosition["รองศาสตราจารย์"] || 0) + (stats.byPosition["ศาสตราจารย์"] || 0)}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <PieChart size={18} className="text-orange-500" />
                จำแนกตามสถานภาพ (Employment Status)
            </h3>
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-100 text-left text-gray-900 font-semibold">
                        <th className="p-3 rounded-l">ประเภท</th>
                        <th className="p-3 text-right rounded-r">จำนวน (คน)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {Object.entries(stats.byStatus).map(([key, val]) => (
                        <tr key={key} className="hover:bg-gray-50 text-gray-900">
                            <td className="p-3">{key}</td>
                            <td className="p-3 text-right font-medium">{val}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Position Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <PieChart size={18} className="text-purple-500" />
                จำแนกตามตำแหน่ง (Position)
            </h3>
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-100 text-left text-gray-900 font-semibold">
                        <th className="p-3 rounded-l">ตำแหน่ง</th>
                        <th className="p-3 text-right rounded-r">จำนวน (คน)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {Object.entries(stats.byPosition).map(([key, val]) => (
                        <tr key={key} className="hover:bg-gray-50 text-gray-900">
                            <td className="p-3">{key}</td>
                            <td className="p-3 text-right font-medium">{val}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Degree Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <PieChart size={18} className="text-green-500" />
                จำแนกตามวุฒิการศึกษา (Education)
            </h3>
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-100 text-left text-gray-900 font-semibold">
                        <th className="p-3 rounded-l">ระดับวุฒิ</th>
                        <th className="p-3 text-right rounded-r">จำนวน (คน)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {Object.entries(stats.byDegree)
                        .sort(([keyA], [keyB]) => {
                             if (keyA === "Unknown" || keyA === "ไม่ระบุ") return -1;
                             if (keyB === "Unknown" || keyB === "ไม่ระบุ") return 1;
                             return keyA.localeCompare(keyB);
                        })
                        .map(([key, val]) => (
                        <tr key={key} className="hover:bg-gray-50 text-gray-900">
                            <td className="p-3">{key}</td>
                            <td className="p-3 text-right font-medium">{val}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Department Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <PieChart size={18} className="text-red-500" />
                จำแนกตามสังกัด (Department)
            </h3>
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-100 text-left text-gray-900 font-semibold">
                        <th className="p-3 rounded-l">สังกัด</th>
                        <th className="p-3 text-right rounded-r">จำนวน (คน)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {Object.entries(stats.byDepartment).map(([key, val]) => (
                        <tr key={key} className="hover:bg-gray-50 text-gray-900">
                            <td className="p-3">{key}</td>
                            <td className="p-3 text-right font-medium">{val}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
