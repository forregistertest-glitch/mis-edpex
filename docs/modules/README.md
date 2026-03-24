# 📚 คู่มือระบบจัดการข้อมูล MIS-EDPEX

> Documentation สำหรับระบบจัดการข้อมูลทั้ง 3 โมดูลหลัก

---

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [โมดูลทั้ง 3](#โมดูลทั้ง-3)
3. [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
4. [การเริ่มต้นใช้งาน](#การเริ่มต้นใช้งาน)

---

## 🎯 ภาพรวมระบบ

ระบบ MIS-EDPEX เป็นระบบจัดการข้อมูลสารสนเทศสำหรับคณะสัตวแพทยศาสตร์ ประกอบด้วย 3 โมดูลหลัก:

### **1. Postgraduate Data Module** 📖
ระบบจัดการข้อมูลนิสิตบัณฑิตศึกษา ครอบคลุม 58 fields ตั้งแต่ข้อมูลส่วนตัว การศึกษา อาจารย์ที่ปรึกษา วิทยานิพนธ์ และการสอบต่างๆ

### **2. HR Data Module** 👥
ระบบจัดการข้อมูลบุคลากร ครอบคลุม 10 tabs จาก 17 sheets ของ Excel รวมถึงข้อมูลส่วนตัว การจ้างงาน การศึกษา ครอบครัว เงินเดือน และอื่นๆ

### **3. Academic Education Module** 🎓
ระบบจัดการข้อมูลการศึกษาวิชาชีพ แบ่งเป็น 2 ประเภท:
- **Residency** (สัตวแพทย์ประจำบ้าน) - ใช้โครงสร้างแบบ Static + Progressive
- **Intern** (นักศึกษาฝึกงาน) - ใช้โครงสร้างแบบ Static + Progressive

---

## 📊 โมดูลทั้ง 3

### **Module 1: Postgraduate Data**
- **Path**: `/data-management/postgraduate`
- **Component**: `PostgraduateForm.tsx`
- **Type**: `PostgraduateData` (58 fields)
- **Features**: 5 tabs, Form validation, Auto-update full name
- [📖 คู่มือโมดูล Postgraduate](./01-postgraduate-module.md)

### **Module 2: HR Data**
- **Path**: `/data-management/hr-data`
- **Component**: `HRDataForm.tsx`
- **Type**: `HRData`
- **Features**: 10 tabs, PDPA masking, Profile picture upload
- [📖 คู่มือโมดูล HR Data](./02-hr-data-module.md)

### **Module 3: Academic Education**
- **Path**: `/data-management/academic`
- **Components**: 
  - Profile Forms: `ResidencyProfileForm.tsx`, `InternProfileForm.tsx`
  - Timeline: `ResidencyProgressTimeline.tsx`, `InternApplicationTimeline.tsx`
- **Types**: 
  - Residency: `ResidencyProfile`, `ResidencyExamLog`, `ResidencyPublication`, etc.
  - Intern: `InternProfile`, `InternApplicationLog`, `InternWorkHistory`
- **Features**: Static + Progressive data model, Timeline view, Multi-step workflow
- [📖 คู่มือโมดูล Academic Education](./03-academic-education-module.md)

---

## 🏗️ สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────────┐
│                     MIS-EDPEX System                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Postgraduate │  │   HR Data    │  │    Academic     │  │
│  │    Module    │  │    Module    │  │     Module      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│         │                 │                    │            │
│         └─────────────────┴────────────────────┘            │
│                           │                                 │
│                    ┌──────▼──────┐                         │
│                    │  TypeScript │                         │
│                    │    Types    │                         │
│                    └──────┬──────┘                         │
│                           │                                 │
│                    ┌──────▼──────┐                         │
│                    │   Next.js   │                         │
│                    │   App Router│                         │
│                    └──────┬──────┘                         │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐              │
│         │                 │                 │              │
│    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐         │
│    │  React  │      │Tailwind │      │ Lucide  │         │
│    │Components│     │   CSS   │      │  Icons  │         │
│    └─────────┘      └─────────┘      └─────────┘         │
│                                                             │
│                    ┌─────────────┐                         │
│                    │  Firebase/  │                         │
│                    │  Database   │                         │
│                    │  (TODO)     │                         │
│                    └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Patterns

### **1. Form Components**
- Controlled inputs with React hooks
- TypeScript interfaces for type safety
- Tailwind CSS for consistent styling
- Validation และ error handling

### **2. Data Models**
- **Single Model**: Postgraduate, HR Data (อัพเดททับ)
- **Hybrid Model**: Academic Education (Static + Progressive)

### **3. UI/UX Patterns**
- Tabbed interface สำหรับข้อมูลหลายส่วน
- Timeline view สำหรับข้อมูลที่เปลี่ยนแปลง
- Empty states พร้อม call-to-action
- Loading states และ error messages

---

## 🚀 การเริ่มต้นใช้งาน

### **1. เข้าสู่ระบบ**
```
http://localhost:3000/data-management
```

### **2. เลือกโมดูล**
- Postgraduate Data (ข้อมูลบัณฑิตศึกษา)
- HR Data (ข้อมูลบุคลากร)
- Academic Education (ข้อมูลการศึกษาวิชาชีพ)

### **3. เพิ่มข้อมูลใหม่**
คลิกปุ่ม **"เพิ่มข้อมูลใหม่"** ในแต่ละโมดูล

### **4. กรอกข้อมูล**
- กรอกข้อมูลตาม tabs/sections
- ระบบจะ validate ข้อมูลอัตโนมัติ
- คลิก **"บันทึกข้อมูล"**

---

## 📖 คู่มือแต่ละโมดูล

### [1. Postgraduate Module →](./01-postgraduate-module.md)
คู่มือการใช้งานโมดูลข้อมูลบัณฑิตศึกษา

### [2. HR Data Module →](./02-hr-data-module.md)
คู่มือการใช้งานโมดูลข้อมูลบุคลากร

### [3. Academic Education Module →](./03-academic-education-module.md)
คู่มือการใช้งานโมดูลข้อมูลการศึกษาวิชาชีพ (Residency & Intern)

---

## 🔧 Technical Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.1.6 | React Framework |
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 3.x | Styling |
| Lucide React | Latest | Icons |

---

## 📝 Data Flow

```
User Input → Form Component → TypeScript Validation → State Management
                                                              ↓
                                                        (TODO) API Call
                                                              ↓
                                                        Firebase/Database
                                                              ↓
                                                        Success/Error Response
                                                              ↓
                                                        UI Update
```

---

## 🎯 Future Enhancements

- [ ] Database integration (Firebase/Firestore)
- [ ] Export to Excel/PDF
- [ ] Advanced search และ filtering
- [ ] Data visualization (charts, graphs)
- [ ] User authentication และ authorization
- [ ] Audit logs และ version control
- [ ] Batch import/export
- [ ] Mobile responsive optimization

---

## 📞 Support

หากมีคำถามหรือพบปัญหา กรุณาติดต่อทีมพัฒนาระบบ

---

**Last Updated**: March 2026  
**Version**: 1.0.0
