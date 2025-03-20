import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface ReportCardPageProps {
  params: {
    id: string;
  };
}

// Define types for better type safety
interface Assessment {
  id: string;
  value: number;
  type: string;
  subject: {
    name: string;
    id: string;
  };
}

interface Student {
  id: string;
  name: string;
  nisn: string;
  class: string;
  teacher?: {
    name: string;
  };
  parents: any[];
}

interface ReportCard {
  id: string;
  semester: number;
  academicYear: string;
  finalGrade: number;
  classRank: number | null;
  teacherComment: string | null;
  description: string;
  student: Student;
  assessments: Assessment[];
}

export default async function ReportCardDetailPage({
  params,
}: ReportCardPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "PARENT") {
    redirect("/dashboard");
  }

  // Get report card
  const reportCard = (await prisma.reportCard.findUnique({
    where: { id: params.id },
    include: {
      student: {
        include: {
          teacher: true,
          parents: {
            where: { userId: user.id },
          },
        },
      },
      assessments: {
        include: {
          subject: true,
        },
      },
    },
  })) as unknown as ReportCard; // Cast to our custom type

  if (!reportCard) {
    return (
      <div className="container py-10">
        <div className="flex items-center mb-6">
          <Link href="/children/report-cards" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Rapor Tidak Ditemukan
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rapor Tidak Ditemukan</CardTitle>
            <CardDescription>
              Rapor yang Anda cari tidak ditemukan atau Anda tidak memiliki
              akses.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check if parent has access to this student
  if (reportCard.student.parents.length === 0) {
    redirect("/children/report-cards");
  }

  // Process assessments to get subject grades
  // Group assessments by subject and calculate average
  const subjectGrades: Record<
    string,
    { id: string; subject: { name: string }; grade: number; kkm?: number }
  > = {};

  reportCard.assessments.forEach((assessment) => {
    const subjectId = assessment.subject.id;

    if (!subjectGrades[subjectId]) {
      subjectGrades[subjectId] = {
        id: subjectId,
        subject: { name: assessment.subject.name },
        grade: 0,
        kkm: 75, // Default KKM
      };
    }

    // Add to the running sum
    subjectGrades[subjectId].grade += assessment.value;
  });

  // Calculate averages
  const subjectGradesArray = Object.values(subjectGrades).map((grade) => {
    const assessmentsForSubject = reportCard.assessments.filter(
      (a) => a.subject.id === grade.id
    );

    if (assessmentsForSubject.length > 0) {
      grade.grade =
        Math.round((grade.grade / assessmentsForSubject.length) * 10) / 10;
    }

    return grade;
  });

  // Calculate statistics
  const totalSubjects = subjectGradesArray.length;
  const totalGrade = subjectGradesArray.reduce(
    (sum, grade) => sum + grade.grade,
    0
  );
  const averageGrade =
    totalSubjects > 0 ? Math.round((totalGrade / totalSubjects) * 10) / 10 : 0;

  const highestGrade =
    subjectGradesArray.length > 0
      ? subjectGradesArray.reduce(
          (max, grade) => (grade.grade > max.grade ? grade : max),
          subjectGradesArray[0]
        )
      : { subject: { name: "Tidak ada" }, grade: 0 };

  const lowestGrade =
    subjectGradesArray.length > 0
      ? subjectGradesArray.reduce(
          (min, grade) => (grade.grade < min.grade ? grade : min),
          subjectGradesArray[0]
        )
      : { subject: { name: "Tidak ada" }, grade: 0 };

  // Attendance data (dummy data for now)
  const attendanceData = {
    present: 90,
    sick: 5,
    permission: 3,
    absent: 2,
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/children/report-cards" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Detail Rapor</h1>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Cetak
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Unduh PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Rapor Semester {reportCard.semester}</CardTitle>
                  <CardDescription>
                    Tahun Ajaran {reportCard.academicYear}
                  </CardDescription>
                </div>
                <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-sm font-medium">
                  Nilai Akhir: {reportCard.finalGrade}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Informasi Siswa
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Nama:
                        </span>
                        <span className="text-sm font-medium">
                          {reportCard.student.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          NISN:
                        </span>
                        <span className="text-sm font-medium">
                          {reportCard.student.nisn}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Kelas:
                        </span>
                        <span className="text-sm font-medium">
                          {reportCard.student.class}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Informasi Akademik
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Wali Kelas:
                        </span>
                        <span className="text-sm font-medium">
                          {reportCard.student.teacher?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Semester:
                        </span>
                        <span className="text-sm font-medium">
                          {reportCard.semester}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Tahun Ajaran:
                        </span>
                        <span className="text-sm font-medium">
                          {reportCard.academicYear}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Nilai Mata Pelajaran
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">
                            Mata Pelajaran
                          </th>
                          <th className="text-center py-3 px-4">KKM</th>
                          <th className="text-center py-3 px-4">Nilai</th>
                          <th className="text-left py-3 px-4">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {subjectGradesArray.map((grade) => (
                          <tr key={grade.id}>
                            <td className="py-3 px-4">{grade.subject.name}</td>
                            <td className="py-3 px-4 text-center">
                              {grade.kkm || 75}
                            </td>
                            <td className="py-3 px-4 text-center font-medium">
                              <span
                                className={`px-2 py-1 rounded-md ${
                                  grade.grade >= (grade.kkm || 75)
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {grade.grade}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {grade.grade >= (grade.kkm || 75)
                                ? "Tuntas"
                                : "Belum Tuntas"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Komentar Guru</h3>
                  <div className="p-4 border rounded-md">
                    <p className="text-sm">
                      {reportCard.teacherComment ||
                        reportCard.description ||
                        "Tidak ada komentar"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ringkasan Nilai</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-primary/5">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Nilai Rata-rata
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {averageGrade}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Nilai Tertinggi
                    </p>
                    <p className="text-xl font-semibold">
                      {highestGrade.grade}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {highestGrade.subject.name}
                    </p>
                  </div>

                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Nilai Terendah
                    </p>
                    <p className="text-xl font-semibold">{lowestGrade.grade}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lowestGrade.subject.name}
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Peringkat Kelas
                  </p>
                  <p className="text-2xl font-bold">
                    {reportCard.classRank
                      ? `${reportCard.classRank} dari 30`
                      : "Tidak tersedia"}
                  </p>
                </div>

                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Status Kenaikan
                  </p>
                  <p className="text-lg font-semibold mt-1">
                    {reportCard.semester === 2 ? (
                      reportCard.finalGrade >= 75 ? (
                        <span className="text-green-600">Naik Kelas</span>
                      ) : (
                        <span className="text-red-600">Tidak Naik Kelas</span>
                      )
                    ) : (
                      "Menunggu Semester 2"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kehadiran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hadir</span>
                  <span className="text-sm font-medium">
                    {attendanceData.present} hari
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sakit</span>
                  <span className="text-sm font-medium">
                    {attendanceData.sick} hari
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Izin</span>
                  <span className="text-sm font-medium">
                    {attendanceData.permission} hari
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tanpa Keterangan</span>
                  <span className="text-sm font-medium">
                    {attendanceData.absent} hari
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
