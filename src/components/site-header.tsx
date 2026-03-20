
'use client';

import Link from "next/link";
import { UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const isAdminPath = pathname.startsWith("/admin");
  const logo = PlaceHolderImages.find(img => img.id === "neu-logo");

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
        <div className="flex flex-col -space-y-1 text-left">
          <h1 className="font-bold text-xl md:text-2xl tracking-tight text-[#FFD600] uppercase">NEU Library</h1>
          <p className="text-sm font-medium text-white/90">Visitor Log</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end -space-y-1">
              <span className="text-sm font-bold text-[#FFD600]">{user.displayName || "Admin User"}</span>
              <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Staff Access</span>
            </div>
            <Avatar className="h-10 w-10 border-2 border-white/20 shadow-sm">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Admin"} />
              <AvatarFallback className="bg-white/10 text-white font-bold">
                {user.displayName?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="bg-transparent border-white/40 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] rounded-full h-10 px-4"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            {!isAdminPath && (
              <Link href="/admin/login">
                <Button variant="outline" className="bg-[#3D5C4E] border-none text-white hover:bg-[#324B40] gap-2 rounded-full px-6 font-bold uppercase text-[10px] tracking-widest h-10 shadow-md">
                  <UserCircle className="w-4 h-4" />
                  ADMIN LOG
                </Button>
              </Link>
            )}
            
            {isAdminPath && !user && (
              <Link href="/">
                <Button variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] rounded-full h-10 px-6">
                  VISITOR PORTAL
                </Button>
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
