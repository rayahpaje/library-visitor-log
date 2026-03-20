'use client';

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useMemo, useState, useEffect } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const logo = PlaceHolderImages.find(img => img.id === "neu-logo");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userRole = useMemo(() => {
    if (!user) return null;
    if (user.email?.endsWith("@neu.edu.ph")) return "Library Staff";
    return "Student";
  }, [user]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been securely signed out." });
      router.push("/");
    } catch (error) {
      toast({ variant: "destructive", title: "Logout Error", description: "Failed to sign out." });
    }
  };

  return (
    <header className="bg-primary text-white py-4 px-6 md:px-10 flex items-center justify-between h-24 shadow-lg z-50 sticky top-0" suppressHydrationWarning>
      {/* Left Branding */}
      <div className="flex items-center gap-6">
        <Link href="/" className="relative w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-xl overflow-hidden transition-all hover:scale-105 group border-2 border-white/20">
          {logo && (
            <div className="relative w-12 h-12">
              <Image 
                src={logo.imageUrl} 
                alt="NEU Logo" 
                fill
                className="object-contain transition-transform group-hover:scale-110"
                data-ai-hint={logo.imageHint}
                priority
              />
            </div>
          )}
        </Link>
        <div className="flex flex-col -space-y-1">
          <h1 className="font-black text-2xl md:text-3xl tracking-tight text-accent uppercase">NEU Library</h1>
          <p className="text-[11px] font-black tracking-[0.3em] uppercase text-white/70">Knowledge & Service</p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {isMounted && user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end -space-y-1">
              <span className="text-sm font-black text-accent text-right">{user.displayName || "Member"}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest mt-1 bg-white/10 text-white/70 border border-white/10">
                {userRole}
              </span>
            </div>
            
            <Avatar className="h-10 w-10 border-2 border-white/30 shadow-lg transition-transform hover:scale-110">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
              <AvatarFallback className="bg-white/10 text-white font-bold">
                {user.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="bg-transparent border-white/40 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] rounded-full h-10 px-4 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          isMounted && !pathname.includes("/admin/login") && (
            <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full h-10 px-6 font-bold uppercase text-[10px] tracking-widest gap-2 shadow-sm">
              <Link href="/admin/login">Staff Portal</Link>
            </Button>
          )
        )}
      </div>
    </header>
  );
}
