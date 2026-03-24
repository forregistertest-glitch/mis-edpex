'use client';

import React, { useState } from 'react';
import { InternApplicationLog } from '@/types/data-management';
import { FileText, Save, X, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';

interface ApplicationLogFormProps {
  internId: string;
  onSubmit: (data: Omit<InternApplicationLog, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  initialData?: InternApplicationLog;
}

export default function ApplicationLogForm({ internId, onSubmit, onCancel, initialData }: ApplicationLogFormProps) {
  const [formData, setFormData] = useState<Omit<InternApplicationLog, 'id' | 'created_at'>>({
    intern_id: internId,
    application_year: initialData?.application_year || '',
    application_date: initialData?.application_date || '',
    selection_status: initialData?.selection_status || 'pending',
    selection_date: initialData?.selection_date || '',
    interview_score: initialData?.interview_score || undefined,
    notes: initialData?.notes || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'interview_score' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting application log:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-sky-600 to-sky-700 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={24} />
              <h2 className="text-xl font-bold">
                {initialData ? 'แก้ไขการสมัคร Intern' : 'เพิ่มการสมัคร Intern'}
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
          {/* Application Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ปีที่สมัคร Intern <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="application_year"
              value={formData.application_year}
              onChange={handleChange}
              required
              placeholder="เช่น 2567"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Application Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่สมัคร
            </label>
            <input
              type="date"
              name="application_date"
              value={formData.application_date}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Selection Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานะการคัดเลือก <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.selection_status === 'pending'
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="selection_status"
                  value="pending"
                  checked={formData.selection_status === 'pending'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <Clock className={formData.selection_status === 'pending' ? 'text-gray-500' : 'text-gray-400'} size={20} />
                <span className={formData.selection_status === 'pending' ? 'text-gray-700 font-medium' : 'text-gray-600'}>
                  รอผล
                </span>
              </label>

              <label className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.selection_status === 'selected'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="selection_status"
                  value="selected"
                  checked={formData.selection_status === 'selected'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <CheckCircle className={formData.selection_status === 'selected' ? 'text-green-500' : 'text-gray-400'} size={20} />
                <span className={formData.selection_status === 'selected' ? 'text-green-700 font-medium' : 'text-gray-600'}>
                  ได้รับคัดเลือก
                </span>
              </label>

              <label className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.selection_status === 'not_selected'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="selection_status"
                  value="not_selected"
                  checked={formData.selection_status === 'not_selected'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <XCircle className={formData.selection_status === 'not_selected' ? 'text-red-500' : 'text-gray-400'} size={20} />
                <span className={formData.selection_status === 'not_selected' ? 'text-red-700 font-medium' : 'text-gray-600'}>
                  ไม่ได้รับคัดเลือก
                </span>
              </label>

              <label className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.selection_status === 'withdrawn'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="selection_status"
                  value="withdrawn"
                  checked={formData.selection_status === 'withdrawn'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <Ban className={formData.selection_status === 'withdrawn' ? 'text-orange-500' : 'text-gray-400'} size={20} />
                <span className={formData.selection_status === 'withdrawn' ? 'text-orange-700 font-medium' : 'text-gray-600'}>
                  ถอนตัว
                </span>
              </label>
            </div>
          </div>

          {/* Selection Date */}
          {(formData.selection_status === 'selected' || formData.selection_status === 'not_selected') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่ประกาศผล
              </label>
              <input
                type="date"
                name="selection_date"
                value={formData.selection_date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          )}

          {/* Interview Score */}
          {formData.selection_status === 'selected' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                คะแนนสัมภาษณ์
              </label>
              <input
                type="number"
                name="interview_score"
                value={formData.interview_score || ''}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="เช่น 85"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          )}

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
              placeholder="เช่น ผ่านการสัมภาษณ์รอบแรก, มีประสบการณ์ทำงาน..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
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
              className="flex-1 px-6 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 flex items-center justify-center gap-2 shadow-lg shadow-sky-200 transition-all font-medium disabled:opacity-50"
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
