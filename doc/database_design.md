# โครงสร้างฐานข้อมูลและการจัดการข้อมูล (Database Architecture & Data Identity)
# คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเกษตรศาสตร์

| Field | Value |
|:------|:------|
| **Doc ID** | KUVMIS-DOC-005 |
| **Version** | 1.10 |
| **Standard** | ISO 27001 / EdPEx Compliance |
| **Last Updated** | 2026-02-23T19:48:00+07:00 |
| **Author** | KUVMIS Development Team |
| **Status** | Active |

---

## 1. ยุทธศาสตร์การจัดการข้อมูล (Data Strategy)
ระบบ KUVMIS ยึดหลัก **ALCOA+** เพื่อความน่าเชื่อถือระดับสากล:
- **Attributable**: รู้ว่าใครกรอก (via email)
- **Legible**: อ่านง่ายและคงทน
- **Contemporaneous**: บันทึกทันทีที่เป็นปัจจุบัน
- **Original**: รักษาต้นฉบับไว้เสมอ
- **Accurate**: ข้อมูลต้องผ่านการกรองและยืนยัน

---

## 2. โครงสร้าง Firestore Collections (Live Data)

### 2.1 คอลเลกชันหลัก (Core Collections)
| Collection | คำอธิบาย | ข้อมูลสำคัญ |
|-----------|----------|------------|
| `kpi_master` | แม่แบบ KPI 61 ตัว | ชื่อ TH/EN, เป้าหมาย, หน่วยนับ |
| `kpi_entries` | ผลการดำเนินงาน | ค่าตัวเลข, ปีงบประมาณ, สถานะ (Pending/Approved) |
| `authorized_users`| รายชื่อผู้มีสิทธิ์ | Email Whitelist, Role (User/Reviewer/Admin) |
| `login_logs` | ประวัติการเข้าใช้งาน | IP, Geolocation, User Agent, Timestamp |
| `personnel` | ฐานข้อมูลบุคคล | ประวัติ, ตำแหน่ง, สังกัด (HR Module) |
| `students` | ฐานข้อมูลนิสิต | ประวัติการศึกษา, Milestone (Student Module) |
| `_system_config` | ตั้งค่าเชิงลึก | API Keys (Scopus/NCBI/ORCiD) - *Secure Zone* |

### 2.2 มาตรฐานความสมบูรณ์ของข้อมูล (ALCOA+ Implementation)
- **Soft Delete**: ใช้ฟิลด์ `is_deleted = true` และ `deleted_by` แทนการลบจริง
- **Audit Trails**: บันทึก `created_at`, `created_by`, `updated_at`, `updated_by` ในทุก Document

---

## 3. รูปแบบข้อมูล (Data Patterns)
ระบบรองรับข้อมูล 5 รูปแบบหลักเพื่อสะท้อน EdPEx:
1. **Year-Series**: ข้อมูลตัวเลขรายปี (7.1.1)
2. **Matrix (Dimension)**: ข้อมูลแยกสาขาหรือมิติ (7.1.5)
3. **Survey**: ผลการสำรวจความพึงพอใจ (7.3.10)
4. **Narrative**: คำบรรยายการดำเนินงานเชิงคุณภาพ
5. **Milestone**: สถานะความสำเร็จรายลำดับ (7.4.13)

---

## 4. โครงสร้าง JSON Blueprint (`db_design/`)
สำหรับการพัฒนาและ Seed Database ระบบมีคัมภีร์โครงสร้างในรูปแบบ JSON 11 ไฟล์ เช่น:
- `kpi_master.json`: นิยามเริ่มต้นของ 61 KPI
- `input_forms.json`: โครงสร้างฟอร์มสำหรับ UI Dynamic Rendering
- `edpex_categories.json`: หมวดหมู่มาตรฐาน 7.1 - 7.4

---

## 5. แผนบริหารจัดการ Quota (Firebase Capacity)
ระบบทำงานภายใต้ **Firebase Spark Plan (ฟรี)** ซึ่งเพียงพอสำหรับการใช้งานในคณะ:
- **Reads**: 50,000 ครั้ง/วัน (รองรับ User 10-20 คนสบายๆ)
- **Writes**: 20,000 ครั้ง/วัน
- **Storage**: 1 GB (ปัจจุบันใช้ไม่ถึง 1%)

---
*ปรับปรุงล่าสุด: 23 ก.พ. 2569 — KUVMIS Project Governance Update*
