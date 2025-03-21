import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  return ["WEEKLY", "DAILY", "MIDTERM", "FINAL", "HOMEWORK", "DAILY_TEST"];
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
    case "HOMEWORK":
      return "Tugas";
    case "DAILY_TEST":
      return "Ulangan Harian";
    default:
      return type;
  }
}

export function generateReportDescription(studentName: string, grade: string, score: number): string {
  const gradeDescriptions: Record<string, string[]> = {
    A: [
      "sangat baik dalam memahami dan menerapkan konsep",
      "menunjukkan kemampuan analisis yang sangat baik",
      "memiliki keterampilan pemecahan masalah yang sangat baik",
    ],
    B: [
      "baik dalam memahami dan menerapkan konsep",
      "menunjukkan kemampuan analisis yang baik",
      "memiliki keterampilan pemecahan masalah yang baik",
    ],
    C: [
      "cukup dalam memahami dan menerapkan konsep",
      "menunjukkan kemampuan analisis yang cukup",
      "memiliki keterampilan pemecahan masalah yang cukup",
    ],
    D: [
      "kurang dalam memahami dan menerapkan konsep",
      "menunjukkan kemampuan analisis yang kurang",
      "memiliki keterampilan pemecahan masalah yang kurang",
    ],
    E: [
      "sangat kurang dalam memahami dan menerapkan konsep",
      "menunjukkan kemampuan analisis yang sangat kurang",
      "memiliki keterampilan pemecahan masalah yang sangat kurang",
    ],
  };

  const randomDescription = gradeDescriptions[grade][Math.floor(Math.random() * gradeDescriptions[grade].length)];
  
  return `${studentName} ${randomDescription}. Nilai akhir yang diperoleh adalah ${score}.`;
}
