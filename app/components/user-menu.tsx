"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "./logout-button";
import { BookOpen, GraduationCap, Home, Settings, User, Users } from "lucide-react";

interface UserMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  // Dapatkan inisial dari nama pengguna untuk avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Dapatkan label peran yang lebih user-friendly
  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      ADMIN: "Administrator",
      TEACHER: "Guru",
      PARENT: "Orang Tua",
      STUDENT: "Siswa",
    };
    return roleMap[role] || role;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <span className="mt-1 inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
              {getRoleLabel(user.role)}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex w-full items-center cursor-pointer">
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex w-full items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profil Saya</span>
            </Link>
          </DropdownMenuItem>
          
          {/* Menu berdasarkan role */}
          {(user.role === "ADMIN" || user.role === "TEACHER") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/students" className="flex w-full items-center cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Siswa</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/assessments" className="flex w-full items-center cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Penilaian</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/report-cards" className="flex w-full items-center cursor-pointer">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <span>Rapor</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          
          {user.role === "PARENT" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/children" className="flex w-full items-center cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Anak</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/report-cards" className="flex w-full items-center cursor-pointer">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <span>Rapor</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          
          {user.role === "STUDENT" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/my-assessments" className="flex w-full items-center cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Nilai</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/my-report-cards" className="flex w-full items-center cursor-pointer">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <span>Rapor</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          
          {user.role === "ADMIN" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex w-full items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutButton
            variant="ghost"
            className="w-full justify-start px-2 py-1.5 h-auto font-normal cursor-pointer flex items-center text-sm"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
