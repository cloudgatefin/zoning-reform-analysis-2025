"use client";

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

export default function MobileNavigation() {
  const pathname = usePathname();

  // Only show bottom nav on app pages, not on landing page
  const showBottomNav = pathname !== '/';

  if (!showBottomNav) {
    return null;
  }

  return <BottomNav />;
}
