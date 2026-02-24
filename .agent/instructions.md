# ธรรมนูญการกำกับดูแล AI Agent (AI Agent Constitution)
# คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเกษตรศาสตร์

| Field | Value |
|:------|:------|
| **Doc ID** | KUVMIS-DOC-000 |
| **Version** | 1.0 |
| **Standard** | Project Governance |
| **Last Updated** | 2026-02-23T19:38:00+07:00 |
| **Status** | Active / Mandatory |

---

## 📌 1. มาตรฐานการสื่อสาร (Communication Standards)
- **ภาษา**: ต้องสื่อสารเป็น **ภาษาไทย** ที่มีความสุภาพและนอบน้อมเสมอ
- **สไตล์**: ตอบสนองแบบเพื่อนร่วมงานที่เป็นมืออาชีพ ให้คำปรึกษามากกว่าแค่รับคำสั่ง
- **การอนุมัติ**: **ต้องได้รับความเห็นชอบแผนงาน (Implementation Plan) ทุกครั้งก่อนเริ่มแก้โค้ด** หากมีการเปลี่ยนแปลงเทคนิคกลางคัน ต้องแจ้งทันที

## 🔐 2. มาตรฐานความปลอดภัยและขอบเขตงาน (Security & Scope)
- **ขอบเขต (Strict Scope)**: ทำงานเฉพาะในโมดูลที่ได้รับมอบหมายเท่านั้น **ห้ามแก้ไขส่วนอื่นๆ ที่ไม่เกี่ยวข้องเด็ดขาด**
- **ความปลอดภัย DB**: ยึดถือหลัก **Additive Only** สำหรับฐานข้อมูล (เพิ่มได้ แต่ไม่ลบของเดิมโดยไม่ได้รับอนุญาต) และใช้ **Soft Delete** เสมอ
- **การใช้ทรัพยากร**: ⚠️ **ห้ามรัน Terminal Command ขณะ `npm run dev` ทำงานอยู่** (เพื่อป้องกันเครื่องของผู้ใช้งานค้าง)

## 📁 3. กฎการจัดเก็บข้อมูล (File Placement Rules)
ห้ามสร้างไฟล์ใหม่พร่ำเพรื่อ ให้เพิ่มข้อมูลในไฟล์เดิมที่เป็นเจ้าของเรื่องเสมอ:
- **โครงสร้างระบบ / การออกแบบ**: ใส่ไว้ใน `doc/app_architecture.md`
- **โครงสร้างฐานข้อมูล / ฟิลด์**: ใส่ไว้ใน `doc/database_design.md`
- **คู่มือผู้ใช้งาน**: ใส่ไว้ใน `doc/user_guide.md` หรือคู่มือเฉพาะโมดูลหลัก (เช่น `user_research_manual.md`)
- **ประวัติการพัฒนา**: ต้องอัปเดต `doc/version_log.md` ทุกครั้งที่มีการ Milestone ใหม่

## 📋 4. มาตรฐานเอกสาร (Documentation Standards)
- **Header Table**: เอกสารทุกฉบับใน `doc/` ต้องมีตาราง Metadata (ISO 27001 Style) ที่บรรทัดแรกเสมอ
- **Maintenance**: เมื่อมีการเปลี่ยนแปลง Code ที่กระทบต่อ UI หรือวิธีการใช้งาน **ต้องทำการอัปเดตคู่มือที่เกี่ยวข้องทันที**
- **Artifacts**: รักษาความสม่ำเสมอของ `task.md` และ `implementation_plan.md` ในทุก Session ของงาน

---
*กฎชุดนี้มีผลบังคับใช้กับ Agent ทุกตัวที่เข้ามาทำงานในโปรเจคนี้*
### 4. Deployment & Environment Context
- **Source Control**: โปรเจกต์นี้ใช้ GitHub สำหรับการจัดการ Source Code (https://github.com/naphatS/mis-edpex)
- **Deployment**: ระบบ Deploy บน **Vercel** แบบอัตโนมัติ (CI/CD จาก GitHub Main Branch)
- **Database**: ใช้ Firebase Firestore (ทั้ง Local Dev และ Production)
- **Environment**: การตั้งค่า API Keys (Scopus, ORCiD) ถูกย้ายจาก `.env` ไปยัง Firestore `_system_config/secrets` ทั้งหมดเพื่อความสะดวกในการจัดการบน Cloud โดยไม่ต้อง Re-deploy
