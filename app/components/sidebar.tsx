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
  Settings 
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
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
