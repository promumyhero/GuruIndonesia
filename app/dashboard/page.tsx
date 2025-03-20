import { getCurrentUser } from "../lib/auth";
import { AdminDashboard } from "./_components/admin-dashboard";
import { TeacherDashboard } from "./_components/teacher-dashboard";
import { ParentDashboard } from "./_components/parent-dashboard";
import { StudentDashboard } from "./_components/student-dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Get current date
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  const formattedDate = currentDate.toLocaleDateString('id-ID', options);
  
  // Render dashboard based on user role
  const renderDashboardContent = () => {
    switch (user.role) {
      case "ADMIN":
        return <AdminDashboard />;
      case "TEACHER":
        return <TeacherDashboard user={user} />;
      case "PARENT":
        return <ParentDashboard user={user} />;
      case "STUDENT":
        return <StudentDashboard user={user} />;
      default:
        return <div>Dashboard tidak tersedia untuk peran ini.</div>;
    }
  };
  
  return (
    <div className="container py-6 px-4 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Selamat datang, <span className="font-medium">{user.name}</span>
          {user.role && (
            <span className="ml-1">
              ({user.role === "ADMIN" ? "Administrator" : 
                user.role === "TEACHER" ? "Guru" : 
                user.role === "PARENT" ? "Orang Tua" : 
                user.role === "STUDENT" ? "Siswa" : user.role})
            </span>
          )}
        </p>
      </div>
      
      {renderDashboardContent()}
    </div>
  );
}
