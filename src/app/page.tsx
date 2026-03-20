import { VisitorSignInForm } from "@/components/visitor-signin-form";
import { SiteHeader } from "@/components/site-header";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const bgImage = PlaceHolderImages.find(img => img.id === "neu-campus-bg");

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Dynamic Campus Background */}
      {bgImage && (
        <div className="fixed inset-0 -z-10">
          <Image 
            src={bgImage.imageUrl} 
            alt="NEU Campus" 
            fill 
            className="object-cover opacity-60 scale-105"
            data-ai-hint={bgImage.imageHint}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-primary/80 backdrop-blur-[2px]" />
        </div>
      )}
      
      <SiteHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20 z-10">
        <div className="w-full max-w-[500px] bg-primary/90 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase text-accent">WELCOME TO NEU LIBRARY!</h2>
            <p className="text-white/90 text-sm font-medium">Please record your official library entry</p>
            <div className="w-12 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>
          
          <VisitorSignInForm />

          <div className="mt-8 bg-black/20 rounded-xl p-5 border border-white/5">
            <h3 className="font-bold text-sm mb-3 text-accent flex items-center gap-2">
              <span className="w-1 h-4 bg-accent rounded-full" />
              Facility Guidelines
            </h3>
            <ul className="text-[11px] space-y-2 text-white/80 font-medium">
              <li className="flex gap-2"><span>•</span> <span>Maintain academic silence at all times.</span></li>
              <li className="flex gap-2"><span>•</span> <span>Keep your official ID displayed for verification.</span></li>
              <li className="flex gap-2"><span>•</span> <span>Food and drinks are strictly prohibited in the study halls.</span></li>
            </ul>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-white/60 text-[10px] uppercase tracking-[0.3em] z-10">
        New Era University © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
