import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  items: {
    label: string;
    href: string;
  }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4 mr-1" />
        <span>Dashboard</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link
            href={item.href}
            className={`hover:text-primary transition-colors ${
              index === items.length - 1 ? "font-medium text-foreground" : ""
            }`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
