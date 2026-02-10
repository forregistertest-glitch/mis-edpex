# KUVMIS Feature List
# คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเกษตรศาสตร์

## 1. Executive Dashboard
- **Glassmorphic UI**: ดีไซน์พรีเมียมด้วย Tailwind CSS + gradient backgrounds
- **KPI Pulse Cards**: 4 cards (Academic, Customer, Strategic, Safety) แสดงค่าปัจจุบัน
- **Strategic Objectives**: แถบ progress bars สำหรับ SO1-SO6
- **Hero Banner**: สรุปข้อมูลเชิงบริหาร + ปีงบประมาณ

## 2. Academic Analytics
- **Trend Chart**: เส้นกราฟ KPI วิชาการ 5 ปี (2564-2568) ด้วย Chart.js
- **KPI 7.1.13 Supply Chain**: จำนวนโรงเรียนเครือข่ายและนิสิตรับเข้า
- **KPI 7.1.16-19 Research Grants**: วิเคราะห์ทุนวิจัยภายใน/ภายนอก

## 3. Data Explorer
- **Full-Screen Overlay**: ตาราง interactive เปิดจากปุ่ม "ดูรายละเอียด"
- **Real-Time Search**: ค้นหาข้อมูลทุก column ทันที
- **Pagination**: 50/100/500 แถวต่อหน้า
- **Multi-Format Export**: Excel (.xlsx), JSON, CSV

## 4. KPI Data Input System (NEW v1.1)
- **7 Dynamic Forms**: Academic, Graduate Matrix, Research, Hospital, HR, Strategic, Narrative
- **Auto-Rendered Fields**: select, number, text, textarea, file — จาก JSON spec
- **Validation**: required check, min/max range, แจ้งเตือนสีแดง
- **Preview Modal**: สรุปข้อมูลก่อนส่ง
- **Audit Trail Table**: ตาราง submissions ล่าสุดพร้อม status badge

## 5. Bilingual Support
- **Thai/English Toggle**: สลับภาษาทั้ง UI ด้วย `translations.ts`
- **40+ Translation Keys**: ครอบคลุมชื่อ tab, labels, descriptions, messages

## 6. Data Ingestion
- **Smart Parsing**: แปลงข้อมูล Excel/SAR จาก 61 sheets → JSON → Firestore
- **4 Collections**: academic_results, customer_feedback, workforce_stats, strategic_kpis
- **Standardized Schema**: fiscal_year + kpi_id เป็น primary keys

## 7. Global Export
- **One-Click Full Export**: ดาวน์โหลดข้อมูลทุก collection ใน Excel ไฟล์เดียว (แยก sheet)
- **Raw JSON Dump**: สำหรับนักพัฒนา

## 8. Technical Architecture
- **Next.js 16 (App Router)** + TypeScript
- **Firebase Firestore** (serverless NoSQL)
- **Tailwind CSS 4** (utility-first styling)
- **Lucide React** (semantic icons)
- **Chart.js** (data visualization)
- **SheetJS** (Excel export)

## 9. Foundation for Future
- Firebase Authentication (planned)
- Hospital/HR data modules (structure ready)
- Automated SAR report generation (planned)
- Real-time data sync (planned)
