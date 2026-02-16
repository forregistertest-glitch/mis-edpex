import { Database, Server, BookOpen } from "lucide-react";

interface Props {
  lang: "th" | "en";
}

export default function SystemDocs({ lang }: Props) {
  const isThai = lang === "th";

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">System Documentation</h2>
          <p className="text-slate-400">
            {isThai
              ? "เอกสารอ้างอิงสำหรับผู้ดูแลระบบ (Superadmin)"
              : "Reference documentation for system administrators"}
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
            <p className="text-sm text-slate-500">สถาปัตยกรรมระบบ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-slate-700 mb-3 border-l-4 border-blue-500 pl-3">Tech Stack</h4>
            <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside bg-slate-50 p-4 rounded-xl">
              <li><strong>Frontend:</strong> Next.js 14 (App Router)</li>
              <li><strong>Language:</strong> TypeScript</li>
              <li><strong>Styling:</strong> Tailwind CSS + Lucide Icons</li>
              <li><strong>State:</strong> React Context (AuthContext)</li>
              <li><strong>Deployment:</strong> Vercel</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-3 border-l-4 border-amber-500 pl-3">Backend (Firebase)</h4>
            <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside bg-slate-50 p-4 rounded-xl">
              <li><strong>Auth:</strong> Google Sign-In + Whitelist</li>
              <li><strong>Database:</strong> Cloud Firestore (NoSQL)</li>
              <li><strong>Security:</strong> Firestore Rules</li>
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
            <p className="text-sm text-slate-500">โครงสร้างฐานข้อมูล (Firestore)</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Collection: Personnel */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="font-mono font-bold text-indigo-700">collection: 'personnel'</span>
              <span className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">บุคลากร</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="pb-2">Field</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr><td className="py-2 font-mono text-slate-700">personnel_id</td><td className="text-amber-600">String</td><td>Unique ID (e.g., K001)</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">title_th</td><td className="text-amber-600">String</td><td>คำนำหน้า (ไทย)</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">first_name_th</td><td className="text-amber-600">String</td><td>ชื่อจริง (ไทย)</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">last_name_th</td><td className="text-amber-600">String</td><td>นามสกุล (ไทย)</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">position</td><td className="text-amber-600">String</td><td>ตำแหน่งงาน</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">department</td><td className="text-amber-600">String</td><td>หน่วยงาน/งาน</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">employment_status</td><td className="text-amber-600">String</td><td>สถานะการจ้าง (ข้าราชการ/พนักงานฯ)</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">updated_at</td><td className="text-amber-600">Timestamp</td><td>เวลาแก้ไขล่าสุด</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Collection: Student */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="font-mono font-bold text-green-700">collection: 'students'</span>
              <span className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">นิสิต</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="pb-2">Field</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr><td className="py-2 font-mono text-slate-700">student_id</td><td className="text-amber-600">String</td><td>Unique Student ID (รหัสนิสิต)</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">title_th</td><td className="text-amber-600">String</td><td>คำนำหน้า</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">first_name_th</td><td className="text-amber-600">String</td><td>ชื่อจริง</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">last_name_th</td><td className="text-amber-600">String</td><td>นามสกุล</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">program</td><td className="text-amber-600">String</td><td>สาขาวิชา (e.g., VPH)</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">degree_level</td><td className="text-amber-600">String</td><td>ระดับปริญญา (Master/Doctoral)</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">advisor_id</td><td className="text-amber-600">String</td><td>รหัสอาจารย์ที่ปรึกษา (Ref: personnel)</td></tr>
                  <tr><td className="py-2 font-mono text-slate-700">current_status</td><td className="text-amber-600">String</td><td>สถานะภาพ (Studying/Graduated)</td></tr>
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
            <p className="text-sm text-slate-500">พจนานุกรมข้อมูลและตัวเลือก (Enums)</p>
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
            <h5 className="font-bold text-slate-700 mb-3">User Role (สิทธิ์การใช้งาน)</h5>
            <ul className="text-sm space-y-2 text-slate-600">
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span><strong>admin</strong>: Full Access (Manage Users, Docs)</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full"></span><strong>reviewer</strong>: View All Data (Read-only)</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span><strong>user</strong>: Edit Own Data Only</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
