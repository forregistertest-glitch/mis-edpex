# KUVMIS — ระบบสารสนเทศเพื่อการจัดการ (MIS)

> **ระบบจัดการตัวชี้วัด EdPEx สำหรับคณะสัตวแพทยศาสตร์ มหาวิทยาลัยเกษตรศาสตร์**

| Field | Value |
|:------|:------|
| **Version** | 1.4.0 |
| **URL** | [https://mis-edpex.vercel.app](https://mis-edpex.vercel.app) |
| **Platform** | Vercel (Auto Deploy from `main` branch) |
| **License** | Internal Use Only |

---

## 🛠 Technology Stack

| Technology | Version | Role |
|:-----------|:--------|:-----|
| Next.js | 16.x (Turbopack) | Framework (App Router) |
| React | 19.x | UI Library |
| TypeScript | ^5 | Type-safe Language |
| Tailwind CSS | ^4 | Styling |
| Firebase Firestore | ^12.9.0 | NoSQL Database |
| Firebase Auth | ^12.9.0 | Authentication (Google Sign-In) |
| Chart.js + react-chartjs-2 | latest | Data Visualization |
| SheetJS (XLSX) | ^0.18.5 | Excel Export |
| Lucide React | ^0.563.0 | Icons |

---

## ✨ Features

- 📊 **Executive Dashboard** — ภาพรวม KPI 4 หมวด พร้อมกราฟแนวโน้ม
- ✏️ **KPI Input Forms** — 7 ประเภทฟอร์มรองรับข้อมูลหลากหลาย
- 🔐 **Authentication** — Google Sign-In + Email Whitelist + 3 Roles (user/reviewer/admin)
- ✅ **Approval Workflow** — Reviewer สามารถ Approve/Reject/ส่งกลับแก้ไข
- 👥 **Admin Panel** — จัดการผู้ใช้ + บันทึกการเข้าใช้งาน (Login Logs)
- 📍 **IP Geolocation** — แสดงจังหวัด + ISP ของผู้เข้าใช้งาน
- 📈 **Annual Report** — เปรียบเทียบผลกับเป้าหมายอัตโนมัติ
- 📄 **Document Viewer** — แสดงเอกสาร Markdown ในระบบ
- 📊 **Data Explorer** — ตาราง + Export (Excel / JSON / CSV)
- 🌐 **Bilingual** — รองรับ ภาษาไทย / English

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

> **Note:** ต้องมี Firebase Environment Variables ตั้งค่าใน `.env.local`
> ดูรายละเอียดใน `doc/database_design.md`

---

## 📁 Project Structure

```
mis-edpex/
├── src/
│   ├── app/          ← Pages + API Routes
│   ├── contexts/     ← AuthContext (Firebase Auth)
│   ├── components/   ← UI Components
│   └── lib/          ← data-service, firebase, utils
├── db_design/        ← JSON blueprints (Seed Data)
├── doc/              ← Documentation (14 files)
├── source/           ← Reference files (Excel/Word)
└── public/           ← Static assets
```

---

## 📚 Documentation

เอกสารทั้งหมดอยู่ใน `doc/` folder:

| Doc ID | File | Description |
|:-------|:-----|:------------|
| DOC-001 | `app_architecture.md` | Software Architecture |
| DOC-002 | `user_guide.md` | คู่มือการใช้งาน |
| DOC-003 | `features_list.md` | รายการ Features |
| DOC-004 | `data_dictionary.md` | Data Dictionary & Schema |
| DOC-005 | `database_design.md` | Database Design |
| DOC-006 | `input_manual.md` | คู่มือกรอกข้อมูล |
| DOC-007 | `qa.md` | Data QA & Authenticity |
| DOC-008 | `auth_and_workflow.md` | Auth & Approval Workflow |
| DOC-009 | `kpi_master_data.md` | KPI Master Data |
| DOC-010 | `performance_seed_data.md` | Seed Data Description |
| DOC-011 | `firebase_capacity.md` | Firebase Capacity Plan |

---

## 👥 Team

- **Developer:** KUVMIS Development Team
- **Organization:** คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเกษตรศาสตร์
- **Contact:** nipon.w@ku.th
