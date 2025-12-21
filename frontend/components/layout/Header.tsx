"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Members", href: "/members" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/blog" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 gpu-accelerated-blur",
      scrolled 
        ? "bg-background/80 backdrop-blur-md border-b border-border/50" 
        : "bg-transparent"
    )}>
      {/* Only subtle bottom border for separation */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative" style={{ background: 'transparent' }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-600 font-bold tracking-tight text-lg">
            Nangman Infra
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                    transition={{ type: "spring", duration: 0.6 }}
                  />
                )}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link href="https://github.com/nangman-infra" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-5 h-5" />
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="hidden md:flex border-primary/20 hover:bg-primary/10 text-primary">
              Contact
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-16 left-0 right-0"
        >
          <div className="gpu-accelerated-blur bg-background/95 backdrop-blur-md border-b border-border/50">
            <nav className="flex flex-col py-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 text-base font-medium transition-colors",
                      isActive 
                        ? "text-primary bg-primary/10 border-l-2 border-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="px-4 py-3 border-t border-border/50 mt-2">
                <Link
                  href="https://github.com/nangman-infra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </Link>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
}
