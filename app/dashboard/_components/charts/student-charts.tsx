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
          <Bar dataKey="nilai" fill="#8884d8" name="Nilai Rata-rata" />
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
            stroke="#82ca9d" 
            name="Nilai Rata-rata"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
