import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/app/lib/auth";
import { SchoolForm } from "../_components/school-form";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function NewSchoolPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Hanya admin yang bisa menambahkan sekolah
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Sekolah", href: "/schools" },
            { label: "Tambah Sekolah", href: "/schools/new" },
          ]}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tambah Sekolah Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolForm />
        </CardContent>
      </Card>
    </div>
  );
}
