"use client";

import { useState } from "react";
import { ResidencyExamLog, ResidencyPublication, ResidencyCertificate } from "@/types/data-management";
import { Plus, Calendar, CheckCircle, XCircle, Clock, BookOpen, Award } from "lucide-react";

interface ResidencyProgressTimelineProps {
  residencyId: string;
  examLogs?: ResidencyExamLog[];
  publications?: ResidencyPublication[];
  certificate?: ResidencyCertificate;
  onAddExam?: () => void;
  onAddPublication?: () => void;
}

export default function ResidencyProgressTimeline({
  residencyId,
  examLogs = [],
  publications = [],
  certificate,
  onAddExam,
  onAddPublication,
}: ResidencyProgressTimelineProps) {
  const [activeSection, setActiveSection] = useState<"exams" | "publications" | "certificate">("exams");

  const getExamStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
      case 'scheduled':
        return <Calendar className="text-blue-600" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getExamTypeLabel = (type: string) => {
    return type === 'comprehensive' ? 'สอบประมวลความรู้' : 'สอบปากเปล่าขั้นสุดท้าย';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'passed': 'ผ่าน',
      'failed': 'ไม่ผ่าน',
      'scheduled': 'กำหนดสอบ',
      'pending': 'รอผล'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSection("exams")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeSection === "exams"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar size={16} />
          การสอบ ({examLogs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("publications")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeSection === "publications"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen size={16} />
          ผลงานวิจัย ({publications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("certificate")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeSection === "certificate"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Award size={16} />
          วุฒิบัตร
        </button>
      </div>

      {/* Exam Logs Section */}
      {activeSection === "exams" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">ประวัติการสอบ</h3>
            {onAddExam && (
              <button
                type="button"
                onClick={onAddExam}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                <Plus size={16} />
                เพิ่มผลการสอบ
              </button>
            )}
          </div>

          {examLogs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 text-sm">ยังไม่มีประวัติการสอบ</p>
              <p className="text-slate-400 text-xs mt-1">คลิก "เพิ่มผลการสอบ" เพื่อบันทึกข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-3">
              {examLogs.map((exam, index) => (
                <div key={exam.id || index} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getExamStatusIcon(exam.exam_status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{getExamTypeLabel(exam.exam_type)}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          exam.exam_status === 'passed' ? 'bg-green-100 text-green-700' :
                          exam.exam_status === 'failed' ? 'bg-red-100 text-red-700' :
                          exam.exam_status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {getStatusLabel(exam.exam_status)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">วันที่สอบ: {exam.exam_date}</p>
                      {exam.score && <p className="text-sm text-slate-600">คะแนน: {exam.score}</p>}
                      {exam.notes && <p className="text-sm text-slate-500 mt-2">{exam.notes}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Publications Section */}
      {activeSection === "publications" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">ผลงานวิจัยที่ตีพิมพ์</h3>
            {onAddPublication && (
              <button
                type="button"
                onClick={onAddPublication}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                <Plus size={16} />
                เพิ่มผลงานวิจัย
              </button>
            )}
          </div>

          {publications.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <BookOpen className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 text-sm">ยังไม่มีผลงานวิจัย</p>
              <p className="text-slate-400 text-xs mt-1">คลิก "เพิ่มผลงานวิจัย" เพื่อบันทึกข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-3">
              {publications.map((pub, index) => (
                <div key={pub.id || index} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <BookOpen className="text-emerald-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 mb-2">{pub.research_title}</h4>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p><span className="font-medium">วารสาร:</span> {pub.journal_name}</p>
                        <p><span className="font-medium">ปีที่ตีพิมพ์:</span> {pub.publication_year}</p>
                        {pub.authors && pub.authors.length > 0 && (
                          <p><span className="font-medium">ผู้แต่ง:</span> {pub.authors.join(', ')}</p>
                        )}
                        {pub.doi && <p><span className="font-medium">DOI:</span> {pub.doi}</p>}
                        {pub.url && (
                          <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                            ดูรายละเอียด →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificate Section */}
      {activeSection === "certificate" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">ข้อมูลวุฒิบัตร</h3>

          {!certificate ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Award className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 text-sm">ยังไม่มีข้อมูลวุฒิบัตร</p>
              <p className="text-slate-400 text-xs mt-1">จะแสดงเมื่อจบการฝึกอบรม</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <Award className="text-emerald-600" size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-emerald-800 mb-3">วุฒิบัตรสัตวแพทย์ประจำบ้าน</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600 font-medium">ปีที่จบการฝึกอบรม</p>
                      <p className="text-slate-800 font-bold text-lg">{certificate.training_end_year}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-medium">วันที่ได้รับวุฒิบัตร</p>
                      <p className="text-slate-800 font-bold text-lg">{certificate.certificate_date}</p>
                    </div>
                    {certificate.certificate_number && (
                      <div className="md:col-span-2">
                        <p className="text-slate-600 font-medium">เลขที่วุฒิบัตร</p>
                        <p className="text-slate-800 font-bold text-lg">{certificate.certificate_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
