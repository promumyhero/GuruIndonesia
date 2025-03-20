"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/form-error";
import { School } from "@prisma/client";

interface SchoolFormProps {
  school?: School;
}

export function SchoolForm({ school }: SchoolFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const type = formData.get("type") as string;
    
    try {
      const response = await fetch(
        school ? `/api/schools/${school.id}` : "/api/schools",
        {
          method: school ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            address,
            type,
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan");
      }
      
      router.refresh();
      router.push("/schools");
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <FormError message={error} />}
      
      <div className="space-y-2">
        <Label htmlFor="name">Nama Sekolah</Label>
        <Input
          id="name"
          name="name"
          defaultValue={school?.name || ""}
          required
          placeholder="Masukkan nama sekolah"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Tipe Sekolah</Label>
        <Select name="type" defaultValue={school?.type || ""} required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih tipe sekolah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SD">SD</SelectItem>
            <SelectItem value="SMP">SMP</SelectItem>
            <SelectItem value="SMA">SMA</SelectItem>
            <SelectItem value="SMK">SMK</SelectItem>
            <SelectItem value="OTHER">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Alamat</Label>
        <Textarea
          id="address"
          name="address"
          defaultValue={school?.address || ""}
          required
          placeholder="Masukkan alamat sekolah"
          rows={4}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : school ? "Perbarui" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
