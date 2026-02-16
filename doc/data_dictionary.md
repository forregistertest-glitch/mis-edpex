# KUVMIS Data Dictionary & Schema Mapping

| Field | Value |
|:------|:------|
| **Doc ID** | KUVMIS-DOC-004 |
| **Version** | 1.5.1 |
| **Last Updated** | 2026-02-16T16:55:00+07:00 |
| **Author** | KUVMIS Development Team |
| **Status** | Released |

---
## 1. Firestore Collections
- **kpi_master_data**: Defines the structure and metadata for each Key Performance Indicator (KPI).
- **performance_data**: Stores the actual performance values, linked by `kpi_id`, `year`, `period`, and `dimension`.
- **authorized_users**: รายชื่อ Email ที่อนุญาตเข้าระบบ พร้อม role (user/reviewer/admin).
- **login_logs**: บันทึกการเข้าใช้งาน (email, timestamp, IP, user agent, geo location, success, reason).
- **personnel**: ข้อมูลบุคลากร (HR)
- **students**: ข้อมูลนิสิต (Reg)

## 2. KPI JSON Blueprint
```json
{
  "kpi_id": "7.1.1",
  "name_th": "ร้อยละของผู้สำเร็จการศึกษา...",
  "name_en": "Percentage of graduates...",
  "category": "Academic",
  "unit": "Percent",
  "target_value": 80,
  "description": "Measures the passing rate..."
}
```

## 3. Performance Data Pattern
```json
{
  "kpi_id": "7.1.1",
  "year": 2567,
  "period": "Q1",
  "dimension": "Department",
  "dimension_value": "Medicine",
  "value": 85.5,
  "timestamp": "2024-03-01T10:00:00Z",
  "submitted_by": "user_id"
}
```

## 4. Input Form Fields
| Field Name | Type | Key in DB | Desc |
|:---|:---|:---|:---|
| KPI Selection | Dropdown | `kpi_id` | Selects the metric to update |
| Year | Number | `year` | Buddhist Era (e.g., 2568) |
| Period | Dropdown | `period` | Q1-Q4, S1-S2, or All |
| Dimension | Dropdown | `dimension_value` | Context (Dept, Hospital, Strategy) |
| Value | Number | `value` | The actual performance metric |
| Text Fields (Extra) | Text | `extra_data` | Optional descriptive fields |
| Submitted By | Email | `submitted_by` | User ID / Email |

## 5. Data Services (`@/lib/data-service`)
- `getKpiTrendData(kpiIds, filters)`: Fetches historical data points for line/bar charts.
- `getKpiMatrixData(kpiIds, year, dimension)`: Aggregates data by dimension for radar/pie charts.
- `getAvailableFilters(categoryId)`: dynamic generation of dropdown options based on existing data.

## 6. Dashboard Chart ↔ Data-Service Mapping — v1.4
| Dashboard | Chart | KPI ID(s) | Data Function | Data Pattern |
|:----------|:------|:----------|:--------------|:-------------|
| **Academic** | Licensure & OSCE | 7.1.1, 7.1.2 | `getKpiTrendData` | year_series |
| **Academic** | Research Funding | 7.1.16, 7.1.17, 7.1.18, 7.1.19 | `getKpiTrendData` | year_series |
| **Academic** | Retention Rate | 7.1.14 | `getKpiTrendData` | year_series |
| **Academic** | Network Schools | 7.1.13 | `getKpiTrendData` | year_series |
| **Academic** | Safety Incidents | 7.1.11 | `getKpiTrendData` | year_series |
| **Hospital** | 3-Area Satisfaction | 7.2.6, 7.2.9, 7.2.10 | `getKpiTrendData` | year_series |
| **Hospital** | Projects & Grants | 7.2.1, 7.2.2 | `getKpiTrendData` | year_series |
| **Hospital** | Applicants | 7.2.5 | `getKpiMatrixData` | dimension_snapshot |
| **Hospital** | Donations | 7.2.8 | `getKpiTrendData` | year_series |
| **Hospital** | Graduates | 7.2.4 | `getKpiMatrixData` | dimension_snapshot |
| **Staff** | Sick Leave | 7.3.4 | `getKpiTrendData` | year_series |
| **Staff** | Safety | 7.3.5 | `getKpiTrendData` | year_series |
| **Staff** | Benefits | 7.3.7 | `getKpiTrendData` | year_series |
| **Staff** | Engagement | 7.3.10 | `getKpiMatrixData` | dimension_snapshot |
| **Staff** | Turnover | 7.3.11 | `getKpiMatrixData` | dimension_snapshot |
| **Staff** | Talent | 7.3.12 | `getKpiMatrixData` | dimension_snapshot |
| **Strategic** | SO Progress | 7.4.4 | `getKpiMatrixData` | dimension_snapshot |
| **Strategic** | New Revenue | 7.4.7 | `getKpiMatrixData` | dimension_snapshot |
| **Strategic** | Governance | 7.4.11 | `getKpiMatrixData` | dimension_snapshot |
| **Strategic** | Animal Welfare | 7.4.14, 7.4.15 | `getKpiTrendData` | year_series |
| **Strategic** | Lab Standards | 7.4.12 | `getKpiTrendData` | year_series |

## 7. Enums & Value Lists (New)
### 7.1 Personnel
- **Type**: ข้าราชการ, พนักงานมหาวิทยาลัย, พนักงานเงินรายได้, ลูกจ้างประจำ, ลูกจ้างชั่วคราว
- **Position**: อาจารย์, ผู้ช่วยศาสตราจารย์, รองศาสตราจารย์, ศาสตราจารย์, เจ้าหน้าที่บริหารงานทั่วไป, นักวิชาการศึกษา, ฯลฯ
- **DegreeLevel**: ปริญญาตรี, ปริญญาโท, ปริญญาเอก

### 7.2 Student
- **Status**: กำลังศึกษา, สำเร็จการศึกษา, พ้นสภาพ, ลาพักการศึกษา
- **DegreeLevel**: ปริญญาตรี, ปริญญาโท, ปริญญาเอก, ประกาศนียบัตรบัณฑิต
