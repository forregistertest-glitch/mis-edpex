"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AcademicTrendChart() {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
    scales: {
        y: { beginAtZero: true, max: 100 }
    }
  };

  const labels = ['2564', '2565', '2566', '2567', '2568 (Proj)'];
  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Licensure Exam (%)',
        data: [56.6, 62.4, 75.2, 81.7, 85.0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'OSCE First-Pass (%)',
        data: [0, 4.2, 5.3, 14.0, 25.0],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return <Line options={options} data={data} />;
}
