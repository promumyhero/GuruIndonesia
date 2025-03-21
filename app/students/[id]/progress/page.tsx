"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getAssessmentTypeLabel } from "@/lib/utils";
import { use } from "react";

interface ProgressPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Konfigurasi warna untuk chart - mapel default
const subjectColors: Record<string, { color: string; label: string }> = {
  Matematika: { color: "hsl(var(--chart-1))", label: "Matematika" },
  "Bahasa Indonesia": { color: "hsl(var(--chart-2))", label: "B. Indonesia" },
  IPA: { color: "hsl(var(--chart-3))", label: "IPA" },
  IPS: { color: "hsl(var(--chart-4))", label: "IPS" },
  "Bahasa Inggris": { color: "hsl(var(--chart-5))", label: "B. Inggris" },
  "Pendidikan Agama": { color: "hsl(var(--primary))", label: "Agama" },
  PPKN: { color: "hsl(var(--secondary))", label: "PPKN" },
  "Seni Budaya": { color: "hsl(var(--accent))", label: "Seni Budaya" },
  PJOK: { color: "hsl(var(--muted))", label: "PJOK" },
};

// Fungsi untuk mendapatkan warna berdasarkan nama mapel
const getSubjectColor = (subjectName: string) => {
  // Jika mapel sudah ada di daftar default, gunakan warna yang sudah ditentukan
  if (subjectColors[subjectName]) {
    return subjectColors[subjectName];
  }

  // Jika mapel tidak ada di daftar default, buat warna baru berdasarkan indeks
  // Gunakan chart-1 sampai chart-5 secara berulang
  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  // Buat hash sederhana dari nama mapel untuk mendapatkan indeks yang konsisten
  const hash = subjectName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % chartColors.length;

  return {
    color: chartColors[colorIndex],
    label:
      subjectName.length > 10
        ? subjectName.substring(0, 10) + "..."
        : subjectName,
  };
};

// Fungsi untuk memastikan warna CSS variabel dirender dengan benar
const ensureColorVisible = (color: string | undefined): string => {
  // Jika tidak ada warna, gunakan warna default
  if (!color) {
    return "hsl(var(--primary))";
  }

  // Jika warna menggunakan variabel CSS, kembalikan apa adanya
  if (color.includes("var(--")) {
    return color;
  }
  return color;
};

