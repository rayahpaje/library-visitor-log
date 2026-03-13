"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function AdminLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <div className="w-full max-w-[550px] bg-[#537D6B] rounded-3xl shadow-2xl p-10 md:p-14 text-white text-center">
          <div className="space-y-6 mb-10">
            <h2 className="text-3xl font-bold tracking-tight uppercase">WELCOME TO NEU LIBRARY!</h2>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-wide">ADMIN ACCESS</h3>
              <p className="text-white/80 text-sm">Enter your staff credentials to manage Library Log</p>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6 text-left max-w-[400px] mx-auto">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white font-bold text-sm">Username</Label>
              <Input 
                id="username" 
                type="text" 
                className="bg-[#CED8D3] border-none h-12 rounded-lg text-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-primary/40" 
                placeholder="Staff ID or Username"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-bold text-sm">Password</Label>
              <Input 
                id="password" 
                type="password" 
                className="bg-[#CED8D3] border-none h-12 rounded-lg text-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-primary/40" 
                placeholder="••••••••"
                required 
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#004D40] hover:bg-[#003d33] text-white font-bold rounded-lg shadow-md transition-all mt-4 uppercase tracking-widest text-xs" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Log in to Dashboard"}
            </Button>
          </form>

          <p className="mt-10 text-white/70 text-[10px] font-medium uppercase tracking-widest">
            Protected System. Unauthorized access is monitored.
          </p>
        </div>
      </main>
    </div>
  );
}