"use client";

import DashboardCard from './DashboardCard';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { BarChart, PieChart, Activity, Target } from 'lucide-react'; // Icons

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ChartGallery({ lang }: { lang: 'th' | 'en' }) {
    const isTh = lang === 'th';

    // 1. Bar Chart - Satisfaction
    const barData = {
        labels: isTh ? ['แพทย์', 'พยาบาล', 'เภสัช', 'Back Office', 'นักศึกษา'] : ['Doctors', 'Nurses', 'Pharmacists', 'Back Office', 'Students'],
        datasets: [{
            label: 'Satisfaction Score (1-5)',
            data: [4.5, 4.2, 4.8, 3.9, 4.1],
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderRadius: 8,
        }],
    };

    // 2. Radar Chart - Leadership Competency
    const radarData = {
        labels: ['Visionary', 'Integrity', 'Communication', 'Empathy', 'Decision Making', 'Agility'],
        datasets: [{
            label: 'Current Leadership',
            data: [85, 90, 75, 80, 85, 70],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgb(16, 185, 129)',
            pointBackgroundColor: 'rgb(16, 185, 129)',
        }],
    };

    // 3. Line Chart - Revenue Trend
    const lineData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: 'Target',
                data: [100, 210, 330, 450],
                borderColor: 'rgb(203, 213, 225)',
                borderDash: [5, 5],
                tension: 0.4,
            },
            {
                label: 'Actual Revenue (MB)',
                data: [110, 205, 345, 460],
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4,
            }
        ],
    };

    // 4. Doughnut - Budget Allocation
    const dougnutData = {
        labels: ['Personnel', 'R&D', 'Facilities', 'Operations', 'Marketing'],
        datasets: [{
            data: [45, 20, 15, 15, 5],
            backgroundColor: [
                'rgb(59, 130, 246)',
                'rgb(168, 85, 247)',
                'rgb(16, 185, 129)',
                'rgb(245, 158, 11)',
                'rgb(239, 68, 68)',
            ],
            borderWidth: 0,
        }],
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                {isTh ? 'ตัวอย่างการวิเคราะห์ข้อมูล (Chart Varieties)' : 'Data Analysis Examples'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard
                    title={isTh ? "ความพึงพอใจแยกตามแผนก" : "Satisfaction by Department"}
                    logic={isTh ? "แสดงค่าเฉลี่ยความพึงพอใจของบุคลากรในแต่ละสายงาน เพื่อเปรียบเทียบ Engagement" : "Compare average satisfaction scores across different departments."}
                    source="KPI-7.3-01"
                    icon={BarChart}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100"
                >
                    <Bar options={{ responsive: true, maintainAspectRatio: false }} data={barData} />
                </DashboardCard>

                <DashboardCard
                    title={isTh ? "สมรรถนะผู้นำองค์กร" : "Leadership Competency"}
                    logic={isTh ? "ประเมินสมรรถนะหลัก 6 ด้านของทีมบริหาร เทียบกับเกณฑ์มาตรฐาน" : "Assess 6 core competencies of leadership team vs benchmarks."}
                    source="KPI-1.1-05"
                    icon={Target}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-100"
                >
                    <Radar options={{ responsive: true, maintainAspectRatio: false }} data={radarData} />
                </DashboardCard>

                <DashboardCard
                    title={isTh ? "แนวโน้มรายได้สะสม (MB)" : "Cumulative Revenue Trend"}
                    logic={isTh ? "เปรียบเทียบรายได้จริงกับเป้าหมายรายไตรมาส ดู Growth Rate" : "Compare actual cumulative revenue vs quarterly targets."}
                    source="KPI-7.4-01"
                    icon={Activity}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-100"
                >
                    <Line options={{ responsive: true, maintainAspectRatio: false }} data={lineData} />
                </DashboardCard>

                <DashboardCard
                    title={isTh ? "สัดส่วนงบประมาณรายจ่าย" : "Budget Allocation"}
                    logic={isTh ? "แสดงสัดส่วนการใช้งบประมาณในหมวดต่างๆ เพื่อดู Cost Efficiency" : "Visualize budget distribution across key operational categories."}
                    source="KPI-7.4-03"
                    icon={PieChart}
                    iconColor="text-rose-600"
                    iconBg="bg-rose-100"
                >
                    <Doughnut options={{ responsive: true, maintainAspectRatio: false }} data={dougnutData} />
                </DashboardCard>
            </div>
        </div>
    );
}
