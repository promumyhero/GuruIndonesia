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
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ChildrenReportCardsPage() {
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
          reportCards: {
            orderBy: [
              { academicYear: "desc" },
              { semester: "desc" },
              { updatedAt: "desc" },
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
        <Card className="shadow-sm border-2">
          <CardHeader className="bg-muted/10">
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-primary" />
              Rapor Anak
            </CardTitle>
            <CardDescription>
              Anda belum memiliki anak yang terdaftar. Silakan hubungi
              administrator sekolah.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4 sm:mb-0">
          Rapor Anak
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

            {student.reportCards.length > 0 ? (
              (() => {
                // Group report cards by academic year
                const groupedReportCards: Record<
                  string,
                  typeof student.reportCards
                > = {};

                student.reportCards.forEach((report) => {
                  if (!groupedReportCards[report.academicYear]) {
                    groupedReportCards[report.academicYear] = [];
                  }

                  groupedReportCards[report.academicYear].push(report);
                });

                // Sort academic years
                const sortedYears = Object.keys(groupedReportCards)
                  .sort()
                  .reverse();

                return sortedYears.map((year) => (
                  <div key={year} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      Tahun Ajaran {year}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {groupedReportCards[year]
                        .sort(
                          (a, b) =>
                            parseInt(b.semester.toString()) -
                            parseInt(a.semester.toString())
                        )
                        .map((report) => (
                          <Card
                            key={report.id}
                            className="overflow-hidden shadow-sm border-2"
                          >
                            <CardHeader className="pb-3 bg-muted/10">
                              <CardTitle className="text-lg flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-primary" />
                                Semester {report.semester}
                              </CardTitle>
                              <CardDescription>
                                Diperbarui:{" "}
                                {new Date(report.updatedAt).toLocaleDateString(
                                  "id-ID"
                                )}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="space-y-4">
                                <div className="flex items-center">
                                  <div className="w-1/2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                      Nilai Akhir:
                                    </p>
                                    <p className="text-2xl font-bold">
                                      {report.finalGrade}
                                    </p>
                                  </div>
                                  <div className="w-1/2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                      Peringkat Kelas:
                                    </p>
                                    <p className="text-lg font-semibold">
                                      {report.classRank
                                        ? `#${report.classRank}`
                                        : "-"}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Komentar Guru:
                                  </p>
                                  <p className="text-sm mt-1 p-2 bg-muted/20 rounded-md">
                                    {report.teacherComment
                                      ? report.teacherComment
                                      : report.description}
                                  </p>
                                </div>

                                <div className="pt-2">
                                  <Button className="w-full" asChild>
                                    <Link
                                      href={`/children/report-cards/${report.id}`}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      Lihat Detail Rapor
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ));
              })()
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-muted/5 rounded-lg border-2 border-dashed">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">Belum Ada Rapor</h3>
                <p className="text-muted-foreground text-center max-w-md px-4">
                  Anak Anda belum memiliki rapor yang tercatat dalam sistem.
                  Rapor akan muncul setelah guru menginput nilai akhir semester.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
