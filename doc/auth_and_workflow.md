# ระบบยืนยันตัวตนและ Workflow อนุมัติข้อมูล
# Authentication & Data Approval Workflow

---

## 1. ภาพรวมระบบยืนยันตัวตน (Authentication)

### 1.1 วิธีการ Login
ระบบใช้ **Google Sign-In** ผ่าน Firebase Authentication — ผู้ใช้กดปุ่ม "Sign in with Google" แล้วเลือก Google Account

### 1.2 การควบคุมสิทธิ์ (Email Whitelist)
ไม่ใช่ทุก Google Account ที่เข้าระบบได้ — ต้องอยู่ใน **รายชื่อที่อนุญาต** ซึ่งเก็บไว้ใน Firestore collection `authorized_users`

ตัวอย่างข้อมูลใน Firestore:
```
Collection: authorized_users
Document ID: "nipon.w@ku.th"
{
  email: "nipon.w@ku.th",
  role: "admin",
  name: "นิพนธ์",
  added_at: "2026-02-10"
}
```

### 1.3 ขั้นตอนการ Login
1. User กด "Sign in with Google"
2. Google popup → เลือก account → ยืนยัน 2FA (ถ้าเปิดไว้ใน Google)
3. ระบบดึง email มาตรวจสอบกับ `authorized_users` ใน Firestore
4. ✅ พบ email → เข้าระบบได้ + กำหนด role ตามข้อมูล
5. ❌ ไม่พบ → Sign-out ทันที + แสดงข้อความ "ไม่มีสิทธิ์เข้าใช้งาน"

### 1.4 Two-Factor Authentication (2FA)
ระบบได้ 2FA ฟรีจาก Google — ถ้าผู้ใช้เปิด 2-Step Verification ใน Google Account ระบบจะบังคับยืนยันตัวตน 2 ชั้นอัตโนมัติ โดยเราไม่ต้อง implement เพิ่ม

---

## 2. ระบบ Role (บทบาท)

| Role | สิทธิ์ | ตัวอย่าง |
|------|--------|----------|
| **user** | กรอกข้อมูล, ดู Dashboard, ลบ/แก้เฉพาะข้อมูลของตัวเองที่ status = pending | staff@ku.th |
| **reviewer** | ทุกอย่างที่ user ทำได้ + Approve/Reject ข้อมูลของทุกคน | head@ku.th |
| **admin** | ทุกอย่าง + จัดการ users + เข้า Seed page + ลบข้อมูลทุก status | nipon.w@ku.th |

---

## 3. Workflow อนุมัติข้อมูล (Data Approval)

### 3.1 แผนภาพ Workflow

```
User กรอกข้อมูล
  → status: "pending" (รอตรวจสอบ)

Reviewer ตรวจสอบ
  → ✅ Approve → status: "approved"
  → ❌ Reject  → status: "rejected" + เหตุผล
  → ✏️ แก้ไข  → status: "revision_requested"

User เห็นรายการที่ถูกปฏิเสธ/ส่งกลับ
  → แก้ไขแล้วส่งใหม่ → status: "pending"
```

### 3.2 สถานะข้อมูล (Entry Status)

| Status | คำอธิบาย (TH) | คำอธิบาย (EN) | สี |
|--------|---------------|---------------|-----|
| `pending` | รอตรวจสอบ | Pending Review | 🟡 เหลือง |
| `approved` | อนุมัติแล้ว | Approved | 🟢 เขียว |
| `rejected` | ปฏิเสธ | Rejected | 🔴 แดง |
| `revision_requested` | ส่งกลับแก้ไข | Revision Requested | 🟠 ส้ม |
| `deleted` | ลบแล้ว (soft delete) | Deleted | ⚫ เทา |

---

## 4. การลบข้อมูล (Soft Delete)

ระบบใช้ **Soft Delete** — ข้อมูลจะไม่ถูกลบออกจาก Firestore จริง แต่จะเปลี่ยน status เป็น `"deleted"` เพื่อให้สามารถตรวจสอบย้อนกลับได้

