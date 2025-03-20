"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  UsersRound, 
  BookOpen, 
  ClipboardList, 
  FileText, 
  Settings,
  GraduationCap,
  School,
  Users,
  Bell
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const userRole = user?.role || "";

  // Routes for ADMIN and TEACHER
  const adminTeacherRoutes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Siswa",
      icon: UsersRound,
      href: "/students",
      active: pathname.startsWith("/students"),
    },
    {
      label: "Mata Pelajaran",
      icon: BookOpen,
      href: "/subjects",
      active: pathname.startsWith("/subjects"),
    },
    {
      label: "Penilaian",
      icon: ClipboardList,
      href: "/assessments",
      active: pathname.startsWith("/assessments"),
    },
    {
      label: "Rapor",
      icon: FileText,
      href: "/report-cards",
      active: pathname.startsWith("/report-cards"),
    },
    {
      label: "Pengaturan",
      icon: Settings,
      href: "/settings",
      active: pathname.startsWith("/settings"),
    },
  ];

  // Routes for PARENT
  const parentRoutes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Anak Saya",
      icon: GraduationCap,
      href: "/children",
      active: pathname.startsWith("/children"),
    },
    {
      label: "Nilai Anak",
      icon: ClipboardList,
      href: "/children/assessments",
      active: pathname.startsWith("/children/assessments"),
    },
    {
      label: "Rapor Anak",
      icon: FileText,
      href: "/children/report-cards",
      active: pathname.startsWith("/children/report-cards"),
    },
    {
      label: "Notifikasi",
      icon: Bell,
      href: "/notifications",
      active: pathname.startsWith("/notifications"),
    },
    {
      label: "Pengaturan",
      icon: Settings,
      href: "/settings",
      active: pathname.startsWith("/settings"),
    },
  ];

  // Routes for STUDENT
  const studentRoutes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Nilai Saya",
      icon: ClipboardList,
      href: "/my-assessments",
      active: pathname.startsWith("/my-assessments"),
    },
    {
      label: "Rapor Saya",
      icon: FileText,
      href: "/my-report-cards",
      active: pathname.startsWith("/my-report-cards"),
    },
    {
      label: "Mata Pelajaran",
      icon: BookOpen,
      href: "/my-subjects",
      active: pathname.startsWith("/my-subjects"),
    },
    {
      label: "Notifikasi",
      icon: Bell,
      href: "/notifications",
      active: pathname.startsWith("/notifications"),
    },
    {
      label: "Pengaturan",
      icon: Settings,
      href: "/settings",
      active: pathname.startsWith("/settings"),
    },
  ];

  // Select routes based on user role
  const routes = userRole === "ADMIN" || userRole === "TEACHER" 
    ? adminTeacherRoutes 
    : userRole === "PARENT" 
      ? parentRoutes 
      : studentRoutes;

  return (
    <div className={cn("py-4", className)} {...props}>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Menu Utama
        </h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                route.active ? 
                  "bg-primary/10 text-primary" : 
                  "text-muted-foreground hover:bg-accent"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
