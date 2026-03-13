
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
    <header className="bg-[#004D40] text-white py-4 px-6 md:px-10 flex items-center justify-between h-20 shadow-md z-50 sticky top-0">
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
          {logo && (
            <Image 
              src={logo.imageUrl} 
              alt="NEU Logo" 
              width={56} 
              height={56}
              className="object-contain p-1"
              data-ai-hint={logo.imageHint}
            />
          )}
        </div>
        <div className="flex flex-col -space-y-1">
          <h1 className="font-bold text-xl md:text-2xl tracking-tight text-[#FFD600] uppercase">NEU Library</h1>
          <p className="text-sm font-medium text-white/90">Visitor Log</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isAdminPath && (
          <Link href="/admin/login">
            <Button variant="outline" className="bg-[#3D5C4E] border-none text-white hover:bg-[#324B40] gap-2 rounded-full px-6 font-bold uppercase text-[10px] tracking-widest h-10 shadow-md">
              <UserCircle className="w-4 h-4" />
              ADMIN LOG
            </Button>
          </Link>
        )}
        
        {isAdminPath && (
          <Link href="/">
            <Button variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] rounded-full h-10 px-6">
              VISITOR PORTAL
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
