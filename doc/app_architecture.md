# KUVMIS Application Architecture
# คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเกษตรศาสตร์

| Field | Value |
|:------|:------|
| **Doc ID** | KUVMIS-DOC-001 |
| **Version** | 1.4.0 |
| **Last Updated** | 2026-02-12T00:30:00+07:00 |
| **Author** | KUVMIS Development Team |
| **Status** | Released |

---

## 1. ภาพรวมระบบ (System Overview)

**KUVMIS** (KU Veterinary Medicine Information System) คือระบบ MIS สำหรับติดตาม KPI ตามมาตรฐาน EdPEx ของคณะสัตวแพทยศาสตร์ มหาวิทยาลัยเกษตรศาสตร์ ครอบคลุม 61 KPI ใน 4 หมวด (7.1-7.4) จากรายงาน SAR ปี 2564-2568

---

## 2. Technology Stack

| Layer | Technology | Version | หน้าที่ |
|-------|-----------|---------|--------|
| **Framework** | Next.js (App Router) | 16.1.6 | SSR/SSG, routing |
| **Language** | TypeScript | 5.x | type safety |
| **UI** | React | 19.2.3 | component-based UI |
| **Styling** | Tailwind CSS | 4.x | utility-first CSS |
| **Icons** | Lucide React | 0.563.0 | semantic icons |
| **Charts** | Chart.js + react-chartjs-2 | 4.5.1 / 5.3.1 | data visualization |
| **Database** | Firebase Firestore | 12.9.0 | NoSQL cloud DB |
| **Auth** | Firebase Auth | 12.9.0 | ✅ Google Sign-In + Email Whitelist |
| **Storage** | Firebase Storage | (planned) | file uploads |
| **Export** | SheetJS (xlsx) | 0.18.5 | Excel/CSV export |
| **Date** | Luxon | 3.7.2 | date formatting |

---

## 3. Project Structure

