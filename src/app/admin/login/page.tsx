"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Info, ArrowRightLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<"config" | "other" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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
        setErrorMessage("Google Sign-In is not enabled. Please go to your Firebase Console and enable it under Authentication > Sign-in method.");
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
    <div className="min-h-screen bg-[#F4F7F5] flex flex-col font-body">
      <SiteHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <div className="w-full max-w-[550px] bg-[#537D6B] rounded-3xl shadow-2xl p-10 md:p-14 text-white text-center">
          <div className="space-y-6 mb-10">
            <h2 className="text-3xl font-bold tracking-tight uppercase">WELCOME TO NEU LIBRARY!</h2>
            <div className="space-y-2">
              <p className="text-white/80 text-sm font-medium">Please sign in with your NEU Institutional Email</p>
            </div>
          </div>

          {errorType === "config" && (
            <Alert className="mb-8 text-left bg-blue-50 text-blue-900 border-blue-200">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-700" />
                <AlertTitle className="font-bold text-sm">Action Required: Enable Google Provider</AlertTitle>
              </div>
              <AlertDescription className="text-xs mt-1 leading-relaxed">
                To allow signing in, you must go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold">Firebase Console</a>, navigate to <b>Authentication &gt; Sign-in method</b>, and enable the <b>Google</b> provider.
              </AlertDescription>
            </Alert>
          )}

          {errorType === "other" && (
            <Alert variant="destructive" className="mb-8 text-left bg-red-50 text-red-900 border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-700" />
                <AlertTitle className="font-bold text-sm">Authentication Error</AlertTitle>
              </div>
              <AlertDescription className="text-xs mt-1">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col items-center space-y-4">
            <Button 
              onClick={handleGoogleLogin}
              className="w-full max-w-[320px] h-14 bg-white hover:bg-white/90 text-[#004D40] font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-3 border-none" 
              disabled={isLoading}
              suppressHydrationWarning
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  Sign in with Google
                </>
              )}
            </Button>
            
            <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full h-10 px-6 font-bold uppercase text-[10px] tracking-widest gap-2 shadow-sm mt-4" suppressHydrationWarning>
              <Link href="/">
                <ArrowRightLeft className="w-4 h-4" />
                Student Portal
              </Link>
            </Button>

            <p className="mt-6 text-white/70 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Protected System. Use NEU credentials only.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
