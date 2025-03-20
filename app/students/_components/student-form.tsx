"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { studentSchema } from "@/app/lib/validations";
import { toast } from "sonner";

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  initialData?: StudentFormValues & { id: string };
}

export function StudentForm({ initialData }: StudentFormProps = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      name: "",
      nisn: "",
      class: "",
    },
  });

  async function onSubmit(data: StudentFormValues) {
    setIsLoading(true);

    try {
      const url = isEditing 
        ? `/api/students/${initialData.id}` 
        : "/api/students";
      
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan saat menyimpan data siswa");
      }

      toast.success(isEditing ? "Data siswa berhasil diperbarui" : "Siswa baru berhasil ditambahkan");
      router.push("/students");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data siswa");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Nama lengkap siswa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nisn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NISN</FormLabel>
              <FormControl>
                <Input placeholder="Nomor Induk Siswa Nasional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kelas</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: 10A, 11B, 12C" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/students")}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : isEditing ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
