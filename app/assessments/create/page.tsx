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
import { getAssessmentTypes, getAssessmentTypeLabel } from "@/app/lib/utils"

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
  type: z.enum(["WEEKLY", "DAILY", "MIDTERM", "FINAL", "HOMEWORK", "DAILY_TEST"], {
    required_error: "Silakan pilih tipe penilaian",
  }),
  semester: z.coerce
    .number()
    .min(1, "Semester minimal adalah 1")
    .max(2, "Semester maksimal adalah 2"),
  academicYear: z.string({
    required_error: "Silakan masukkan tahun akademik",
  }),
  assessmentDate: z.string({
    required_error: "Silakan pilih tanggal penilaian",
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

export default function CreateAssessmentPage() {
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
      assessmentDate: new Date().toISOString().split('T')[0],
    },
  })

  // Ambil data siswa dan mata pelajaran
  useEffect(() => {
    async function fetchData() {
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
        setError("Gagal mengambil data. Silakan coba lagi.")
      }
    }

    fetchData()
  }, [])

  // Handle submit form
  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    setError(null)

    try {
      await createAssessment(data)
      toast.success("Penilaian berhasil dibuat")
      router.push("/assessments")
      router.refresh()
    } catch (error) {
      console.error("Error submitting form:", error)
      setError(error instanceof Error ? error.message : "Gagal membuat penilaian")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb
        items={[
          { label: "Penilaian", href: "/assessments" },
          { label: "Tambah Penilaian", href: "/assessments/create" },
        ]}
      />

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Tambah Penilaian Baru</CardTitle>
            <CardDescription>
              Masukkan informasi penilaian untuk siswa
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {error && <FormError message={error} />}
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Siswa</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading || students.length === 0}
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
                          disabled={isLoading || subjects.length === 0}
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
                            placeholder="Masukkan nilai"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Nilai antara 0-100
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
                            {getAssessmentTypes().map((type) => (
                              <SelectItem key={type} value={type}>
                                {getAssessmentTypeLabel(type)}
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
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value.toString()}
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
                            placeholder="Contoh: 2023/2024"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assessmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Penilaian</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Tanggal kejadian penilaian dilakukan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="flex justify-end gap-4 pt-6 border-t px-6">
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
        </Card>
      </div>
    </div>
  )
}