```
mis-edpex/
├── src/
│   ├── app/
│   │   ├── layout.tsx           ← Root Layout + AuthProvider wrapper
│   │   ├── page.tsx             ← Main Dashboard (370+ lines)
│   │   ├── error.tsx            ← Route-level Error Boundary
│   │   ├── global-error.tsx     ← Root-level Error Boundary
│   │   ├── globals.css          ← Tailwind base styles
│   │   ├── favicon.ico
│   │   ├── api/docs/route.ts    ← API Route สำหรับเอกสาร
│   │   ├── api/auth/whoami/route.ts ← IP + User Agent + Geolocation API
│   │   └── seed/page.tsx        ← Seed Tool (Admin Only Guard)
│   ├── contexts/
│   │   └── AuthContext.tsx      ← Firebase Auth + Role Management
│   ├── components/
│   │   ├── LoginPage.tsx        ← Google Sign-In + KU Branding
│   │   ├── KpiInputForm.tsx     ← ฟอร์มกรอกข้อมูล (ใช้ email จริง)
│   │   ├── DocViewer.tsx        ← ดูเอกสาร Markdown
│   │   ├── DataExplorer.tsx     ← ตารางข้อมูล + Export
│   │   ├── AcademicTrendChart.tsx ← กราฟแนวโน้ม
│   │   ├── dashboard/
│   │   │   ├── Header.tsx       ← User info + Sign-out
│   │   │   ├── Sidebar.tsx      ← Role badge + เมนูตาม Role
│   │   │   ├── HeroBanner.tsx   ← Gradient summary banner
│   │   │   ├── CategorySection.tsx ← KPI category display
│   │   │   ├── ReportsSection.tsx  ← Export tools
│   │   │   ├── ReviewerDashboard.tsx ← Approve/Reject (Reviewer+Admin)
│   │   │   ├── AdminPanel.tsx   ← จัดการผู้ใช้ + Login Logs (Admin only)
│   │   │   ├── DashboardCard.tsx ← Standard Card with Logic/Source
│   │   │   └── AnnualReportDashboard.tsx ← รายงานประจำปี
│   │   └── kpi-input/           ← Sub-components ของ KpiInputForm
│   │       ├── FormSelector.tsx
│   │       ├── FormEntry.tsx
│   │       ├── PreviewModal.tsx
│   │       └── SuccessScreen.tsx
│   └── lib/
│       ├── firebase.ts          ← Firebase config (env vars)
│       ├── data-service.ts      ← CRUD + Review + SoftDelete + Admin
│       ├── translations.ts     ← ภาษา TH/EN
│       └── ingestion/
│           ├── ingest_data.js   ← Script นำเข้าข้อมูลจาก JSON
│           └── inspect_v4.js    ← Script ตรวจสอบข้อมูล
├── db_design/                   ← ข้อมูล Seed (JSON) 11 ไฟล์
├── doc/                         ← เอกสารประกอบ (MD + HTML) 14 ไฟล์
├── source/                      ← ไฟล์ต้นฉบับอ้างอิง (Excel/Word)
├── public/                      ← Static assets (SVG icons)
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 4. Core Components

### 4.1 Authentication Layer (`AuthContext.tsx`) ✅

| Feature | รายละเอียด |
|---------|-----------|
| **Google Sign-In** | Firebase Auth + GoogleAuthProvider |
| **Email Whitelist** | ตรวจสอบ email กับ Firestore `authorized_users` |
| **Role Management** | 3 roles: user, reviewer, admin |
| **2FA** | ได้ฟรีจาก Google Account (ถ้าผู้ใช้เปิดไว้) |
| **Login Gate** | ทุกหน้าต้อง login ก่อนเข้าถึง |

### 4.2 Dashboard (`page.tsx`)

Main single-page application ประกอบด้วย:

| Section | คำอธิบาย |
|---------|----------|
| **Sidebar** | 10+ tabs (ตาม Role): Dashboard, Academic, Staff/HR, Hospital, Strategic, Input, Review, Admin, Reports, Docs |
| **Header** | User avatar + email + Role badge + Sign-out |
| **Hero Banner** | Gradient banner + system description |
| **KPI Cards** | 4 cards: Academic Pass Rate, Customer Satisfaction, Strategic Success, Safety |
| **Charts** | Academic trend line chart (64-68) |
| **Review Tab** | Approve/Reject data entries (Reviewer/Admin) |
| **Admin Tab** | Manage authorized users (Admin only) |

### 4.3 Approval Workflow (`ReviewerDashboard.tsx`) ✅

| Feature | รายละเอียด |
|---------|-----------|
| **Status Filter** | pending / approved / rejected / revision_requested / all |
| **Approve** | กด ✅ → status = approved + reviewed_by + reviewed_at |
| **Reject** | กด ❌ → ใส่เหตุผล → status = rejected |
| **Revision** | กด ✏️ → status = revision_requested |
| **Soft Delete** | กด 🗑️ → status = deleted + audit fields |

### 4.4 Admin Panel (`AdminPanel.tsx`) ✅

| Feature | รายละเอียด |
|---------|-----------|
| **View Users** | ตารางแสดงผู้ใช้ทั้งหมด |
| **Add User** | ฟอร์มเพิ่ม email, ชื่อ, Role |
| **Change Role** | Dropdown เปลี่ยน Role ทันที |
| **Remove User** | ลบผู้ใช้ (ป้องกันลบตัวเอง) |
| **Login Logs** | ตาราง log การเข้าใช้งาน: paging 100/หน้า, filter ตามเดือน, แสดง IP + Location + User Agent |

### 4.5 KpiInputForm (`KpiInputForm.tsx`)

Dynamic form component ที่อ่าน spec จาก `input_forms.json`:

| Feature | รายละเอียด |
|---------|-----------  |
| **Form Selector** | 7 cards grid, แต่ละ card มี icon+สี+คำอธิบาย |
| **Dynamic Rendering** | render fields จาก JSON: select, number, text, textarea, file |
| **Validation** | required check, min/max range, red error |
| **submitted_by** | ✅ ใช้ email จริงจาก Auth (ไม่ hardcode แล้ว) |
| **Audit Trail** | Table แสดง logs ล่าสุด + status badge |

### 4.6 DataExplorer, DocViewer, AcademicTrendChart

| Component | คำอธิบาย |
|-----------|----------|
| **DataExplorer** | Full-screen overlay + search + pagination + export (Excel/JSON/CSV) |
| **DocViewer** | Markdown viewer สำหรับเอกสารในโฟลเดอร์ `/doc` |
| **AcademicTrendChart** | Chart.js line chart แสดง trend KPI วิชาการ 5 ปี |

---

## 5. Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Source Excel │ ──→ │ Ingest Script│ ──→ │  Firestore   │
│ (SAR 64-68) │     │  (Node.js)   │     │ Collections  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                                          ┌──────┴──────┐
                                          │  AuthContext │
                                          │  (Login Gate)│
                                          └──────┬──────┘
                                                 │
                    ┌──────────────┐              │
                    │  Dashboard   │ ←────────────┘
                    │  (page.tsx)  │    getDocs()
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
    │ KPI Cards │   │  Charts   │   │DataExplorer│
    │+ Review   │   │           │   │           │
    │+ Admin    │   │           │   │ Export    │
    └───────────┘   └───────────┘   └───────────┘
```

