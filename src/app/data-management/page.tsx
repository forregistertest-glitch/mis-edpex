"use client";

import Link from "next/link";
import { Users, GraduationCap, Stethoscope, ArrowRight } from "lucide-react";

export default function DataManagementHub() {
  const modules = [
    {
      id: "hr-data",
      title: "ข้อมูลงาน HR",
      titleEn: "HR Data Management",
      description: "จัดการฐานข้อมูลบุคลากรและข้อมูล HR ของคณะสัตวแพทยศาสตร์",
      icon: Users,
      color: "indigo",
      bgColor: "bg-indigo-600",
      lightBg: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-600",
      hoverBg: "hover:bg-indigo-700",
      href: "/data-management/hr-data",
    },
    {
      id: "postgraduate",
      title: "ข้อมูลบัณฑิตศึกษา",
      titleEn: "Postgraduate Data",
      description: "จัดการฐานข้อมูลนิสิตระดับบัณฑิตศึกษา ผลงาน และความก้าวหน้า",
      icon: GraduationCap,
      color: "purple",
      bgColor: "bg-purple-600",
      lightBg: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
      hoverBg: "hover:bg-purple-700",
      href: "/data-management/postgraduate",
    },
    {
      id: "academic",
      title: "การศึกษา",
      titleEn: "Academic Education (Residency/Intern)",
      description: "จัดการฐานข้อมูล Resident และ Intern ของคณะสัตวแพทยศาสตร์",
      icon: Stethoscope,
      color: "sky",
      bgColor: "bg-sky-600",
      lightBg: "bg-sky-50",
      borderColor: "border-sky-200",
      textColor: "text-sky-600",
      hoverBg: "hover:bg-sky-700",
      href: "/data-management/academic",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sarabun">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600 mb-4">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Design Samples
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            ตัวอย่างการออกแบบ
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            กรุณาเลือกโมดูลที่ต้องการดูตัวอย่างการออกแบบ UI
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.id}
                href={module.href}
                className="group relative block animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`relative p-6 rounded-2xl border-2 ${module.borderColor} bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  {/* Icon Badge */}
                  <div className={`inline-flex p-4 rounded-xl ${module.bgColor} ${module.hoverBg} shadow-lg mb-4 transition-all duration-300 group-hover:scale-110`}>
                    <Icon size={32} className="text-white" />
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl font-bold text-slate-800 mb-2 group-hover:${module.textColor} transition-colors`}>
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mb-3 uppercase tracking-wide">
                    {module.titleEn}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {module.description}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                    <span>ดูตัวอย่าง</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Decorative gradient */}
                  <div className={`absolute top-0 right-0 w-24 h-24 ${module.lightBg} rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10`}></div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
            <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              หมายเหตุ (Note)
            </h4>
            <p className="text-amber-700 text-sm leading-relaxed">
              หน้านี้เป็นตัวอย่างการออกแบบ UI เท่านั้น ปุ่มและฟังก์ชันต่างๆ ยังไม่มีการเชื่อมต่อกับฐานข้อมูลจริง 
              (This is a UI design sample only. Buttons and functions are not connected to the actual database.)
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
