'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Microscope, ChevronRight, Zap, Settings } from 'lucide-react';

type NavLink = {
  href: string;
  label: string;
  sectionId?: string;
};

const PAGE_LINKS: NavLink[] = [
  { href: '/analyze', label: 'Analyze' },
  { href: '/compare', label: 'Compare' },
  { href: '/docs', label: 'Docs' },
  { href: '/blog', label: 'Blog' },
];

const HOME_LINKS: NavLink[] = [
  { href: '#overview', label: 'Overview', sectionId: 'overview' },
  { href: '#workflow', label: 'Workflow', sectionId: 'workflow' },
  { href: '#features', label: 'Features', sectionId: 'features' },
  { href: '#demo', label: 'Demo', sectionId: 'demo' },
  { href: '#research', label: 'Research', sectionId: 'research' },
  { href: '#contact', label: 'Contact', sectionId: 'contact' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const pathname = usePathname();
  const isHome = pathname === '/';
  const visibleLinks = isHome ? HOME_LINKS : PAGE_LINKS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const sections = HOME_LINKS
      .map((link) => (link.sectionId ? document.getElementById(link.sectionId) : null))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-25% 0px -55% 0px',
        threshold: [0.15, 0.35, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isHome]);

  const isActiveLink = (href: string, sectionId?: string) => {
    if (isHome) return sectionId === activeSection;
    return Boolean(pathname?.startsWith(href));
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'backdrop-blur-md bg-bg-primary/85 border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-accent-green/10 border border-accent-green/30 flex items-center justify-center">
                  <Microscope className="w-4 h-4 text-accent-green" />
                </div>
                <div className="absolute inset-0 rounded-lg bg-accent-green/5 blur-sm group-hover:bg-accent-green/15 transition-all" />
              </div>
              <span
                className="font-mono font-bold text-base text-text-primary logo-glitch tracking-tight"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <span className="text-accent-green">SYSCALL</span>
                <span className="text-text-secondary">·</span>
                DETECTIVE
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {visibleLinks.map(link => {
                const active = isActiveLink(link.href, link.sectionId);

                return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-150 rounded-lg ${
                    active
                      ? 'text-accent-green bg-accent-green/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-accent-green rounded-full"
                    />
                  )}
                </Link>
                );
              })}
            </div>

            {/* CTA buttons */}
            <div className="hidden md:flex items-center gap-3">
              {!isHome && (
                <Link
                  href="/#overview"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  Back to Overview
                </Link>
              )}
              <Link
                href="/settings"
                className={`flex items-center gap-1.5 text-sm transition-colors px-3 py-2 rounded-lg border ${
                  pathname === '/settings'
                    ? 'text-accent-green bg-accent-green/10 border-accent-green/30'
                    : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Link>
              <Link
                href="/analyze"
                className="flex items-center gap-1.5 px-4 py-2 bg-accent-green text-bg-primary font-semibold text-sm rounded-lg hover:bg-accent-green/90 transition-all pulse-green-btn"
              >
                <Zap className="w-3.5 h-3.5" />
                Launch App
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-bg-primary/95 backdrop-blur-lg" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-64 bg-bg-secondary border-l border-white/10 p-6 flex flex-col gap-2"
            >
              <div className="h-16 flex items-center">
                <span className="font-mono font-bold text-accent-green">SYSCALL DETECTIVE</span>
              </div>
              {visibleLinks.map((link, i) => {
                const active = isActiveLink(link.href, link.sectionId);

                return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
                );
              })}
              <div className="mt-auto">
                {!isHome && (
                  <Link
                    href="/#overview"
                    onClick={() => setMobileOpen(false)}
                    className="mb-3 flex items-center justify-center gap-2 w-full px-4 py-3 border border-white/10 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5"
                  >
                    Back to Overview
                  </Link>
                )}
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className={`mb-3 flex items-center justify-center gap-2 w-full px-4 py-3 border rounded-lg text-sm font-semibold ${
                    pathname === '/settings'
                      ? 'border-accent-green/30 bg-accent-green/10 text-accent-green'
                      : 'border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link
                  href="/analyze"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-accent-green text-bg-primary font-semibold text-sm rounded-lg"
                >
                  <Zap className="w-4 h-4" />
                  Launch App →
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
