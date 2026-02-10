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
      return NextResponse.json({ name: file, content });
    }

    // List all docs
    const files = fs.readdirSync(DOC_DIR).filter((f) => f.endsWith(".md"));
    const docs = files.map((f) => {
      const stat = fs.statSync(path.join(DOC_DIR, f));
      return {
        name: f,
        title: f.replace(/_/g, " ").replace(".md", ""),
        size: stat.size,
        modified: stat.mtime.toISOString(),
      };
    });
    return NextResponse.json({ docs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
