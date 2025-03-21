"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  LabelList,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProgressPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Fungsi untuk mendapatkan warna berdasarkan nama mata pelajaran
const getSubjectColor = (subjectName: string) => {
  const subjectColors: Record<string, { color: string; label: string }> = {
    Matematika: { color: "#4C51BF", label: "Matematika" },
    "Bahasa Indonesia": { color: "#ED64A6", label: "B. Indonesia" },
    "Bahasa Inggris": { color: "#48BB78", label: "B. Inggris" },
    IPA: { color: "#ECC94B", label: "IPA" },
    IPS: { color: "#F56565", label: "IPS" },
  };

  return (
    subjectColors[subjectName] || {
      color: `hsl(${Math.floor(Math.random() * 360)} 70% 50%)`,
      label: subjectName,
    }
  );
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

  // Fungsi untuk menghitung nilai rata-rata per bulan
  interface GroupedData {
    date: string;
    month: string;
    values: number[];
    count: number;
  }

  interface AverageData {
    date: string;
    month: string;
    values: number[];
    count: number;
    nilai: number;
    trend: string;
    [key: string]: any; 
  }

  const calculateAveragePerMonth = (data: any[]): AverageData[] => {
    if (!data || data.length === 0) return [];

    // Kelompokkan berdasarkan bulan
    const groupedByMonth = data.reduce<Record<string, GroupedData>>(
      (acc, item) => {
        const date = new Date(item.assessmentDate);
        const monthYear = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!acc[monthYear]) {
          acc[monthYear] = {
            date: `${monthYear}-15`,
            month: new Date(
              date.getFullYear(),
              date.getMonth(),
              1
            ).toLocaleString("id-ID", { month: "short" }),
            values: [],
            count: 0,
          };
        }

        acc[monthYear].values.push(item.value);
        acc[monthYear].count++;

        return acc;
      },
      {}
    );

    // Hitung rata-rata per bulan
    const result = Object.values(groupedByMonth).map<AverageData>(
      (item, index, array) => {
        const average =
          item.values.reduce((sum: number, val: number) => sum + val, 0) /
          item.values.length;

        // Hitung trend jika ada data sebelumnya
        let trend = 0;
        if (index > 0) {
          const prevAverage =
            array[index - 1].values.reduce(
              (sum: number, val: number) => sum + val,
              0
            ) / array[index - 1].values.length;
          trend = average - prevAverage;
        }

        return {
          ...item,
          nilai: Math.round(average),
          trend:
            trend !== 0
              ? `${trend > 0 ? "+" : ""}${trend.toFixed(1)}`
              : "Tetap",
        };
      }
    );

    return result.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Fungsi untuk mendapatkan data yang difilter berdasarkan tab aktif
  const getFilteredData = (): AverageData[] => {
    if (activeTab === "all") {
      return calculateAveragePerMonth(Object.values(subjectGroups).flat());
    }

    return calculateAveragePerMonth(subjectGroups[activeTab] || []);
  };

  // Fungsi untuk memformat data chart
  const getChartData = () => {
    const data = getFilteredData();
    
    // Jika tab aktif adalah "all", tambahkan properti untuk setiap mata pelajaran
    if (activeTab === "all") {
      // Buat salinan data dengan properti nilai-{subject} untuk setiap mata pelajaran
      return data.map(item => {
        const newItem: AverageData = { ...item };
        Object.keys(chartConfig).forEach(subject => {
          newItem[`nilai-${subject}`] = item.nilai;
        });
        return newItem;
      });
    }
    
    // Jika tab spesifik, gunakan data asli
    return data;
  };

  // Filter data berdasarkan tab aktif (mata pelajaran)
  const getFilteredSubjects = () => {
    if (activeTab === "all") return subjectGroups;

    return Object.fromEntries(
      Object.entries(subjectGroups).filter(([subject]) => subject === activeTab)
    );
  };

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kembali ke Profil Siswa
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
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
                {getFilteredData().length > 0 ? (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart
                        data={getChartData()}
                        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                        <ChartTooltip
                          cursor={false}
                          content={(props) => {
                            if (
                              props.active &&
                              props.payload &&
                              props.payload.length
                            ) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium">
                                        {props.payload[0]?.payload.month}
                                      </span>
                                    </div>
                                    {props.payload.map((entry) => (
                                      <div
                                        key={entry.dataKey as string}
                                        className="flex flex-col"
                                      >
                                        <span className="flex items-center gap-1 text-xs">
                                          <span
                                            className="h-2 w-2 rounded-full"
                                            style={{
                                              backgroundColor: entry.color,
                                              border:
                                                "1px solid rgba(0,0,0,0.1)",
                                              display: "inline-block",
                                            }}
                                          />
                                          {entry.name}
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
                            <Line
                              key={key}
                              type="monotone"
                              dataKey={activeTab === "all" ? `nilai-${key}` : "nilai"}
                              name={key}
                              stroke={ensureColorVisible(config.color)}
                              strokeWidth={2}
                              dot={{
                                r: 4,
                                strokeWidth: 1,
                                fill: "white",
                                stroke: ensureColorVisible(config.color),
                              }}
                              activeDot={{
                                r: 6,
                                strokeWidth: 2,
                                fill: "white",
                                stroke: ensureColorVisible(config.color),
                              }}
                            >
                              <LabelList
                                dataKey={activeTab === "all" ? `nilai-${key}` : "nilai"}
                                position="top"
                                formatter={(value: number | string) =>
                                  Math.round(value as number)
                                }
                                className="fill-foreground"
                                fontSize={12}
                                offset={8}
                              />
                            </Line>
                          ) : null
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex flex-wrap gap-4">
                      {Object.entries(chartConfig).map(([key, config]) =>
                        activeTab === "all" || activeTab === key ? (
                          <div key={key} className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: ensureColorVisible(
                                  config.color
                                ),
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
                    <CardFooter className="flex-col items-start gap-2 text-sm mt-4 border-t pt-4">
                      {getChartData().length > 1 ? (
                        <>
                          <div className="flex gap-2 font-medium leading-none items-center">
                            {(() => {
                              const lastData = getChartData()[getChartData().length - 1];
                              const prevData = getChartData()[getChartData().length - 2];
                              const diff = lastData.nilai - prevData.nilai;

                              if (diff > 0) {
                                return (
                                  <>
                                    <span>
                                      Nilai meningkat {diff.toFixed(1)} poin
                                    </span>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                  </>
                                );
                              } else if (diff < 0) {
                                return (
                                  <>
                                    <span>
                                      Nilai menurun {Math.abs(diff).toFixed(1)}{" "}
                                      poin
                                    </span>
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                  </>
                                );
                              } else {
                                return (
                                  <>
                                    <span>Nilai tetap</span>
                                    <Minus className="h-4 w-4 text-muted-foreground" />
                                  </>
                                );
                              }
                            })()}
                          </div>
                          <div className="leading-none text-muted-foreground">
                            Perbandingan nilai{" "}
                            {
                              getChartData()[getChartData().length - 2]
                                .month
                            }{" "}
                            dengan{" "}
                            {
                              getChartData()[getChartData().length - 1]
                                .month
                            }
                          </div>
                        </>
                      ) : getChartData().length === 1 ? (
                        <>
                          <div className="flex gap-2 font-medium leading-none">
                            Nilai rata-rata: {getChartData()[0].nilai}
                          </div>
                          <div className="leading-none text-muted-foreground">
                            Data penilaian bulan {getChartData()[0].month}
                          </div>
                        </>
                      ) : (
                        <div className="leading-none text-muted-foreground">
                          Belum ada data penilaian yang cukup untuk menampilkan
                          trend
                        </div>
                      )}
                    </CardFooter>
                  </ChartContainer>
                ) : (
                  <div className="flex h-[350px] items-center justify-center">
                    <p className="text-muted-foreground">
                      Belum ada data penilaian
                    </p>
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
                                    <span>
                                      {getSubjectColor(subject).label}
                                    </span>
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
                                    assessment.assessmentDate
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
