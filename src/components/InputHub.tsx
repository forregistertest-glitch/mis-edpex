"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, GraduationCap, FlaskConical, TrendingUp } from "lucide-react";
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
    href?: string;
    isExternal?: boolean;
    disabled?: boolean;
    action?: () => void;
  }> = [
    {
      id: "personnel",
      title: lang === "th" ? "ข้อมูลบุคลากร (HR)" : "Personnel Data (HR)",
      description: lang === "th" ? "จัดการข้อมูลบุคลากร, นำเข้า Excel, และส่งออกข้อมูล" : "Manage personnel records, Import/Export Excel.",
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/personnel", // Direct link or internal state
      isExternal: true
    },
    {
      id: "student",
      title: lang === "th" ? "ข้อมูลนิสิต (Student)" : "Student Data",
      description: lang === "th" ? "จัดการข้อมูลนิสิตระดับบัณฑิตศึกษา, นำเข้า Excel, และส่งออกข้อมูล" : "Manage graduate student records, Import/Export Excel.",
      icon: GraduationCap,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/student",
      isExternal: true
    },
    {
      id: "research",
      title: lang === "th" ? "ข้อมูลงานวิจัย (Research)" : "Research Data",
      description: lang === "th" ? "จัดการข้อมูลผลงานตีพิมพ์, Scopus, และการนำเข้า Excel" : "Manage publications, Scopus search, and data import.",
      icon: FlaskConical,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/research",
      isExternal: true
    },
    {
      id: "kpi",
      title: lang === "th" ? "ตัวชี้วัดยุทธศาสตร์ (KPI)" : "Strategic KPIs",
      description: lang === "th" ? "กรอกผลการดำเนินงานตามตัวชี้วัด (SAR)" : "Input data for Strategic Objectives and KPIs.",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
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
           {lang === "th" ? "ระบบนำเข้าข้อมูลกลาง" : "Central Data Input Hub"}
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
                   <h3 className={`text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors ${m.disabled ? 'text-slate-500' : ''}`}>
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
