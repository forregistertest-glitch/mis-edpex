"use client";

import ImportDataForm from "@/components/import-data/ImportDataForm";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditImportDataPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        // UI-Only Dummy Submit
        console.log("Submit UI Only Edit:", data);
        alert(`อัปเดตข้อมูล ID: ${params.id} สำเร็จ (UI Only - แบบร่าง)`);
        router.push("/import-data");
    };

    return (
        <div className="container mx-auto p-6 font-sarabun max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/import-data" className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-colors text-slate-400">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="bg-indigo-100 p-2 rounded-lg">
                            <Edit size={24} className="text-indigo-600" />
                        </span>
                        แก้ไขข้อมูลนำเข้า (Staging)
                    </h1>
                    <p className="text-slate-500 mt-1 ml-12">แก้ไข/ตรวจสอบข้อมูลนำเข้ารหัส {params.id}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <ImportDataForm
                    onSubmit={handleSubmit}
                    onCancel={() => router.push("/import-data")}
                    loading={false}
                />
            </div>
        </div>
    );
}
