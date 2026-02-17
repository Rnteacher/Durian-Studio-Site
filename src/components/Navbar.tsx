"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "בית" },
    { href: "/students", label: "החניכים שלנו" },
    { href: "/about", label: "אודות" },
    { href: "/contact", label: "יצירת קשר" },
  ];


  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-rubik text-2xl font-bold text-heading">
          <img alt="סטודיו דוריאן" className="h-10 w-auto mix-blend-multiply" src="/lovable-uploads/7dd05dcf-56df-4ab1-9241-faba25333bc7.jpg" />
          סטודיו דוריאן
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) =>
          <Link
            key={link.href}
            href={link.href}
            className={`font-medium transition-colors hover:text-primary ${
            pathname === link.href ? "text-primary" : "text-foreground"}`
            }>

              {link.label}
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}>

          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {isOpen &&
      <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-3 animate-fade-in">
          {links.map((link) =>
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setIsOpen(false)}
          className={`font-medium py-2 transition-colors ${
          pathname === link.href ? "text-primary" : "text-foreground"}`
          }>

              {link.label}
            </Link>
        )}
        </div>
      }
    </nav>
  );
};

export default Navbar;
