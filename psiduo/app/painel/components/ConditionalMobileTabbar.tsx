"use client";

import { usePathname } from "next/navigation";
import { MobileTabbar } from "./MobileTabbar";

export function ConditionalMobileTabbar({ plano, slug, userId }: { plano: string; slug: string; userId?: string }) {
  const pathname = usePathname();
  
  // Hide MobileTabbar on patient detail pages
  const hideTabbar = pathname?.includes('/painel/pacientes/') && pathname?.match(/\/painel\/pacientes\/[^/]+$/);
  
  if (hideTabbar) return null;
  
  return <MobileTabbar plano={plano} slug={slug} userId={userId} />;
}
