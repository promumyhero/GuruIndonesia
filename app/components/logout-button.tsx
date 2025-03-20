"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LogoutButton({ 
  variant = "default", 
  size = "default",
  className = ""
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Terjadi kesalahan saat logout");
      }

      toast.success("Logout berhasil");
      
      // Hard redirect ke halaman login
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat logout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLogout} 
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        "Memproses..."
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </>
      )}
    </Button>
  );
}
