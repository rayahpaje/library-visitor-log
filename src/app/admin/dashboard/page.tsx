"use client";

import { useMemo, useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  Ban, 
  Monitor,
  Search,
  BadgeCheck,
  CalendarDays,
  User as UserIcon,
  ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs
} from "firebase/firestore";
import { format, parseISO, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { MOCK_VISITORS, MOCK_BLOCKED } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [sessionUnblockedIds, setSessionUnblockedIds] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const visitorCollection = useMemoFirebase(() => db ? collection(db, "visitors") : null, [db]);
  const blockCollection = useMemoFirebase(() => db ? collection(db, "blockList") : null, [db]);

  const { data: dbVisitors } = useCollection(visitorCollection);
  const { data: dbBlocked } = useCollection(blockCollection);

  const allVisitors = useMemo(() => {
    const firestoreData = dbVisitors || [];
    const mockData = MOCK_VISITORS.filter(m => !firestoreData.find(f => f.institutionalId === m.institutionalId));
    return [...firestoreData, ...mockData].sort((a, b) => 
      new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime()
    );
  }, [dbVisitors]);

  const blockedList = useMemo(() => {
    const firestoreData = dbBlocked || [];
    const mockData = MOCK_BLOCKED.filter(m => !firestoreData.find(f => f.institutionalId === m.institutionalId));
    return [...firestoreData, ...mockData].filter(u => !sessionUnblockedIds.includes(u.institutionalId));
  }, [dbBlocked, sessionUnblockedIds]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const weekStart = startOfWeek(now).getTime();

    const countToday = allVisitors.filter(v => new Date(v.timeIn).getTime() >= todayStart).length;
    const countWeek = allVisitors.filter(v => new Date(v.timeIn).getTime() >= weekStart).length;

    return {
      today: countToday, 
      week: countWeek, 
      blocked: blockedList.length, 
      active: allVisitors.length
    };
  }, [blockedList, allVisitors]);

  const filteredVisitors = useMemo(() => {
    return allVisitors.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.institutionalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.college.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20);
  }, [allVisitors, searchTerm]);

  const userRole = useMemo(() => {
    if (!user) return "Guest";
    if (user.email?.endsWith("@neu.edu.ph")) return "Library Staff";
    return "Student";
  }, [user]);

  const handleBlock = async (visitor: any) => {
    if (!db) return;
    const isAlreadyBlocked = blockedList.find(b => b.institutionalId === visitor.institutionalId);
    if (isAlreadyBlocked) return;

    const blockData = {
      name: visitor.name,
      institutionalId: visitor.institutionalId,
      reason: "Administrative block from dashboard",
      dateBlocked: new Date().toISOString()
    };

    addDoc(collection(db, "blockList"), blockData)
      .catch(async () => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({
          path: "blockList",
          operation: "create",
          requestResourceData: blockData
        }));
      });
      
    toast({ title: "Access Restricted", description: `${visitor.name} has been blocked.` });
  };

  const formatDateTime = (isoString: string) => {
    if (!isMounted) return "--:--";
    try { 
      return (
        <div className="flex flex-col text-[11px]">
          <span className="font-black text-primary">{format(parseISO(isoString), "hh:mm a").toLowerCase()}</span>
          <span className="text-muted-foreground font-medium">{format(parseISO(isoString), "MMM dd, yyyy")}</span>
        </div>
      );
    } catch { return "N/A"; }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] font-body flex flex-col" suppressHydrationWarning>
      <SiteHeader />
      
      <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full space-y-8">
        {/* User Identity Section */}
        {isMounted && user ? (
          <div className="bg-white border border-black/5 shadow-sm rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-0" />
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-xl transition-transform group-hover:scale-105">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                  <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold uppercase">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-primary tracking-tight">{user.displayName || "Welcome Back"}</h2>
                  <div className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border flex items-center gap-1.5",
                    userRole === "Library Staff" ? "bg-accent text-accent-foreground border-accent" : "bg-primary/10 text-primary border-primary/20"
                  )}>
                    {userRole === "Library Staff" && <BadgeCheck className="w-3.5 h-3.5" />}
                    {userRole}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary" />
                  {user.email}
                </p>
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Live Session</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{format(new Date(), "MMMM dd, yyyy")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 text-right relative z-10">
              <div className="flex items-center gap-2 text-primary/40">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Verified Portal</span>
              </div>
              <Button variant="outline" size="sm" className="rounded-full font-bold uppercase text-[10px] tracking-widest" asChild>
                <Link href="/admin/logs">Detailed Logs</Link>
              </Button>
            </div>
          </div>
        ) : !isUserLoading && (
          <div className="bg-white border border-black/5 shadow-sm rounded-2xl p-12 text-center">
             <h3 className="text-xl font-bold text-primary mb-2">Staff Access Only</h3>
             <p className="text-muted-foreground mb-6">Please sign in to view administrative data.</p>
             <Button className="rounded-full px-8 bg-primary font-bold uppercase tracking-widest text-xs h-11" asChild>
                <Link href="/admin/login">Log In</Link>
             </Button>
          </div>
        )}

        {user && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-none shadow-sm rounded-xl bg-white">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="flex items-center gap-2 text-black/80">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Today</span>
                  </div>
                  <h3 className="text-5xl font-black text-black tracking-tighter">{isMounted ? stats.today : "--"}</h3>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl bg-white">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="flex items-center gap-2 text-black/80">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold uppercase tracking-tight">This Week</span>
                  </div>
                  <h3 className="text-5xl font-black text-black tracking-tighter">{isMounted ? stats.week : "--"}</h3>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl bg-white">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <Ban className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Blocked</span>
                  </div>
                  <h3 className="text-5xl font-black text-black tracking-tighter">{isMounted ? stats.blocked : "--"}</h3>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl bg-white">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Monitor className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">All Logs</span>
                  </div>
                  <h3 className="text-5xl font-black text-black tracking-tighter">{isMounted ? allVisitors.length : "--"}</h3>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-black/5 shadow-sm rounded-xl bg-white">
              <div className="p-6 border-b border-black/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <h2 className="text-lg font-black text-black uppercase tracking-tight">Live Activity Log</h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search Logs..." 
                    className="pl-9 h-10 text-xs border-muted-foreground/30 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-6 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#F4F4F4]">
                    <TableRow className="border-none">
                      <TableHead className="text-[10px] font-black uppercase text-black py-4">Time In & Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-black">Name</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-black">College / Office</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-black">Purpose</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-black">Student/Admin</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-black text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors.map((visitor) => {
                      const isBlocked = blockedList.some(b => b.institutionalId === visitor.institutionalId);
                      const isStaff = visitor.college?.includes("Staff") || visitor.college?.includes("Faculty") || visitor.institutionalId?.endsWith("@neu.edu.ph");
                      
                      return (
                        <TableRow 
                          key={visitor.id || visitor.institutionalId} 
                          className={cn(
                            "hover:bg-muted/10 border-black/5 transition-colors cursor-pointer",
                            isBlocked && "bg-red-50/30"
                          )}
                          onClick={() => userRole === "Library Staff" && !isBlocked && handleBlock(visitor)}
                        >
                          <TableCell className="py-4">{formatDateTime(visitor.timeIn)}</TableCell>
                          <TableCell>
                            <div className="text-sm font-black text-black">{visitor.name}</div>
                            <div className="text-[9px] font-bold text-muted-foreground uppercase">{visitor.institutionalId}</div>
                          </TableCell>
                          <TableCell className="text-xs font-medium text-black/70">{visitor.college}</TableCell>
                          <TableCell className="text-xs font-medium italic text-primary">"{visitor.purpose}"</TableCell>
                          <TableCell>
                            <span className={cn(
                              "text-[9px] font-black px-2 py-0.5 rounded uppercase",
                              isStaff ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"
                            )}>
                              {isStaff ? "Admin/Staff" : "Student"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className={cn(
                              "inline-flex items-center px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                              isBlocked 
                                ? "bg-red-50 text-red-600 border border-red-200" 
                                : "bg-green-50 text-green-700 border border-green-200"
                            )}>
                              {isBlocked ? "BLOCKED" : "ACTIVE"}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredVisitors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-20 text-center text-muted-foreground italic">
                          No matching records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}