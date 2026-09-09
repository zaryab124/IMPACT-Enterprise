"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImpactLogo } from "../brand/ImpactLogo";
import { Menu, X, ArrowRight, ChevronDown, Sparkles, Bot, Workflow, Code2, Layers, FolderKanban, Users } from "lucide-react";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSolutionsDropdownOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    {
      label: "Solutions",
      href: "/solutions",
      hasDropdown: true,
      children: [
        {
          label: "Solutions Overview",
          desc: "Full overview of our intelligent enterprise solutions",
          href: "/solutions",
          icon: Sparkles,
        },
        {
          label: "AI & Agents",
          desc: "Autonomous reasoning, voice, sales & support agents",
          href: "/solutions/ai-agents",
          icon: Bot,
        },
        {
          label: "Business Automation",
          desc: "Lead, CRM, and mission-critical workflow automation",
          href: "/solutions/automation",
          icon: Workflow,
        },
        {
          label: "Software & Applications",
          desc: "Custom web, mobile, SaaS, and enterprise platforms",
          href: "/solutions/software",
          icon: Code2,
        },
      ],
    },
    { label: "AI & Agents", href: "/solutions/ai-agents" },
    { label: "Automation", href: "/solutions/automation" },
    { label: "Products", href: "/products" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-brand-border shadow-card"
          : "bg-[#FAF9F6] border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center">
            <ImpactLogo size="md" showTagline={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              if (link.hasDropdown) {
                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setSolutionsDropdownOpen(true)}
                    onMouseLeave={() => setSolutionsDropdownOpen(false)}
                  >
                    <button
                      type="button"
                      aria-expanded={solutionsDropdownOpen}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        pathname.startsWith("/solutions")
                          ? "text-brand-accent bg-brand-accentSoft/60"
                          : "text-brand-text hover:text-brand-accent hover:bg-brand-surface"
                      }`}
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-150 ${
                          solutionsDropdownOpen ? "rotate-180 text-brand-accent" : "text-brand-muted"
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {solutionsDropdownOpen && (
                      <div className="absolute left-0 top-full pt-2 w-80 shadow-cardHover animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="bg-white border border-brand-border rounded-xl p-2 shadow-elevated">
                          {link.children?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                                  isSubActive
                                    ? "bg-brand-accentSoft text-brand-accent"
                                    : "hover:bg-brand-surface text-brand-text"
                                }`}
                              >
                                <div className="p-2 rounded-lg bg-brand-surface text-brand-accent mt-0.5">
                                  <SubIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold leading-tight">{subItem.label}</div>
                                  <div className="text-xs text-brand-muted mt-0.5 line-clamp-1">{subItem.desc}</div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive
                      ? "text-brand-accent bg-brand-accentSoft/60"
                      : "text-brand-text hover:text-brand-accent hover:bg-brand-surface"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/contact"
              className="px-4 py-2.5 text-xs xl:text-sm font-semibold text-brand-text hover:text-brand-accent border border-brand-border hover:border-brand-accent/40 rounded-lg transition-all bg-white hover:bg-brand-surface"
            >
              TALK TO IMPACT
            </Link>
            <Link
              href="/start-a-project"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs xl:text-sm font-bold text-white bg-brand-accent hover:bg-brand-accentHover rounded-lg shadow-sm hover:shadow-cardHover transition-all"
            >
              <span>START A PROJECT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/start-a-project"
              className="px-3 py-2 text-xs font-bold text-white bg-brand-accent rounded-lg sm:hidden"
            >
              START
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-text hover:bg-brand-surface border border-brand-border"
              aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-brand-border bg-white shadow-elevated px-4 pt-3 pb-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                pathname === "/" ? "bg-brand-accentSoft text-brand-accent" : "text-brand-text hover:bg-brand-surface"
              }`}
            >
              Home
            </Link>
            <div className="py-2 px-3">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">Solutions</div>
              <div className="space-y-1 pl-2 border-l-2 border-brand-border">
                <Link
                  href="/solutions"
                  className={`block py-1.5 text-sm font-medium ${
                    pathname === "/solutions" ? "text-brand-accent" : "text-brand-text"
                  }`}
                >
                  All Solutions
                </Link>
                <Link
                  href="/solutions/ai-agents"
                  className={`block py-1.5 text-sm font-medium ${
                    pathname === "/solutions/ai-agents" ? "text-brand-accent" : "text-brand-text"
                  }`}
                >
                  AI & Agents
                </Link>
                <Link
                  href="/solutions/automation"
                  className={`block py-1.5 text-sm font-medium ${
                    pathname === "/solutions/automation" ? "text-brand-accent" : "text-brand-text"
                  }`}
                >
                  Business Automation
                </Link>
                <Link
                  href="/solutions/software"
                  className={`block py-1.5 text-sm font-medium ${
                    pathname === "/solutions/software" ? "text-brand-accent" : "text-brand-text"
                  }`}
                >
                  Software & Applications
                </Link>
              </div>
            </div>
            <Link
              href="/products"
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                pathname === "/products" ? "bg-brand-accentSoft text-brand-accent" : "text-brand-text hover:bg-brand-surface"
              }`}
            >
              Products
            </Link>
            <Link
              href="/projects"
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                pathname.startsWith("/projects") ? "bg-brand-accentSoft text-brand-accent" : "text-brand-text hover:bg-brand-surface"
              }`}
            >
              Projects & Case Studies
            </Link>
            <Link
              href="/about"
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                pathname === "/about" ? "bg-brand-accentSoft text-brand-accent" : "text-brand-text hover:bg-brand-surface"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                pathname === "/contact" ? "bg-brand-accentSoft text-brand-accent" : "text-brand-text hover:bg-brand-surface"
              }`}
            >
              Contact
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-brand-border space-y-2">
            <Link
              href="/start-a-project"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-brand-accent text-white font-bold text-sm shadow-sm"
            >
              <span>START A PROJECT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-surface text-brand-text font-semibold text-sm hover:bg-brand-border"
            >
              TALK TO IMPACT
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
