import { Navbar } from "../components/navbar";
import { SidebarWrapper } from "../components/sidebar-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <SidebarWrapper />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
