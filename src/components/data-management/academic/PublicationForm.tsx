'use client';

import React, { useState } from 'react';
import { ResidencyPublication } from '@/types/data-management';
import { BookOpen, Save, X } from 'lucide-react';

interface PublicationFormProps {
  residencyId: string;
  onSubmit: (data: Omit<ResidencyPublication, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: ResidencyPublication;
}

export default function PublicationForm({ residencyId, onSubmit, onCancel, initialData }: PublicationFormProps) {
  const [formData, setFormData] = useState<Omit<ResidencyPublication, 'id' | 'created_at' | 'updated_at'>>({
    residency_id: residencyId,
    research_title: initialData?.research_title || '',
    journal_name: initialData?.journal_name || '',
    publication_year: initialData?.publication_year || '',
    authors: initialData?.authors || [],
    doi: initialData?.doi || '',
    url: initialData?.url || '',
  });

  const [loading, setLoading] = useState(false);
  const [authorsInput, setAuthorsInput] = useState(initialData?.authors?.join(', ') || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAuthorsInput(value);
    const authorsArray = value.split(',').map(a => a.trim()).filter(a => a);
    setFormData((prev) => ({ ...prev, authors: authorsArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting publication:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen size={24} />
              <h2 className="text-xl font-bold">
                {initialData ? 'แก้ไขผลงานวิจัย' : 'เพิ่มผลงานวิจัย'}
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
          {/* Research Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อผลงานวิจัยที่ตีพิมพ์ <span className="text-red-500">*</span>
            </label>
            <textarea
              name="research_title"
              value={formData.research_title}
              onChange={handleChange}
              required
              rows={3}
              placeholder="เช่น การศึกษาประสิทธิภาพของวัคซีนป้องกันโรคในสุนัข..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Journal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วารสารที่ตีพิมพ์ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="journal_name"
              value={formData.journal_name}
              onChange={handleChange}
              required
              placeholder="เช่น Thai Journal of Veterinary Medicine"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Publication Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ปีที่ตีพิมพ์ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="publication_year"
              value={formData.publication_year}
              onChange={handleChange}
              required
              placeholder="เช่น 2567"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Authors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ผู้แต่ง (คั่นด้วยเครื่องหมายจุลภาค)
            </label>
            <input
              type="text"
              value={authorsInput}
              onChange={handleAuthorsChange}
              placeholder="เช่น น.สพ.สมชาย ใจดี, ผศ.ดร.สมหญิง รักเรียน"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            {formData.authors && formData.authors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.authors.map((author, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                  >
                    {author}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* DOI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DOI (Digital Object Identifier)
            </label>
            <input
              type="text"
              name="doi"
              value={formData.doi}
              onChange={handleChange}
              placeholder="เช่น 10.1234/example.2024.001"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL ลิงก์ผลงาน
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://..."
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
