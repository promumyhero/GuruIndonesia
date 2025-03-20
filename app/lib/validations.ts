import { z } from "zod";

// Auth validations
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "TEACHER"]),
});

// Student validations
export const studentSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  nisn: z.string().min(10, "NISN minimal 10 karakter").max(10, "NISN maksimal 10 karakter"),
  class: z.string().min(1, "Kelas tidak boleh kosong"),
});

// Subject validations
export const subjectSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  code: z.string().min(2, "Kode minimal 2 karakter"),
});

// Assessment validations
export const assessmentSchema = z.object({
  studentId: z.string().uuid("ID Siswa tidak valid"),
  subjectId: z.string().uuid("ID Mata Pelajaran tidak valid"),
  value: z.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100"),
  type: z.enum(["WEEKLY", "DAILY", "MIDTERM", "FINAL"]),
  semester: z.number().int().min(1, "Semester minimal 1").max(2, "Semester maksimal 2"),
  academicYear: z.string().min(9, "Tahun akademik tidak valid"),
});

// Report Card validations
export const reportCardSchema = z.object({
  studentId: z.string().uuid("ID Siswa tidak valid"),
  semester: z.number().int().min(1, "Semester minimal 1").max(2, "Semester maksimal 2"),
  academicYear: z.string().min(9, "Tahun akademik tidak valid"),
  finalGrade: z.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  assessmentIds: z.array(z.string().uuid("ID Penilaian tidak valid")),
});
