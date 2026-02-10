"use client";

import { CheckCircle2 } from "lucide-react";

interface SuccessScreenProps {
    goBack: () => void;
    t: boolean; // true = Thai
}

export default function SuccessScreen({ goBack, t }: SuccessScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{t ? "บันทึกลง Firestore สำเร็จ!" : "Saved to Firestore!"}</h3>
            <p className="text-slate-500 text-center max-w-md">
                {t ? "ข้อมูลถูกบันทึกลง Firestore เรียบร้อย สถานะ: Pending (รอตรวจสอบ)" : "Data saved to Firestore. Status: Pending review."}
            </p>
            <button onClick={goBack} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                {t ? "กลับเลือกฟอร์ม" : "Back to Form Selection"}
            </button>
        </div>
    );
}
