# KUVMIS Feature List
# คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเกษตรศาสตร์

| Field | Value |
|:------|:------|
| **Doc ID** | KUVMIS-DOC-003 |
| **Version** | 1.4.0 |
| **Last Updated** | 2026-02-12T09:00:00+07:00 |
| **Author** | KUVMIS Development Team |
| **Status** | Released |

---

## 1. Dashboard System

- [x] **Dashboard Cards**: Generic component with Chart + Tooltip (Logic/Source).
- [x] **Charts**: Bar / Line / Radar / KPI Cards.
- [x] **Filters**: Years / Quarters / Org Units.
- [x] **Entry History**: Dynamic Columns + Status Badges.em

### 1.1 Executive Dashboard (Main)
**Structure:**
- **KPI Pulse Cards (6 Cards):** Real-time key metrics with status indicators (Met / Below Target).
- **Quick-View Category Cards (4 Cards):** Summaries for Academic, Hospital, Staff, and Strategic areas.

### 1.2 Academic Dashboard (Category: 7.1)
**Data Source:** `getKpiTrendData`, `getAvailableFilters`, `getCategoryOverview`
**Charts & Logic:**
1.  **Licensure & OSCE Trend**
    *   **KPIs:** 7.1.1 (Licensure Pass %), 7.1.2 (OSCE Pass %)
    *   **Logic:** Multi-line chart comparing exam pass rates over years.
    *   **Filter:** Year, Dimension (Department).
2.  **Research Funding**
    *   **KPIs:** 7.1.16 (Int. Count), 7.1.17 (Int. Fund), 7.1.18 (Ext. Count), 7.1.19 (Ext. Fund)
    *   **Logic:** Grouped bar chart comparing internal vs. external funding (count & amount).
3.  **Student Retention Rate**
    *   **KPIs:** 7.1.14
    *   **Logic:** Line chart showing retention trends for 2nd-year students onwards.
4.  **Network Schools (Supply Chain)**
    *   **KPIs:** 7.1.13
    *   **Logic:** Bar chart showing the number of network high schools over time.
5.  **Safety Incidents**
    *   **KPIs:** 7.1.11
    *   **Logic:** Bar chart tracking safety incidents in academic settings.

### 1.3 Hospital Dashboard (Category: 7.2)
**Data Source:** `getKpiTrendData`, `getKpiMatrixData`
**Charts & Logic:**
1.  **3-Area Satisfaction**
    *   **KPIs:** 7.2.6 (Student), 7.2.9 (Seminar), 7.2.10 (Overall Service)
    *   **Logic:** Radar or Bar chart comparing satisfaction scores across three key dimensions.
2.  **Major Projects & Grants**
    *   **KPIs:** 7.2.1 (Projects), 7.2.2 (National Grants)
    *   **Logic:** Bar chart comparing the count of major projects and national grants.
3.  **Applicants by Program**
    *   **KPIs:** 7.2.5
    *   **Logic:** Horizontal bar chart breaking down applicants by curriculum/program.
4.  **Animal Charity Donations**
    *   **KPIs:** 7.2.8
    *   **Logic:** Line chart tracking donation amounts (THB) for animal welfare.
5.  **Graduates by Level**
    *   **KPIs:** 7.2.4
    *   **Logic:** Bar chart showing the number of graduates separated by degree level.

### 1.4 Staff/HR Dashboard (Category: 7.3)
**Data Source:** `getKpiTrendData`, `getKpiMatrixData`
**Charts & Logic:**
1.  **Sick Leave & Incidents**
    *   **KPIs:** 7.3.4 (Sick Leave), 7.3.5 (Workplace Incidents)
    *   **Logic:** Dual-axis or grouped chart monitoring health and safety metrics.
2.  **Welfare & Benefits**
    *   **KPIs:** 7.3.7
    *   **Logic:** Bar chart tracking satisfaction or utilization of welfare benefits.
3.  **Employee Engagement**
    *   **KPIs:** 7.3.10
    *   **Logic:** Radar chart visualizing engagement scores across different dimensions (e.g., "ด้าน").
4.  **Turnover by Tenure**
    *   **KPIs:** 7.3.11
    *   **Logic:** Stacked bar or matrix chart analyzing turnover rates by years of service ("ช่วงอายุงาน").
5.  **Talent Readiness**
    *   **KPIs:** 7.3.12
    *   **Logic:** Gauge or Bar chart showing the percentage of staff ready for succession/promotion.

### 1.5 Strategic Dashboard (Category: 7.4)
**Data Source:** `getKpiMatrixData`, `getKpiTrendData`
**Charts & Logic:**
1.  **Strategic Objectives Progress**
    *   **KPIs:** 7.4.4
    *   **Logic:** Horizontal bar chart showing % completion of strategic objectives ("ยุทธศาสตร์").
2.  **New Revenue Sources**
    *   **KPIs:** 7.4.7
    *   **Logic:** Bar chart tracking revenue generated from new initiatives.
3.  **Governance & Ethics**
    *   **KPIs:** 7.4.11
    *   **Logic:** Radar chart evaluating governance scores across various issues ("ประเด็น").
4.  **Animal Welfare (Disease & Sterilization)**
    *   **KPIs:** 7.4.14 (Events), 7.4.15 (Animals)
    *   **Logic:** Mixed chart tracking disease control events and number of sterilized animals.
5.  **Accredited Lab Facilities**
    *   **KPIs:** 7.4.12
    *   **Logic:** Trend chart showing the number of laboratories achieving standard accreditation.

### 1.6 Annual Report Dashboard
- **Performance Optimized:** Bulk data fetching strategy for high-speed loading.
- **Year Selector:** View data from previous years (default: Current Year).
- **Consolidated View:** Summary table of all 61 KPIs with status and trends.

### 1.7 Admin Panel (Enhanced)
- **User Management:** Edit role/delete users.
- **Login Logs:**
    - Real-time monitoring.
    - **CSV Export:** Download full logs for specific months [Super Admin Only].
    - **Mock Data Tools:** Generate/Clear test data [Super Admin Only].

## 2. Shared Components
- **ChartFilterBar:** Unified control for Year, Quarter (Period), Dimension, and View Mode (Chart/Table).
- **Data Explorer:** Drill-down table view for granular data analysis.

## 3. Reference
- **KPI Master Data:** See `kpi_master_data.md` for full definition of each KPI ID.
