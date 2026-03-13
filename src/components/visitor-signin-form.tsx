'use client';

import { useState } from "react";
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
import { Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useFirestore } from "@/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { cn } from "@/lib/utils";

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
  "College of Computing", 
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
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"tap" | "email">("tap");
  const [submitted, setSubmitted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNumber: "",
      fullName: "",
      purpose: "Reading books",
      college: "College of Computing",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return;
    setIsLoading(true);

    try {
      const blockQuery = query(collection(db, "blockList"), where("institutionalId", "==", values.idNumber));
      const blockSnap = await getDocs(blockQuery);

      if (!blockSnap.empty) {
        setIsBlocked(true);
        setIsLoading(false);
        return;
      }

      const visitorData = {
        name: values.fullName,
        institutionalId: values.idNumber,
        college: values.college,
        purpose: values.purpose,
        timeIn: new Date().toISOString(),
        status: "Active"
      };

      addDoc(collection(db, "visitors"), visitorData).catch(async () => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({
          path: "visitors",
          operation: "create",
          requestResourceData: visitorData
        }));
      });

      setSubmitted(true);
      toast({ title: "Success", description: "Welcome to the NEU Library!" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isBlocked) {
    return (
      <Card className="border-none bg-white/10 text-white">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
          <ShieldAlert className="w-12 h-12 text-destructive" />
          <div className="space-y-2">
            <h4 className="text-xl font-bold uppercase">Entry Restricted</h4>
            <p className="text-white/80 text-sm">Access denied. Please proceed to the Main Circulation Desk for assistance.</p>
          </div>
          <Button onClick={() => { setIsBlocked(false); form.reset(); }} variant="outline" className="text-primary border-white bg-white hover:bg-white/90 rounded-none px-8 font-bold uppercase text-xs">
            Try another ID
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="border-none bg-white/10 text-white">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
          <CheckCircle2 className="w-12 h-12 text-accent" />
          <div className="space-y-2">
            <h4 className="text-xl font-bold uppercase">Sign-in Complete!</h4>
            <p className="text-white/80 text-sm">Welcome to NEU Library. Enjoy your study session.</p>
          </div>
          <Button onClick={() => { setSubmitted(false); form.reset(); }} variant="outline" className="text-primary border-white bg-white hover:bg-white/90 rounded-none px-8 font-bold uppercase text-xs">
            Done
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#E8EEEB] text-primary border-none focus:ring-offset-0 h-10 font-medium rounded-none">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-none">
                      {COLLEGES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#E8EEEB] text-primary border-none focus:ring-offset-0 h-10 font-medium rounded-none">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-none">
                      {PURPOSES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
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
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "SIGN IN ENTRY"}
        </Button>
      </form>
    </Form>
  );
}