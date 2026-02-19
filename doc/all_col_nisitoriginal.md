# CSV Field Mapping — Complete Gap Analysis

| Field | Value |
|:------|:------|
| **Version** | 1.03 |
| **Last Updated** | 2026-02-19T06:50:00+07:00 |
| **Purpose** | แสดงทุก field ของ 6 CSV ต้นฉบับ + สถานะว่าระบบมีหรือไม่ + logic คำนวณ |

**Legend:**
- ✅ = มีใน Type + Import + Export แล้ว
- ⚠️ = มีใน Type แล้ว แต่ Export ยังไม่ส่งออก
- ❌ = ยังไม่มีใน Type / ต้องเพิ่ม
- 🔗 = ต้อง JOIN จาก collection อื่น
- 📊 = ต้องคำนวณ (Computed/Aggregated)

---

## CSV 1: การตีพิมพ์ผลงาน (Publication Records — 296 rows)

**แหล่งข้อมูล:** `student_publications` + JOIN `graduate_students`

| # | คอลัมน์ต้นฉบับ | Type Field | Collection | สถานะ | แผน |
|:--|:---|:---|:---|:---|:---|
| 1 | ลำดับ | — (row number) | — | 📊 | Auto-number ตอน export |
| 2 | รหัสนิสิต | `student_id` | student_publications | ✅ | — |
| 3 | ชื่อ - นามสกุล | `full_name_th` | 🔗 graduate_students | ⚠️ | JOIN student by student_id |
| 4 | ระดับ | `degree_level` | 🔗 graduate_students | ⚠️ | JOIN student by student_id |
| 5 | สาขาวิชา | `major_name` | 🔗 graduate_students | ⚠️ | JOIN student by student_id |
| 6 | ชื่ออาจารย์ที่ปรึกษาหลัก | `advisor_name` | 🔗 graduate_students | ⚠️ | JOIN student by student_id |
| 7 | ชื่อบทความ | `publication_title` | student_publications | ✅ | — |
| 8 | ชื่อวารสาร | `journal_name` | student_publications | ✅ | — |
| 9 | เผยแพร่ระหว่างวันที่ | `publish_period` | student_publications | ⚠️ | Type มี, Import/Export ยังไม่ map |
| 10 | ปีที่ (Volume) | `volume` | student_publications | ⚠️ | Type มี, Import/Export ยังไม่ map |
| 11 | ฉบับที่ (Issue) | `issue` | student_publications | ⚠️ | Type มี, Import/Export ยังไม่ map |
| 12 | เลขหน้า | `pages` | student_publications | ⚠️ | Type มี, Import/Export ยังไม่ map |
| 13 | วันที่ตอบรับให้ตีพิมพ์ | `acceptance_date` | student_publications | ⚠️ | Type มี, Import/Export ยังไม่ map |
| 14 | ปีที่ตีพิมพ์ | `year` | student_publications | ✅ | — |
| 15 | ระดับการเผยแพร่ | `publication_level` | student_publications | ⚠️ | Type มี, Import/Export ยังไม่ map |
| 16 | วันที่อนุมัติปริญญา | `degree_approval_date` | student_publications | ⚠️ | Type มี, Import/Export ยังไม่ map |
| 17 | ฐานข้อมูล | `database_source` | student_publications | ⚠️ | Type มี, Import/Export ยังไม่ map |
| 18 | แผนการเรียน | `study_plan` | 🔗 graduate_students | ⚠️ | JOIN student by student_id |

**สรุป CSV 1:** Type ครบแล้ว ✅ — ต้องทำ: (1) เพิ่ม header mapping ใน Import, (2) เพิ่ม columns ใน Export, (3) JOIN student data ตอน export

