import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/servizi", label: "Servizi" },
  { to: "/case-studies", label: "Case Studies" },
  { to: "/chi-siamo", label: "Chi Siamo" },
  { to: "/contatti", label: "Contatti" }
];

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[9000] transition-all duration-300 ${
          scrolled ? "py-3 glass-strong" : "py-6 bg-transparent"
        }`}
        data-testid="site-nav"
      >
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                data-testid={`nav-link-${l.to.replace(/\//g, "-")}`}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-[11px] font-mono uppercase tracking-[0.24em] transition-colors ${
                    isActive ? "text-white" : "text-neutral-400 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{l.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
            <Link
              to="/contatti"
              data-testid="nav-cta-contact"
              className="ml-4 px-5 py-3 bg-white text-black font-display font-bold uppercase tracking-[0.18em] text-xs hover:bg-violet-500 hover:text-white transition-colors"
            >
              Lavoriamo insieme
            </Link>
          </nav>
          <button
            type="button"
            className="md:hidden p-2 text-white"
            aria-label="Open menu"
            data-testid="nav-mobile-toggle"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9500] bg-black"
            data-testid="mobile-menu"
          >
            <div className="absolute top-6 left-5 right-5 flex items-center justify-between">
              <Logo size="md" />
              <button
                type="button"
                className="p-2 text-white"
                aria-label="Close menu"
                data-testid="nav-mobile-close"
                onClick={() => setOpen(false)}
              >
                <X size={22} />
              </button>
            </div>
            <nav className="h-full w-full flex flex-col items-start justify-center gap-6 px-8">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.2, 0.6, 0.2, 1] }}
                >
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    data-testid={`mobile-link-${l.to.replace(/\//g, "-")}`}
                    className="font-display text-5xl font-black uppercase tracking-tight text-white hover:text-violet-500 transition-colors"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8 text-xs font-mono uppercase tracking-[0.24em] text-neutral-500">
                Cattolica · IT
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
