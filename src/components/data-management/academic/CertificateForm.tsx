'use client';

import React, { useState } from 'react';
import { ResidencyCertificate } from '@/types/data-management';
import { Award, Save, X } from 'lucide-react';

interface CertificateFormProps {
  residencyId: string;
  onSubmit: (data: Omit<ResidencyCertificate, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  initialData?: ResidencyCertificate;
}

export default function CertificateForm({ residencyId, onSubmit, onCancel, initialData }: CertificateFormProps) {
  const [formData, setFormData] = useState<Omit<ResidencyCertificate, 'id' | 'created_at'>>({
    residency_id: residencyId,
    training_end_year: initialData?.training_end_year || '',
    certificate_date: initialData?.certificate_date || '',
    certificate_number: initialData?.certificate_number || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting certificate:', error);
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
              <Award size={24} />
              <h2 className="text-xl font-bold">
                {initialData ? 'แก้ไขข้อมูลวุฒิบัตร' : 'บันทึกข้อมูลวุฒิบัตร'}
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
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg mb-6">
            <p className="text-emerald-800 text-sm">
              <strong>หมายเหตุ:</strong> บันทึกข้อมูลวุฒิบัตรเมื่อจบการฝึกอบรมแล้วเท่านั้น
            </p>
          </div>

          {/* Training End Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ปีที่จบฝึกอบรม <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="training_end_year"
              value={formData.training_end_year}
              onChange={handleChange}
              required
              placeholder="เช่น 2568"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Certificate Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่ได้รับวุฒิบัตร <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="certificate_date"
              value={formData.certificate_date}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Certificate Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลขที่วุฒิบัตร
            </label>
            <input
              type="text"
              name="certificate_number"
              value={formData.certificate_number}
              onChange={handleChange}
              placeholder="เช่น ว.บ. 123/2568"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
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
