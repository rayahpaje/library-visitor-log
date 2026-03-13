
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { suggestVisitorPurpose } from "@/ai/flows/visitor-purpose-suggestion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useFirestore } from "@/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const formSchema = z.object({
  idNumber: z.string().min(5, { message: "Institutional ID or Email is required" }),
  fullName: z.string().min(2, { message: "Full name is required" }),
  purpose: z.string().min(1, { message: "Please select a purpose of visit" }),
  customPurpose: z.string().optional(),
  college: z.string().min(1, { message: "College/Office is required" }),
});

const STANDARD_PURPOSES = [
  "Study",
  "Research",
  "Borrow/Return Books",
  "Attend Event",
  "Meeting with Staff",
  "Use Computer/Facilities",
  "Printing/Scanning",
  "Other"
];

const COLLEGES = [
  "College of Computing",
  "College of Arts",
  "College of Science",
  "College of Engineering",
  "College of Business",
  "College of Nursing",
  "Graduate Studies",
  "Staff/Faculty",
  "Visitor"
];

export function VisitorSignInForm() {
  const db = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showCustom, setShowCustom] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNumber: "",
      fullName: "",
      purpose: "",
      customPurpose: "",
      college: "",
    },
  });

  async function handleAiAnalysis() {
    const customText = form.getValues("customPurpose");
    if (!customText || customText.length < 5) {
      toast({
        title: "More info needed",
        description: "Please type a bit more about your visit for AI suggestions.",
      });
      return;
    }

    try {
      setIsAiLoading(true);
      const result = await suggestVisitorPurpose(customText);
      setAiSuggestions(result.suggestions);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return;
    setIsLoading(true);
    setIsBlocked(false);

    try {
      // 1. Check Block List first
      const blockRef = collection(db, "blockList");
      const blockQuery = query(blockRef, where("institutionalId", "==", values.idNumber));
      const blockSnap = await getDocs(blockQuery);

      if (!blockSnap.empty) {
        setIsBlocked(true);
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Your ID is currently on the restricted access list.",
        });
        return;
      }

      // 2. Log Visitor
      const visitorData = {
        name: values.fullName,
        institutionalId: values.idNumber,
        college: values.college,
        purpose: values.purpose === "Other" ? values.customPurpose : values.purpose,
        timeIn: new Date().toISOString(),
        status: "Active"
      };

      const visitorsRef = collection(db, "visitors");
      addDoc(visitorsRef, visitorData).catch(async (e) => {
        const err = new FirestorePermissionError({
          path: "visitors",
          operation: "create",
          requestResourceData: visitorData
        });
        errorEmitter.emit("permission-error", err);
      });

      setSubmitted(true);
      toast({
        title: "Successfully Logged In",
        description: `Welcome, ${values.fullName}.`,
      });
    } catch (error) {
      console.error("Submit Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isBlocked) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-bold text-destructive">Entry Restricted</h4>
            <p className="text-muted-foreground">Please proceed to the Main Library Office for assistance regarding your account status.</p>
          </div>
          <Button onClick={() => { setIsBlocked(false); form.reset(); }} variant="outline">
            Try another ID
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="border-accent bg-accent/5 overflow-hidden">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-bold text-primary">Check-in Complete!</h4>
            <p className="text-muted-foreground">Thank you for visiting the NEU Library. Enjoy your stay!</p>
          </div>
          <Button onClick={() => { setSubmitted(false); form.reset(); setShowCustom(false); }} variant="outline" className="mt-4">
            Sign in another visitor
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Number / Institutional Email</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 2021-1234 or email@neu.edu.ph" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="college"
          render={({ field }) => (
            <FormItem>
              <FormLabel>College / Office</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COLLEGES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose of Visit</FormLabel>
              <Select 
                onValueChange={(val) => {
                  field.onChange(val);
                  setShowCustom(val === "Other");
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select why you are visiting today" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STANDARD_PURPOSES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCustom && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <FormField
              control={form.control}
              name="customPurpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Describe your purpose</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder="e.g. Using the archives for local history..." 
                        {...field} 
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="shrink-0"
                      onClick={handleAiAnalysis}
                      disabled={isAiLoading}
                    >
                      {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent" />}
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            
            {aiSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {aiSuggestions.map((suggestion) => (
                  <Badge 
                    key={suggestion} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-accent hover:text-white transition-colors text-[10px] py-0.5"
                    onClick={() => form.setValue("customPurpose", suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl transition-all shadow-lg active:scale-[0.98]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Complete Sign-in"
          )}
        </Button>
      </form>
    </Form>
  );
}
