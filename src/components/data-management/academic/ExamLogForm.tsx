'use client';

import React, { useState } from 'react';
import { ResidencyExamLog } from '@/types/data-management';
import { Calendar, CheckCircle, XCircle, Clock, Save, X } from 'lucide-react';

interface ExamLogFormProps {
  residencyId: string;
  onSubmit: (data: Omit<ResidencyExamLog, 'id' | 'created_at' | 'created_by'>) => void;
  onCancel: () => void;
  initialData?: ResidencyExamLog;
}

export default function ExamLogForm({ residencyId, onSubmit, onCancel, initialData }: ExamLogFormProps) {
  const [formData, setFormData] = useState<Omit<ResidencyExamLog, 'id' | 'created_at' | 'created_by'>>({
    residency_id: residencyId,
    exam_type: initialData?.exam_type || 'comprehensive',
    exam_date: initialData?.exam_date || '',
    exam_status: initialData?.exam_status || 'scheduled',
    notes: initialData?.notes || '',
    score: initialData?.score || undefined,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'score' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting exam log:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={24} />
              <h2 className="text-xl font-bold">
                {initialData ? 'แก้ไขผลการสอบ' : 'เพิ่มผลการสอบ'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Exam Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทการสอบ <span className="text-red-500">*</span>
            </label>
            <select
              name="exam_type"
              value={formData.exam_type}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="comprehensive">สอบประมวลความรู้/วัดคุณสมบัติ</option>
              <option value="final_oral">สอบปากเปล่าขั้นสุดท้าย</option>
            </select>
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่สอบ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="exam_date"
              value={formData.exam_date}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Exam Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานะการสอบ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.exam_status === 'scheduled'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="exam_status"
                  value="scheduled"
                  checked={formData.exam_status === 'scheduled'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <Clock className={formData.exam_status === 'scheduled' ? 'text-blue-500' : 'text-gray-400'} size={20} />
                <span className={formData.exam_status === 'scheduled' ? 'text-blue-700 font-medium' : 'text-gray-600'}>
                  กำหนดสอบ
                </span>
              </label>

              <label className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.exam_status === 'passed'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="exam_status"
                  value="passed"
                  checked={formData.exam_status === 'passed'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <CheckCircle className={formData.exam_status === 'passed' ? 'text-green-500' : 'text-gray-400'} size={20} />
                <span className={formData.exam_status === 'passed' ? 'text-green-700 font-medium' : 'text-gray-600'}>
                  ผ่าน
                </span>
              </label>

              <label className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.exam_status === 'failed'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="exam_status"
                  value="failed"
                  checked={formData.exam_status === 'failed'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <XCircle className={formData.exam_status === 'failed' ? 'text-red-500' : 'text-gray-400'} size={20} />
                <span className={formData.exam_status === 'failed' ? 'text-red-700 font-medium' : 'text-gray-600'}>
                  ไม่ผ่าน
                </span>
              </label>

              <label className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.exam_status === 'pending'
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="exam_status"
                  value="pending"
                  checked={formData.exam_status === 'pending'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <Clock className={formData.exam_status === 'pending' ? 'text-gray-500' : 'text-gray-400'} size={20} />
                <span className={formData.exam_status === 'pending' ? 'text-gray-700 font-medium' : 'text-gray-600'}>
                  รอผล
                </span>
              </label>
            </div>
          </div>

          {/* Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คะแนน (ถ้ามี)
            </label>
            <input
              type="number"
              name="score"
              value={formData.score || ''}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="เช่น 85"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุ
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="เช่น สอบครั้งที่ 2, มีการทบทวน..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all font-medium disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save size={20} />
                  บันทึกข้อมูล
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
