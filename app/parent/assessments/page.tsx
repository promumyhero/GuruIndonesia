"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import { formatDate } from "@/app/lib/utils";
import { ClipboardList, Search, Filter } from "lucide-react";
import { getAssessmentTypeLabel } from "@/app/lib/utils";

// Tipe data untuk penilaian
interface Assessment {
  id: string;
  value: number;
  type: string;
  semester: number;
  academicYear: string;
  assessmentDate: string;
  createdAt: string;
  subject: {
    name: string;
  };
  student: {
    name: string;
  };
}

export default function ParentAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [children, setChildren] = useState<{id: string, name: string}[]>([]);
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  // Ambil data anak dan penilaian
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Ambil data anak
        const childrenResponse = await fetch("/api/parent/children");
        if (!childrenResponse.ok) {
          throw new Error("Gagal mengambil data anak");
        }
        const childrenData = await childrenResponse.json();
        setChildren(childrenData);
        
        // Ambil data mata pelajaran
        const subjectsResponse = await fetch("/api/subjects");
        if (!subjectsResponse.ok) {
          throw new Error("Gagal mengambil data mata pelajaran");
        }
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData);
        
        // Ambil data penilaian
        const assessmentsResponse = await fetch("/api/parent/assessments");
        if (!assessmentsResponse.ok) {
          throw new Error("Gagal mengambil data penilaian");
        }
        const assessmentsData = await assessmentsResponse.json();
        setAssessments(assessmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Filter penilaian berdasarkan kriteria
  const filteredAssessments = assessments.filter((assessment) => {
    // Filter pencarian
    const searchMatch = 
      search === "" || 
      assessment.student.name.toLowerCase().includes(search.toLowerCase()) ||
      assessment.subject.name.toLowerCase().includes(search.toLowerCase());
    
    // Filter anak
    const childMatch = selectedChild === "all" || assessment.student.name === selectedChild;
    
    // Filter tipe
    const typeMatch = selectedType === "all" || assessment.type === selectedType;
    
    // Filter mata pelajaran
    const subjectMatch = selectedSubject === "all" || assessment.subject.name === selectedSubject;
    
    // Filter tanggal
    const dateMatch = 
      selectedDate === "" || 
      (assessment.assessmentDate && formatDate(new Date(assessment.assessmentDate)) === formatDate(new Date(selectedDate)));
    
    return searchMatch && childMatch && typeMatch && subjectMatch && dateMatch;
  });

  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb items={[{ label: "Penilaian Anak", href: "/parent/assessments" }]} />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Penilaian Anak</h1>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Penilaian</CardTitle>
          <CardDescription>Cari dan filter data penilaian anak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama anak atau mapel"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Anak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Anak</SelectItem>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.name}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipe Penilaian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="WEEKLY">Mingguan</SelectItem>
                  <SelectItem value="DAILY">Harian</SelectItem>
                  <SelectItem value="MIDTERM">Tengah Semester</SelectItem>
                  <SelectItem value="FINAL">Akhir Semester</SelectItem>
                  <SelectItem value="HOMEWORK">Tugas</SelectItem>
                  <SelectItem value="DAILY_TEST">Ulangan Harian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Mata Pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mapel</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="md:col-span-4 flex justify-end">
              <Button 
                onClick={() => {
                  setSearch("");
                  setSelectedChild("all");
                  setSelectedType("all");
                  setSelectedSubject("all");
                  setSelectedDate("");
                }}
                variant="outline" 
                className="mr-2"
              >
                Reset
              </Button>
              <Button className="w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-destructive/15 p-4 rounded-md text-center text-destructive">
          {error}
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Belum ada data penilaian</h3>
          <p className="text-muted-foreground mb-4">
            Belum ada penilaian yang tercatat untuk anak Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-primary/10 p-6 flex items-center justify-center md:w-1/4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{assessment.value}</div>
                      <div className="text-sm text-muted-foreground">Nilai</div>
                    </div>
                  </div>
                  <div className="p-6 md:w-3/4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{assessment.subject.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {assessment.student.name}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                        {getAssessmentTypeLabel(assessment.type)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                        Semester {assessment.semester}
                      </span>
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                        {assessment.academicYear}
                      </span>
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                        {assessment.assessmentDate ? formatDate(new Date(assessment.assessmentDate)) : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
