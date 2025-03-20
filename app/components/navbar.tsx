import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "../lib/auth";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <span className="text-xl font-bold text-primary ml-4">
            Guru Indonesia
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/students"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Siswa
              </Link>
              <Link
                href="/subjects"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Mata Pelajaran
              </Link>
              <Link
                href="/assessments"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Penilaian
              </Link>
              <Link
                href="/report-cards"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Rapor
              </Link>
              <div className="ml-2 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <form action="/api/auth/logout" method="POST">
                  <Button variant="outline" size="sm" type="submit">
                    Keluar
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Masuk
              </Link>
              <Button asChild size="sm">
                <Link href="/auth/register">Daftar</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px]">
            <nav className="flex flex-col gap-4 mt-8">
              {user ? (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/students"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Siswa
                  </Link>
                  <Link
                    href="/subjects"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Mata Pelajaran
                  </Link>
                  <Link
                    href="/assessments"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Penilaian
                  </Link>
                  <Link
                    href="/report-cards"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Rapor
                  </Link>
                  <div className="mt-4">
                    <form action="/api/auth/logout" method="POST">
                      <Button
                        variant="outline"
                        size="sm"
                        type="submit"
                        className="w-full"
                      >
                        Keluar
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Masuk
                  </Link>
                  <Button asChild size="sm" className="mt-2">
                    <Link href="/auth/register">Daftar</Link>
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
