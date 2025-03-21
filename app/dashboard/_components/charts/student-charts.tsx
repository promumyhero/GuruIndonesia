"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

// Fungsi untuk mendapatkan warna chart berdasarkan nama subject dan indeks
const getChartColor = (index: number) => {
  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))"
  ];
  
  return chartColors[index % chartColors.length];
};

interface SubjectChartProps {
  data: {
    subject: string;
    nilai: number;
  }[];
}

export function SubjectBarChart({ data }: SubjectChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 70,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="subject" 
            angle={-45} 
            textAnchor="end"
            height={70}
            tick={{fontSize: 12}}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="nilai" fill={getChartColor(0)} name="Nilai Rata-rata" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface DailyProgressProps {
  data: {
    tanggal: string;
    nilai: number;
  }[];
}

export function DailyProgressChart({ data }: DailyProgressProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tanggal" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="nilai" 
            stroke={getChartColor(1)} 
            name="Nilai Harian" 
            strokeWidth={2}
            dot={{ r: 4, fill: getChartColor(1) }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