**Export Logic:**
```
publications.map(pub => {
  const student = studentsMap[pub.student_id];
  return {
    ลำดับ: index + 1,
    รหัสนิสิต: pub.student_id,
    ชื่อ: student?.full_name_th,           // JOIN
    ระดับ: student?.degree_level,           // JOIN
    สาขาวิชา: student?.major_name,         // JOIN
    อาจารย์: student?.advisor_name,         // JOIN
    ชื่อบทความ: pub.publication_title,
    ชื่อวารสาร: pub.journal_name,
    เผยแพร่ระหว่าง: pub.publish_period,
    ปีที่: pub.volume,
    ฉบับที่: pub.issue,
    เลขหน้า: pub.pages,
    วันรับ: pub.acceptance_date,
    ปีตีพิมพ์: pub.year,
    ระดับ: pub.publication_level,
    วันอนุมัติ: pub.degree_approval_date,
    ฐานข้อมูล: pub.database_source,
    แผน: student?.study_plan,              // JOIN
  };
})
```

---

## CSV 2: นิสิตคงอยู่ สำเร็จ (Active/Graduated Students — 22 rows)

**แหล่งข้อมูล:** `graduate_students` WHERE `current_status` IN ('กำลังศึกษา', 'จบการศึกษา')

| # | คอลัมน์ต้นฉบับ | Type Field | สถานะ | แผน |
|:--|:---|:---|:---|:---|
| 1 | ลำดับ | — | 📊 | Auto-number |
| 2 | รหัสนิสิต | `student_id` | ✅ | — |
| 3 | ชื่อ | `full_name_th` | ✅ | — |
| 4 | เพศ | `gender` | ✅ | — |
| 5 | สัญชาติ | `nationality` | ✅ | — |
| 6 | ระดับปริญญา | `degree_level` | ✅ | — |
| 7 | หลักสูตร (ปกติ/พิเศษ) | `program_type` | ✅ | — |
| 8 | รหัสสาขา | `major_code` | ✅ | — |
| 9 | สาขาวิชา | `major_name` | ✅ | — |
| 10 | อาจารย์ที่ปรึกษา | `advisor_name` | ✅ | — |
| 11 | ภาควิชาอาจารย์ | `advisor_department` | ✅ | — |
| 12 | ภาคที่เข้าศึกษา | `admit_semester` | ✅ | — |
| 13 | ปีที่เข้าศึกษา | `admit_year` | ✅ | — |
| 14 | ภาคที่ต้องจบ (แผน) | `expected_grad_semester` | ✅ | — |
| 15 | ปีที่ต้องจบ (แผน) | `expected_grad_year` | ✅ | — |
| 16 | สถานะปัจจุบัน | `current_status` | ✅ | — |
| 17 | แผนการเรียน | `study_plan` | ✅ | — |
| 18 | หัวข้อวิทยานิพนธ์ | `thesis_title_th` | ✅ | — |
| 19 | วันที่อนุมัติโครงร่าง | `proposal_exam_date` | ✅ | — |
| 20 | ผลสอบภาษาอังกฤษ | `english_test_pass` | ✅ | — |
| 21 | สอบประมวลความรู้/QE | — | ❌ | ต้อง JOIN จาก student_progress (milestone_type = QE/Comprehensive) |
| 22 | ผลสอบปากเปล่า | — | ❌ | ต้อง JOIN จาก student_progress (milestone_type = Defense) |
| 23 | ผลสอบปากเปล่าโมฆะ | — | ❌ | ยังไม่มี field — ต้องเพิ่มใน Type หรือ Progress |
| 24 | อนุมัติปริญญา | `actual_graduation_date` | ⚠️ | มีใน Type แต่ Export ไม่ส่งออก |
| 25 | ภาคจบการศึกษา | `graduated_semester` | ✅ | — |
| 26 | ปีจบการศึกษา | `graduated_year` | ✅ | — |
| 27 | จบตามแผน | `on_plan` | ⚠️ | มีใน Type แต่ Export ไม่ส่งออก |

