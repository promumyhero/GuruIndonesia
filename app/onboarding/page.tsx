"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, School, Search } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/app/hooks/use-debounce";

// Schema for school form
const schoolFormSchema = z.object({
  schoolName: z.string().min(3, "Nama sekolah harus minimal 3 karakter"),
  schoolAddress: z.string().min(5, "Alamat sekolah harus minimal 5 karakter"),
  schoolType: z.enum(["SD", "SMP", "SMA", "SMK"], {
    required_error: "Pilih jenis sekolah",
  }),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ exists: boolean; schoolId: string | null }>({ exists: false, schoolId: null });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Initialize form
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      schoolName: "",
      schoolAddress: "",
      schoolType: "SMA",
    },
  });

  // Search for school when debounced query changes
  useEffect(() => {
    const searchSchool = async () => {
      if (debouncedSearchQuery.length < 3) {
        setSearchResults({ exists: false, schoolId: null });
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/schools/check?name=${encodeURIComponent(debouncedSearchQuery)}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error checking school:", error);
      } finally {
        setIsSearching(false);
      }
    };

    searchSchool();
  }, [debouncedSearchQuery]);

  // Handle form submission
  const onSubmit = async (values: SchoolFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/schools/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Terjadi kesalahan");
      }

      toast.success("Berhasil!", {
        description: "Informasi sekolah telah disimpan"
      });

      // Redirect to dashboard
      console.log("Redirecting to dashboard after creating school...");
      router.refresh(); // Refresh router state
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating school:", error);
      toast.error("Gagal menyimpan informasi sekolah", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting existing school
  const handleSelectExistingSchool = async () => {
    if (!selectedSchoolId) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/users/update-school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schoolId: selectedSchoolId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Terjadi kesalahan");
      }

      toast.success("Berhasil!", {
        description: "Sekolah telah dipilih"
      });

      // Redirect to dashboard
      console.log("Redirecting to dashboard after selecting school...");
      router.refresh(); // Refresh router state
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating school:", error);
      toast.error("Gagal memilih sekolah", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Selamat Datang, Guru!</CardTitle>
          <CardDescription>
            Sebelum melanjutkan, kami perlu informasi tentang sekolah Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Cari Sekolah Anda</h3>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Ketik nama sekolah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-muted-foreground" />
                  ) : (
                    <Search className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />
                  )}
                </div>
              </div>

              {debouncedSearchQuery.length >= 3 && (
                <div className="mt-2">
                  {searchResults.exists ? (
                    <div className="p-4 border rounded-md bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <School className="h-5 w-5 text-primary" />
                          <span className="font-medium">{debouncedSearchQuery}</span>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedSchoolId(searchResults.schoolId);
                            handleSelectExistingSchool();
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            "Pilih Sekolah Ini"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      Sekolah tidak ditemukan. Silakan daftarkan sekolah baru di bawah.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Atau daftarkan sekolah baru
                </span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Sekolah</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama sekolah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Sekolah</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan alamat sekolah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Sekolah</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis sekolah" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SD">SD</SelectItem>
                          <SelectItem value="SMP">SMP</SelectItem>
                          <SelectItem value="SMA">SMA</SelectItem>
                          <SelectItem value="SMK">SMK</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan dan Lanjutkan"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
