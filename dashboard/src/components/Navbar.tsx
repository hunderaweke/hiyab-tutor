import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  // NavigationMenuLink removed (unused)
} from "@/components/ui/navigation-menu";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

type NavbarProps = {
  children?: React.ReactNode; // for SidebarTrigger or other items
};

export function Navbar({ children }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm w-full text-white">
      <div className="w-full justify-between flex h-16 items-center px-4 md:px-6 relative">
        {/* Left side: Sidebar trigger + Logo */}
        <div className="flex items-center gap-2">
          {children}
          <div className="text-xl font-bold">Hyab Tutor</div>
        </div>

        {/* Desktop Menu */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/10 text-[var(--color-brand-green)]"
                      : "text-white hover:text-[var(--color-brand-green)]"
                  }`
                }
              >
                Dashboard
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink
                to="/tutors"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/10 text-[var(--color-brand-green)]"
                      : "text-white hover:text-[var(--color-brand-green)]"
                  }`
                }
              >
                Tutors
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink
                to="/bookings"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/10 text-[var(--color-brand-green)]"
                      : "text-white hover:text-[var(--color-brand-green)]"
                  }`
                }
              >
                Bookings
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink
                to="/testimonials"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/10 text-[var(--color-brand-green)]"
                      : "text-white hover:text-[var(--color-brand-green)]"
                  }`
                }
              >
                Testimonials
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink
                to="/partners"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/10 text-[var(--color-brand-green)]"
                      : "text-white hover:text-[var(--color-brand-green)]"
                  }`
                }
              >
                Partners
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink
                to="/other-services"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/10 text-[var(--color-brand-green)]"
                      : "text-white hover:text-[var(--color-brand-green)]"
                  }`
                }
              >
                Other Services
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Dropdown Menu */}
        <div className="md:hidden relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Menu className="h-6 w-6" />
          </Button>
          {mobileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white/10 backdrop-blur border border-white/20 shadow-lg z-50">
              <nav className="flex flex-col gap-1 p-2">
                {[
                  { to: "/", label: "Dashboard" },
                  { to: "/tutors", label: "Tutors" },
                  { to: "/bookings", label: "Bookings" },
                  { to: "/testimonials", label: "Testimonials" },
                  { to: "/partners", label: "Partners" },
                  { to: "/other-services", label: "Other Services" },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `py-2 px-4 rounded-lg ${
                        isActive
                          ? "bg-white/20 text-[var(--color-brand-green)]"
                          : "text-white hover:bg-white/10"
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
