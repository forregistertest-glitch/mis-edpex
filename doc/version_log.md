# MIS-EDPEx Version Log

เอกสารสำหรับบันทึกประวัติการพัฒนาฟีเจอร์ เทคนิคที่ใช้ และอุปสรรคที่พบ

---

## [Initial Version Log Setup]
- **วันที่**: 2026-02-17
- **เวลา**: 13:15 (GMT+7)
- **สรุป**: เริ่มต้นใช้งานระบบ Global Agent Context และระบบ Version Log สำหรับโปรเจกต์
- **เทคนิค**: ใช้ Global Configuration ไฟล์เพื่อกำหนดพฤติกรรมการทำงานภาษาไทยและลำดับความสำคัญของงาน (Planning-First)
- **อุปสรรค**: -

---

## [UI/UX Standardization & Full-Page forms]
- **วันที่**: 2026-02-17
- **เวลา**: 14:00 (GMT+7)
- **สรุป**: ปรับปรุง UI ทั้งระบบให้เป็น Standard Input UI และเปลี่ยนจาก Modal เป็น Full-Page
- **เทคนิค**: 
    - Refactor `StudentForm` ให้รองรับ Wide Layout (`max-w-5xl`) และจัดกลุ่ม Input ให้สวยงาม
    - ติดตั้ง Sticky Header พร้อม Backdrop Blur (Glassmorphism) สำหรับหน้าฟอร์มทั้งหมด
    - เพิ่มระบบ Smooth Scroll "Back to Top" ในหน้ารายการ
    - ปรับปรุง UI Consistency ระหว่างโมดูล Student และ Personnel
- **อุปสรรค**: การปิด Modal เดิมและจัดการ State การนำทางใหม่ในหน้าลิสต์

---

## [Student Module Phase I — v.1.03]
- **วันที่**: 2026-02-17
- **เวลา**: 20:30 (GMT+7)
- **สรุป**: พัฒนาระบบจัดการข้อมูลนิสิตบัณฑิตศึกษาครบ Phase I
- **เทคนิค**:
    - เพิ่ม Field ใหม่ใน `GraduateStudent`, `StudentPublication`, `StudentProgress` interfaces ตาม CSV จริง
    - สร้าง `Advisor` interface และ `AdvisorService` พร้อม CRUD operations
    - สร้างระบบ Autocomplete สำหรับชื่ออาจารย์, สาขาวิชา, ภาควิชา (Hook + Component)
    - ปรับปรุง `StudentForm` ด้วย InputField helper, เพิ่ม Tab วิทยานิพนธ์/กรรมการ/การสำเร็จ
    - สร้างหน้าจัดการอาจารย์ (`/advisor`) ตาม UI Pattern ของ HR Module (Back, Pagination, Back-to-Top)
    - เพิ่มปุ่ม Eye (ดูนิสิตในสังกัด) ในตารางอาจารย์ — ขยายแถวแสดงรายชื่อ
    - ปรับปรุงช่องค้นหาตารางนิสิตให้ค้นได้ทุกคอลัมน์ (รหัส, ชื่อ, สาขา, อาจารย์, ภาควิชา, ระดับ, หลักสูตร, สถานะ)
    - สร้างหน้า Seed Data (`/seed`) สำหรับทดสอบ (ชั่วคราว)
    - สร้างเอกสาร `user_student_manual.md` (KUVMIS-DOC-013)
- **อุปสรรค**: Dev server ใช้ทรัพยากรมาก ทำให้ terminal commands ช้า — แก้ด้วยการสร้างหน้า Seed ผ่าน Browser แทน

---

---

## [Research Module Enhancement — v.1.3b ORCiD API]
- **วันที่**: 2026-02-23
- **เวลา**: 20:00 (GMT+7)
- **สรุป**: เพิ่มระบบเชื่อมต่อ ORCiD API และปรับปรุง UI งานวิจัยสู่มาตรฐานความปลอดภัยสูง
- **เทคนิค**:
    - **Security**: ย้าย API Keys ทั้งหมดไปเก็บที่ Firestore Secrets เพื่อความปลอดภัย (ISO 27001 Compliance)
    - **ORCiD API**: พัฒนา Proxy Route (OAuth 2.0 Client Credentials) เพื่อสืบค้นข้อมูลนักวิจัยระดับสากล
    - **UI Standard**: ปรับปรุงหน้าจอ ORCiD จากระบบ Split-screen เดิม ให้เป็น **Single Column Standard UI** พร้อมติดตั้ง **Progress Modal** ตามแบบอย่าง Scopus และ NCBI
    - **Branding**: ผสานธีมสี Indigo (Standard Research) และ Purple (ORCiD) อย่างลงตัว
    - **Deployment**: เตรียมระบบรองรับ CI/CD บน Vercel พร้อมดึง Configuration จากระบบ Cloud Firestore โดยตรง
