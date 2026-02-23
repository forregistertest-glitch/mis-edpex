# 📚 เปรียบเทียบโครงสร้างข้อมูล Research APIs (Scopus vs NCBI)

| Field | Value |
| :--- | :--- |
| **Doc ID** | KUVMIS-DOC-003 |
| **Version** | 1.3 |
| **Standard** | ISO 27001 / EdPEx Compliance |
| **Last Updated** | 2026-02-23 |
| **Author** | KUVMIS Development Team |
| **Status** | Released |

เอกสารฉบับนี้เปรียบเทียบรายละเอียดฟิลด์ข้อมูลที่ได้รับจากการเชื่อมต่อ API ของ **Scopus (Elsevier)** ในโหมด Standard/Complete และ **NCBI (PubMed)** เพื่อใช้เป็นมาตรฐานในการจัดการฐานข้อมูลงานวิจัยของคณะสัตวแพทยศาสตร์

---

## 🔍 เปรียบเทียบฟิลด์ข้อมูลรายแหล่ง (Data Fields Comparison)

| ข้อมูลที่ได้รับ | Scopus Standard | Scopus Complete | NCBI (PubMed) | หมายเหตุ |
| :--- | :---: | :---: | :---: | :--- |
| **Unique ID** | ✅ (EID) | ✅ (EID) | ✅ (PMID) | ใช้ระบุตัวตนงานวิจัยเพื่อป้องกันการนำเข้าซ้ำ |
| **DOI** | ✅ | ✅ | ✅ | Digital Object Identifier |
| **ชื่องานวิจัย (Title)** | ✅ | ✅ | ✅ | |
| **วารสาร (Journal)** | ✅ | ✅ | ✅ | |
| **ปีที่พิมพ์ (Year)** | ✅ | ✅ | ✅ | |
| **รายชื่อผู้แต่ง (Authors)** | ⚠️ เฉพาะคนแรก | ✅ **มาครบ** | ✅ **มาครบ** | Scopus Standard จะให้ข้อมูลผู้แต่งไม่ครบ |
| **Author ID** | ⚠️ เฉพาะคนแรก | ✅ มีครบทุกคน | ❌ ไม่มี | NCBI ไม่ได้ให้รหัส Author ID ติดมาในชุด metadata ปกติ |
| **บทคัดย่อ (Abstract)**| ❌ | ✅ | ⚠️ (อนาคต) | ปัจจุบัน NCBI ดึงเฉพาะ Summary (ยังไม่มี Abstract) |
| **คำสำคัญ (Keywords)** | ❌ | ✅ | ⚠️ (อนาคต) | |
| **จำนวนอ้างอิง (Citation)**| ❌ | ✅ | ❌ | NCBI (PubMed) ไม่ได้ให้ข้อมูล Citation Count โดยตรง |
| **สังกัด (Affiliations)** | ⚠️ รวม | ✅ แยกรายคน | ✅ รวม | |
| **ทุนวิจัย (Funding)** | ❌ | ✅ | ❌ | |
| **Open Access** | ❌ | ✅ | ❌ | |

---

## 🛠️ ข้อแนะนำการจัดการข้อมูล

### 1. การทับข้อมูล (Data Upsert)
เมื่อมีการนำเข้าข้อมูลจากแหล่งเดียวหรือหลายแหล่ง ระบบจะใช้กุญแจหลักในการเปรียบเทียบดังนี้:
- **Scopus**: ใช้ `scopus_eid` เป็นหลัก
- **NCBI**: ใช้ `PMID` (เก็บในฟิลด์เดียวกับ scopus_eid แต่มี Prefix ว่า `PMID:`)
- **DOI**: ใช้เป็นกุญแจรอง หากพบ DOI ซ้ำ ระบบจะถือว่าเป็นงานวิจัยชิ้นเดียวกันและทำการอัปเดต (Merge) ข้อมูลแทนการสร้างใหม่

### 2. แหล่งข้อมูล (Data Priority)
เราแนะนำให้ใช้ข้อมูลจาก **Scopus (Complete)** เป็นหลักหากมีข้อมูลในทั้งสองแหล่ง เนื่องจากให้รายละเอียดที่ครบถ้วนที่สุดทั้งในส่วนของ Abstract, Keywords, และ Citation Count

### 3. การแสดงผลในหน้าหลัก
ระบบจะแสดงป้ายกำกับแหล่งที่มาอย่างชัดเจน:
- <span style="color: #2563eb; font-weight: bold;">[Globe] Scopus</span> (สีฟ้า)
- <span style="color: #ea580c; font-weight: bold;">[Globe] NCBI</span> (สีส้ม)
- <span style="color: #10b981; font-weight: bold;">[File] Excel</span> (สีเขียว)
- <span style="color: #64748b; font-weight: bold;">[Edit] Manual</span> (สีเทา)
