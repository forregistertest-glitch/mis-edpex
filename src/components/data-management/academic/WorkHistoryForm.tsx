'use client';

import React, { useState } from 'react';
import { InternWorkHistory } from '@/types/data-management';
import { Briefcase, Save, X } from 'lucide-react';

interface WorkHistoryFormProps {
  internId: string;
  onSubmit: (data: Omit<InternWorkHistory, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  initialData?: InternWorkHistory;
}

export default function WorkHistoryForm({ internId, onSubmit, onCancel, initialData }: WorkHistoryFormProps) {
  const [formData, setFormData] = useState<Omit<InternWorkHistory, 'id' | 'created_at'>>({
    intern_id: internId,
    workplace: initialData?.workplace || '',
    position: initialData?.position || '',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
  });

  const [loading, setLoading] = useState(false);
  const [isCurrentJob, setIsCurrentJob] = useState(!initialData?.end_date);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrentJobToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsCurrentJob(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, end_date: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting work history:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-sky-600 to-sky-700 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase size={24} />
              <h2 className="text-xl font-bold">
                {initialData ? 'แก้ไขประวัติการทำงาน' : 'เพิ่มประวัติการทำงาน'}
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
          {/* Workplace */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานที่ทำงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="workplace"
              value={formData.workplace}
              onChange={handleChange}
              required
              placeholder="เช่น โรงพยาบาลสัตว์มหาวิทยาลัยเกษตรศาสตร์"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ตำแหน่ง <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              placeholder="เช่น สัตวแพทย์ประจำ, อาจารย์"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มงาน <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด {!isCurrentJob && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required={!isCurrentJob}
                disabled={isCurrentJob}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
          </div>

          {/* Current Job Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="currentJob"
              checked={isCurrentJob}
              onChange={handleCurrentJobToggle}
              className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
            />
            <label htmlFor="currentJob" className="text-sm text-gray-700">
              ทำงานที่นี่ในปัจจุบัน
            </label>
          </div>

          {/* Contact Information */}
          <div className="pt-4 border-t">
            <h3 className="text-md font-semibold text-gray-800 mb-4">ข้อมูลติดต่อ (ณ ขณะนั้น)</h3>
            
            <div className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="เช่น 02-123-4567"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ที่อยู่
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="ที่อยู่สถานที่ทำงาน..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
                />
              </div>
            </div>
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
