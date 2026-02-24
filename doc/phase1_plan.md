# แผนการดำเนินงาน Phase 1: การเชื่อมต่อ ORCiD และระบบความปลอดภัย

ในเฟสนี้จะเน้นการย่อยความซับซ้อนของการจัดการ API Keys และการเพิ่มแหล่งข้อมูลงานวิจัยใหม่จาก ORCiD ซึ่งเป็นมาตรฐานสากล เพื่อให้ระบบ KUVMIS มีความสมบูรณ์ในการติดตามผลงานวิจัยของคณะครับ

## 1. ยกระดับความปลอดภัย (Security & Secrets Management)
ย้ายการเก็บข้อมูลความลับจาก Environment Variables (`.env`) ไปสู่ฐานข้อมูล Firestore เพื่อการจัดการที่ปลอดภัยและยืดหยุ่นกว่า

- **[NEW] `_system_config` Collection**: สร้างคอลเลกชันใหม่ใน Firestore สำหรับเก็บค่าการตั้งค่าระบบและ API Keys (เช่น `SCOPUS_API_KEY`, `ORCID_CLIENT_ID`, `ORCID_CLIENT_SECRET`)
- **[NEW] [configService.ts](file:///c:/Users/PC-DIAG/Downloads/GitHub/mis-edpex/src/services/configService.ts)**: พัฒนา Service สำหรับดึงค่า Config จาก Firestore โดยมีการ Cache เพื่อประสิทธิภาพ
- **[MODIFY] API Proxy Routes**: ปรับปรุง `@/api/scopus` และ API อื่นๆ ให้ดึง Key จาก `configService` แทนการใช้ `process.env`

## 2. การเชื่อมต่อ ORCiD API (ORCiD Integration)
เพิ่มระบบสืบค้นและดึงข้อมูลงานวิจัยจาก ORCiD เพื่อรองรับนักวิจัยที่มีผลงานนอกเหนือจากฐานข้อมูล Scopus

- **[NEW] [orcidService.ts](file:///c:/Users/PC-DIAG/Downloads/GitHub/mis-edpex/src/services/orcidService.ts)**: พัฒนา Logic การติดต่อกับ ORCiD API (OAuth 2.0 Client Credentials Flow)
- **[NEW] [/api/orcid/route.ts](file:///c:/Users/PC-DIAG/Downloads/GitHub/mis-edpex/src/app/api/orcid/route.ts)**: สร้าง Server-side Proxy สำหรับติดต่อกับ ORCiD เพื่อความก้าวหน้าด้านความปลอดภัย
- **[NEW] [Research ORCiD UI](file:///c:/Users/PC-DIAG/Downloads/GitHub/mis-edpex/src/app/research/orcid/page.tsx)**: พัฒนาหน้าจอการสืบค้นและ Sync ข้อมูล โดยใช้ **ธีมสีม่วง (#A020F0)** เพื่อให้แยกแยะจาก Scopus (น้ำเงิน) และ NCBI (เขียว) ได้ชัดเจน

## 3. การจัดระเบียบข้อมูลงานวิจัย (Research Data Harmonization)
- **[MODIFY] Metadata Mapping**: ปรับจูนฟิลด์ข้อมูลที่ดึงจาก ORCiD ให้เข้าสู่โครงสร้างมาตรฐานเดียวกับ `research_logs` เพื่อให้การ Export รายงาน A4 ทำงานได้ทันที
- **[NEW] ORCiD Sync History**: เพิ่มระบบบันทึกประวัติการดึงข้อมูล (Sync Logs) แยกตามเดือน เพื่อใช้ในการตรวจสอบ (Audit) ตามมาตรฐาน ISO 27001

---

## แผนการทดสอบ (Verification Plan)
1. **Security**: ตรวจสอบว่า API Scopus ยังคงทำงานได้ปกติหลังเปลี่ยนมาดึง Key จาก Firestore
2. **Connectivity**: ทดสอบการสืบค้นข้อมูลนิสิตหรืออาจารย์ด้วยรหัส ORCiD จริง
3. **UI/UX**: ตรวจสอบการแสดงผลธีมสีม่วงและความง่ายในการใช้งานหน้า Sync ข้อมูล

**หากคุณนพนธ์เห็นชอบกับแผน Phase 1 นี้ ผมจะเริ่มดำเนินการส่วนระบบความปลอดภัยก่อนเป็นอันดับแรกครับ**
