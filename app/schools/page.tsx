import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { formatDate } from "@/app/lib/utils";
import { Breadcrumb } from "@/components/breadcrumb";
import { PlusIcon } from "lucide-react";

export default async function SchoolsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Hanya admin yang bisa melihat semua sekolah
  if (user.role !== "ADMIN") {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
        <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      </div>
    );
  }
  
  const schools = await prisma.school.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Sekolah", href: "/schools" },
          ]}
        />
        <Link href="/schools/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Tambah Sekolah
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Sekolah</CardTitle>
        </CardHeader>
        <CardContent>
          {schools.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Belum ada data sekolah.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.type}</TableCell>
                      <TableCell>{school.address}</TableCell>
                      <TableCell>{formatDate(school.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/schools/${school.id}`}>
                            <Button variant="outline" size="sm">
                              Detail
                            </Button>
                          </Link>
                          <Link href={`/schools/${school.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
