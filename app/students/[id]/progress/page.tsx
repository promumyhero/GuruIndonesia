"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Breadcrumb } from "@/components/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getAssessmentTypeLabel } from "@/lib/utils"
import { use } from "react"

interface ProgressPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Konfigurasi warna untuk chart
const subjectColors: Record<string, { color: string; label: string }> = {
  "Matematika": { color: "#0ea5e9", label: "Matematika" },
  "Bahasa Indonesia": { color: "#f59e0b", label: "B. Indonesia" },
  "IPA": { color: "#10b981", label: "IPA" },
  "IPS": { color: "#8b5cf6", label: "IPS" },
  "Bahasa Inggris": { color: "#ec4899", label: "B. Inggris" },
  "Pendidikan Agama": { color: "#6366f1", label: "Agama" },
  "PJOK": { color: "#ef4444", label: "PJOK" },
  "Seni Budaya": { color: "#14b8a6", label: "Seni Budaya" },
  "Prakarya": { color: "#f97316", label: "Prakarya" },
  "PKN": { color: "#84cc16", label: "PKN" },
}

export default function StudentProgressPage({ params }: ProgressPageProps) {
  // Menggunakan React.use untuk unwrap Promise params di client component
  const { id } = use(params)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [student, setStudent] = useState<any>(null)
  const [timeRange, setTimeRange] = useState("12m")
  const [activeTab, setActiveTab] = useState("all")
  const [chartData, setChartData] = useState<any[]>([])
  const [subjectGroups, setSubjectGroups] = useState<Record<string, any[]>>({})
  
  // Konfigurasi chart berdasarkan mata pelajaran yang ada
  const [chartConfig, setChartConfig] = useState<ChartConfig>({})
  
  useEffect(() => {
    const fetchStudentProgress = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/students/${id}/progress`)
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data perkembangan')
        }
        
        const data = await response.json()
        
        setStudent(data.student)
        setSubjectGroups(data.subjectGroups)
        setChartData(data.chartData)
        
        // Buat konfigurasi chart berdasarkan mata pelajaran yang ada
        const config: ChartConfig = {}
        Object.keys(data.subjectGroups).forEach(subject => {
          config[subject] = {
            label: subject,
            color: subjectColors[subject]?.color || "#888888",
          }
        })
        setChartConfig(config)
        
      } catch (err) {
        console.error('Error fetching student progress:', err)
        setError('Terjadi kesalahan saat mengambil data perkembangan')
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchStudentProgress()
    }
  }, [id])
  
  // Filter data berdasarkan rentang waktu
  const getFilteredData = () => {
    if (!chartData.length) return []
    
    const now = new Date()
    let monthsToShow = 12
    
    switch (timeRange) {
      case "3m":
        monthsToShow = 3
        break
      case "6m":
        monthsToShow = 6
        break
      case "1y":
        monthsToShow = 12
        break
      case "all":
      default:
        return chartData
    }
    
    const cutoffDate = new Date(now)
    cutoffDate.setMonth(now.getMonth() - monthsToShow)
    
    return chartData.filter(item => new Date(item.date) >= cutoffDate)
  }
  
  // Filter data berdasarkan tab aktif (mata pelajaran)
  const getFilteredSubjects = () => {
    if (activeTab === "all") return subjectGroups
    
    return Object.fromEntries(
      Object.entries(subjectGroups).filter(([subject]) => subject === activeTab)
    )
  }
  
  // Render loading state
  if (loading) {
    return (
      <div className="container p-4 md:p-6">
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
    )
  }
  
  // Render error state
  if (error) {
    return (
      <div className="container p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/students">Kembali ke Daftar Siswa</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb
        items={[
          { label: "Siswa", href: "/students" },
          { label: student?.name || "Loading...", href: `/students/${id}` },
          { label: "Perkembangan Nilai", href: `/students/${id}/progress` },
        ]}
      />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Perkembangan Nilai Siswa</h1>
        <Button asChild variant="outline">
          <Link href={`/students/${id}`}>Kembali ke Detail</Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-2 md:flex md:flex-row">
            <TabsTrigger value="all">Semua Mapel</TabsTrigger>
            {Object.keys(subjectGroups).map(subject => (
              <TabsTrigger key={subject} value={subject}>
                {subjectColors[subject]?.label || subject}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Pilih Rentang Waktu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 Bulan Terakhir</SelectItem>
            <SelectItem value="6m">6 Bulan Terakhir</SelectItem>
            <SelectItem value="1y">1 Tahun Terakhir</SelectItem>
            <SelectItem value="all">Semua Waktu</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b py-5">
          <div className="grid flex-1 gap-1">
            <CardTitle>Grafik Perkembangan Nilai</CardTitle>
            <CardDescription>
              Rata-rata nilai per bulan untuk setiap mata pelajaran
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={getFilteredData()}
                  margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                >
                  <defs>
                    {Object.entries(chartConfig).map(([key, config]) => (
                      <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={config.color} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={config.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
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
                                <span className="text-xs font-medium">{payload[0]?.payload.month}</span>
                              </div>
                              {payload.map((entry) => (
                                <div key={entry.dataKey as string} className="flex flex-col">
                                  <span className="flex items-center gap-1 text-xs">
                                    <span
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    {entry.dataKey as string}
                                  </span>
                                  <span className="font-medium">{Math.round(entry.value as number)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  {Object.entries(chartConfig).map(([key, config]) => (
                    activeTab === "all" || activeTab === key ? (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={config.color}
                        fill={`url(#gradient-${key})`}
                        strokeWidth={2}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    ) : null
                  ))}
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap gap-4">
                {Object.entries(chartConfig).map(([key, config]) => (
                  activeTab === "all" || activeTab === key ? (
                    <div key={key} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                  ) : null
                ))}
              </div>
            </ChartContainer>
          ) : (
            <div className="flex h-[350px] items-center justify-center">
              <p className="text-muted-foreground">Belum ada data penilaian</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8">
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
                      {Object.entries(getFilteredSubjects()).map(([subject, assessments]) => (
                        assessments.map((assessment, index) => (
                          <tr key={assessment.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: subjectColors[subject]?.color || "#888888" }}
                                />
                                <span>{subject}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{assessment.value}</span>
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
                              {new Date(assessment.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                          </tr>
                        ))
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-muted-foreground">Belum ada data penilaian</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
