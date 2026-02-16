import { Database, Server, BookOpen, Layers } from "lucide-react";

interface Props {
  lang: "th" | "en";
}

export default function SystemDocs({ lang }: Props) {
  const isThai = lang === "th";

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">
            {isThai ? "เอกสารระบบงาน (System Documentation)" : "System Documentation"}
          </h2>
          <p className="text-slate-400">
            {isThai
              ? "ข้อมูลอ้างอิงทางเทคนิค โครงสร้างฐานข้อมูล และพจนานุกรมข้อมูลสำหรับผู้ดูแลระบบ"
              : "Technical reference, database schema, and data dictionary for system administrators."}
          </p>
        </div>
      </div>

      {/* 1. Architecture */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Server size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">1. System Architecture</h3>
            <p className="text-sm text-slate-500">
                {isThai ? "สถาปัตยกรรมระบบและเทคโนโลยีที่ใช้" : "System Architecture & Tech Stack"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-slate-700 mb-3 border-l-4 border-blue-500 pl-3">Tech Stack (Frontend)</h4>
            <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside bg-slate-50 p-4 rounded-xl">
              <li><strong>Framework:</strong> Next.js 14 (App Router)</li>
              <li><strong>Language:</strong> TypeScript</li>
              <li><strong>Styling:</strong> Tailwind CSS + Lucide Icons</li>
              <li><strong>State:</strong> React Context (AuthContext)</li>
              <li><strong>Deployment:</strong> Vercel</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-3 border-l-4 border-amber-500 pl-3">Infrastructure (Firebase)</h4>
            <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside bg-slate-50 p-4 rounded-xl">
              <li><strong>Auth:</strong> Google Sign-In + Whitelist Logic</li>
              <li><strong>Database:</strong> Cloud Firestore (NoSQL)</li>
              <li><strong>Security:</strong> Firestore Rules (Role-based)</li>
              <li><strong>Storage:</strong> Firebase Storage (Images)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Database Design */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">2. Database Design</h3>
            <p className="text-sm text-slate-500">
                {isThai ? "โครงสร้างฐานข้อมูล (Firestore Collections)" : "Firestore Collection Schema"}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Collection: Personnel */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-indigo-500" />
                <span className="font-mono font-bold text-indigo-700">collection: 'personnel'</span>
              </div>
              <span className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
                {isThai ? "ข้อมูลบุคลากร" : "Personnel Data"}
              </span>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="pb-2 w-1/4">Field Name</th>
                    <th className="pb-2 w-1/6">Type</th>
                    <th className="pb-2">Description {isThai ? "(คำอธิบาย)" : ""}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr><td className="py-2 font-mono text-slate-700">personnel_id</td><td className="text-amber-600 font-mono text-xs">String</td><td>{isThai ? "รหัสบุคลากร (Unique ID e.g., K001)" : "Unique ID"}</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">title_th</td><td className="text-amber-600 font-mono text-xs">String</td><td>{isThai ? "คำนำหน้า (ไทย)" : "Title (TH)"}</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">first_name_th</td><td className="text-amber-600 font-mono text-xs">String</td><td>{isThai ? "ชื่อจริง (ไทย)" : "First Name (TH)"}</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">last_name_th</td><td className="text-amber-600 font-mono text-xs">String</td><td>{isThai ? "นามสกุล (ไทย)" : "Last Name (TH)"}</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">position</td><td className="text-amber-600 font-mono text-xs">String</td><td>{isThai ? "ตำแหน่งงาน" : "Job Position"}</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">department</td><td className="text-amber-600 font-mono text-xs">String</td><td>{isThai ? "หน่วยงาน/ภาควิชา" : "Department"}</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">employment_status</td><td className="text-amber-600 font-mono text-xs">String</td><td>{isThai ? "ประเภทการจ้าง (ENUM)" : "Employment Type"}</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">email</td><td className="text-amber-600 font-mono text-xs">String</td><td>{isThai ? "อีเมลติดต่อ" : "Email Address"}</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">updated_at</td><td className="text-amber-600 font-mono text-xs">Timestamp</td><td>{isThai ? "เวลาแก้ไขล่าสุด" : "Last Updated"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Collection: Users */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-green-500" />
                <span className="font-mono font-bold text-green-700">collection: 'authorized_users'</span>
              </div>
              <span className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
                {isThai ? "สิทธิ์ผู้ใช้งาน" : "User Permissions"}
              </span>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-100">
                        <th className="pb-2 w-1/4">Document ID</th>
                        <th className="pb-2 w-1/6">Type</th>
                        <th className="pb-2">Description {isThai ? "(คำอธิบาย)" : ""}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr><td className="py-2 font-mono text-slate-700">email</td><td className="text-amber-600 font-mono text-xs">String</td><td>{isThai ? "ใช้อีเมลเป็น Key หลัก" : "Email as Document Key"}</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">role</td><td className="text-amber-600 font-mono text-xs">String</td><td>{isThai ? "ระดับสิทธิ์ (admin, reviewer, user)" : "User Role"}</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">name</td><td className="text-amber-600 font-mono text-xs">String</td><td>{isThai ? "ชื่อที่ใช้แสดงผล" : "Display Name"}</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">added_at</td><td className="text-amber-600 font-mono text-xs">Timestamp</td><td>{isThai ? "วันที่เพิ่มสิทธิ์" : "Date Added"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Data Dictionary */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">3. Data Dictionary</h3>
            <p className="text-sm text-slate-500">
                {isThai ? "พจนานุกรมข้อมูลและค่าตัวเลือก (Enums)" : "Standard Values & Enums"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-700 mb-3">Employment Status (สถานะการจ้าง)</h5>
            <ul className="text-sm space-y-2 text-slate-600">
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>ข้าราชการ</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>พนักงานมหาวิทยาลัย</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>พนักงานเงินรายได้</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>ลูกจ้างประจำ</li>
            </ul>
          </div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-700 mb-3">User Role (ระดับสิทธิ์)</h5>
            <ul className="text-sm space-y-2 text-slate-600">
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span><strong>admin</strong>: {isThai ? "ดูแลระบบทั้งหมด (เพิ่ม/ลบผู้ใช้ แก้ไขข้อมูล)" : "Full Control"}</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full"></span><strong>reviewer</strong>: {isThai ? "ดูข้อมูลได้ทุกส่วน (แก้ไขไม่ได้)" : "View All Data"}</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span><strong>user</strong>: {isThai ? "ดูและแก้ไขเฉพาะข้อมูลตนเอง" : "Edit Own Data"}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
