"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Form schema
const formSchema = z.object({
  nisn: z.string().min(10, "NISN harus minimal 10 karakter").max(20, "NISN maksimal 20 karakter"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddChildPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nisn: "",
      birthDate: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/children/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menambahkan anak");
      }

      toast.success("Anak berhasil ditambahkan");
      router.push("/children");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menambahkan anak");
      toast.error("Gagal menambahkan anak");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Anak</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tambah Anak</CardTitle>
              <CardDescription>
                Masukkan NISN dan tanggal lahir anak Anda untuk menghubungkan akun Anda dengan data anak
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="nisn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NISN</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan NISN anak" {...field} />
                        </FormControl>
                        <FormDescription>
                          NISN (Nomor Induk Siswa Nasional) dapat dilihat pada kartu pelajar atau rapor anak
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Lahir</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Tanggal lahir digunakan untuk verifikasi
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Tambah Anak"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Informasi</CardTitle>
              <CardDescription>
                Panduan menambahkan anak ke akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Apa itu NISN?</h3>
                <p className="text-sm text-muted-foreground">
                  NISN (Nomor Induk Siswa Nasional) adalah nomor identitas unik yang diberikan kepada setiap siswa di Indonesia. 
                  NISN terdiri dari 10 digit angka dan dapat ditemukan pada kartu pelajar atau rapor anak.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Bagaimana cara mendapatkan NISN?</h3>
                <p className="text-sm text-muted-foreground">
                  Jika Anda tidak mengetahui NISN anak Anda, Anda dapat:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Melihat pada kartu pelajar anak</li>
                  <li>Melihat pada rapor anak</li>
                  <li>Menghubungi pihak sekolah</li>
                  <li>Mengecek di website <a href="https://nisn.data.kemdikbud.go.id" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NISN Kemdikbud</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Mengapa perlu verifikasi tanggal lahir?</h3>
                <p className="text-sm text-muted-foreground">
                  Verifikasi tanggal lahir diperlukan untuk memastikan bahwa Anda adalah orang tua atau wali sah dari anak tersebut.
                  Data ini akan dicocokkan dengan data yang ada di sistem sekolah.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Bagaimana jika data tidak cocok?</h3>
                <p className="text-sm text-muted-foreground">
                  Jika data yang Anda masukkan tidak cocok dengan data di sistem, Anda dapat menghubungi pihak sekolah untuk memverifikasi data anak Anda.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Catatan Penting</h3>
                <p className="text-sm text-muted-foreground">
                  Jika ini adalah pertama kalinya tanggal lahir anak Anda dimasukkan ke sistem, data tersebut akan disimpan untuk verifikasi di masa mendatang.
                  Pastikan Anda memasukkan tanggal lahir yang benar.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
