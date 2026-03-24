"use client";

import { useState } from "react";
import { InternApplicationLog, InternWorkHistory } from "@/types/data-management";
import { Plus, FileText, Briefcase, CheckCircle, XCircle, Clock } from "lucide-react";

interface InternApplicationTimelineProps {
  internId: string;
  applications?: InternApplicationLog[];
  workHistory?: InternWorkHistory[];
  onAddApplication?: () => void;
  onAddWorkHistory?: () => void;
}

export default function InternApplicationTimeline({
  internId,
  applications = [],
  workHistory = [],
  onAddApplication,
  onAddWorkHistory,
}: InternApplicationTimelineProps) {
  const [activeSection, setActiveSection] = useState<"applications" | "work">("applications");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'selected':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'not_selected':
        return <XCircle className="text-red-600" size={20} />;
      case 'withdrawn':
        return <XCircle className="text-gray-400" size={20} />;
      default:
        return <Clock className="text-blue-600" size={20} />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'รอผล',
      'selected': 'ได้รับคัดเลือก',
      'not_selected': 'ไม่ได้รับคัดเลือก',
      'withdrawn': 'ถอนตัว'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSection("applications")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeSection === "applications"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText size={16} />
          การสมัคร ({applications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("work")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeSection === "work"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Briefcase size={16} />
          ประวัติการทำงาน ({workHistory.length})
        </button>
      </div>

      {/* Applications Section */}
      {activeSection === "applications" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">ประวัติการสมัคร Intern</h3>
            {onAddApplication && (
              <button
                type="button"
                onClick={onAddApplication}
                className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg text-sm font-medium hover:bg-sky-100 transition-colors"
              >
                <Plus size={16} />
                เพิ่มการสมัคร
              </button>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <FileText className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 text-sm">ยังไม่มีประวัติการสมัคร</p>
              <p className="text-slate-400 text-xs mt-1">คลิก "เพิ่มการสมัคร" เพื่อบันทึกข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app, index) => (
                <div key={app.id || index} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getStatusIcon(app.selection_status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">ปีการศึกษา {app.application_year}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          app.selection_status === 'selected' ? 'bg-green-100 text-green-700' :
                          app.selection_status === 'not_selected' ? 'bg-red-100 text-red-700' :
                          app.selection_status === 'withdrawn' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {getStatusLabel(app.selection_status)}
                        </span>
                      </div>
                      {app.application_date && (
                        <p className="text-sm text-slate-600">วันที่สมัคร: {app.application_date}</p>
                      )}
                      {app.selection_date && (
                        <p className="text-sm text-slate-600">วันที่ประกาศผล: {app.selection_date}</p>
                      )}
                      {app.interview_score && (
                        <p className="text-sm text-slate-600">คะแนนสัมภาษณ์: {app.interview_score}</p>
                      )}
                      {app.notes && (
                        <p className="text-sm text-slate-500 mt-2">{app.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Work History Section */}
      {activeSection === "work" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">ประวัติการทำงาน</h3>
            {onAddWorkHistory && (
              <button
                type="button"
                onClick={onAddWorkHistory}
                className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg text-sm font-medium hover:bg-sky-100 transition-colors"
              >
                <Plus size={16} />
                เพิ่มประวัติการทำงาน
              </button>
            )}
          </div>

          {workHistory.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 text-sm">ยังไม่มีประวัติการทำงาน</p>
              <p className="text-slate-400 text-xs mt-1">คลิก "เพิ่มประวัติการทำงาน" เพื่อบันทึกข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workHistory.map((work, index) => (
                <div key={work.id || index} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Briefcase className={work.end_date ? "text-slate-400" : "text-sky-600"} size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{work.workplace}</h4>
                        {!work.end_date && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            ปัจจุบัน
                          </span>
                        )}
                      </div>
                      {work.position && (
                        <p className="text-sm text-slate-600 mb-2">ตำแหน่ง: {work.position}</p>
                      )}
                      <div className="text-sm text-slate-600">
                        <p>
                          <span className="font-medium">ระยะเวลา:</span> {work.start_date} 
                          {work.end_date ? ` - ${work.end_date}` : ' - ปัจจุบัน'}
                        </p>
                      </div>
                      {(work.phone || work.email || work.address) && (
                        <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500">
                          <p className="font-medium text-slate-600 mb-1">ข้อมูลติดต่อในช่วงนั้น:</p>
                          {work.phone && <p>โทร: {work.phone}</p>}
                          {work.email && <p>Email: {work.email}</p>}
                          {work.address && <p>ที่อยู่: {work.address}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