export default function StudentProgressPage({ params }: ProgressPageProps) {
  // Menggunakan React.use untuk unwrap Promise params di client component
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("12m");
  const [activeTab, setActiveTab] = useState("all");
  const [chartData, setChartData] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<Record<string, any[]>>({});

  // Konfigurasi chart berdasarkan mata pelajaran yang ada
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});

  useEffect(() => {
    const fetchStudentProgress = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/students/${id}/progress`);

        if (!response.ok) {
          throw new Error("Gagal mengambil data perkembangan");
        }

        const data = await response.json();

        setStudent(data.student);
        setSubjectGroups(data.subjectGroups);
        setChartData(data.chartData);

        // Buat konfigurasi chart berdasarkan mata pelajaran yang ada
        const config: ChartConfig = {};
        Object.keys(data.subjectGroups).forEach((subject, index) => {
          const subjectColor = getSubjectColor(subject);
          config[subject] = {
            label: subject,
            color: ensureColorVisible(subjectColor.color),
          };
        });
        setChartConfig(config);
      } catch (err) {
        console.error("Error fetching student progress:", err);
        setError("Terjadi kesalahan saat mengambil data perkembangan");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentProgress();
    }
  }, [id]);

  // Filter data berdasarkan rentang waktu
  const getFilteredData = () => {
    if (!chartData.length) return [];

    const now = new Date();
    let monthsToShow = 12;

    switch (timeRange) {
      case "3m":
        monthsToShow = 3;
        break;
      case "6m":
        monthsToShow = 6;
        break;
      case "1y":
        monthsToShow = 12;
        break;
      case "all":
      default:
        return chartData;
    }

    const cutoffDate = new Date(now);
    cutoffDate.setMonth(now.getMonth() - monthsToShow);

    return chartData.filter((item) => new Date(item.date) >= cutoffDate);
  };

  // Filter data berdasarkan tab aktif (mata pelajaran)
  const getFilteredSubjects = () => {
    if (activeTab === "all") return subjectGroups;

    return Object.fromEntries(
      Object.entries(subjectGroups).filter(([subject]) => subject === activeTab)
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-28" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>

        <div className="mt-8">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/students">Kembali ke Daftar Siswa</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Breadcrumb
          items={[
            { label: "Siswa", href: "/students" },
            { label: student?.name || "Loading...", href: `/students/${id}` },
            { label: "Perkembangan Nilai", href: `/students/${id}/progress` },
          ]}
        />
        <Link
          href={`/students/${id}`}
          className="text-sm text-primary hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
          Kembali ke Profil Siswa
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                  <CardTitle>Grafik Perkembangan Nilai</CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeTab === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("all")}
                    className="h-8"
                  >
                    Semua
                  </Button>
                  {Object.keys(chartConfig).map((subject) => (
                    <Button
                      key={subject}
                      variant={activeTab === subject ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab(subject)}
                      className="h-8"
                    >
                      {getSubjectColor(subject).label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[350px] w-full">
                {chartData.length > 0 ? (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart
                        data={getFilteredData()}
                        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                      >
                        <defs>
                          {Object.entries(chartConfig).map(([key, config]) => {
                            // Ekstrak nilai warna CSS jika menggunakan variabel CSS
                            const colorValue =
                              config.color && config.color.includes("var(--")
                                ? `var(${
                                    config.color.match(/var\((.*?)\)/)?.[1]
                                  }, #3b82f6)`
                                : config.color || "hsl(var(--primary))";

                            return (
                              <linearGradient
                                key={key}
                                id={`gradient-${key}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor={ensureColorVisible(colorValue)}
                                  stopOpacity={0.6}
                                />
                                <stop
                                  offset="100%"
                                  stopColor={ensureColorVisible(colorValue)}
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            );
                          })}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium">
                                        {payload[0]?.payload.month}
                                      </span>
                                    </div>
                                    {payload.map((entry) => (
                                      <div
                                        key={entry.dataKey as string}
                                        className="flex flex-col"
                                      >
                                        <span className="flex items-center gap-1 text-xs">
                                          <span
                                            className="h-2 w-2 rounded-full"
                                            style={{
                                              backgroundColor: ensureColorVisible(
                                                entry.color
                                              ),
                                              border: "1px solid rgba(0,0,0,0.1)",
                                              display: "inline-block",
                                            }}
                                          />
                                          {entry.dataKey as string}
                                        </span>
                                        <span className="font-medium">
                                          {Math.round(entry.value as number)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {Object.entries(chartConfig).map(([key, config]) =>
                          activeTab === "all" || activeTab === key ? (
                            <Area
                              key={key}
                              type="monotone"
                              dataKey={key}
                              stroke={ensureColorVisible(config.color)}
                              fill={`url(#gradient-${key})`}
                              strokeWidth={2}
                              activeDot={{
                                r: 6,
                                strokeWidth: 0,
                                fill: ensureColorVisible(config.color),
                                stroke: "white",
                              }}
                            />
                          ) : null
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex flex-wrap gap-4">
                      {Object.entries(chartConfig).map(([key, config]) =>
                        activeTab === "all" || activeTab === key ? (
                          <div key={key} className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: ensureColorVisible(config.color),
                                border: "1px solid rgba(0,0,0,0.1)",
                              }}
                            />
                            <span className="text-sm font-medium">
                              {getSubjectColor(key).label}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </ChartContainer>
                ) : (
                  <div className="flex h-[350px] items-center justify-center">
                    <p className="text-muted-foreground">Belum ada data penilaian</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Detail Penilaian</CardTitle>
              <CardDescription>
                Daftar penilaian yang telah dilakukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(getFilteredSubjects()).length > 0 ? (
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Mata Pelajaran
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Nilai
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Tipe
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Semester
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Tahun Akademik
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Tanggal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(getFilteredSubjects()).map(
                          ([subject, assessments]) =>
                            assessments.map((assessment, index) => (
                              <tr
                                key={assessment.id}
                                className={index % 2 === 0 ? "bg-muted/20" : ""}
                              >
                                <td className="p-4 align-middle">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-2 w-2 rounded-full"
                                      style={{
                                        backgroundColor: ensureColorVisible(
                                          getSubjectColor(subject).color
                                        ),
                                        border: "1px solid rgba(0,0,0,0.1)",
                                        display: "inline-block",
                                      }}
                                    />
                                    <span>{getSubjectColor(subject).label}</span>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {assessment.value}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  {getAssessmentTypeLabel(assessment.type)}
                                </td>
                                <td className="p-4 align-middle">
                                  {assessment.semester}
                                </td>
                                <td className="p-4 align-middle">
                                  {assessment.academicYear}
                                </td>
                                <td className="p-4 align-middle">
                                  {new Date(
                                    assessment.createdAt
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center">
                  <p className="text-muted-foreground">
                    Belum ada data penilaian
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
