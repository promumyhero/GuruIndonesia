import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function calculateGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
}

export function getAcademicYears(startYear: number = 2020, endYear: number = new Date().getFullYear() + 1): string[] {
  const years: string[] = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(`${year}/${year + 1}`);
  }
  return years;
}

export function getSemesters(): number[] {
  return [1, 2];
}

export function getAssessmentTypes(): string[] {
  return ["WEEKLY", "DAILY", "MIDTERM", "FINAL"];
}

export function getAssessmentTypeLabel(type: string): string {
  switch (type) {
    case "WEEKLY":
      return "Mingguan";
    case "DAILY":
      return "Harian";
    case "MIDTERM":
      return "Tengah Semester";
    case "FINAL":
      return "Akhir Semester";
    default:
      return type;
  }
}
