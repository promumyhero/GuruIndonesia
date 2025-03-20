"use client";

import { useEffect, useState } from "react";

type UserRole = "ADMIN" | "TEACHER" | "PARENT" | "STUDENT";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch("/api/auth/me");
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();
  }, []);

  return user;
}
