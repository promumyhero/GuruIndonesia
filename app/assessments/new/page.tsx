"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Breadcrumb } from "@/components/breadcrumb"
import { FormError } from "@/app/components/form-error"

// Definisi schema validasi
const formSchema = z.object({
  studentId: z.string({
    required_error: "Silakan pilih siswa",
  }),
  subjectId: z.string({
    required_error: "Silakan pilih mata pelajaran",
  }),
  value: z.coerce
    .number()
    .min(0, "Nilai minimal adalah 0")
    .max(100, "Nilai maksimal adalah 100"),
  type: z.enum(["WEEKLY", "DAILY", "MIDTERM", "FINAL"], {
    required_error: "Silakan pilih tipe penilaian",
  }),
  semester: z.coerce
    .number()
    .min(1, "Semester minimal adalah 1")
    .max(2, "Semester maksimal adalah 2"),
  academicYear: z.string({
    required_error: "Silakan masukkan tahun akademik",
  }),
})

// Tipe data untuk form
type FormValues = z.infer<typeof formSchema>

// Server action untuk membuat penilaian baru
async function createAssessment(data: FormValues) {
  const response = await fetch("/api/assessments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Gagal membuat penilaian")
  }

  return response.json()
}

export default function NewAssessmentPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Inisialisasi form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: 0,
      semester: 1,
      academicYear: new Date().getFullYear().toString(),
    },
  })

  // Ambil data siswa dan mata pelajaran saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data siswa
        const studentsResponse = await fetch("/api/students")
        if (!studentsResponse.ok) {
          throw new Error("Gagal mengambil data siswa")
        }
        const studentsData = await studentsResponse.json()
        setStudents(studentsData)

        // Ambil data mata pelajaran
        const subjectsResponse = await fetch("/api/subjects")
        if (!subjectsResponse.ok) {
          throw new Error("Gagal mengambil data mata pelajaran")
        }
        const subjectsData = await subjectsResponse.json()
        setSubjects(subjectsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Gagal memuat data. Silakan coba lagi.")
      }
    }

    fetchData()
  }, [])

  // Handler saat form disubmit
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      await createAssessment(data)
      toast.success("Penilaian berhasil dibuat")
      router.push("/assessments")
      router.refresh()
    } catch (error) {
      console.error("Error creating assessment:", error)
      setError(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb
        items={[
          { label: "Penilaian", href: "/assessments" },
          { label: "Tambah Penilaian", href: "/assessments/new" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Tambah Penilaian</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Form Penilaian</CardTitle>
          <CardDescription>
            Masukkan data penilaian untuk siswa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && <FormError message={error} />}

              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Siswa</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih siswa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mata Pelajaran</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih mata pelajaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nilai</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Nilai antara 0 - 100
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Penilaian</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe penilaian" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WEEKLY">Mingguan</SelectItem>
                        <SelectItem value="DAILY">Harian</SelectItem>
                        <SelectItem value="MIDTERM">Tengah Semester</SelectItem>
                        <SelectItem value="FINAL">Akhir Semester</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Semester 1</SelectItem>
                          <SelectItem value="2">Semester 2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Akademik</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: 2024/2025"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="flex justify-end gap-4 pt-6 border-t px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/assessments")}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
