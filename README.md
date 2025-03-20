# 🇮🇩 Guru Indonesia

![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

Aplikasi manajemen pendidikan komprehensif untuk guru di Indonesia. Dirancang untuk memudahkan guru dalam mengelola data siswa, mata pelajaran, penilaian, dan rapor dengan antarmuka yang modern dan responsif.

## ✨ Fitur Utama

- **Manajemen Siswa**: Tambah, edit, dan hapus data siswa dengan mudah
- **Manajemen Mata Pelajaran**: Kelola mata pelajaran yang diajarkan
- **Sistem Penilaian**: Catat dan kelola nilai siswa untuk berbagai jenis penilaian
- **Pembuatan Rapor**: Buat dan cetak rapor siswa dengan format yang profesional
- **Pemantauan Kemajuan**: Pantau perkembangan siswa dengan visualisasi data
- **Responsif**: Tampilan yang optimal di perangkat mobile, tablet, dan desktop
- **Autentikasi**: Sistem login yang aman untuk melindungi data

## 🚀 Teknologi

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL dengan Prisma ORM
- **Autentikasi**: JWT dengan bcrypt
- **UI Components**: Shadcn UI

## 📋 Prasyarat

- Node.js 18.0 atau lebih baru
- PostgreSQL
- npm atau yarn

## 🛠️ Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/promumyhero/GuruIndonesia.git
   cd GuruIndonesia
   ```

2. Instal dependensi:
   ```bash
   npm install
   # atau
   yarn install
   ```

3. Salin file `.env.example` ke `.env` dan isi dengan konfigurasi database:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/guruindonesia"
   JWT_SECRET="your-secret-key"
   ```

4. Jalankan migrasi database:
   ```bash
   npx prisma migrate dev
   ```

5. Jalankan server pengembangan:
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000) di browser Anda

## 📱 Tampilan Aplikasi

Aplikasi Guru Indonesia memiliki antarmuka yang modern dan responsif:

- **Dashboard**: Ringkasan data dan aktivitas terbaru
- **Halaman Siswa**: Tampilan kartu untuk mobile dan tabel untuk desktop
- **Halaman Mata Pelajaran**: Tampilan responsif dengan informasi lengkap
- **Halaman Penilaian**: Formulir penilaian yang mudah digunakan
- **Halaman Rapor**: Tampilan rapor yang profesional dengan opsi cetak

## 🤝 Kontribusi

Kontribusi selalu disambut baik! Silakan buat pull request atau buka issue untuk saran dan perbaikan.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

## 📞 Kontak

Untuk pertanyaan atau dukungan, silakan hubungi [ridho@guruindonesia.com](mailto:ridho@guruindonesia.com)

---

Dibuat dengan ❤️ untuk guru-guru Indonesia
