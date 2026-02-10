# โครงสร้างฐานข้อมูล KUVMIS — Database Design Document
# Faculty of Veterinary Medicine, Kasetsart University

---

## 1. ภาพรวมระบบฐานข้อมูล

ระบบ KUVMIS ใช้ฐานข้อมูล **2 ระดับ**:

| ระดับ | ชนิด | สถานะ | คำอธิบาย |
|-------|------|-------|----------|
| **Production** | Firebase Firestore | ⚙️ Active | เก็บข้อมูลจริง, query จาก dashboard |
| **Design Blueprint** | JSON Files (`db_design/`) | 📄 Reference | แบบจำลองโครงสร้างฐานข้อมูลขั้นสูง 61 KPI |

> **หมายเหตุ**: JSON files ใน `db_design/` ยังไม่ได้ migrate เข้า Firestore — เป็น blueprint สำหรับการพัฒนาขั้นต่อไป

---

## 2. Firestore Collections (Production)

```
Firebase Project: mis-edpex
Project ID: mis-edpex
Region: Default
```

### 2.1 Collection Map

| Collection | EdPEx Category | คำอธิบาย |
|-----------|----------------|----------|
| `academic_results` | 7.1 ผลลัพธ์ด้านการเรียนรู้ | ผลสอบ, OSCE, ทุนวิจัย, ชั่วโมงฝึก |
| `customer_feedback` | 7.2 ผลลัพธ์ด้านลูกค้า | ความพอใจ, บริการ รพ.สัตว์ |
| `workforce_stats` | 7.3 ผลลัพธ์ด้านบุคลากร | อัตรากำลัง, งบสวัสดิการ, ลาออก |
| `strategic_kpis` | 7.4 ยุทธศาสตร์/ธรรมาภิบาล | ISO, AVBC, รายได้ใหม่ |

### 2.2 Document Schema

```json
// ตัวอย่าง document ใน academic_results
{
  "id": "auto_generated",
  "kpi_id": "7.1.1",
  "year": 2568,
  "source_sheet": "Sheet1",
  "raw_data": { ... },
  "ingested_at": "2026-01-27T10:00:00Z"
}
```

### 2.3 Firebase Config

| Key | Value |
|-----|-------|
| `projectId` | `mis-edpex` |
| `authDomain` | `mis-edpex.firebaseapp.com` |
| `storageBucket` | `mis-edpex.firebasestorage.app` |

---

## 3. JSON Blueprint (`db_design/`) — 61 KPI, 11 ไฟล์

### 3.1 Entity Relationship

```
edpex_categories (4 หมวด)
  └── kpi_master (61 KPI)
        ├── kpi_data_academic (92 records)
        ├── kpi_data_workforce (33 records)
        ├── kpi_data_strategic (60 records)
        └── kpi_data_narratives (12 records)

departments (6 หน่วยงาน)
  └── staff_users (6 ผู้ใช้)
        └── input_logs (6 audit records)

input_forms (7 ฟอร์ม)
```

### 3.2 File Detail

| ไฟล์ | Records | คำอธิบาย |
|------|:---:|----------|
| `edpex_categories.json` | 4 | หมวด 7.1–7.4 (TH/EN, icon, description) |
| `departments.json` | 6 | หน่วยงาน + KPI ที่รับผิดชอบ |
| `staff_users.json` | 6 | ผู้ใช้ตัวอย่าง (admin/editor/viewer) |
| `kpi_master.json` | **61** | **รายการ KPI ทั้งหมด** พร้อม metadata |
| `kpi_data_academic.json` | 92 | ข้อมูลตัวเลข 7.1.x |
| `kpi_data_workforce.json` | 33 | ข้อมูลตัวเลข 7.3.x |
| `kpi_data_strategic.json` | 60 | ข้อมูลตัวเลข 7.4.x |
| `kpi_data_narratives.json` | 12 | ข้อมูลบรรยาย/milestone |
| `input_forms.json` | 7 | คำจำกัดความฟอร์ม UI |
| `input_logs.json` | 6 | ตัวอย่าง audit trail |
| `README.md` | — | คู่มือโครงสร้าง |

### 3.3 Data Patterns (5 รูปแบบ)

| Pattern | ตัวอย่าง KPI | โครงสร้าง |
|---------|------------|----------|
| **Year-Series** | 7.1.1 สอบผ่านวิชาชีพ | `{ fiscal_year, value, target }` |
| **Matrix** | 7.1.5 บัณฑิตแยกสาขา | `{ fiscal_year, dimension, dimension_value, value }` |
| **Survey** | 7.3.10 ผลสำรวจผูกพัน | `{ dimension, value, target }` |
| **Narrative** | 7.1.4 เปรียบเทียบหลักสูตร | `{ title, description, old_value, new_value }` |
| **Milestone** | 7.4.13 วัคซีนสัตว์เศรษฐกิจ | `{ title, status, phase }` |

### 3.4 KPI Master Schema

```json
{
  "kpi_id": "7.1.1",
  "category_id": "7.1",
  "name_th": "ร้อยละ 100 นิสิตสอบผ่านความรู้วิชาชีพ",
  "name_en": "100% students pass professional knowledge exam",
  "unit": "ร้อยละ",
  "data_pattern": "year_series",
  "target_value": 100,
  "target_description": "ร้อยละ 100",
  "frequency": "yearly",
  "department_id": "dept_academic"
}
```

### 3.5 KPI Data Schema

```json
// Year-Series
{ "id": "a001", "kpi_id": "7.1.1", "fiscal_year": 2568, "dimension": null, "dimension_value": null, "value": 81.70, "target": 100 }

// Matrix
{ "id": "a020", "kpi_id": "7.1.5", "fiscal_year": 2568, "dimension": "สาขา", "dimension_value": "วิทยาศาสตร์สุขภาพสัตว์", "value": 3, "target": null }

// Survey
{ "id": "w010", "kpi_id": "7.3.10", "fiscal_year": null, "dimension": "ด้าน", "dimension_value": "บุคลากรยังมีพลัง...", "value": 4.33, "target": 4.0 }
```

---

## 4. แผนพัฒนาฐานข้อมูลต่อไป

| ลำดับ | งาน | สถานะ |
|:---:|------|:---:|
| 1 | Migrate `kpi_master.json` → Firestore `kpi_master` collection | ⬜ |
| 2 | Migrate `kpi_data_*.json` → Firestore `kpi_data` collection | ⬜ |
| 3 | เชื่อมต่อ Input Forms → Firestore write operations | ⬜ |
| 4 | เพิ่ม Authentication (Firebase Auth → `staff_users`) | ⬜ |
| 5 | สร้าง `kpi_data_customer.json` (7.2.x) | ⬜ |