- **อุปสรรค**: โครงสร้างข้อมูล ORCiD มีความซับซ้อน (Nested JSON) — แก้ไขโดยการทำ Data Flattening ในฝั่ง API Proxy

---

## [Remodel UI & Full API Integration — v.1.4]
- **วันที่**: 2026-02-24
- **เวลา**: 12:30 (GMT+7)
- **สรุป**: ปรับโฉม UI ใหม่ยกเครื่อง (Remodel) พร้อมเชื่อมต่อ API งานวิจัยสมบูรณ์แบบ (Scopus, NCBI, ORCiD)
- **เทคนิค**:
    - **UI Refinement**: ปรับปรุงปุ่มและสีประจำโมดูล (Branding) ให้เป็นระบบเดียวกัน (White-background style for secondary actions)
    - **Navigation Optimization**: ปรับปรุง Loading logic ใน `app/page.tsx` เพื่อลด Flicker เวลาสลับหน้า
    - **API Integration**: เชื่อมต่อ NCBI (PubMed) สำหรับงานวิจัยสายการแพทย์ และ ORCiD สำหรับข้อมูลนักวิจัยสากล
    - **Documentation**: ปรับปรุงคู่มือการใช้งานและการติดตั้งเป็นเวอร์ชัน 1.4
- **อุปสรรค**: การกะพริบของ Layout (Flicker) เมื่อมีการโหลดคอมโพเนนต์ใหม่ — แก้ไขโดยการแยกส่วน Content Loading ออกจาก Layout พื้นฐาน

---

## [Import Data Module (Staging Area) — v.1.5]
- **วันที่**: 2026-03-05
- **เวลา**: 13:45 (GMT+7)
- **สรุป**: พัฒนาโมดูล "ข้อมูลนำเข้า" (Import Data) สำหรับนำเข้าข้อมูลบุคลากรจากแอปพลิเคชันภายนอก (เช่น HumanSoft) เข้าสู่ระบบ MIS ในรูปแบบ Staging Area
- **เทคนิค**:
    - **UI Form (ImportDataForm.tsx)**: สร้างฟอร์มข้อมูลบุคลากรแบบ Tab Navigation (6 tabs: ข้อมูลทั่วไป, ที่อยู่และติดต่อ, การจ้างงาน, บัญชีธนาคาร, วุฒิการศึกษา, สถิติเวลาทำงาน)
    - **PDPA Toggle**: ปุ่มสวิตช์เปิด-ปิดการบังข้อมูลส่วนบุคคลตามกฎหมาย PDPA พร้อม Icon Eye/EyeOff แสดงสถานะ
    - **Profile Picture Upload**: UI สำหรับอัปโหลดรูปถ่ายพนักงานพร้อม placeholder ไอคอนกล้อง
    - **ฟิลด์ครบถ้วน**: รหัสประจำตัว, เลขพาสปอร์ต, Research IDs (Scopus/NCBI/ORCID), คำนำหน้าทางวิชาการ/วิชาชีพ/ราชการ, ชื่อ TH/EN, ประวัติส่วนตัว, ที่อยู่, การจ้างงาน, บัญชีธนาคาร, วุฒิการศึกษา, สถิติเวลาทำงาน
    - **Navigation**: เพิ่มการ์ด "ข้อมูลนำเข้า" ในหน้าการจัดการข้อมูล (InputHub) พร้อม Upload icon สี indigo
    - **Page Title**: หน้ารายการ = "ข้อมูลนำเข้า", หน้าเพิ่มข้อมูล = "เพิ่มข้อมูลนำเข้าใหม่ (Staging)"
    - **Personnel Title Update**: เปลี่ยนชื่อหน้า /personnel จาก "งานบุคคล" เป็น "ข้อมูลบุคลากร"
- **อุปสรรค**: Browser automation ไม่สามารถเชื่อมต่อ CDP Port ในช่วง development ได้ — แก้ไขโดยการตรวจสอบ UI ด้วยมือและรัน `npm run build` เพื่อยืนยัน code integrity
