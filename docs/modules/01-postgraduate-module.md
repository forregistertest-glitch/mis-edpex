# 📖 Postgraduate Data Module

> คู่มือการใช้งานโมดูลจัดการข้อมูลนิสิตบัณฑิตศึกษา

---

## 📋 สารบัญ

1. [ภาพรวม](#ภาพรวม)
2. [โครงสร้างข้อมูล](#โครงสร้างข้อมูล)
3. [User Interface](#user-interface)
4. [Data Flow](#data-flow)
5. [การใช้งาน](#การใช้งาน)
6. [Technical Details](#technical-details)

---

## 🎯 ภาพรวม

โมดูล Postgraduate Data ใช้สำหรับจัดการข้อมูลนิสิตบัณฑิตศึกษา ครอบคลุม **58 fields** จาก CSV ที่มีโครงสร้างครบถ้วน

### **Features หลัก**
- ✅ Form 5 tabs สำหรับจัดกลุ่มข้อมูล
- ✅ Auto-update ชื่อเต็ม (ไทย/อังกฤษ)
- ✅ Validation ข้อมูลอัตโนมัติ
- ✅ Responsive design
- ✅ Type-safe with TypeScript

### **ข้อมูลที่ครอบคลุม**
- ข้อมูลส่วนตัว (11 fields)
- สถานะและโครงการ (4 fields)
- สาขาวิชาและปริญญา (13 fields)
- การเข้าศึกษาและสำเร็จการศึกษา (7 fields)
- อาจารย์ที่ปรึกษาและคณะกรรมการ (4 fields)
- วิทยานิพนธ์ (6 fields)
- การสอบต่างๆ (13 fields)

---

## 📊 โครงสร้างข้อมูล

### **Data Model Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                    PostgraduateData                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Basic Info (11 fields)                           │  │
│  │  - student_id, sex                                   │  │
│  │  - prename_th, name_th, midname_th, surname_th      │  │
│  │  - prename_en, name_en, midname_en, surname_en      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 2. Status (2 fields)                                 │  │
│  │  - current_status                                    │  │
│  │  - registration_status                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 3. Program Info (2 fields)                           │  │
│  │  - project_type_th                                   │  │
│  │  - project_type_en                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 4. Major/Degree (11 fields)                          │  │
│  │  - major_code, major_th, major_en                    │  │
│  │  - degree_th, degree_en, degree_level                │  │
│  │  - faculty_th, faculty_en                            │  │
│  │  - campus_th, campus_en, line_th                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 5. Admission (5 fields)                              │  │
│  │  - class_year, semester                              │  │
│  │  - nationality_code, nationality_th, nationality_en  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 6. Graduation (3 fields)                             │  │
│  │  - graduation_year, graduation_semester              │  │
│  │  - approve_date                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 7. Advisor (2 fields)                                │  │
│  │  - teacher_card                                      │  │
│  │  - advisor_name_th                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 8. Committee (2 fields)                              │  │
│  │  - committee_set                                     │  │
│  │  - committee_date                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 9. Thesis (4 fields)                                 │  │
│  │  - thesis_th, thesis_en                              │  │
│  │  - proposal_submit, proposal_date                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 10. Exams (13 fields)                                │  │
│  │  - English: status, date                             │  │
│  │  - Study Plan: submit, date                          │  │
│  │  - Comprehensive (Writing): status, date             │  │
│  │  - Comprehensive (Oral): status, date                │  │
│  │  - Qualifying (Writing): status, date                │  │
│  │  - Qualifying (Oral): status, date                   │  │
│  │  - Defense: status, date                             │  │
│  │  - Manuscript: status, date                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Metadata (3 fields)                                  │  │
│  │  - created_at, updated_at, created_by                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Total: 58 fields
```

---

## 🎨 User Interface

### **Tab Structure**

```
┌─────────────────────────────────────────────────────────────┐
│  PostgraduateForm                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Profile] [Academic] [Advisor] [Thesis] [Exams]           │
│  ───────                                                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Tab Content                                           │ │
│  │                                                       │ │
│  │  [Input Fields arranged in grid layout]              │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│                                    [ยกเลิก] [บันทึกข้อมูล] │
└─────────────────────────────────────────────────────────────┘
```

### **Tab 1: Profile (ข้อมูลส่วนตัว)**
- รหัสนิสิต *
- เพศ *
- คำนำหน้า (ไทย) *
- ชื่อ (ไทย) *
- ชื่อกลาง (ไทย)
- นามสกุล (ไทย) *
- คำนำหน้า (อังกฤษ) *
- ชื่อ (อังกฤษ) *
- ชื่อกลาง (อังกฤษ)
- นามสกุล (อังกฤษ) *
- สถานะปัจจุบัน *
- สถานะการลงทะเบียน *

**Auto-update Feature:**
- ชื่อเต็ม (ไทย) = คำนำหน้า + ชื่อ + ชื่อกลาง + นามสกุล
- ชื่อเต็ม (อังกฤษ) = คำนำหน้า + ชื่อ + ชื่อกลาง + นามสกุล

### **Tab 2: Academic (ข้อมูลการศึกษา)**
- ประเภทโครงการ (ไทย) *
- ประเภทโครงการ (อังกฤษ) *
- รหัสสาขาวิชา *
- ชื่อสาขาวิชา (ไทย) *
- ชื่อสาขาวิชา (อังกฤษ) *
- ชื่อปริญญา (ไทย) *
- ชื่อปริญญา (อังกฤษ) *
- ระดับปริญญา *
- ชื่อคณะ (ไทย) *
- ชื่อคณะ (อังกฤษ) *
- ชื่อวิทยาเขต (ไทย) *
- ชื่อวิทยาเขต (อังกฤษ) *
- ชื่อกลุ่มสาขาวิชา
- ปีที่เข้าศึกษา *
- ภาคเรียนที่เข้าศึกษา *
- สัญชาติ (ไทย) *
- ปีที่สำเร็จการศึกษา
- ภาคเรียนที่สำเร็จการศึกษา
- วันอนุมัติปริญญา

### **Tab 3: Advisor (อาจารย์ที่ปรึกษา)**
- รหัสอาจารย์ที่ปรึกษาหลัก
- ชื่ออาจารย์ที่ปรึกษาหลัก (ไทย)
- การแต่งตั้งคณะกรรมการนิสิต
- วันที่แต่งตั้งคณะกรรมการนิสิต

### **Tab 4: Thesis (วิทยานิพนธ์)**
- ชื่อวิทยานิพนธ์ (ไทย)
- ชื่อวิทยานิพนธ์ (อังกฤษ)
- การเสนอโครงการวิทยานิพนธ์
- วันที่อนุมัติโครงการวิทยานิพนธ์

### **Tab 5: Exams (การสอบ)**
- การสอบภาษาอังกฤษ + วันที่
- การเสนอแผนการเรียน + วันที่
- การสอบประมวลความรู้ (ข้อเขียน) + วันที่
- การสอบประมวลความรู้ (สัมภาษณ์) + วันที่
- การสอบวัดคุณสมบัติ (ข้อเขียน) + วันที่
- การสอบวัดคุณสมบัติ (สัมภาษณ์) + วันที่
- การสอบปากเปล่าขั้นสุดท้าย + วันที่
- การยื่นเอกสารขอจบการศึกษา + วันที่

---

## 🔄 Data Flow

### **Component Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interaction                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgraduateForm Component                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ useState<PostgraduateData>                           │  │
│  │  - formData state management                         │  │
│  │  - handleChange for inputs                           │  │
│  │  - handleSubmit for form submission                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              TypeScript Validation                          │
│  - Type checking at compile time                           │
│  - Required fields validation                               │
│  - Data structure validation                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  onSubmit Handler                           │
│  - Async function                                           │
│  - Loading state management                                 │
│  - Error handling                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              (TODO) API Integration                         │
│  - POST /api/postgraduate                                   │
│  - Firebase/Firestore save                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Success/Error Response                       │
│  - Alert message                                            │
│  - Navigate to list page                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 การใช้งาน

### **Step 1: เข้าสู่หน้าเพิ่มข้อมูล**

```
http://localhost:3000/data-management/postgraduate/new
```

### **Step 2: กรอกข้อมูลในแต่ละ Tab**

#### **Tab 1: Profile**
1. กรอกรหัสนิสิต (เช่น 6510400001)
2. เลือกเพศ
3. กรอกคำนำหน้า ชื่อ นามสกุล (ไทย)
4. กรอกคำนำหน้า ชื่อ นามสกุล (อังกฤษ)
5. เลือกสถานะปัจจุบัน
6. เลือกสถานะการลงทะเบียน

**💡 Tip**: ชื่อเต็มจะถูกสร้างอัตโนมัติ

#### **Tab 2: Academic**
1. กรอกข้อมูลโครงการ
2. กรอกข้อมูลสาขาวิชาและปริญญา
3. กรอกข้อมูลคณะและวิทยาเขต
4. กรอกปีและภาคเรียนที่เข้าศึกษา
5. กรอกข้อมูลการสำเร็จการศึกษา (ถ้ามี)

#### **Tab 3: Advisor**
1. กรอกรหัสอาจารย์ที่ปรึกษา
2. กรอกชื่ออาจารย์ที่ปรึกษา
3. กรอกข้อมูลคณะกรรมการ (ถ้ามี)

#### **Tab 4: Thesis**
1. กรอกชื่อวิทยานิพนธ์ (ไทย/อังกฤษ)
2. กรอกข้อมูลการเสนอโครงการ (ถ้ามี)

#### **Tab 5: Exams**
1. กรอกข้อมูลการสอบแต่ละประเภท
2. ระบุวันที่สอบ (ถ้ามี)

### **Step 3: บันทึกข้อมูล**

คลิกปุ่ม **"บันทึกข้อมูล"** (สีม่วง)

---

## 🔧 Technical Details

### **File Structure**

```
src/
├── components/
│   └── data-management/
│       └── postgraduate/
│           └── PostgraduateForm.tsx    # Main form component
├── types/
│   └── data-management.ts              # PostgraduateData interface
└── app/
    └── data-management/
        └── postgraduate/
            └── new/
                └── page.tsx            # New postgraduate page
```

### **TypeScript Interface**

```typescript
export interface PostgraduateData {
  id?: string;
  
  // Basic Info (11 fields)
  number?: number;
  student_id: string;
  sex: string;
  prename_th: string;
  name_th: string;
  midname_th?: string;
  surname_th: string;
  prename_en: string;
  name_en: string;
  midname_en?: string;
  surname_en: string;
  
  // Status (2 fields)
  current_status: string;
  registration_status: string;
  
  // ... (58 fields total)
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
```

### **Key Features Implementation**

#### **1. Auto-update Full Name**
```typescript
useEffect(() => {
  const fullNameTh = [
    formData.prename_th,
    formData.name_th,
    formData.midname_th,
    formData.surname_th
  ].filter(Boolean).join(' ');
  
  const fullNameEn = [
    formData.prename_en,
    formData.name_en,
    formData.midname_en,
    formData.surname_en
  ].filter(Boolean).join(' ');
  
  // Update display
}, [formData.prename_th, formData.name_th, ...]);
```

#### **2. Form Validation**
```typescript
<input
  type="text"
  name="student_id"
  required
  value={formData.student_id}
  onChange={handleChange}
  className="..."
/>
```

#### **3. State Management**
```typescript
const [formData, setFormData] = useState<Partial<PostgraduateData>>({
  student_id: "",
  sex: "ชาย",
  // ... initial values
  ...initialData,
});

const handleChange = (e: React.ChangeEvent<...>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};
```

---

## 🎨 UI/UX Design

### **Color Theme**
- Primary: **Purple/Violet** (#8B5CF6)
- Focus: Purple ring
- Buttons: Purple gradient

### **Responsive Grid**
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

### **Input Styling**
- Rounded corners (rounded-xl)
- Border on focus
- Disabled state styling
- Required field indicator (*)

---

## 📊 Data Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| student_id | string | ✅ | - |
| sex | string | ✅ | - |
| prename_th | string | ✅ | - |
| name_th | string | ✅ | - |
| surname_th | string | ✅ | - |
| current_status | string | ✅ | - |
| class_year | string | ✅ | - |
| semester | string | ✅ | - |

---

## 🚀 Next Steps

- [ ] เชื่อมต่อ Firebase/Database
- [ ] เพิ่ม Edit mode
- [ ] เพิ่ม Delete function
- [ ] เพิ่ม Search และ Filter
- [ ] Export to Excel

---

**[← กลับไปหน้าหลัก](./README.md)**
