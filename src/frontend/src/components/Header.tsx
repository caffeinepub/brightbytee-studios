import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { Lock, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const navLinks = [
  { to: "/templates", label: "Templates" },
  { to: "/free", label: "Free Stuff" },
  { to: "/announcements", label: "Announcements" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const state = useRouterState();
  const pathname = state.location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(11,18,32,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28">
          <Link
            to="/"
            className="flex items-center gap-2"
            data-ocid="header.link"
          >
            <img
              src="/assets/new_logo_of_brightbytee_studios-019d435d-9ebc-760c-ad60-32542a761ba0.jpeg"
              alt="BrightBytee Studios"
              className="h-24 w-auto object-contain rounded"
              style={{ filter: "drop-shadow(0 0 12px rgba(139,92,255,0.4))" }}
            />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={`nav.${link.label.toLowerCase().replace(" ", "_")}.link`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === link.to ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/admin" data-ocid="header.admin.button">
              <Button
                size="sm"
                variant="outline"
                className="hidden md:flex items-center gap-2 border-white/10 hover:border-primary/50"
              >
                <Lock className="w-4 h-4" /> Admin
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              data-ocid="header.menu.toggle"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{
              background: "rgba(11,18,32,0.98)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${pathname === link.to ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/admin" onClick={() => setMenuOpen(false)}>
                <Button
                  size="sm"
                  className="w-full btn-gradient text-white border-0 mt-2"
                >
                  <Lock className="w-4 h-4 mr-2" /> Admin
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
