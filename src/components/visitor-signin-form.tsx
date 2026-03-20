'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Check, User as UserIcon, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useUser, useAuth } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { cn } from "@/lib/utils";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const formSchema = z.object({
  idNumber: z.string().min(5, { message: "ID or Email is required" }),
  fullName: z.string().min(2, { message: "Name is required" }),
  purpose: z.string().min(1, { message: "Purpose is required" }),
  college: z.string().min(1, { message: "College/Office is required" }),
});

const PURPOSES = [
  "Reading books",
  "Research in thesis",
  "Use of computer",
  "Doing assignments"
];

const COLLEGES = [
  "College of Informatics and Computing Science", 
  "College of Arts", 
  "College of Science", 
  "College of Engineering", 
  "College of Business", 
  "College of Nursing", 
  "Staff/Faculty", 
  "External Visitor"
];

export function VisitorSignInForm() {
  const db = useFirestore();
  const { user } = useUser();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"tap" | "email">("tap");
  const [submitted, setSubmitted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{ name: string; college: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNumber: "",
      fullName: "",
      purpose: "Reading books",
      college: "College of Informatics and Computing Science",
    },
  });

  useEffect(() => {
    if (user && isMounted) {
      form.setValue("fullName", user.displayName || "");
      if (user.email) {
        form.setValue("idNumber", user.email);
        setLoginMethod("email");
        if (user.email.endsWith("@neu.edu.ph")) {
           form.setValue("college", "Staff/Faculty");
        }
      }
    }
  }, [user, form, isMounted]);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Welcome!", description: "Successfully authenticated." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login Error", description: err.message });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return;
    setIsLoading(true);

    const visitorData = {
      name: values.fullName,
      institutionalId: values.idNumber,
      college: values.college,
      purpose: values.purpose,
      timeIn: new Date().toISOString(),
      status: "Active"
    };

    addDoc(collection(db, "visitors"), visitorData)
      .then(() => {
        setLastSubmission({ name: values.fullName, college: values.college });
        setSubmitted(true);
        toast({ title: "Success", description: "Welcome to the NEU Library!" });
      })
      .catch(async (error) => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({
          path: "visitors",
          operation: "create",
          requestResourceData: visitorData
        }));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  if (!isMounted) return null;

  if (submitted && lastSubmission) {
    return (
      <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500 py-4">
        {/* Checkmark Icon Container */}
        <div className="relative">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm">
            <div className="w-16 h-16 bg-[#2B473A] rounded-full flex items-center justify-center border border-white/20 shadow-lg">
              <Check className="w-8 h-8 text-white stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-tight">
          WELCOME TO NEU<br />LIBRARY!
        </h2>

        {/* Identity Box */}
        <div className="w-full bg-black/30 rounded-2xl p-8 space-y-2 border border-white/5 backdrop-blur-md shadow-2xl">
          <h3 className="text-xl font-black text-white uppercase tracking-wide">
            {lastSubmission.name}
          </h3>
          <p className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">
            {lastSubmission.college}
          </p>
        </div>

        {/* Success Message */}
        <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em]">
          Successfully checked in. Enjoy your stay!
        </p>

        {/* Reset Action */}
        <Button 
          onClick={() => { setSubmitted(false); form.reset(); }} 
          variant="ghost" 
          className="text-white/40 hover:text-white hover:bg-transparent text-[10px] uppercase font-bold tracking-widest pt-4"
        >
          Click to refresh for next student
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!user && (
        <Button 
          onClick={handleGoogleLogin}
          variant="outline" 
          className="w-full bg-white border-none text-primary hover:bg-white/90 gap-3 rounded-none h-12 font-bold uppercase text-[10px] tracking-widest shadow-lg"
          suppressHydrationWarning
        >
          <LogIn className="w-4 h-4" />
          Sign in with Google to Auto-fill
        </Button>
      )}

      {user && (
        <div className="bg-white/10 p-3 rounded-lg border border-white/10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Logged in as</span>
            <span className="text-xs font-bold text-white">{user.displayName || user.email}</span>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex rounded-none overflow-hidden border border-white/20 p-1 bg-[#4A6D5D]">
            <button
              type="button"
              className={cn(
                "flex-1 py-2 text-[10px] font-bold transition-all rounded-none uppercase tracking-widest",
                loginMethod === "tap" ? "bg-[#3D5C4E] text-white" : "text-white/60"
              )}
              onClick={() => setLoginMethod("tap")}
            >
              School ID Tap
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 py-2 text-[10px] font-bold transition-all rounded-none uppercase tracking-widest",
                loginMethod === "email" ? "bg-[#3D5C4E] text-white" : "text-white/60"
              )}
              onClick={() => setLoginMethod("email")}
            >
              Institutional Email
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    {loginMethod === "tap" ? "NEU School ID" : "Institutional Email"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={loginMethod === "tap" ? "2021-1234" : "user@neu.edu.ph"}
                      className="bg-[#E8EEEB] text-primary border-none focus-visible:ring-offset-0 h-10 font-medium rounded-none" 
                      suppressHydrationWarning
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-white/70">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name"
                      className="bg-[#E8EEEB] text-primary border-none focus-visible:ring-offset-0 h-10 font-medium rounded-none" 
                      suppressHydrationWarning
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-white/70">College / Office</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#E8EEEB] text-primary border-none focus:ring-offset-0 h-10 font-medium rounded-none text-xs" suppressHydrationWarning>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none">
                        {COLLEGES.map((c) => (
                          <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-white/70">Purpose</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#E8EEEB] text-primary border-none focus:ring-offset-0 h-10 font-medium rounded-none text-xs" suppressHydrationWarning>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none">
                        {PURPOSES.map((p) => (
                          <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#3D5C4E] hover:bg-[#324B40] text-white font-bold h-12 rounded-none uppercase tracking-widest text-xs mt-4" 
            disabled={isLoading}
            suppressHydrationWarning
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "RECORD ENTRY"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
