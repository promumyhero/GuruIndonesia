"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/app/lib/validations";
import { toast } from "sonner";
import Link from "next/link";

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      console.log("Submitting login data:", data);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Login response:", response.status, result);

      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan saat login");
      }

      toast.success("Login berhasil");
      console.log("Redirecting to dashboard...");
      
      // Set login success state
      setLoginSuccess(true);
      
      // Gunakan window.location untuk hard redirect
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {loginSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Login berhasil! Mengalihkan ke dashboard...</p>
          <p className="mt-2">
            Jika Anda tidak dialihkan secara otomatis, silakan klik{" "}
            <Link href="/dashboard" className="text-blue-500 underline">
              di sini
            </Link>
          </p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="nama@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </Form>
    </>
  );
}
