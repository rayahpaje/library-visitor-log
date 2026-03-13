'use client';

import Link from "next/link";
import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function SiteHeader() {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith("/admin");
  const logo = PlaceHolderImages.find(img => img.id === "neu-logo");

  return (
    <header className="bg-[#004D40] text-white py-4 px-6 md:px-10 flex items-center justify-between h-20 shadow-md">
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border border-white shadow-sm">
          {logo && (
            <Image 
              src={logo.imageUrl} 
              alt="NEU Logo" 
              width={48} 
              height={48}
              className="object-contain p-1"
              data-ai-hint={logo.imageHint}
            />
          )}
        </div>
        <div className="flex flex-col -space-y-1">
          <h1 className="font-bold text-xl md:text-2xl tracking-tight text-[#FFD600]">NEU Library</h1>
          <p className="text-sm font-medium text-white">Visitor Log</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {pathname === "/" && (
          <Link href="/admin/login">
            <Button variant="outline" className="bg-[#3D5C4E] border-none text-white hover:bg-[#324B40] gap-2 rounded-full px-6 font-bold uppercase text-xs tracking-widest h-10">
              <UserCircle className="w-5 h-5" />
              ADMIN LOG
            </Button>
          </Link>
        )}
        
        {isAdminPath && (
          <Link href="/">
            <Button variant="outline" className="bg-transparent border-white/50 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs rounded-full h-10 px-4">
              VISITOR PORTAL
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
