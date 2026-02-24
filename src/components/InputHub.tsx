"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  FlaskConical,
  TrendingUp,
  Stethoscope,
  LibraryBig,
  UserStar,
  Landmark,
  ClipboardEdit
} from "lucide-react";
import KpiInputForm from "@/components/KpiInputForm";
import type { Language } from "@/lib/translations";

interface InputHubProps {
  lang: Language;
}

export default function InputHub({ lang }: InputHubProps) {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const modules: Array<{
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    bg: string;
    hoverText: string;
    href?: string;
    isExternal?: boolean;
    disabled?: boolean;
    action?: () => void;
  }> = [
      {
        id: "personnel",
        title: lang === "th" ? "ข้อมูลบุคคลากร" : "Personnel Records",
        description: lang === "th" ? "จัดการฐานข้อมูลบุคคลากรของคณะสัตวแพทยศาสตร์" : "Manage faculty personnel database.",
        icon: Users,
        color: "text-white",
        bg: "bg-blue-600 shadow-sm",
        hoverText: "group-hover:text-blue-600",
        href: "/personnel",
        isExternal: true
      },
      {
        id: "instructor",
        title: lang === "th" ? "ข้อมูลอาจารย์ผู้สอน" : "Instructor Work",
        description: lang === "th" ? "จัดการฐานข้อมูลอาจารย์ผู้สอนของคณะสัตวแพทยศาสตร์" : "Manage instructor database of Faculty of Veterinary Medicine.",
        icon: UserStar,
        color: "text-white",
        bg: "bg-teal-600 shadow-sm",
        hoverText: "group-hover:text-teal-600",
        href: "/faculty",
        isExternal: true
      },
      {
        id: "undergrad",
        title: lang === "th" ? "ข้อมูลการศึกษา" : "Undergraduate Management",
        description: lang === "th" ? "จัดการฐานข้อมูลนิสิตและอื่นๆในระดับปริญญาตรี" : "Manage undergraduate student database and related activities.",
        icon: Stethoscope,
        color: "text-white",
        bg: "bg-sky-600 shadow-sm",
        hoverText: "group-hover:text-sky-600",
        href: "/undergraduate",
        isExternal: true
      },
      {
        id: "postgrad",
        title: lang === "th" ? "ข้อมูลบัณฑิตศึกษา" : "Postgraduate Work",
        description: lang === "th" ? "จัดการฐานข้อมูลบัณฑิตระดับสูงกว่าปริญญาตรี" : "Manage postgraduate student database.",
        icon: GraduationCap,
        color: "text-white",
        bg: "bg-purple-600 shadow-sm",
        hoverText: "group-hover:text-purple-600",
        href: "/student",
        isExternal: true
      },
      {
        id: "research",
        title: lang === "th" ? "ข้อมูลงานวิจัย" : "Research Work",
        description: lang === "th" ? "จัดการฐานข้อมูลงานวิจัยและผลงานตีพิมพ์" : "Manage research projects and publications database.",
        icon: FlaskConical,
        color: "text-white",
        bg: "bg-amber-600 shadow-sm",
        hoverText: "group-hover:text-amber-600",
        href: "/research",
        isExternal: true
      },
      {
        id: "department",
        title: lang === "th" ? "ข้อมูลภาควิชา" : "Department Work",
        description: lang === "th" ? "จัดการฐานข้อมูลภาควิชาต่างๆของคณะสัตวแพทยศาสตร์" : "Manage department database projects.",
        icon: Landmark,
        color: "text-white",
        bg: "bg-slate-600 shadow-sm",
        hoverText: "group-hover:text-slate-600",
        href: "/department",
        isExternal: true
      },
      {
        id: "kpi",
        title: lang === "th" ? "ตัวชี้วัดยุทธศาสตร์ (KPI)" : "Strategic KPIs",
        description: lang === "th" ? "จัดการฐานข้อมูลตัวชี้วัด KPI และผลการดำเนินงาน (SAR)" : "Manage KPI data and strategic outcomes results.",
        icon: TrendingUp,
        color: "text-white",
        bg: "bg-emerald-600 shadow-sm",
        hoverText: "group-hover:text-emerald-600",
        action: () => setSelectedModule("kpi")
      }
    ];

  if (selectedModule === "kpi") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedModule(null)}
          className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-4"
        >
          ← {lang === "th" ? "กลับไปหน้าเลือกเมนู" : "Back to Menu"}
        </button>
        <KpiInputForm lang={lang} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl font-bold text-slate-800">
          {lang === "th" ? "การจัดการฐานข้อมูลกลาง" : "Central Database Management"}
        </h2>
        <p className="text-slate-500">
          {lang === "th" ? "กรุณาเลือกประเภทข้อมูลที่ต้องการจัดการ" : "Please select the data module you wish to manage."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {modules.map((m) => (
          <div
            key={m.id}
            className={`relative group p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all ${m.disabled ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}`}
            onClick={() => {
              if (m.disabled) return;
              if (m.action) m.action();
              // for href, we let Link handle it if we wrapped it, but here we using div onClick for simplicity or conditional logic
            }}
          >
            {/* Wrap content in Link if external and enabled */}
            {m.isExternal && !m.disabled && m.href ? (
              <Link href={m.href} className="absolute inset-0 z-10" />
            ) : null}

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${m.bg} ${m.color}`}>
                <m.icon size={28} />
              </div>
              <div className="space-y-1">
                <h3 className={`text-lg font-bold text-slate-800 ${m.hoverText} transition-colors ${m.disabled ? 'text-slate-500' : ''}`}>
                  {m.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {m.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
