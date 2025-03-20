"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { School } from "@prisma/client";

interface TeacherSchoolInfoProps {
  userId: string;
  schoolId: string | null;
  schools: School[];
}

export function TeacherSchoolInfo({ userId, schoolId, schools }: TeacherSchoolInfoProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(schoolId);
  
  const currentSchool = schools.find((school) => school.id === schoolId);
  
  const handleSchoolChange = async () => {
    if (!selectedSchoolId || selectedSchoolId === schoolId) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolId: selectedSchoolId,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Terjadi kesalahan saat memperbarui sekolah");
      }
      
      toast.success("Sekolah berhasil diperbarui");
      router.refresh();
    } catch (error) {
      console.error("Error updating school:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui sekolah");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Sekolah</CardTitle>
        <CardDescription>
          Sekolah tempat Anda mengajar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSchool ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Sekolah Saat Ini:</p>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">{currentSchool.name}</p>
              <p className="text-sm text-muted-foreground">Tipe: {currentSchool.type}</p>
              <p className="text-sm text-muted-foreground">Alamat: {currentSchool.address}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Anda belum terdaftar di sekolah manapun.</p>
        )}
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Ubah Sekolah:</p>
          <div className="flex space-x-2">
            <Select
              value={selectedSchoolId || ""}
              onValueChange={(value) => setSelectedSchoolId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih sekolah" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name} ({school.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleSchoolChange} 
              disabled={isLoading || !selectedSchoolId || selectedSchoolId === schoolId}
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
