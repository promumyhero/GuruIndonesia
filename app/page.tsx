import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Guru <span className="text-blue-600">Indonesia</span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-600">
          Sistem manajemen rapor untuk membantu guru membuat dan mengelola rapor siswa dengan mudah dan efisien.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/auth/login">Masuk</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/register">Daftar</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-bold">Kelola Siswa</h3>
            <p className="text-gray-600">
              Tambah, edit, dan kelola data siswa dengan mudah.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-bold">Penilaian</h3>
            <p className="text-gray-600">
              Catat dan kelola nilai siswa untuk berbagai jenis penilaian.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-bold">Rapor Digital</h3>
            <p className="text-gray-600">
              Buat dan unduh rapor siswa dalam format digital.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
