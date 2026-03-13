import { VisitorSignInForm } from "@/components/visitor-signin-form";
import { ShieldCheck, BookOpen, Clock } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'library-hero');

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Column: Visual & Welcome */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 bg-primary overflow-hidden flex-col justify-end p-12 text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover opacity-30"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="relative z-10 space-y-6 max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-accent rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">NEU Library</h1>
          </div>
          <h2 className="text-5xl font-extrabold leading-tight">
            Welcome to the Heart of Knowledge
          </h2>
          <p className="text-xl text-white/80 font-medium">
            Join thousands of students and researchers today. Our secure digital log ensures a safe and organized study environment for everyone.
          </p>
          
          <div className="grid grid-cols-2 gap-6 pt-12">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold">Secure Entry</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold">Real-time Logs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Sign-in Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-3xl font-bold text-primary">Visitor Sign-in</h3>
            <p className="text-muted-foreground">Please enter your details to register your visit.</p>
          </div>
          
          <VisitorSignInForm />

          <div className="pt-8 text-center">
            <a 
              href="/admin/login" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Administrative Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}