**สรุป CSV 2:** ข้อมูล Student profile ครบ 20/27 fields ✅ — ต้องทำ:
1. Export แยก Sheet ตาม status filter
2. เพิ่ม JOIN milestone data (#21-23)
3. เพิ่ม #24, #27 ใน Export

**Export Logic:**
```
// Filter
const activeGrad = students.filter(s =>
  ['กำลังศึกษา', 'จบการศึกษา'].includes(s.current_status)
);
// Column #21: QE date
const qeDate = progressMap[s.student_id]
  ?.find(p => ['QE','Comprehensive','QualifyOral'].includes(p.milestone_type))
  ?.exam_date;
// Column #22: Defense date
const defenseDate = progressMap[s.student_id]
  ?.find(p => p.milestone_type === 'Defense')
  ?.exam_date;
// Column #27: จบตามแผน
const onPlan = s.graduated_year && s.expected_grad_year
  ? (s.graduated_year <= s.expected_grad_year ? 'จบตามแผน' : 'จบไม่ตามแผน')
  : '';
```

---

## CSV 3: นิสิตสละสิทธิ์ / ไม่มารายงานตัว (Withdrawn — 22 rows)

**แหล่งข้อมูล:** `graduate_students` WHERE `current_status` IN ('สละสิทธิ์', 'ไม่มารายงานตัว', 'ลาออก', 'พ้นสภาพ')

| # | คอลัมน์ต้นฉบับ | Type Field | สถานะ |
|:--|:---|:---|:---|
| 1-13 | (เหมือน CSV 2 แถว 1-13) | — | ✅ |
| 14 | ภาคที่ต้องจบ | `expected_grad_semester` | ✅ (อาจเป็น "ไม่มารายงานตัว") |
| 15 | ปีที่ต้องจบ | `expected_grad_year` | ✅ |
| 16 | สถานะปัจจุบัน | `current_status` | ✅ |

**สรุป CSV 3:** ✅ **ข้อมูลครบแล้ว** — ต้องทำ: Export แยก Sheet ตาม status filter เท่านั้น

**Export Logic:**
```
const withdrawn = students.filter(s =>
  ['สละสิทธิ์', 'ไม่มารายงานตัว', 'ลาออก', 'พ้นสภาพ'].includes(s.current_status)
);
```

---

## CSV 4: รายงานความก้าวหน้า (Progress Report — 165 rows, **55 columns**)

> ⚠️ **`all_col_nisitoriginal.md` เดิมแสดงไม่ครบ** — แสดงเพียง ~13 จาก 55 คอลัมน์

**แหล่งข้อมูล:** `graduate_students` + PIVOT `student_progress`

**Format: Wide (1 แถว = 1 นิสิต, Milestone เป็นคอลัมน์แนวนอน)**

| # | คอลัมน์ | Type Field | Collection | สถานะ | แผน |
|:--|:---|:---|:---|:---|:---|
| 1 | STUDENT_ID | `student_id` | graduate_students | ✅ | — |
| 2 | SEX | `gender` | graduate_students | ✅ | Map F→หญิง, M→ชาย |
| 3 | PRENAME_TH | `title_th` | graduate_students | ✅ | — |
| 4 | NAME_TH | `first_name_th` | graduate_students | ✅ | — |
| 5 | MIDNAME_TH | — | — | ❌ | ไม่พบใน field ปัจจุบัน (ส่วนใหญ่ว่าง) |
| 6 | SURNAME_TH | `last_name_th` | graduate_students | ✅ | — |
| 7 | PRENAME_EN | `title_en` | graduate_students | ✅ | — |
| 8 | NAME_EN | `first_name_en` | graduate_students | ✅ | — |
| 9 | MIDNAME_EN | — | — | ❌ | ไม่พบ (ส่วนใหญ่ว่าง) |
| 10 | SURNAME_EN | `last_name_en` | graduate_students | ✅ | — |
| 11 | TYPE_C | `study_plan` | graduate_students | ✅ | — |
| 12 | PRJ_TH | `program_type` | graduate_students | ✅ | — |
| 13 | PRJ_EN | — | — | ❌ | เพิ่ม field `program_type_en` หรือ map จาก TH |
| 14 | MAJOR_C | `major_code` | graduate_students | ✅ | — |
| 15 | MAJOR_TH | `major_name` | graduate_students | ✅ | — |
| 16 | MAJOR_EN | — | — | ❌ | เพิ่ม field `major_name_en` |
| 17 | DEGREE_TH | — | — | ❌ | เพิ่ม field `degree_name_th` (ชื่อเต็มปริญญา) |
| 18 | DEGREE_EN | — | — | ❌ | เพิ่ม field `degree_name_en` |
| 19 | DEGREE_LEVEL | `degree_level` | graduate_students | ✅ | — |
| 20 | FACULTY_TH | `faculty` | graduate_students | ✅ | — |
| 21 | FACULTY_EN | — | — | ❌ | เพิ่ม field `faculty_en` หรือ hardcode "Veterinary Medicine" |
| 22 | CAMPUS_TH | `campus` | graduate_students | ✅ | — |
| 23 | CAMPUS_EN | — | — | ❌ | map: บางเขน→Bangkhen |
| 24 | LINE_TH | `line_th` | graduate_students | ✅ | — |
| 25 | CLASS_YR | `admit_year` | graduate_students | ✅ | — |
| 26 | SEMESTER | `admit_semester` | graduate_students | ✅ | — |
| 27 | NATIONALITY_C | — | — | ❌ | เพิ่ม field `nationality_code` หรือ map จาก TH |
| 28 | NATIONALITY_TH | `nationality` | graduate_students | ✅ | — |
| 29 | NATIONALITY_EN | — | — | ❌ | map: ไทย→THAI |
| 30 | CLASS_YR_G | `graduated_year` | graduate_students | ⚠️ | มีแต่ไม่ export |
| 31 | SEMESTER2_G | `graduated_semester` | graduate_students | ⚠️ | มีแต่ไม่ export |
| 32 | APPROVE_D | `actual_graduation_date` | graduate_students | ⚠️ | มีแต่ไม่ export |
| 33 | TEACHER_CARD | `teacher_card` | graduate_students | ✅ | — |
| 34 | ADVISOR_NAME_TH | `advisor_name` | graduate_students | ✅ | — |
| 35 | COMMITTEE_SET | `committee_set` | graduate_students | ✅ | — |
| 36 | COMMIT_DATE | `committee_date` | graduate_students | ✅ | — |
| 37 | THESIS_TH | `thesis_title_th` | graduate_students | ✅ | — |
| 38 | THESIS_EN | `thesis_title_en` | graduate_students | ✅ | — |
| **39** | **PROPOSAL_SUBMIT** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=Proposal, field=status |
| **40** | **PROP_DATE** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=Proposal, field=exam_date |
| **41** | **ENGEXAM_STATUS** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=English, field=status |
| **42** | **ENGEXAM_DATE** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=English, field=exam_date |
| **43** | **STUDYPLAN_SUBMIT** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=StudyPlan, field=status |
| **44** | **STUDYPLAN_DATE** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=StudyPlan, field=exam_date |
| **45** | **COMPREHENSIVE_WRITING_STATUS** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=ComprehensiveWriting, field=status |
| **46** | **COMPRE_WRITING_DATE** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=ComprehensiveWriting, field=exam_date |
| **47** | **COMPREHENSIVE_ORAL_STATUS** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=ComprehensiveOral, field=status |
| **48** | **COMPRE_ORAL_DATE** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=ComprehensiveOral, field=exam_date |
| **49** | **QUALIFYEXAM_WRITING_STATUS** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=QualifyWriting, field=status |
| **50** | **QUALIFY_WRITING_DATE** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=QualifyWriting, field=exam_date |
| **51** | **QUALIFYEXAM_ORAL_STATUS** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=QualifyOral, field=status |
| **52** | **QUALIFY_ORAL_DATE** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=QualifyOral, field=exam_date |
| **53** | **DEFENDEXAM_STATUS** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=Defense, field=status |
| **54** | **DEFEND_DATE** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=Defense, field=exam_date |
| **55** | **MANUSCRIPT_STATUS** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=Manuscript, field=status |
| **56** | **MANUSCRIPT_DATE** | — | 🔄 student_progress | ❌ | **Pivot:** milestone=Manuscript, field=exam_date |

**สรุป CSV 4:** Profile fields 24/38 ✅, Milestone fields 0/18 ❌ (ต้อง Pivot)

**Pivot Logic (Long → Wide):**
```javascript
// แปลง student_progress (Long format) → Wide format columns
const MILESTONE_COLS = {
  'Proposal':             ['PROPOSAL_SUBMIT', 'PROP_DATE'],
  'English':              ['ENGEXAM_STATUS', 'ENGEXAM_DATE'],
  'StudyPlan':            ['STUDYPLAN_SUBMIT', 'STUDYPLAN_DATE'],
  'ComprehensiveWriting': ['COMPREHENSIVE_WRITING_STATUS', 'COMPRE_WRITING_DATE'],
  'ComprehensiveOral':    ['COMPREHENSIVE_ORAL_STATUS', 'COMPRE_ORAL_DATE'],
  'QualifyWriting':       ['QUALIFYEXAM_WRITING_STATUS', 'QUALIFY_WRITING_DATE'],
  'QualifyOral':          ['QUALIFYEXAM_ORAL_STATUS', 'QUALIFY_ORAL_DATE'],
  'Defense':              ['DEFENDEXAM_STATUS', 'DEFEND_DATE'],
  'Manuscript':           ['MANUSCRIPT_STATUS', 'MANUSCRIPT_DATE'],
};

function pivotProgress(studentId, progressRecords) {
  const row = {};
  for (const [milestoneType, [statusCol, dateCol]] of Object.entries(MILESTONE_COLS)) {
    const record = progressRecords.find(p =>
      p.student_id === studentId && p.milestone_type === milestoneType
    );
    row[statusCol] = record?.status || '';
    row[dateCol] = record?.exam_date || '';
  }
  return row;
}

// Export: 1 row per student
students.map(s => ({
  STUDENT_ID: s.student_id,
  SEX: s.gender === 'หญิง' ? 'F' : 'M',
  PRENAME_TH: s.title_th,
  NAME_TH: s.first_name_th,
  // ... (profile fields) ...
  ...pivotProgress(s.student_id, allProgress)
}));
```

---

## CSV 5: สรุปนิสิตจบแยกตามปีเข้า (Graduation Summary Pivot — 39 rows)

**ประเภทข้อมูล:** 📊 **Aggregated Cross-Tab** — ไม่ใช่ข้อมูลดิบ, เป็นตารางสรุป

**โครงสร้าง:**

| แถว = ปีเข้า+ภาค | คอลัมน์ |
|:---|:---|
| 2560 ภาคต้น | รับเข้า, ลาออก, คงเหลือ, [ปี 2560: จบ/คงอยู่], [ปี 2561: จบ/คงอยู่], ... [ปี 2568: จบ/คงอยู่], รวมนิสิตจบ (ตามแผน/ไม่ตามแผน), คงเหลือปัจจุบัน |

**Aggregation Logic:**
```javascript
function buildGradSummary(students) {
  // Group by (admit_year, admit_semester)
  const groups = groupBy(students, s => `${s.admit_year}_${s.admit_semester}`);

  return Object.entries(groups).map(([key, group]) => {
    const [year, sem] = key.split('_');
    const admitted = group.length;
    const resigned = group.filter(s =>
      ['สละสิทธิ์','ลาออก','พ้นสภาพ','ไม่มารายงานตัว'].includes(s.current_status)
    ).length;
    const remaining = admitted - resigned;

    // Dynamic year columns
    const yearCols = {};
    for (let y = 2560; y <= 2568; y++) {
      const gradInYear = group.filter(s => s.graduated_year === y).length;
      const stillIn = group.filter(s =>
        s.current_status === 'กำลังศึกษา' ||
        (s.graduated_year && s.graduated_year > y)
      ).length;
      yearCols[`${y}_จบ`] = gradInYear;
      yearCols[`${y}_คงอยู่`] = stillIn;
    }

    const totalGrad = group.filter(s => s.current_status === 'จบการศึกษา').length;
    const onPlan = group.filter(s =>
      s.current_status === 'จบการศึกษา' && s.on_plan === true
    ).length;

    return {
      ปีเข้า: year,
      ภาค: sem,
      รับเข้า: admitted,
      ลาออก: resigned,
      คงเหลือ: remaining,
      ...yearCols,
      รวมจบตามแผน: onPlan,
      รวมจบไม่ตามแผน: totalGrad - onPlan,
      รวมนิสิตจบ: totalGrad,
      คงเหลือปัจจุบัน: group.filter(s => s.current_status === 'กำลังศึกษา').length,
    };
  });
}
```

---

## CSV 6: สรุปอาจารย์ที่ปรึกษา (Advisor Summary — 188 rows)

**แหล่งข้อมูล:** `graduate_students` GROUP BY `advisor_name`

| # | คอลัมน์ | Type Field | สถานะ |
|:--|:---|:---|:---|
| 1 | อาจารย์ที่ปรึกษา | `advisor_name` | ✅ |
| 2 | ภาควิชาอาจารย์ | `advisor_department` | ✅ |
| 3 | รหัสนิสิต | `student_id` | ✅ |
| 4 | ชื่อ | `full_name_th` | ✅ |
| 5 | ระดับปริญญา | `degree_level` | ✅ |
| 6 | หลักสูตร | `program_type` | ✅ |
| 7 | สาขาวิชา | `major_name` | ✅ |
| 8 | ภาคที่เข้าศึกษา | `admit_semester` | ✅ |
| 9 | ปีที่เข้าศึกษา | `admit_year` | ✅ |
| 10 | ภาคที่ต้องจบ | `expected_grad_semester` | ✅ |
| 11 | ปีที่ต้องจบ | `expected_grad_year` | ✅ |
| 12 | สถานะปัจจุบัน | `current_status` | ✅ |

**สรุป CSV 6:** ✅ **ข้อมูลครบแล้ว** — ต้องเขียน Export logic

**Export Logic:**
```javascript
function exportAdvisorSummary(students) {
  // Group by advisor, sort by advisor name
  const grouped = groupBy(
    students.filter(s => s.advisor_name),
    s => s.advisor_name
  );

  const rows = [];
  Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b, 'th'))
    .forEach(([advisor, students]) => {
      students.forEach(s => {
        rows.push({
          อาจารย์: advisor,
          ภาควิชา: s.advisor_department,
          รหัสนิสิต: s.student_id,
          ชื่อ: s.full_name_th,
          ระดับ: s.degree_level,
          หลักสูตร: s.program_type,
          สาขา: s.major_name,
          ภาคเข้า: s.admit_semester,
          ปีเข้า: s.admit_year,
          ภาคจบ: s.expected_grad_semester,
          ปีจบ: s.expected_grad_year,
          สถานะ: s.current_status,
        });
      });
    });
  return rows;
}
```

---

## สรุปภาพรวม — แผนดำเนินงานทั้ง 6 CSV

| CSV | ข้อมูลครบ? | ต้องเพิ่ม Field? | ต้อง JOIN? | ต้อง Compute? | ความยาก |
|:---|:---|:---|:---|:---|:---|
| 1. การตีพิมพ์ | ⚠️ Type ครบ, I/O ไม่ครบ | Import/Export mapping | ✅ JOIN students | — | ปานกลาง |
| 2. คงอยู่/สำเร็จ | ⚠️ 90% | #21-23 จาก Progress | ✅ JOIN progress | จบตามแผน | ปานกลาง |
| 3. สละสิทธิ์ | ✅ **ครบ** | — | — | — | **ง่าย** |
| 4. รายงานความก้าวหน้า | ❌ 44% | 8 EN fields | ✅ JOIN progress | **Pivot 18 cols** | **ยาก** |
| 5. สรุปนิสิตจบ | ❌ | — | — | **Cross-tab** | **ยาก** |
| 6. สรุปอาจารย์ | ✅ **ครบ** | — | — | Group By | **ง่าย** |

### ลำดับแนะนำ:
1. 🟢 **CSV 3 + 6** (ง่าย — แค่ filter + group, ไม่ต้องเพิ่ม field)
2. 🟡 **CSV 1 + 2** (ปานกลาง — เพิ่ม import mapping + JOIN)
3. 🔴 **CSV 4 + 5** (ยาก — ต้อง Pivot logic + เพิ่ม EN fields + Cross-tab)

---
*Document v.1.03 — Complete Field Gap Analysis*
