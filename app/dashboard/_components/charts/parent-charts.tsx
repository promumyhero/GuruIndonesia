"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis, BarChart, Bar, ResponsiveContainer, YAxis, Tooltip, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Komponen untuk menampilkan grafik nilai per mata pelajaran
export function SubjectScoreCard({ data, studentName }: { data: any[], studentName: string }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nilai Per Mata Pelajaran</CardTitle>
          <CardDescription>Belum ada data nilai untuk {studentName}</CardDescription>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
          <p className="text-muted-foreground">Belum ada data nilai tersedia</p>
        </CardContent>
      </Card>
    );
  }

  // Menghitung persentase perubahan nilai
  const calculateChange = () => {
    if (data.length < 2) return { value: 0, isUp: true };
    
    const sortedData = [...data].sort((a, b) => a.nilai - b.nilai);
    const lowestScore = sortedData[0].nilai;
    const highestScore = sortedData[sortedData.length - 1].nilai;
    
    const change = ((highestScore - lowestScore) / lowestScore) * 100;
    return {
      value: change.toFixed(1),
      isUp: true
    };
  };

  const change = calculateChange();

  const chartConfig = data.reduce((config, item) => {
    config[item.subject] = {
      label: item.subject,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
    };
    return config;
  }, {} as ChartConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nilai Per Mata Pelajaran</CardTitle>
        <CardDescription>{studentName}</CardDescription>
      </CardHeader>
      <CardContent>
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
              <Bar dataKey="nilai" fill="#8884d8" name="Nilai Rata-rata">
                <LabelList dataKey="nilai" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {change.isUp ? (
            <>Peningkatan {change.value}% dari nilai terendah <TrendingUp className="h-4 w-4" /></>
          ) : (
            <>Penurunan {change.value}% dari nilai tertinggi <TrendingDown className="h-4 w-4" /></>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Menampilkan nilai rata-rata per mata pelajaran
        </div>
      </CardFooter>
    </Card>
  );
}

// Komponen untuk menampilkan grafik perkembangan nilai
export function ProgressScoreCard({ data, studentName }: { data: any[], studentName: string }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perkembangan Nilai</CardTitle>
          <CardDescription>Belum ada data perkembangan untuk {studentName}</CardDescription>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
          <p className="text-muted-foreground">Belum ada data perkembangan tersedia</p>
        </CardContent>
      </Card>
    );
  }

  // Menghitung tren perkembangan
  const calculateTrend = () => {
    if (data.length < 2) return { value: 0, isUp: true };
    
    const firstValue = data[0].nilai;
    const lastValue = data[data.length - 1].nilai;
    
    const change = ((lastValue - firstValue) / firstValue) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isUp: change >= 0
    };
  };

  const trend = calculateTrend();

  const chartConfig = {
    nilai: {
      label: "Nilai",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perkembangan Nilai</CardTitle>
        <CardDescription>{studentName} - {data.length} hari terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
              left: 12,
              right: 12,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="tanggal"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis domain={[0, 100]} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="nilai"
              type="natural"
              stroke="var(--color-nilai)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-nilai)",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                dataKey="nilai"
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trend.isUp ? (
            <>Trending up by {trend.value}% <TrendingUp className="h-4 w-4" /></>
          ) : (
            <>Trending down by {trend.value}% <TrendingDown className="h-4 w-4" /></>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Menampilkan perkembangan nilai harian
        </div>
      </CardFooter>
    </Card>
  );
}
