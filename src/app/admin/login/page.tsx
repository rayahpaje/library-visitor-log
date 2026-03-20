
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Info, ShieldAlert, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<"config" | "other" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const bgImage = PlaceHolderImages.find(img => img.id === "neu-campus-bg");

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setIsLoading(true);
    setErrorType(null);
    setErrorMessage("");
    
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Welcome back!", description: "Successfully authenticated with Google." });
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Login Error:", err);
      
      if (err.code === 'auth/operation-not-allowed') {
        setErrorType("config");
        setErrorMessage("Google Sign-In is not enabled. Please go to your Firebase Console.");
      } else {
        setErrorType("other");
        setErrorMessage(err.message || "Failed to sign in with Google.");
        toast({ 
          variant: "destructive", 
          title: "Login Failed", 
          description: err.message || "An error occurred." 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-body overflow-hidden">
      {/* Dynamic Campus Background */}
      {bgImage && (
        <div className="fixed inset-0 -z-10">
          <Image 
            src={bgImage.imageUrl} 
            alt="NEU Campus" 
            fill 
            className="object-cover opacity-70 scale-110 blur-[1px]"
            data-ai-hint={bgImage.imageHint}
            priority
          />
          <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
        </div>
      )}

      <SiteHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20 z-10">
        <div className="w-full max-w-[500px] bg-primary/95 backdrop-blur-xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] p-10 md:p-14 text-white text-center border border-white/10">
          <div className="mb-10 flex flex-col items-center">
            <div className="bg-accent/20 p-4 rounded-full mb-6 border border-accent/30 shadow-inner">
              <ShieldAlert className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-3xl font-black tracking-tight uppercase text-white mb-2">ADMIN PORTAL</h2>
            <div className="w-16 h-1 bg-accent rounded-full mb-4" />
            <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">Restricted Access Area</p>
          </div>

          {errorType === "config" && (
            <Alert className="mb-8 text-left bg-blue-50/10 text-white border-blue-200/20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-accent" />
                <AlertTitle className="font-bold text-sm">Action Required</AlertTitle>
              </div>
              <AlertDescription className="text-xs mt-1 leading-relaxed text-white/80">
                Please enable Google Sign-In in your Firebase Console.
              </AlertDescription>
            </Alert>
          )}

          {errorType === "other" && (
            <Alert variant="destructive" className="mb-8 text-left bg-red-50/10 text-white border-red-200/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <AlertTitle className="font-bold text-sm">Authentication Error</AlertTitle>
              </div>
              <AlertDescription className="text-xs mt-1">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col items-center space-y-6">
            <Button 
              onClick={handleGoogleLogin}
              className="w-full h-14 bg-white hover:bg-white/90 text-primary font-bold rounded-xl shadow-2xl transition-all flex items-center justify-center gap-3 border-none group" 
              disabled={isLoading}
              suppressHydrationWarning
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="uppercase tracking-widest text-xs">Staff Login</span>
                </>
              )}
            </Button>

            <Button 
              variant="ghost" 
              asChild
              className="w-full text-white/60 hover:text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] gap-2"
            >
              <Link href="/">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Student Portal
              </Link>
            </Button>

            <div className="pt-6 border-t border-white/10 w-full">
              <p className="text-accent text-[11px] font-black uppercase tracking-[0.25em] mb-2">
                Protected System
              </p>
              <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                Use official NEU credentials only. Unauthorized access is recorded.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-white/40 text-[9px] uppercase tracking-[0.4em] z-10 font-bold">
        Security Infrastructure • NEU Library
      </footer>
    </div>
  );
}
