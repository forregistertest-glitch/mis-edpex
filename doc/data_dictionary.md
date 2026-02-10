# KUVMIS Data Dictionary & Schema Mapping

## 1. Firestore Collections (Production)

| Collection | EdPEx | Records | Key Fields |
|-----------|-------|---------|------------|
| `academic_results` | 7.1 | ~300+ | kpi_id, year, source_sheet, raw_data, ingested_at |
| `customer_feedback` | 7.2 | ~50+ | kpi_id, year, branch_id, satisfaction_score |
| `workforce_stats` | 7.3 | ~100+ | kpi_id, year, staff_count, incident_level |
| `strategic_kpis` | 7.4 | ~80+ | objective_id, success_percentage, standard_status |

## 2. JSON Blueprint Collections (db_design/)

| File | Records | Schema |
|------|:---:|--------|
| `edpex_categories.json` | 4 | id, name_th, name_en, icon, description |
| `departments.json` | 6 | dept_id, name_th, name_en, kpi_ids[] |
| `staff_users.json` | 6 | user_id, name, department_id, role, email |
| `kpi_master.json` | 61 | kpi_id, category_id, name_th/en, unit, data_pattern, target, frequency, department_id |
| `kpi_data_academic.json` | 92 | id, kpi_id, fiscal_year, dimension, dimension_value, value, target |
| `kpi_data_workforce.json` | 33 | (same as above) |
| `kpi_data_strategic.json` | 60 | (same as above) |
| `kpi_data_narratives.json` | 12 | id, kpi_id, fiscal_year, sequence, title, description, status |
| `input_forms.json` | 7 | form_id, name_th/en, department_id, kpi_ids[], fields[] |
| `input_logs.json` | 6 | log_id, form_id, kpi_id, action, status, data_snapshot |

## 3. Key Dimensions

| Dimension Type | ตัวอย่าง | ใช้ใน |
|---------------|---------|------|
| **fiscal_year** | 2564, 2565, 2566, 2567, 2568 | ทุก collection |
| **kpi_id** | 7.1.1, 7.3.5, 7.4.13 | ทุก collection |
| **department_id** | dept_academic, dept_hr, dept_hospital | departments, staff, forms |
| **dimension** | สาขา, ระดับ, ประเภท, ด้าน | kpi_data (Matrix type) |
| **status** | approved, pending_review, rejected | input_logs |

## 4. Data Patterns

| Pattern | KPI Count | ตัวอย่าง | Fields |
|---------|:---------:|---------|--------|
| year_series | 28 | 7.1.1 สอบผ่านวิชาชีพ | fiscal_year, value, target |
| multi_column_matrix | 12 | 7.1.5 บัณฑิตแยกสาขา | fiscal_year, dimension, dimension_value, value |
| narrative_list | 10 | 7.1.4 หลักสูตร | title, description, status |
| survey_score | 6 | 7.3.10 ผูกพันองค์กร | dimension, value, target |
| milestone_phase | 5 | 7.4.13 วัคซีน | title, phase, status |

## 5. Input Form Fields Summary

| Form | Fields | Required | Types Used |
|------|:------:|:--------:|-----------|
| academic_yearly | 10 | 9 | select, number, text |
| grad_matrix | 5 | 4 | select, number, text |
| research_funding | 6 | 5 | select, number, textarea |
| hospital_stats | 5 | 4 | select, number |
| hr_workforce | 7 | 7 | select, number |
| strategic_governance | 6 | 4 | select, number |
| narrative_entry | 8 | 4 | select, text, textarea, file |
