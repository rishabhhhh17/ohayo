'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart/store';
import { BlendStartLogo } from '@/components/storefront/blendstart-logo';

const NAV_LINKS = [
  { label: 'Shop', href: '/products' },
  { label: 'Why BlendStart', href: '/#brand-story' },
  { label: 'Nutrition', href: '/#nutrition' },
  { label: 'About', href: '/about' },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = useCartStore((state) => state.count());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-cream/85 backdrop-blur-md border-b border-cocoa/10 shadow-soft'
            : 'bg-transparent border-b border-transparent',
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 text-2xl tracking-tight transition-opacity hover:opacity-80"
            aria-label="BlendStart — home"
          >
            <BlendStartLogo className="text-2xl sm:text-3xl" />
          </Link>

          <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-cocoa/75 transition-colors hover:text-cocoa"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/account"
              aria-label="Account"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-cocoa/75 transition-colors hover:bg-rose/30 hover:text-cocoa sm:flex"
            >
              <User size={20} aria-hidden="true" />
            </Link>

            <Link
              href="/cart"
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-cocoa/75 transition-colors hover:bg-rose/30 hover:text-cocoa"
            >
              <ShoppingBag size={20} aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-sun px-1 text-[10px] font-bold text-cream"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/products"
              className="ml-2 hidden rounded-full bg-cocoa px-5 py-2 text-xs font-bold uppercase tracking-wider text-cream transition-colors hover:bg-cocoa/90 lg:inline-block"
            >
              Shop
            </Link>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-cocoa/75 transition-colors hover:bg-rose/30 hover:text-cocoa md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-nav"
        aria-hidden={!menuOpen}
        className={cn(
          'fixed inset-0 z-30 flex flex-col bg-cream pt-16 md:hidden transition-transform duration-300 ease-in-out',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-6 py-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-cocoa/15 py-4 font-display text-3xl tracking-tight text-cocoa transition-colors hover:text-sun"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 pt-4 text-sm text-cocoa/60">
          <Link href="/account" onClick={() => setMenuOpen(false)} className="hover:underline">
            My account
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-20 bg-cocoa/30 md:hidden"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
