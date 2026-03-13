"use client";

import Link from "next/link";
import { LogIn, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="bg-primary text-white py-3 px-6 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5 overflow-hidden">
          <BookOpen className="w-full h-full text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-wide">NEU Library</h1>
          <p className="text-xs text-white/80">Visitor Log</p>
        </div>
      </div>

      {!isAdmin && (
        <Link href="/admin/login">
          <Button variant="outline" size="sm" className="bg-transparent border-white/50 text-white hover:bg-white/10 gap-2 rounded-full px-4">
            <LogIn className="w-3.5 h-3.5" />
            ADMIN LOG
          </Button>
        </Link>
      )}
      
      {isAdmin && pathname !== "/admin/login" && (
        <Link href="/">
          <Button variant="outline" size="sm" className="bg-transparent border-white/50 text-white hover:bg-white/10 gap-2 rounded-full px-4">
            VISITOR PORTAL
          </Button>
        </Link>
      )}
    </header>
  );
}