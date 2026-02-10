# KUVMIS Application Architecture
# คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเกษตรศาสตร์

> อัปเดตล่าสุด: 10 กุมภาพันธ์ 2569 | Version: 1.1.0

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
| **Auth** | Firebase Auth | (planned) | user authentication |
| **Storage** | Firebase Storage | (planned) | file uploads |
| **Export** | SheetJS (xlsx) | 0.18.5 | Excel/CSV export |
| **Date** | Luxon | 3.7.2 | date formatting |

---

## 3. Project Structure

```
mis-edpex/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Root layout (fonts, metadata)
│   │   ├── page.tsx            ← Main dashboard (401 lines)
│   │   ├── globals.css         ← Tailwind base styles
│   │   └── favicon.ico
│   ├── components/
│   │   ├── AcademicTrendChart.tsx  ← Chart.js line chart
│   │   ├── DataExplorer.tsx       ← Data table overlay (209 lines)
│   │   └── KpiInputForm.tsx       ← Dynamic input forms (310 lines)
│   └── lib/
│       ├── firebase.ts         ← Firebase SDK config
│       ├── data-service.ts     ← Firestore query helpers
│       └── translations.ts    ← Bilingual TH/EN strings
├── db_design/                  ← JSON database blueprint (11 files)
├── doc/                        ← Project documentation
├── source/                     ← Source Excel/Word files
├── public/                     ← Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 4. Core Components

### 4.1 Dashboard (`page.tsx`)

Main single-page application ประกอบด้วย:

| Section | คำอธิบาย |
|---------|----------|
| **Sidebar** | 7 tabs: Dashboard, Academic, Staff/HR, Hospital, Strategic, Input, Reports |
| **Header** | ปีการศึกษา + user badge |
| **Hero Banner** | Gradient banner + system description |
| **KPI Cards** | 4 cards: Academic Pass Rate, Customer Satisfaction, Strategic Success, Safety |
| **Charts** | Academic trend line chart (64-68) |
| **Action Cards** | KPI 7.1.13 Supply Chain + Research Grants |
| **Data Explorer** | Overlay table with search/export |

**State Management:**
- `activeTab` — tab ปัจจุบัน
- `lang` — ภาษา (th/en)
- `showExplorer` / `explorerData` — Data Explorer overlay
- `explorerLoading` — loading spinner

### 4.2 KpiInputForm (`KpiInputForm.tsx`)

Dynamic form component ที่อ่าน spec จาก `input_forms.json`:

| Feature | รายละเอียด |
|---------|-----------|
| **Form Selector** | 7 cards grid, แต่ละ card มี icon+สี+คำอธิบาย |
| **Dynamic Rendering** | render fields จาก JSON: select, number, text, textarea, file |
| **Validation** | required check, min/max range, red error |
| **Preview** | Summary modal ก่อน submit |
| **Success** | Animated checkmark + message |
| **Audit Trail** | Table แสดง logs ล่าสุด + status badge |

### 4.3 DataExplorer (`DataExplorer.tsx`)

Full-screen overlay สำหรับดู raw data:

| Feature | รายละเอียด |
|---------|-----------|
| **Search** | Real-time filter across all columns |
| **Pagination** | 50/100/500 rows per page |
| **Export** | Excel (.xlsx), JSON, CSV |
| **Auto Headers** | อ่าน column headers จาก data keys |

### 4.4 AcademicTrendChart (`AcademicTrendChart.tsx`)

Chart.js line chart แสดง trend KPI วิชาการ (ปี 64-68)

---

## 5. Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Source Excel │ ──→ │ Ingest Script│ ──→ │  Firestore   │
│ (SAR 64-68) │     │  (Node.js)   │     │ Collections  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                    ┌──────────────┐              │
                    │  Dashboard   │ ←────────────┘
                    │  (page.tsx)  │    getDocs()
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
        KPI Cards    AcademicChart  DataExplorer
                                       │
                              ┌────────┴────────┐
                              ↓        ↓        ↓
                            .xlsx    .json    .csv
```

---

## 6. Features ปัจจุบัน (v1.1)

| # | Feature | Component | สถานะ |
|:-:|---------|-----------|:---:|
| 1 | Executive Dashboard | `page.tsx` | ✅ |
| 2 | KPI Cards (4 pillars) | `page.tsx` | ✅ |
| 3 | Academic Trend Chart | `AcademicTrendChart.tsx` | ✅ |
| 4 | Strategic Objectives (SO1-SO6) | `page.tsx` | ✅ |
| 5 | Supply Chain View (7.1.13) | `page.tsx` | ✅ |
| 6 | Research Grants View (7.1.16-19) | `page.tsx` | ✅ |
| 7 | Bilingual UI (TH/EN) | `translations.ts` | ✅ |
| 8 | Data Explorer + Search | `DataExplorer.tsx` | ✅ |
| 9 | Excel/JSON/CSV Export | `DataExplorer.tsx` | ✅ |
| 10 | Global Full Export | `page.tsx` | ✅ |
| 11 | **KPI Input Forms (7 types)** | `KpiInputForm.tsx` | ✅ |
| 12 | **Dynamic Field Rendering** | `KpiInputForm.tsx` | ✅ |
| 13 | **Form Validation** | `KpiInputForm.tsx` | ✅ |
| 14 | **Audit Trail Table** | `KpiInputForm.tsx` | ✅ |

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
- `academic_results` — KPI 7.1.x
- `customer_feedback` — KPI 7.2.x
- `workforce_stats` — KPI 7.3.x
- `strategic_kpis` — KPI 7.4.x

---

## 9. Roadmap

| Phase | งาน | สถานะ |
|:---:|------|:---:|
| Phase 1 | Dashboard + Data Ingestion | ✅ |
| Phase 2 | Bilingual UI + Export | ✅ |
| Phase 3 | Input Forms + DB Blueprint | ✅ |
| Phase 4 | Firebase Auth + Access Control | ⬜ |
| Phase 5 | Firestore Migration (61 KPI) | ⬜ |
| Phase 6 | Real-time Data Sync | ⬜ |
| Phase 7 | Automated SAR Report Generation | ⬜ |
