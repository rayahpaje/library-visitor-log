import { VisitorSignInForm } from "@/components/visitor-signin-form";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4F7F5] flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <div className="w-full max-w-[500px] bg-[#537D6B] rounded-2xl shadow-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase">WELCOME TO NEU LIBRARY!</h2>
            <p className="text-white/90 text-sm">Sign in to record your library entry</p>
            <p className="text-white/70 text-xs mt-2 italic px-4">
              Your login details will be displayed in the portal to confirm your identity.
            </p>
          </div>
          
          <VisitorSignInForm />

          <div className="mt-8 bg-[#3D5C4E] rounded-lg p-5">
            <h3 className="font-bold text-sm mb-3">Member Benefits</h3>
            <ul className="text-xs space-y-2 list-disc list-inside text-white/90 font-medium">
              <li>Gain access to high-speed campus Wi-Fi.</li>
              <li>Access campus computers and private study rooms.</li>
              <li>Official verification of library attendance logs.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
