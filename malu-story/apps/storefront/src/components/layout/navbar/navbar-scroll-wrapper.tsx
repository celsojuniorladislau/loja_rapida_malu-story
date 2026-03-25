'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function NavbarScrollWrapper({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-150 ease-functional',
        scrolled ? 'shadow-heavy' : '',
      )}
    >
      {children}
    </header>
  );
}
