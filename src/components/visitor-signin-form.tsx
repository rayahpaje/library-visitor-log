"use client";

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
  idNumber: z.string().min(5, { message: "Required" }),
  fullName: z.string().min(2, { message: "Required" }),
  purpose: z.string().min(1, { message: "Required" }),
  college: z.string().min(1, { message: "Required" }),
});

const PURPOSES = ["Study", "Research", "Borrow/Return Books", "Attend Event", "Meeting", "Other"];
const COLLEGES = ["Computing", "Arts", "Science", "Engineering", "Business", "Nursing", "Staff", "Visitor"];

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
      purpose: "",
      college: "Computing",
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
      toast({ title: "Success", description: "Welcome to the library!" });
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
            <h4 className="text-xl font-bold">Entry Restricted</h4>
            <p className="text-white/80 text-sm">Please proceed to the Main Circulation Desk for assistance.</p>
          </div>
          <Button onClick={() => { setIsBlocked(false); form.reset(); }} variant="outline" className="text-primary border-white bg-white hover:bg-white/90">
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
            <h4 className="text-xl font-bold">Sign-in Complete!</h4>
            <p className="text-white/80 text-sm">Enjoy your study session.</p>
          </div>
          <Button onClick={() => { setSubmitted(false); form.reset(); }} variant="outline" className="text-primary border-white bg-white hover:bg-white/90">
            Finish
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex rounded-md overflow-hidden border border-white/20 p-0.5 bg-[#4A6D5D]">
          <button
            type="button"
            className={cn(
              "flex-1 py-1.5 text-xs font-bold transition-all",
              loginMethod === "tap" ? "bg-[#3D5C4E] text-white" : "text-white/60 hover:text-white"
            )}
            onClick={() => setLoginMethod("tap")}
          >
            School ID Tap
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 py-1.5 text-xs font-bold transition-all",
              loginMethod === "email" ? "bg-[#3D5C4E] text-white" : "text-white/60 hover:text-white"
            )}
            onClick={() => setLoginMethod("email")}
          >
            Institutional Email
          </button>
        </div>

        <FormField
          control={form.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                {loginMethod === "tap" ? "NEU School ID" : "Institutional Email"}
              </FormLabel>
              <FormControl>
                <Input className="bg-[#E8EEEB] text-primary border-none focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-white h-9" {...field} />
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
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-white/70">Full Name</FormLabel>
              <FormControl>
                <Input className="bg-[#E8EEEB] text-primary border-none focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-white h-9" {...field} />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-white/70">Purpose of Visit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-[#E8EEEB] text-primary border-none focus:ring-offset-0 focus:ring-1 focus:ring-white h-9">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PURPOSES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-[#3D5C4E] hover:bg-[#324B40] text-white font-bold h-10 rounded uppercase tracking-widest text-xs mt-4" 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "SIGN IN"}
        </Button>
      </form>
    </Form>
  );
}