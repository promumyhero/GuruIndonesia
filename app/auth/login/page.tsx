import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
          <CardDescription>
            Masukkan email dan password Anda untuk mengakses akun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              Daftar
            </Link>
          </div>
          <div className="text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              Kembali ke beranda
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