---

## 6. Features ปัจจุบัน (v1.4)

| # | Feature | Component | สถานะ |
|:-:|---------|-----------|:---:|
| 1 | Executive Dashboard | `page.tsx` | ✅ |
| 2 | KPI Cards (4 pillars) | `page.tsx` | ✅ |
| 3 | Academic Trend Chart | `AcademicTrendChart.tsx` | ✅ |
| 4 | Strategic Objectives (SO1-SO6) | `page.tsx` | ✅ |
| 5 | Bilingual UI (TH/EN) | `translations.ts` | ✅ |
| 6 | Data Explorer + Search | `DataExplorer.tsx` | ✅ |
| 7 | Excel/JSON/CSV Export | `DataExplorer.tsx` | ✅ |
| 8 | KPI Input Forms (7 types) | `KpiInputForm.tsx` | ✅ |
| 9 | Dynamic Field Rendering | `KpiInputForm.tsx` | ✅ |
| 10 | Form Validation | `KpiInputForm.tsx` | ✅ |
| 11 | Firebase Auth + Google Sign-In | `AuthContext.tsx` | ✅ |
| 12 | Email Whitelist + Role | `AuthContext.tsx` | ✅ |
| 13 | Role Badge + Conditional Menu | `Sidebar.tsx` | ✅ |
| 14 | Seed Page Guard (Admin Only) | `seed/page.tsx` | ✅ |
| 15 | Error Boundary (Route+Global) | `error.tsx` / `global-error.tsx` | ✅ |
| 16 | Approval Workflow | `ReviewerDashboard.tsx` | ✅ |
| 17 | Soft Delete | `data-service.ts` | ✅ |
| 18 | Admin Panel (User CRUD) | `AdminPanel.tsx` | ✅ |
| 19 | **Login Logs Enhanced** (Paging, Filter, Full UA) | `AdminPanel.tsx` | ✅ |
| 20 | **Annual Report Dashboard** | `AnnualReportDashboard.tsx` | ✅ |
| 21 | **IP Geolocation** (จังหวัด + ISP) | `whoami/route.ts` | ✅ |
| 22 | **Firestore Composite Indexes** | `firestore.indexes.json` | ✅ |

---

## 7. Development & Build Commands

```bash
# Development (Hot Reload)
npm run dev          # → http://localhost:3000

# Production Build
npm run build        # → TypeScript check + optimize

# Start Production
npm start            # → serve build output

# Lint
npm run lint         # → ESLint check
```

---

## 8. Firebase Configuration

```
Project ID:        mis-edpex
Auth Domain:       mis-edpex.firebaseapp.com
Storage Bucket:    mis-edpex.firebasestorage.app
Config File:       src/lib/firebase.ts
```

**Collections ที่ใช้งาน:**
- `kpi_master` — รายการ KPI หลัก (61 KPIs)
- `kpi_entries` — ข้อมูล KPI ที่กรอก (พร้อม review + soft delete fields)
- `authorized_users` — รายชื่อ email ที่มีสิทธิ์ + role
- `login_logs` — บันทึกการเข้าใช้งาน (email, timestamp, IP, user agent, geo location)

---

## 9. Roadmap

| Phase | งาน | สถานะ |
|:---:|------|:---:|
| Phase 1 | Dashboard + Data Ingestion | ✅ |
| Phase 2 | Bilingual UI + Export | ✅ |
| Phase 3 | Input Forms + DB Blueprint | ✅ |
| Phase 4 | Firebase Auth + Access Control | ✅ |
| Phase 5 | Approval Workflow + Soft Delete | ✅ |
| Phase 6 | Admin Panel (User Management) | ✅ |
| Phase 7 | Login Logs + IP Geolocation + Annual Report | ✅ |
| Phase 8 | Firestore Composite Indexes | ✅ |
| Phase 9 | Firebase Storage (File Uploads) | ⬜ |
| Phase 10 | Automated SAR Report Generation | ⬜ |

---

*เอกสารนี้ปรับปรุงล่าสุดเมื่อ 12 ก.พ. 2569 — KUVMIS v1.4*
