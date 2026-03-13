"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const logo = PlaceHolderImages.find(img => img.id === "neu-logo");

  return (
    <header className="bg-[#004D40] text-white py-4 px-10 flex items-center justify-between border-b-4 border-[#FFD600]">
      <div className="flex items-center gap-5">
        <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
          {logo && (
            <Image 
              src={logo.imageUrl} 
              alt="NEU Logo" 
              width={64} 
              height={64}
              className="object-contain p-1"
              data-ai-hint={logo.imageHint}
            />
          )}
        </div>
        <div className="space-y-0.5">
          <h1 className="font-bold text-3xl tracking-wide text-[#FFD600]">NEU Library</h1>
          <p className="text-lg font-medium text-white/90 uppercase tracking-widest">Visitor Log</p>
        </div>
      </div>

      {!isAdmin && (
        <Link href="/admin/login">
          <Button variant="outline" className="bg-transparent border-white/50 text-white hover:bg-white/10 gap-2 rounded-full px-6 font-bold uppercase text-xs tracking-widest h-10 shadow-sm transition-all">
            <LogIn className="w-4 h-4" />
            ADMIN ACCESS
          </Button>
        </Link>
      )}
      
      {isAdmin && pathname !== "/admin/login" && (
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs">
              VISITOR PORTAL
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}