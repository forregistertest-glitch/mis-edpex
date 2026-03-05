"use client";

import { useState } from "react";
import { Save, Loader2, User, MapPin, Briefcase, Landmark, GraduationCap, Clock, Camera, Upload, Eye, EyeOff } from "lucide-react";

interface ImportDataFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export default function ImportDataForm({
    initialData = {},
    onSubmit,
    onCancel,
    loading = false,
}: ImportDataFormProps) {
    const [activeTab, setActiveTab] = useState("personal");
    const [isUnmasked, setIsUnmasked] = useState(false);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({}); // UI Only
    };

    const tabs = [
        { id: "personal", label: "ข้อมูลทั่วไป", icon: <User size={16} /> },
        { id: "address", label: "ที่อยู่และติดต่อ", icon: <MapPin size={16} /> },
        { id: "employment", label: "การจ้างงาน", icon: <Briefcase size={16} /> },
        { id: "financial", label: "บัญชีธนาคาร", icon: <Landmark size={16} /> },
        { id: "education", label: "วุฒิการศึกษา", icon: <GraduationCap size={16} /> },
        { id: "time_log", label: "สถิติเวลาทำงาน", icon: <Clock size={16} /> },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-8">
                {/* Personal Tab */}
                <div className={activeTab === "personal" ? "block animate-in fade-in" : "hidden"}>

                    {/* PDPA Banner with Toggle */}
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6 flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h4 className="text-amber-800 font-bold text-sm mb-1">ระบบมีการปกปิดข้อมูลส่วนบุคคลตามกฎหมาย PDPA (Masking Applied)</h4>
                            <p className="text-amber-700 text-xs mb-2">ในการพัฒนาจริงจะเป็นส่วนของ permission ในการเข้าถึงข้อมูลระดับสูง สำหรับผู้ดูแลระบบเท่านั้น</p>
                            <p className="text-xs pt-2 border-t border-amber-200/50">
                                <strong>แหล่งที่มาข้อมูล:</strong> ป้าย <span className="bg-slate-100 text-slate-500 border border-slate-200 px-1 rounded mx-1 text-[10px] font-mono">employee_code</span> คือข้อมูลจาก Excel HumanSoft | ป้าย <span className="bg-slate-100 text-slate-500 border border-slate-200 px-1 rounded mx-1 text-[10px] font-mono">MIS</span> คือข้อมูลที่ระบบ MIS ควรเพิ่ม
                            </p>
                        </div>
                        {/* PDPA Toggle Switch */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                            <button
                                type="button"
                                onClick={() => setIsUnmasked(!isUnmasked)}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isUnmasked ? 'bg-[#006664] focus:ring-[#006664]' : 'bg-slate-300 focus:ring-slate-400'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isUnmasked ? 'translate-x-8' : 'translate-x-1'}`} />
                            </button>
                            <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                {isUnmasked ? <><Eye size={10} /> เปิด</> : <><EyeOff size={10} /> ปิด</>}
                            </span>
                        </div>
                    </div>

                    {/* Profile Picture Upload */}
                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">รูปถ่ายพนักงาน (PROFILE PICTURE) <span className="text-red-600 text-[11px] font-normal">[MIS ONLY]</span></h2>
                        <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            {/* Photo placeholder */}
                            <div className="w-28 h-28 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                                <Camera size={32} className="text-slate-400" />
                            </div>
                            {/* Upload info */}
                            <div className="flex-1">
                                <button type="button" className="flex items-center gap-2 px-4 py-2 bg-[#006664] hover:bg-[#005553] text-white rounded-lg text-sm font-medium transition-colors mb-2">
                                    <Upload size={16} />
                                    อัปโหลดรูปถ่ายพนักงานใหม่
                                </button>
                                <p className="text-xs text-slate-500">รองรับไฟล์ JPG, PNG หรือภาพหน้าตรงแบบเป็นทางการ ขนาดไฟล์ไม่เกิน 2MB (ขนาดแนะนำ 400x400 px)</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">รหัสประจำตัว (Identification Numbers)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    รหัสอ้างอิงระบบ (Auto Gen) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span>
                                </label>
                                <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" value="MIS-P-88492" readOnly />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    รหัสมหาวิทยาลัย <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-blue-600 font-mono">employee_code</span>
                                </label>
                                <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" value="88492" readOnly />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    รหัสบัตร (Security No.) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span>
                                </label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none" defaultValue="1004592" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    เลขบัตรประชาชน <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-blue-600 font-mono">id_no</span>
                                </label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none privacy-mask" defaultValue="1-1002-99887-12-3" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    เลขพาสปอร์ต <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">passport</span>
                                </label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none privacy-mask text-slate-500" defaultValue="-" placeholder="Not available" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    รหัสสแกนนิ้ว <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span>
                                </label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700" defaultValue="88492" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">รหัสฐานข้อมูลนักวิจัย (Research ID) <span className="text-red-600 text-[11px] font-normal">[MIS ONLY]</span></h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">Scopus ID</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="e.g. 5720xxxxxxx" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">NCBI ID</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="e.g. johndoe" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">ORCID</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="e.g. 0000-0002-xxxx-xxxx" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">รหัสผู้แต่ง (Author ID)</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="e.g. 123456789" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">รายละเอียดชื่อสกุล (Naming)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    คำนำหน้าทางวิชาการ <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span>
                                </label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none" defaultValue="รศ.">
                                    <option value="">-- ไม่มี --</option>
                                    <option value="ศ.">ศ.</option>
                                    <option value="รศ.">รศ.</option>
                                    <option value="ผศ.">ผศ.</option>
                                    <option value="อ.">อ.</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    นำหน้าวิชาชีพ/คุณวุฒิ <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span>
                                </label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none" defaultValue="น.สพ.">
                                    <option value="">-- ไม่มี --</option>
                                    <option value="น.สพ.">น.สพ.</option>
                                    <option value="สพ.ญ.">สพ.ญ.</option>
                                    <option value="นพ.">นพ.</option>
                                    <option value="พญ.">พญ.</option>
                                    <option value="ทพ.">ทพ.</option>
                                    <option value="ทพญ.">ทพญ.</option>
                                    <option value="ดร.">ดร.</option>
                                    <option value="น.สพ.ดร.">น.สพ.ดร.</option>
                                    <option value="สพ.ญ.ดร.">สพ.ญ.ดร.</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    คำนำหน้าทางราชการ / ฐานันดรศักดิ์ <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span>
                                </label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none">
                                    <option value="">-- ไม่มี --</option>
                                    <option>ม.ร.ว.</option>
                                    <option>ม.ล.</option>
                                    <option>ว่าที่ ร.ต.</option>
                                    <option>พล.ต.อ.</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    คำนำหน้า (TH) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-blue-600 font-mono">title_lv</span>
                                </label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none">
                                    <option>นาย</option>
                                    <option>นาง</option>
                                    <option>นางสาว</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    ชื่อ (TH) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-blue-600 font-mono">name</span>
                                </label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none privacy-mask" defaultValue="สมชาย" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    นามสกุล (TH) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-blue-600 font-mono">last_name</span>
                                </label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none privacy-mask" defaultValue="ใจดี" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    ชื่อเล่น <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-blue-600 font-mono">nickname</span>
                                </label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none" defaultValue="ชาย" />
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    คำนำหน้า (EN) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span>
                                </label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none">
                                    <option>Mr.</option>
                                    <option>Mrs.</option>
                                    <option>Miss</option>
                                    <option>Dr.</option>
                                    <option>Prof.</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    ชื่อ (EN) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-blue-600 font-mono">name_en</span>
                                </label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none privacy-mask" defaultValue="Somchai" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                                    นามสกุล (EN) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-blue-600 font-mono">last_name_en</span>
                                </label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none privacy-mask" defaultValue="Jaidee" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">ประวัติส่วนตัว (Personal Details)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">เพศ</label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none">
                                    <option>ชาย (Male)</option>
                                    <option>หญิง (Female)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">วันเกิด</label>
                                <input type="date" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none" defaultValue="1985-06-15" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">สัญชาติ</label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none">
                                    <option>ไทย (Thai)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">กรุ๊ปเลือด</label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none">
                                    <option>O</option>
                                    <option>A</option>
                                    <option>B</option>
                                    <option>AB</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Address Tab */}
                <div className={activeTab === "address" ? "block animate-in fade-in" : "hidden"}>
                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">ข้อมูลติดต่อ (Contact Info)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">เบอร์มือถือหลัก</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none privacy-mask text-slate-500" defaultValue="089-123-4567" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">เบอร์มือถือสำรอง <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span></label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none privacy-mask text-slate-500" defaultValue="-" placeholder="Optional" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">เบอร์ติดต่อภายใน (Ext.)</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700" defaultValue="1234" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">อีเมลองค์กร (Primary)</label>
                                <input type="email" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none privacy-mask text-slate-500" defaultValue="somchai.j@mockup.ac.th" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">อีเมลส่วนตัว (Personal) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span></label>
                                <input type="email" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none privacy-mask text-slate-500" placeholder="e.g. gmail.com" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">ที่อยู่ตามทะเบียนบ้าน</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">บ้านเลขที่ / หมู่ / ซอย / ถนน</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none privacy-mask text-slate-500" defaultValue="99/9 หมู่บ้านจำลอง ซอยสันติสุข ถนนวงแหวนรอบนอก" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">จังหวัด</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700" defaultValue="กรุงเทพมหานคร" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">เขต / อำเภอ</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700" defaultValue="จตุจักร" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">แขวง / ตำบล</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700" defaultValue="ลาดยาว" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">รหัสไปรษณีย์ <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span></label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700" defaultValue="10900" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employment Tab */}
                <div className={activeTab === "employment" ? "block animate-in fade-in" : "hidden"}>
                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">ข้อมูลการจ้างงาน</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ประเภทพนักงาน</label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700">
                                    <option>พนักงานมหาวิทยาลัยเงินงบประมาณ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">วิทยาเขต (Campus) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span></label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700">
                                    <option>บางเขน (Bangkhen)</option>
                                    <option>กำแพงแสน (Kamphaeng Saen)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">สำนัก / แผนก</label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700">
                                    <option>สำนักบริการคอมพิวเตอร์</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ฝ่าย / ศูนย์ (Division)</label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700">
                                    <option>ศูนย์บริหารระบบสารสนเทศ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ตำแหน่งงาน (Job Title)</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700" defaultValue="นักวิชาการคอมพิวเตอร์ชำนาญการ" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ตำแหน่งในแผนก (Management Positions) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span></label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700">
                                    <option value="">-- None --</option>
                                    <option>หัวหน้าฝ่าย</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">วันที่เริ่มงาน</label>
                                <input type="date" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700" defaultValue="2015-04-01" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">วันที่บรรจุ</label>
                                <input type="date" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700" defaultValue="2015-10-01" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ตำแหน่งงานบริหาร (Executive Positions) <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-red-600 font-mono">MIS</span></label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700">
                                    <option value="">-- None --</option>
                                    <option>คณบดี</option>
                                    <option>รองคณบดี</option>
                                    <option>ผู้อำนวยการศูนย์</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Tab */}
                <div className={activeTab === "financial" ? "block animate-in fade-in" : "hidden"}>
                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">ข้อมูลบัญชีเงินเดือน</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">เงินเดือนปัจจุบัน (Current Salary)</label>
                                <div className="relative border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-100 overflow-hidden">
                                    <span className="absolute left-4 top-2.5 text-slate-500 font-bold">฿</span>
                                    <input type="text" className="w-full p-2.5 pl-10 text-right outline-none blur-[4px] hover:blur-none transition-all" defaultValue="35,000.00" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">วิธีการรับเงิน</label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl outline-none">
                                    <option>โอนเข้าบัญชี (Transfer)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ธนาคารหลัก</label>
                                <select className="w-full p-2.5 border border-slate-200 rounded-xl outline-none">
                                    <option>ธนาคารกรุงไทย (KTB)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">เลขที่บัญชีงหลัก</label>
                                <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none blur-[4px] hover:blur-none transition-all" defaultValue="123-4-56789-0" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Education Tab */}
                <div className={activeTab === "education" ? "block animate-in fade-in" : "hidden"}>
                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">ประวัติการศึกษา</h2>
                        <div className="border border-slate-200 rounded-xl overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                    <tr>
                                        <th className="p-4 font-semibold">ระดับการศึกษา</th>
                                        <th className="p-4 font-semibold">ชื่อปริญญา (เต็ม/ย่อ)</th>
                                        <th className="p-4 font-semibold">สาขาวิชา</th>
                                        <th className="p-4 font-semibold">สถาบันการศึกษา</th>
                                        <th className="p-4 font-semibold">ปีที่จบ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">ปริญญาโท</td>
                                        <td className="p-4">วิทยาศาสตรมหาบัณฑิต (วท.ม.)</td>
                                        <td className="p-4">วิศวกรรมซอฟต์แวร์</td>
                                        <td className="p-4">มหาวิทยาลัยกรุงเทพจำลอง</td>
                                        <td className="p-4">2560</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">ปริญญาตรี</td>
                                        <td className="p-4">วิทยาศาสตรบัณฑิต (วท.บ.)</td>
                                        <td className="p-4">วิทยาการคอมพิวเตอร์</td>
                                        <td className="p-4">มหาวิทยาลัยภูมิภาคสมมุติ</td>
                                        <td className="p-4">2556</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Time Log Tab */}
                <div className={activeTab === "time_log" ? "block animate-in fade-in" : "hidden"}>
                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">สถิติเวลาทำงาน และการลา</h2>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                                <div className="text-xs font-bold text-slate-500 mb-1">ลาพักร้อน (Annual)</div>
                                <div className="text-2xl font-black text-indigo-600">10/10 <span className="text-sm font-medium text-slate-400">วัน</span></div>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                                <div className="text-xs font-bold text-slate-500 mb-1">ลาป่วย (Sick)</div>
                                <div className="text-2xl font-black text-indigo-600">28/30 <span className="text-sm font-medium text-slate-400">วัน</span></div>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                                <div className="text-xs font-bold text-slate-500 mb-1">ลากิจ (Personal)</div>
                                <div className="text-2xl font-black text-indigo-600">3/15 <span className="text-sm font-medium text-slate-400">วัน</span></div>
                            </div>
                        </div>

                        <div className="text-sm font-bold text-slate-600 mb-2">ประวัติการลงเวลา 3 วันล่าสุด</div>
                        <div className="border border-slate-200 rounded-xl overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-700">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                    <tr>
                                        <th className="p-4 font-semibold">วันที่</th>
                                        <th className="p-4 font-semibold">สถานะเข้างาน</th>
                                        <th className="p-4 font-semibold">เวลาเข้า-ออกช่วง 1</th>
                                        <th className="p-4 font-semibold">เวลาเข้า-ออกช่วง 2</th>
                                        <th className="p-4 font-semibold text-right">สาย/OT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-4">01/02/2026</td>
                                        <td className="p-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold">ปฏิบัติงานปกติ</span></td>
                                        <td className="p-4 font-mono text-xs">08:24 - 12:00</td>
                                        <td className="p-4 font-mono text-xs">13:00 - 16:35</td>
                                        <td className="p-4 text-right">-</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-4">02/02/2026</td>
                                        <td className="p-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold">ปฏิบัติงานปกติ</span></td>
                                        <td className="p-4 font-mono text-xs">08:45 - 12:00</td>
                                        <td className="p-4 font-mono text-xs">13:00 - 18:30</td>
                                        <td className="p-4 text-right">
                                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold mr-1" title="สาย">15m</span>
                                            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold" title="OT">2.0</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 font-medium text-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        บันทึกข้อมูลนำเข้า
                    </button>
                </div>
            </form>
        </div>
    );
}
