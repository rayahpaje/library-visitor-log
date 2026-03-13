"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  idNumber: z.string().min(5, { message: "Institutional ID or Email is required" }),
  fullName: z.string().min(2, { message: "Full name is required" }),
  purpose: z.string().min(5, { message: "Please describe your purpose of visit" }),
});

export function VisitorSignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNumber: "",
      fullName: "",
      purpose: "",
    },
  });

  const purposeValue = form.watch("purpose");

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (purposeValue && purposeValue.length > 10 && !isAiLoading) {
        try {
          setIsAiLoading(true);
          const result = await suggestVisitorPurpose(purposeValue);
          setSuggestions(result.suggestions);
        } catch (error) {
          console.error("AI Error:", error);
        } finally {
          setIsAiLoading(false);
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [purposeValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setSubmitted(true);
    toast({
      title: "Successfully Logged In",
      description: `Welcome, ${values.fullName}. Your visit has been recorded.`,
    });
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
          <Button onClick={() => { setSubmitted(false); form.reset(); }} variant="outline" className="mt-4">
            Sign in another visitor
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Purpose of Visit</FormLabel>
                {isAiLoading && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
              </div>
              <FormControl>
                <Textarea 
                  placeholder="Tell us what you're working on today..." 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3 h-3 text-accent" />
                AI will suggest categories as you type.
              </FormDescription>
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestions.map((suggestion) => (
                    <Badge 
                      key={suggestion} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-accent hover:text-white transition-colors py-1 px-3"
                      onClick={() => form.setValue("purpose", suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl transition-all shadow-lg active:scale-[0.98]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Complete Sign-in"
          )}
        </Button>
      </form>
    </Form>
  );
}