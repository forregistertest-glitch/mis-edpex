# Deployment Guide (v.1.4)
## ระบบสารสนเทศเพื่อการจัดการ (MIS-EdPEx) - Remodel UI & Full API

| Field | Value |
| :--- | :--- |
| **Doc ID** | KUVMIS-DOC-012 |
| **Version** | 1.4 |
| **Standard** | ISO 27001 / EdPEx Compliance |
| **Last Updated** | 2026-02-24T12:40:00+07:00 |

---

## 1. ข้อกำหนดเบื้องต้น (Prerequisites)
- **Node.js**: v18.0.0 ขึ้นไป (แนะนำ v20.x)
- **Firebase/Firestore**: โปรเจกต์ที่ตั้งค่าพร้อมใช้งาน
- **API Keys**: Scopus API Key, NCBI, และ ORCiD Credentials

## 2. การตั้งค่า Secrets & Configuration
ในเวอร์ชัน 1.4 ระบบจะดึงค่าคอนฟิกจาก Cloud Firestore เพื่อความปลอดภัย:
1. สร้าง Collection ชื่อ `_system_config`
2. สร้าง Document ชื่อ `main` (หรือชื่อตามความเหมาะสม)
3. เพิ่มข้อมูลฟิลด์ดังนี้:
   - `SCOPUS_API_KEY`: [Key จาก Elsevier]
   - `ORCID_CLIENT_ID`: [Client ID จาก ORCiD]
   - `ORCID_CLIENT_SECRET`: [Client Secret จาก ORCiD]

## 3. ขั้นตอนการติดตั้ง (Setup Steps)
1. **Clone Repository**:
   ```bash
   git clone [repository-url]
   cd mis-edpex
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Setup Environment Variables**:
   สร้างไฟล์ `.env.local` และระบุ Firebase Config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 4. การอัปเกรดจาก v1.3
- ทำการลบ `process.env` ที่เกี่ยวข้องกับ API Keys ออกจากระบบ Hosting
- ย้าย Key ทั้งหมดไปที่ Firestore ตามข้อที่ 2
- ตรวจสอบว่า `package.json` มั่นใจว่าเป็นเวอร์ชัน 1.4.0

---
*จัดทำโดย: ทีมพัฒนา KUVMIS*
