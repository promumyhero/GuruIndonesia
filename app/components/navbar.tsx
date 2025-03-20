import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "../lib/auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserMenu } from "./user-menu";
import { LogoutButton } from "./logout-button";
import { BookOpen, GraduationCap, Home, Menu, User, Users } from "lucide-react";

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
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>Dashboard</span>
              </Link>
              {/* Tampilkan menu berdasarkan peran */}
              {(user.role === "ADMIN" || user.role === "TEACHER") && (
                <>
                  <Link
                    href="/students"
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>Siswa</span>
                  </Link>
                  <Link
                    href="/subjects"
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>Mata Pelajaran</span>
                  </Link>
                  <Link
                    href="/assessments"
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>Penilaian</span>
                  </Link>
                  <Link
                    href="/report-cards"
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>Rapor</span>
                  </Link>
                </>
              )}
              {user.role === "PARENT" && (
                <>
                  <Link
                    href="/children"
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>Anak</span>
                  </Link>
                  <Link
                    href="/report-cards"
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>Rapor</span>
                  </Link>
                </>
              )}
              {user.role === "STUDENT" && (
                <>
                  <Link
                    href="/my-assessments"
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>Nilai</span>
                  </Link>
                  <Link
                    href="/my-report-cards"
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>Rapor</span>
                  </Link>
                </>
              )}
              <div className="flex items-center mr-8">
                <UserMenu user={user} />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>Masuk</span>
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
                  <div className="flex items-center gap-3 mb-6 p-2 rounded-md bg-muted/50">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted/50"
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted/50"
                  >
                    <User className="h-4 w-4" />
                    Profil Saya
                  </Link>

                  {/* Tampilkan menu berdasarkan peran */}
                  {(user.role === "ADMIN" || user.role === "TEACHER") && (
                    <>
                      <div className="h-px bg-border my-2" />
                      <Link
                        href="/students"
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted/50"
                      >
                        <Users className="h-4 w-4" />
                        Siswa
                      </Link>
                      <Link
                        href="/subjects"
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted/50"
                      >
                        <BookOpen className="h-4 w-4" />
                        Mata Pelajaran
                      </Link>
                      <Link
                        href="/assessments"
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted/50"
                      >
                        <BookOpen className="h-4 w-4" />
                        Penilaian
                      </Link>
                      <Link
                        href="/report-cards"
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted/50"
                      >
                        <GraduationCap className="h-4 w-4" />
                        Rapor
                      </Link>
                    </>
                  )}
                  {user.role === "PARENT" && (
                    <>
                      <div className="h-px bg-border my-2" />
                      <Link
                        href="/children"
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted/50"
                      >
                        <Users className="h-4 w-4" />
                        Anak
                      </Link>
                      <Link
                        href="/report-cards"
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted/50"
                      >
                        <GraduationCap className="h-4 w-4" />
                        Rapor
                      </Link>
                    </>
                  )}
                  {user.role === "STUDENT" && (
                    <>
                      <div className="h-px bg-border my-2" />
                      <Link
                        href="/my-assessments"
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted/50"
                      >
                        <BookOpen className="h-4 w-4" />
                        Nilai
                      </Link>
                      <Link
                        href="/my-report-cards"
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted/50"
                      >
                        <GraduationCap className="h-4 w-4" />
                        Rapor
                      </Link>
                    </>
                  )}

                  <div className="mt-6">
                    <LogoutButton
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center"
                    />
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
