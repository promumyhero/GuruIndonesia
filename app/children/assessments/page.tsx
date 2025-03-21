import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  SubjectScoreCard,
  ProgressScoreCard,
} from "@/app/_components/charts/parent-charts";
import { Button } from "@/components/ui/button";

export default async function ChildrenAssessmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "PARENT") {
    redirect("/dashboard");
  }

  // Get parent data with children
  const parent = await prisma.parent.findUnique({
    where: { userId: user.id },
    include: {
      students: {
        include: {
          teacher: true,
          assessments: {
            include: {
              subject: true,
            },
            orderBy: [
              { academicYear: "desc" },
              { semester: "desc" },
              { assessmentDate: "desc" },
            ],
          },
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  if (!parent || parent.students.length === 0) {
    return (
      <div className="container py-10 px-4 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Nilai Anak</CardTitle>
            <CardDescription>
              Anda belum memiliki anak yang terdaftar. Silakan hubungi
              administrator sekolah.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Prepare data for charts
  const prepareSubjectChartData = (studentId: string) => {
    const student = parent?.students?.find((s) => s.id === studentId);
    if (!student) return [];

    // Group assessments by subject
    const subjectGroups = student.assessments.reduce((acc, assessment) => {
      const subjectName = assessment.subject.name;
      if (!acc[subjectName]) {
        acc[subjectName] = [];
      }
      acc[subjectName].push(assessment);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate average score per subject
    return Object.entries(subjectGroups).map(([subject, assessments]) => {
      const totalScore = assessments.reduce(
        (sum, assessment) => sum + assessment.value,
        0
      );
      const averageScore = totalScore / assessments.length;

      return {
        subject,
        nilai: Math.round(averageScore * 10) / 10, // Round to 1 decimal place
      };
    });
  };

  // Prepare data for daily progress chart
  const prepareDailyProgressData = (studentId: string) => {
    const student = parent?.students?.find((s) => s.id === studentId);
    if (!student || student.assessments.length === 0) return [];

    // Group assessments by date
    const assessmentsByDate = student.assessments.reduce((acc, assessment) => {
      const date = format(new Date(assessment.assessmentDate), "dd MMM", {
        locale: id,
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(assessment);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate average score per date
    return Object.entries(assessmentsByDate)
      .map(([date, assessments]) => {
        const totalScore = assessments.reduce(
          (sum, assessment) => sum + assessment.value,
          0
        );
        const averageScore = totalScore / assessments.length;

        return {
          tanggal: date,
          nilai: Math.round(averageScore * 10) / 10, // Round to 1 decimal place
        };
      })
      .slice(-7); // Get last 7 days
  };

  return (
    <div className="container py-10 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4 sm:mb-0">
          Nilai Anak
        </h1>
        <Button
          variant="outline"
          asChild
          size="sm"
          className="self-start sm:self-auto"
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={parent.students[0].id} className="w-full">
        <TabsList className="mb-6 w-full max-w-md mx-auto grid grid-cols-2 sm:grid-cols-3">
          {parent.students.map((student) => (
            <TabsTrigger
              key={student.id}
              value={student.id}
              className="text-sm"
            >
              {student.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {parent.students.map((student) => (
          <TabsContent
            key={student.id}
            value={student.id}
            className="space-y-8"
          >
            <Card className="shadow-sm border-2">
              <CardHeader className="bg-muted/10">
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  Informasi Siswa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 border-r-0 md:border-r border-dashed pr-0 md:pr-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Nama:
                      </span>
                      <span className="font-medium">{student.name}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        NISN:
                      </span>
                      <span className="font-medium">{student.nisn}</span>
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t md:border-t-0 md:pt-0">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Kelas:
                      </span>
                      <span className="font-medium">{student.class}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Wali Kelas:
                      </span>
                      <span className="font-medium">
                        {student.teacher?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {student.assessments.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <SubjectScoreCard
                  data={prepareSubjectChartData(student.id)}
                  studentName={student.name}
                />
                <ProgressScoreCard
                  data={prepareDailyProgressData(student.id)}
                  studentName={student.name}
                />
              </div>
            )}

            {student.assessments.length > 0 ? (
              (() => {
                // Group assessments by academic year and semester
                const groupedAssessments: Record<
                  string,
                  Record<string, typeof student.assessments>
                > = {};

                student.assessments.forEach((assessment) => {
                  if (!groupedAssessments[assessment.academicYear]) {
                    groupedAssessments[assessment.academicYear] = {};
                  }

                  if (
                    !groupedAssessments[assessment.academicYear][
                      assessment.semester
                    ]
                  ) {
                    groupedAssessments[assessment.academicYear][
                      assessment.semester
                    ] = [];
                  }

                  groupedAssessments[assessment.academicYear][
                    assessment.semester
                  ].push(assessment);
                });

                // Sort academic years and semesters
                const sortedYears = Object.keys(groupedAssessments)
                  .sort()
                  .reverse();

                return sortedYears.map((year) => (
                  <div key={year} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                      Tahun Ajaran {year}
                    </h2>

                    {Object.keys(groupedAssessments[year])
                      .sort()
                      .reverse()
                      .map((semester) => (
                        <Card
                          key={`${year}-${semester}`}
                          className="mb-6 shadow-sm"
                        >
                          <CardHeader className="bg-muted/10">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center">
                                <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                                Semester {semester}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b bg-muted/5">
                                    <th className="text-left py-3 px-4 font-medium">
                                      Mata Pelajaran
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium">
                                      Jenis Penilaian
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium">
                                      Nilai
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium">
                                      Tanggal
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {groupedAssessments[year][semester].map(
                                    (assessment) => (
                                      <tr
                                        key={assessment.id}
                                        className="border-b"
                                      >
                                        <td className="py-3 px-4">
                                          {assessment.subject.name}
                                        </td>
                                        <td className="py-3 px-4">
                                          {assessment.type}
                                        </td>
                                        <td className="py-3 px-4 font-medium">
                                          {assessment.value}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">
                                          {format(
                                            new Date(assessment.assessmentDate),
                                            "dd MMM yyyy",
                                            { locale: id }
                                          )}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ));
              })()
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-muted/5 rounded-lg border-2 border-dashed">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">Belum Ada Nilai</h3>
                <p className="text-muted-foreground text-center max-w-md px-4">
                  Anak Anda belum memiliki nilai yang tercatat dalam sistem.
                  Nilai akan muncul setelah guru menginput nilai.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
