import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/auth";
import { formatDate } from "../lib/utils";
import { BookOpen, Plus, Eye, Pencil } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function SubjectsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const subjects = await prisma.subject.findMany({
    where: { teacherId: user.id },
    orderBy: { name: "asc" },
  });
  
  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb items={[{ label: "Mata Pelajaran", href: "/subjects" }]} />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Daftar Mata Pelajaran</h1>
        </div>
        <Button asChild>
          <Link href="/subjects/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Tambah Mata Pelajaran</span>
          </Link>
        </Button>
      </div>
      
      {/* Card untuk tampilan mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <div key={subject.id} className="bg-card rounded-lg border shadow-sm p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{subject.name}</h3>
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {subject.code}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Dibuat: {formatDate(subject.createdAt)}</p>
                <div className="flex items-center gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/subjects/${subject.id}`} className="flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>Lihat</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/subjects/${subject.id}/edit`} className="flex items-center justify-center gap-1">
                      <Pencil className="h-3 w-3" />
                      <span>Edit</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-4 text-center text-muted-foreground">
            Belum ada data mata pelajaran
          </div>
        )}
      </div>
      
      {/* Tabel untuk tampilan desktop */}
      <div className="rounded-md border shadow-sm hidden md:block">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium">Nama</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Kode</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Tanggal Dibuat</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <tr
                    key={subject.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">{subject.name}</td>
                    <td className="p-4 align-middle">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {subject.code}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">{formatDate(subject.createdAt)}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/subjects/${subject.id}`} className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>Lihat</span>
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/subjects/${subject.id}/edit`} className="flex items-center gap-1">
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    Belum ada data mata pelajaran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
