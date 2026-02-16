# โครงสร้างฐานข้อมูล KUVMIS — Database Design Document
# Faculty of Veterinary Medicine, Kasetsart University

| Field | Value |
|:------|:------|
| **Doc ID** | KUVMIS-DOC-005 |
| **Version** | 1.02d |
| **Last Updated** | 2026-02-16T19:00:00+07:00 |
| **Author** | KUVMIS Development Team |
| **Status** | Released |

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

| Collection | คำอธิบาย | สถานะ |
|-----------|----------|:---:|
| `kpi_master` | รายการ KPI หลัก 61 รายการ (ชื่อ, หน่วย, เป้าหมาย, aggregation) | ✅ |
| `kpi_entries` | ค่า KPI ที่กรอก (ผูกกับ kpi_id, ปี, งวด + review & soft delete fields) | ✅ |
| `authorized_users` | รายชื่อ email ที่มีสิทธิ์เข้าระบบ + role (user/reviewer/admin) | ✅ |
| `login_logs` | บันทึกการเข้าใช้งาน (email, IP, user agent, geo location, timestamp) | ✅ |
| `personnel` | ข้อมูลบุคลากรรายบุคคล (ประวัติการทำงาน, การลา, ผลงาน) | ✅ |
| `students` | ข้อมูลนิสิตรายบุคคล (สถานะการศึกษา, คะแนน, ทุน) | ✅ |

### 2.2 Document Schema — kpi_entries

```json
// ตัวอย่าง document ใน kpi_entries
{
  "id": "auto_generated",
  "kpi_id": "7.1.1",
  "fiscal_year": 2568,
  "period": "Q1",
  "value": 81.70,
  "target": 100,
  "unit": "ร้อยละ",
  "extra_data": {
    "field1": "value1",
    "field2": 123
  },
  "submitted_by": "staff@ku.th",
  "submitted_at": "2026-02-10T10:00:00Z",
  "status": "pending",
  "reviewed_by": "reviewer@ku.th",
  "reviewed_at": "2026-02-10T12:00:00Z",
  "rejection_reason": null,
  "deleted_by": null,
  "deleted_at": null,
  "previous_status": null
}
```
**Field Definition for `kpi_entries`:**
| Field | Type | Description |
|---|---|---|
| `id` | String | Auto-generated document ID |
| `kpi_id` | String | ID ของ KPI (เช่น "7.1.1") |
| `fiscal_year` | Number | ปีงบประมาณ (พ.ศ.) |
| `period` | String | งวดข้อมูล (เช่น "Q1", "S1", "Annual") |
| `value` | Number | ค่าตัวเลขที่กรอก |
| `target` | Number | ค่าเป้าหมายของ KPI |
| `unit` | String | หน่วยนับ (เช่น "ร้อยละ", "คน", "บาท") |
| `extra_data` | Map | ข้อมูลเพิ่มเติม (JSON object) สำหรับฟอร์มที่มีหลาย field |
| `submitted_by` | String | Email ผู้บันทึกข้อมูล |
| `submitted_at` | Timestamp | วันที่และเวลาที่บันทึกข้อมูล |
| `status` | String | สถานะของข้อมูล ("pending", "approved", "rejected") |
| `reviewed_by` | String | Email ผู้ตรวจสอบข้อมูล |
| `reviewed_at` | Timestamp | วันที่และเวลาที่ตรวจสอบข้อมูล |
| `rejection_reason` | String | เหตุผลในการปฏิเสธข้อมูล |
| `deleted_by` | String | Email ผู้ลบข้อมูล (soft delete) |
| `deleted_at` | Timestamp | วันที่และเวลาที่ลบข้อมูล (soft delete) |
| `previous_status` | String | สถานะก่อนหน้าการลบ (สำหรับ soft delete) |

### 2.3 Document Schema — authorized_users

```json
// Document ID = email
{
  "email": "nipon.w@ku.th",
  "role": "admin",
  "name": "นิพนธ์",
  "added_at": "2026-02-10T10:00:00Z"
}
```

### 2.3 Document Schema — login_logs

```json
// Document ID = auto-generated
{
  "email": "nipon.w@ku.th",
  "timestamp": "2026-02-12T00:30:00Z",
  "success": true,
  "method": "google",
  "ip_address": "171.97.xxx.xxx",
  "user_agent": "Mozilla/5.0 ...",
  "geo_location": "Bangkok, Bangkok, Thailand (True Internet)",
  "reason": "Login Successful"
}
```

### 2.4 Document Schema — personnel (v.1.02)
```json
{
  "personnel_id": "393",
  "title_th": "นาย",
  "first_name_th": "สมชาย",
  "last_name_th": "ใจดี",
  "position": "อาจารย์",
  "department": "เวชศาสตร์คลินิกสัตว์เลี้ยง",
  "affiliation": "รพ.สท.ม.เกษตรศาสตร์ (KUVTH BK)",
  "employment_status": "พนักงานมหาวิทยาลัย",
  "is_deleted": false,
  "created_at": "2026-02-16T17:00:00Z",
  "created_by": "admin@ku.th",
  "updated_at": "2026-02-16T18:05:00Z",
  "updated_by": "admin@ku.th"
}
```

### 2.5 Document Schema — students
```json
{
  "studentId": "64xxxxxxxxx",
  "data": {
    "Title": "นาย",
    "FirstName": "นิสิต",
    "LastName": "เรียนดี",
    "Major": "สัตวแพทยศาสตรบัณฑิต",
    "DegreeLevel": "ปริญญาตรี",
    "Status": "กำลังศึกษา",
    "Advisor": "ดร.สมชาย"
  },
  "updatedAt": "2026-02-15T10:00:00Z"
}
```

### 2.6 Firebase Config

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
| 1 | Migrate `kpi_master.json` → Firestore `kpi_master` collection | ✅ |
| 2 | Migrate `kpi_data_*.json` → Firestore `kpi_entries` collection | ✅ |
| 3 | เชื่อมต่อ Input Forms → Firestore write operations | ✅ |
| 4 | เพิ่ม Authentication → Firestore `authorized_users` | ✅ |
| 5 | สร้าง `kpi_data_customer.json` (7.2.x) | ⬜ |
| 6 | Real-time data sync | ⬜ |

---
*เอกสารนี้ปรับปรุงล่าสุดเมื่อ 16 ก.พ. 2569 — KUVMIS v.1.02d*