### 4.1 กฎการลบ

| Role | ลบข้อมูล pending ของตัวเอง | ลบข้อมูล approved | ลบข้อมูลของคนอื่น |
|------|:-:|:-:|:-:|
| **user** | ✅ | ❌ | ❌ |
| **reviewer** | ✅ | ❌ | ❌ |
| **admin** | ✅ | ✅ | ✅ |

### 4.2 ข้อมูลที่เก็บเพิ่มเมื่อลบ
เมื่อ soft delete จะเพิ่มฟิลด์:
- `deleted_at`: timestamp ที่ลบ
- `deleted_by`: email ของผู้ลบ
- `previous_status`: status ก่อนลบ (เพื่อ restore ได้)

---

## 5. การป้องกันหน้า Seed

หน้า `/seed` เป็นเครื่องมือสำหรับ admin ใช้ Seed ข้อมูลตัวอย่างเท่านั้น

- ต้อง login ก่อนเข้าถึง
- เฉพาะ role = **admin** เท่านั้นที่เข้าได้
- ผู้ใช้ทั่วไปจะถูก redirect กลับหน้าหลัก

> **หมายเหตุ:** หน้า Seed จะใช้งานเฉพาะช่วงเริ่มต้นระบบ หลังจาก User เริ่มกรอกข้อมูลจริงแล้ว จะยกเลิกการใช้งานหน้านี้

---

## 6. Error Boundary

ระบบมี Error Boundary เพื่อรองรับกรณีที่ Firebase ล่มหรือเกิดข้อผิดพลาด:

- **error.tsx**: จับ error ในหน้าเพจ → แสดงหน้า error สวยงามแทนที่จะแสดงหน้าว่าง
- **global-error.tsx**: จับ error ระดับ layout → ป้องกันหน้าเว็บค้างทั้งหมด
- มีปุ่ม "ลองใหม่" และ "กลับหน้าหลัก"

---

## 7. แผนการดำเนินการ (Implementation Phases)

### เฟส A (ปัจจุบัน)
- [x] Rec 1: แก้ metadata
- [x] Rec 2: แยก page.tsx
- [x] Rec 3: แยก KpiInputForm.tsx
- [ ] Rec 4: Firebase Auth + Google Sign-In + Email Whitelist
- [ ] Rec 5: ป้องกันหน้า Seed
- [ ] Rec 6: Error Boundary

### เฟส B (อนาคต)
- [ ] Approval Workflow (Reviewer Dashboard)
- [ ] Soft Delete พร้อม Audit Log
- [ ] Role-based UI (ซ่อน/แสดงเมนูตาม role)
- [ ] เพิ่ม/ลบ authorized users ผ่านหน้า Admin

---

## 8. โครงสร้างไฟล์ที่เกี่ยวข้อง

```
src/
├── contexts/
│   └── AuthContext.tsx          ← React Context สำหรับ Auth
├── components/
│   ├── LoginPage.tsx            ← หน้า Login
│   ├── dashboard/
│   │   ├── Sidebar.tsx          ← เพิ่มปุ่ม Logout
│   │   └── Header.tsx           ← แสดงชื่อ/รูป user จริง
│   └── kpi-input/               ← Sub-components
├── app/
│   ├── layout.tsx               ← Wrap AuthProvider
│   ├── page.tsx                 ← Login gate
│   ├── error.tsx                ← Error Boundary
│   ├── global-error.tsx         ← Global Error Boundary
│   └── seed/page.tsx            ← Auth guard (admin only)
└── lib/
    └── firebase.ts              ← มี auth export อยู่แล้ว
```

---

## 9. Firestore Collections

| Collection | คำอธิบาย |
|------------|----------|
| `kpi_master` | รายการ KPI หลัก |
| `kpi_entries` | ค่า KPI ที่กรอก (มี status field) |
| `authorized_users` | รายชื่อ email ที่มีสิทธิ์ + role |

---

*เอกสารนี้สร้างเมื่อ 10 ก.พ. 2569 — KUVMIS Project*
