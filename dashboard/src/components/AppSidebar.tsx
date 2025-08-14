import {
  Calendar,
  Home,
  Settings,
  MessageCircle,
  Handshake,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Admins",
    url: "/admins",
    icon: Settings,
  },
  {
    title: "Testimonials",
    url: "/testimonials",
    icon: MessageCircle,
  },
  {
    title: "Partners",
    url: "/partners",
    icon: Handshake,
  },
  {
    title: "Other Services",
    url: "/other-services",
    icon: Settings,
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <h1 className="text-2xl font-bold text-black">Hiyab Tutor</h1>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-10">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`text-xl py-6 ${
                      location.pathname === item.url
                        ? "bg-gray-700 text-white"
                        : ""
                    }`}
                  >
                    <NavLink to={item.url}>
                      <item.icon size={"40px"} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full flex text-xl"
                >
                  Logout
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
