'use client';

import Link from "next/link";
import { LogOut, ShieldCheck, LayoutDashboard, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const isAdminPath = pathname.startsWith("/admin");
  const logo = PlaceHolderImages.find(img => img.id === "neu-logo");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userRole = useMemo(() => {
    if (!user) return null;
    if (user.email?.endsWith("@neu.edu.ph")) return "Library Staff";
    return "Visitor";
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
    <header className="bg-[#004D40] text-white py-4 px-6 md:px-10 flex items-center justify-between h-20 shadow-md z-50 sticky top-0">
      <div className="flex items-center gap-4">
        <Link href="/" className="relative w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-lg transition-transform hover:scale-105">
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
        </Link>
        <div className="flex flex-col -space-y-1 text-left">
          <h1 className="font-bold text-xl md:text-2xl tracking-tight text-[#FFD600] uppercase">NEU Library</h1>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded",
              isAdminPath ? "bg-accent text-accent-foreground" : "bg-white/20 text-white"
            )}>
              {isAdminPath ? "Admin Portal" : "Visitor Portal"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isMounted && user ? (
          <div className="flex items-center gap-4">
            {/* Context Switcher for Staff */}
            {userRole === "Library Staff" && (
              <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full h-9 px-4 font-bold uppercase text-[10px] tracking-widest gap-2" suppressHydrationWarning>
                <Link href={isAdminPath ? "/" : "/admin/dashboard"}>
                  {isAdminPath ? <ArrowRightLeft className="w-3.5 h-3.5" /> : <LayoutDashboard className="w-3.5 h-3.5" />}
                  {isAdminPath ? "Switch to Visitor Portal" : "Switch to Admin Portal"}
                </Link>
              </Button>
            )}

            <div className="hidden md:flex flex-col items-end -space-y-1">
              <span className="text-sm font-bold text-[#FFD600]">{user.displayName || "Member"}</span>
              <span className={cn(
                "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest mt-1",
                userRole === "Library Staff" ? "bg-accent/20 text-accent border border-accent/30" : "bg-white/10 text-white/70"
              )}>
                {userRole}
              </span>
            </div>
            
            <Avatar className="h-10 w-10 border-2 border-white/20 shadow-sm">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
              <AvatarFallback className="bg-white/10 text-white font-bold">
                {user.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="bg-transparent border-white/40 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] rounded-full h-10 px-4"
              suppressHydrationWarning
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : isMounted ? (
          <div className="flex items-center gap-3">
            {!isAdminPath && (
              <Button asChild variant="outline" className="bg-[#3D5C4E] border-none text-white hover:bg-[#324B40] gap-2 rounded-full px-6 font-bold uppercase text-[10px] tracking-widest h-10 shadow-md" suppressHydrationWarning>
                <Link href="/admin/login">
                  <ShieldCheck className="w-4 h-4" />
                  ADMIN LOGIN
                </Link>
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
