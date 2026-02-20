import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DOC_DIR = path.join(process.cwd(), "doc");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  try {
    if (file) {
      // Return single file content
      const filePath = path.join(DOC_DIR, file);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      const content = fs.readFileSync(filePath, "utf-8");

      // Validating extension for security
      if (file.endsWith(".html")) {
        return new NextResponse(content, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      return NextResponse.json({ name: file, content });
    }

    const titleMap: Record<string, { th: string; en: string }> = {
      "user_guide": { th: "📖 คู่มือการใช้งาน KUVMIS", en: "KUVMIS User Guide" },
      "auth_and_workflow": { th: "🔐 ระบบยืนยันตัวตนและ Workflow", en: "Auth & Approval Workflow" },
      "app_architecture": { th: "โครงสร้างทางสถาปัตยกรรม", en: "System Architecture" },
      "database_design": { th: "การออกแบบฐานข้อมูล", en: "Database Schema" },
      "data_dictionary": { th: "พจนานุกรมข้อมูล", en: "Data Dictionary" },
      "features_list": { th: "รายการฟีเจอร์ปัจจุบัน", en: "System Features" },
      "input_manual": { th: "คู่มือการใช้ฟอร์มกรอกข้อมูล", en: "Data Input Manual" },
      "firebase_capacity": { th: "Firebase Capacity", en: "Pilot Test Quotas" },
      "qa": { th: "QA: ความถูกต้องของข้อมูล", en: "Data Authenticity QA" },
      "kpi_master_data": { th: "KPI Master Data", en: "61 KPIs Definition" },
      "performance_seed_data": { th: "ข้อมูลจำลองผลการดำเนินงาน", en: "Performance Seed Data" },
      "data_integrity_plan": { th: "แผนการรักษาความถูกต้องของข้อมูล", en: "Data Integrity Plan" },
      "user_hr_manual": { th: "คู่มือการจัดการผู้ใช้ & HR (v.1.1b)", en: "User & HR Manual" },
      "import_export_manual": { th: "คู่มือ Import / Export / Backup (v1.1b)", en: "Import, Export & Backup Manual" },
      "import_manual_v1_2": { th: "คู่มือการนำเข้าข้อมูลและการเชื่อมต่อ Scopus (v1.2)", en: "Data Import & Scopus Sync Manual (v1.2)" },
      "user_research_manual": { th: "🔬 คู่มือโมดูลวิจัย & Scopus Integration (v1.3)", en: "Research & Scopus Manual (v1.3)" },
      "convert_script_guide": { th: "คู่มือ Script แปลงไฟล์ Excel", en: "Excel Conversion Script Guide" },
      "scopus_api_comparison": { th: "📊 เปรียบเทียบ Scopus API (Standard vs Complete)", en: "Scopus API Data Comparison" }
    };

    const files = fs.readdirSync(DOC_DIR).filter((f) => f.endsWith(".md"));
    const docs = files.map((f) => {
      const baseName = f.replace(".md", "");
      const stat = fs.statSync(path.join(DOC_DIR, f));
      const titles = titleMap[baseName] || { th: baseName.replace(/_/g, " "), en: "" };
      return {
        name: f,
        title: titles.th,
        subtitle: titles.en,
        size: stat.size,
        modified: stat.mtime.toISOString(),
        isGuide: baseName === "user_guide",
        isHrManual: baseName === "user_hr_manual",
        isManual: baseName === "input_manual",
        isImportManual: baseName === "import_export_manual"
      };
    }).sort((a, b) => {
      if (a.isGuide) return -1;
      if (b.isGuide) return 1;
      if (a.isHrManual) return -1;
      if (b.isHrManual) return 1;
      if (a.isManual) return -1;
      if (b.isManual) return 1;
      if (a.isImportManual) return -1;
      if (b.isImportManual) return 1;
      return a.title.localeCompare(b.title);
    });
    return NextResponse.json({ docs });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
