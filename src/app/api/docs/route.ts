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
      user_guide: {
        th: "📖 คู่มือการใช้งานระบบ KUVMIS (ฉบับสมบูรณ์)",
        en: "All-in-One User Guide",
      },
      app_architecture: {
        th: "🏗️ โครงสร้างสถาปัตยกรรมและรายละเอียดฟีเจอร์",
        en: "System Architecture & Blueprint",
      },
      database_design: {
        th: "🗄️ การออกแบบฐานข้อมูลและ Schema Mapping",
        en: "Database Design & Data Identity",
      },
      kpi_master_data: {
        th: "📊 KPI Master Data (รายละเอียด 61 ตัวชี้วัด)",
        en: "61 KPIs Definition",
      },
      data_integrity_plan: {
        th: "🛡️ แผนการรักษาความถูกต้องของข้อมูล (ALCOA+)",
        en: "Data Integrity Plan",
      },
      qa: {
        th: "✅ มาตรฐาน QA และการรับรองความถูกต้อง",
        en: "Data Authenticity QA",
      },
      version_log: {
        th: "📜 บันทึกการยกระดับระบบ (Version Log)",
        en: "Development History",
      },
      deployment_guide: {
        th: "🚀 คู่มือการ Deployment & Maintenance",
        en: "Deployment Guide",
      },
    };

    const files = fs.readdirSync(DOC_DIR).filter((f) => f.endsWith(".md"));
    const docs = files
      .map((f) => {
        const baseName = f.replace(".md", "");
        const stat = fs.statSync(path.join(DOC_DIR, f));
        const titles = titleMap[baseName];

        // Only include files that are in our titleMap (the main documents)
        if (!titles) return null;

        return {
          name: f,
          title: titles.th,
          subtitle: titles.en,
          size: stat.size,
          modified: stat.mtime.toISOString(),
          isGuide: baseName === "user_guide",
          isArch: baseName === "app_architecture",
          isDb: baseName === "database_design",
        };
      })
      .filter((d) => d !== null)
      .sort((a, b) => {
        if (a.isGuide) return -1;
        if (b.isGuide) return 1;
        if (a.isArch) return -1;
        if (b.isArch) return 1;
        if (a.isDb) return -1;
        if (b.isDb) return 1;
        return a.title.localeCompare(b.title);
      });
    return NextResponse.json({ docs });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
