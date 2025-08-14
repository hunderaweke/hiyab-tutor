import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Navbar } from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <main className="flex h-screen w-screen">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main section */}
        <div className="flex flex-1 flex-col">
          {/* Navbar with Sidebar Trigger inside */}
          <Navbar>
            <SidebarTrigger />
          </Navbar>

          {/* Content area */}
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
