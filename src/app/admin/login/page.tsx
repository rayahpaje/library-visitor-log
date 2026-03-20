
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminLogin() {
  const router = useRouter();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setIsLoading(true);
    setError(null);
    
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Welcome back!", description: "Successfully authenticated with Google." });
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Login Error:", err);
      
      let errorMessage = err.message || "Failed to sign in with Google.";
      
      if (err.code === 'auth/operation-not-allowed') {
        errorMessage = "Google Sign-In is not enabled in your Firebase Console. Please go to Authentication > Sign-in method and enable Google.";
        setError(errorMessage);
      } else {
        toast({ 
          variant: "destructive", 
          title: "Login Failed", 
          description: errorMessage 
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
              <h3 className="text-2xl font-bold tracking-wide">ADMIN ACCESS</h3>
              <p className="text-white/80 text-sm font-medium">Please sign in with your staff Google account</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 text-left bg-red-50 text-red-900 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Required</AlertTitle>
              <AlertDescription className="text-xs">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col items-center space-y-4">
            <Button 
              onClick={handleGoogleLogin}
              className="w-full max-w-[320px] h-14 bg-white hover:bg-white/90 text-[#004D40] font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-3 border-none" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
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
