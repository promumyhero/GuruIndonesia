import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Ekstrak ID dari params dengan await
    const params = await context.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "ID siswa tidak ditemukan" },
        { status: 400 }
      );
    }
    
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }
    
    // Cek apakah siswa ada dan milik guru tersebut
    const student = await prisma.student.findUnique({
      where: { id, teacherId: user.id },
    });
    
    if (!student) {
      return NextResponse.json(
        { error: "Siswa tidak ditemukan" },
        { status: 404 }
      );
    }
    
    // Ambil semua penilaian untuk siswa ini
    const assessments = await prisma.assessment.findMany({
      where: { 
        studentId: id,
        teacherId: user.id 
      },
      include: {
        subject: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });
    
    // Kelompokkan penilaian berdasarkan mata pelajaran
    const subjectGroups = assessments.reduce((groups, assessment) => {
      const subjectName = assessment.subject.name;
      
      if (!groups[subjectName]) {
        groups[subjectName] = [];
      }
      
      groups[subjectName].push({
        id: assessment.id,
        value: assessment.value,
        type: assessment.type,
        semester: assessment.semester,
        academicYear: assessment.academicYear,
        createdAt: assessment.createdAt,
        subjectId: assessment.subjectId,
        subjectName: assessment.subject.name,
        subjectCode: assessment.subject.code
      });
      
      return groups;
    }, {} as Record<string, any[]>);
    
    // Format data untuk chart
    const chartData = assessments.reduce((data, assessment) => {
      const date = new Date(assessment.createdAt);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Cari apakah sudah ada entri untuk bulan ini
      let monthEntry = data.find(entry => entry.date.startsWith(monthYear));
      
      if (!monthEntry) {
        monthEntry = {
          date: `${monthYear}-15`, // Tengah bulan sebagai representasi
          month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString('id-ID', { month: 'short' }),
        };
        data.push(monthEntry);
      }
      
      // Tambahkan nilai penilaian ke entri bulan
      if (!monthEntry[assessment.subject.name]) {
        monthEntry[assessment.subject.name] = 0;
        monthEntry[`${assessment.subject.name}Count`] = 0;
      }
      
      // Hitung rata-rata nilai per mata pelajaran per bulan
      monthEntry[assessment.subject.name] = 
        (monthEntry[assessment.subject.name] * monthEntry[`${assessment.subject.name}Count`] + assessment.value) / 
        (monthEntry[`${assessment.subject.name}Count`] + 1);
      
      monthEntry[`${assessment.subject.name}Count`]++;
      
      return data;
    }, [] as any[]);
    
    // Urutkan data berdasarkan tanggal
    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return NextResponse.json({
      student,
      subjectGroups,
      chartData
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data perkembangan" },
      { status: 500 }
    );
  }
}
