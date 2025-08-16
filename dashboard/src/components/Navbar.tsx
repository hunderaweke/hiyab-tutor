import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

type NavbarProps = {
  children?: React.ReactNode; // for SidebarTrigger or other items
};

export function Navbar({ children }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="border-b bg-white w-full">
      <div className="w-full justify-between flex h-16 items-center px-auto relative">
        {/* Left side: Sidebar trigger + Logo */}
        <div className="flex items-center gap-2">
          {children}
          <div className="text-xl font-bold">Hiyab Tutor</div>
        </div>

        {/* Desktop Menu */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/" className="px-4 py-2">
                Dashboard
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/tutors" className="px-4 py-2">
                Tutors
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/bookings" className="px-4 py-2">
                Bookings
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/testimonials" className="px-4 py-2">
                Testimonials
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/partners" className="px-4 py-2">
                Partners
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/contact" className="px-4 py-2">
                Contact
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Dropdown Menu */}
        <div className="md:hidden relative">
          <Button
            variant="default"
            size="icon"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          {mobileMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg z-50">
              <nav className="flex flex-col gap-2 p-2">
                <a
                  href="/"
                  className="text-lg py-2 px-4 rounded hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="/about"
                  className="text-lg py-2 px-4 rounded hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="/contact"
                  className="text-lg py-2 px-4 rounded hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
