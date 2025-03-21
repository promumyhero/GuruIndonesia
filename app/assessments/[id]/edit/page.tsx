"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Breadcrumb } from "@/components/breadcrumb"
import { FormError } from "@/app/components/form-error"
import { getAssessmentTypes, getAssessmentTypeLabel } from "@/app/lib/utils"

// Server action untuk mengupdate penilaian
async function updateAssessment(id: string, data: any) {
  console.log("Updating assessment with ID:", id);
  console.log("Data to update:", data);
  
  try {
    const response = await fetch(`/api/assessments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      throw new Error(errorData.message || "Gagal mengupdate penilaian");
    }
    
    const result = await response.json();
    console.log("Update successful:", result);
    return result;
  } catch (error) {
    console.error("Error in updateAssessment:", error);
    throw error;
  }
}

// Fungsi untuk mengambil data penilaian
async function getAssessment(id: string) {
  const response = await fetch(`/api/assessments/${id}`)
  
  if (!response.ok) {
    throw new Error("Gagal mengambil data penilaian")
  }
  
  return response.json()
}

export default function EditAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const { id } = use(params)
  
  // State untuk form
  const [formData, setFormData] = useState({
    studentId: "",
    subjectId: "",
    value: 0,
    type: "WEEKLY",
    semester: 1,
    academicYear: new Date().getFullYear().toString(),
    assessmentDate: new Date().toISOString().split('T')[0],
  });

  // Ambil data siswa dan mata pelajaran saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data siswa
        const studentsResponse = await fetch("/api/students")
        const studentsData = await studentsResponse.json()
        setStudents(studentsData)

        // Ambil data mata pelajaran
        const subjectsResponse = await fetch("/api/subjects")
        const subjectsData = await subjectsResponse.json()
        setSubjects(subjectsData)

        // Ambil data penilaian yang akan diedit
        const assessmentData = await getAssessment(id)
        console.log("Assessment data from API:", assessmentData);
        
        // Set nilai default form
        setFormData({
          studentId: assessmentData.studentId || "",
          subjectId: assessmentData.subjectId || "",
          value: typeof assessmentData.value === 'string' ? parseFloat(assessmentData.value) : (assessmentData.value || 0),
          type: assessmentData.type || "WEEKLY",
          semester: assessmentData.semester || 1,
          academicYear: assessmentData.academicYear || new Date().getFullYear().toString(),
          assessmentDate: assessmentData.assessmentDate 
            ? new Date(assessmentData.assessmentDate).toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0],
        });
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Gagal memuat data. Silakan coba lagi.")
      } finally {
        setInitialLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Handler untuk perubahan form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Khusus untuk input number, konversi ke number
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    console.log(`Field ${name} changed to:`, value);
  };

  // Handler untuk submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Form submitted with data:", formData);
      await updateAssessment(id, formData);
      console.log("Update completed successfully");
      toast.success("Penilaian berhasil diperbarui");
      router.push("/assessments");
    } catch (err: any) {
      console.error("Error in submit:", err);
      setError(err.message || "Terjadi kesalahan saat memperbarui penilaian");
      toast.error("Gagal memperbarui penilaian");
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Penilaian", href: "/assessments" },
          { label: "Edit Penilaian", href: "#" },
        ]}
      />

      <div className="mt-6 sm:mt-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Penilaian</CardTitle>
            <CardDescription>
              Ubah data penilaian siswa
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              {error && <FormError message={error} />}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Siswa</label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Pilih siswa</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mata Pelajaran</label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Pilih mata pelajaran</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nilai</label>
                  <input
                    type="number"
                    name="value"
                    min={0}
                    max={100}
                    value={formData.value}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-500">Nilai antara 0-100</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipe Penilaian</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {getAssessmentTypes().map((type) => (
                      <option key={type} value={type}>
                        {getAssessmentTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester</label>
                  <select
                    name="semester"
                    value={formData.semester.toString()}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        semester: parseInt(e.target.value)
                      });
                    }}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tahun Ajaran</label>
                  <input
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Penilaian</label>
                  <input
                    type="date"
                    name="assessmentDate"
                    value={formData.assessmentDate}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/assessments")}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
