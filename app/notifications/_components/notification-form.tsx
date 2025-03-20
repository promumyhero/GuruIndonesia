"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormError } from "@/components/form-error";

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NotificationFormProps {
  recipients: Recipient[];
}

export function NotificationForm({ recipients }: NotificationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const message = formData.get("message") as string;
    const recipientId = formData.get("recipientId") as string;
    
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          message,
          recipientId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan");
      }
      
      router.refresh();
      router.push("/notifications");
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
        <Label htmlFor="recipientId">Penerima</Label>
        <Select name="recipientId" required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih penerima" />
          </SelectTrigger>
          <SelectContent>
            {recipients.map((recipient) => (
              <SelectItem key={recipient.id} value={recipient.id}>
                {recipient.name} ({recipient.email}) - {recipient.role === "PARENT" ? "Orang Tua" : recipient.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Masukkan judul notifikasi"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Pesan</Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Masukkan pesan notifikasi"
          rows={6}
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
          {isLoading ? "Mengirim..." : "Kirim Notifikasi"}
        </Button>
      </div>
    </form>
  );
}
