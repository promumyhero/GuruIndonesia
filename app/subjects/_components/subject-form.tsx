"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { subjectSchema } from "@/app/lib/validations";
import { toast } from "sonner";

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  initialData?: SubjectFormValues & { id: string };
}

export function SubjectForm({ initialData }: SubjectFormProps = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: initialData || {
      name: "",
      code: "",
    },
  });

  async function onSubmit(data: SubjectFormValues) {
    setIsLoading(true);

    try {
      const url = isEditing 
        ? `/api/subjects/${initialData.id}` 
        : "/api/subjects";
      
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
        throw new Error(result.error || "Terjadi kesalahan saat menyimpan data mata pelajaran");
      }

      toast.success(isEditing ? "Data mata pelajaran berhasil diperbarui" : "Mata pelajaran baru berhasil ditambahkan");
      router.push("/subjects");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data mata pelajaran");
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
              <FormLabel>Nama Mata Pelajaran</FormLabel>
              <FormControl>
                <Input placeholder="Nama mata pelajaran" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Mata Pelajaran</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: MTK, BIG, FIS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/subjects")}
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
