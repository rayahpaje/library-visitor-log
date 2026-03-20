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
  FileText,
  ShieldCheck,
  User as UserIcon,
  BadgeCheck,
  ArrowRightLeft
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import { format, parseISO } from "date-fns";
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
    return {
      today: 145, 
      week: 650, 
      blocked: blockedList.length, 
      active: allVisitors.length - blockedList.length
    };
  }, [blockedList, allVisitors]);

  const filteredVisitors = useMemo(() => {
    return allVisitors.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.institutionalId.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [allVisitors, searchTerm]);

  // Role Detection Logic
  const userRole = useMemo(() => {
    if (!user) return "Guest";
    if (user.email?.endsWith("@neu.edu.ph")) return "Library Staff";
    return "Visitor";
  }, [user]);

  const handleBlock = async (visitor: any) => {
    if (!db) return;
    const isAlreadyBlocked = blockedList.find(b => b.institutionalId === visitor.institutionalId);
    if (isAlreadyBlocked) return;

    setSessionUnblockedIds(prev => prev.filter(id => id !== visitor.institutionalId));

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
      
    toast({ title: "Student Blocked", description: `${visitor.name} has been restricted.` });
  };

  const handleUnblock = async (blockedUser: any) => {
    setSessionUnblockedIds(prev => [...prev, blockedUser.institutionalId]);

    if (!db) return;

    const q = query(collection(db, "blockList"), where("institutionalId", "==", blockedUser.institutionalId));
    getDocs(q).then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach((docSnap) => {
          deleteDoc(doc(db, "blockList", docSnap.id)).catch(async () => {
            errorEmitter.emit("permission-error", new FirestorePermissionError({
              path: `blockList/${docSnap.id}`,
              operation: "delete"
            }));
          });
        });
      }
    });
    
    toast({ title: "Access Restored", description: `${blockedUser.name} is now ACTIVE.` });
  };

  const formatTime = (isoString: string) => {
    if (!isMounted) return "--:--";
    try { return format(parseISO(isoString), "hh:mm a").toLowerCase(); } catch { return "N/A"; }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] font-body flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full space-y-8">
        {/* User Identity Section */}
        {isMounted && user ? (
          <div className="bg-white border border-black/5 shadow-sm rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-0" />
            
            <div className="flex items-center gap-6 relative z-10">
              <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-xl">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold uppercase">
                  {user.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-primary tracking-tight">{user.displayName || "Welcome"}</h2>
                  <div className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border flex items-center gap-1.5 shadow-sm",
                    userRole === "Library Staff" 
                      ? "bg-accent text-accent-foreground border-accent" 
                      : "bg-primary/10 text-primary border-primary/20"
                  )}>
                    {userRole === "Library Staff" && <BadgeCheck className="w-3.5 h-3.5" />}
                    {userRole}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary" />
                  {user.email}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Active Session: {userRole} Portal</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 text-right relative z-10">
              <Button asChild variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 h-10 px-6 font-bold uppercase tracking-widest text-[10px] rounded-full shadow-sm gap-2" suppressHydrationWarning>
                <Link href="/">
                  <ArrowRightLeft className="w-4 h-4" />
                  Go to Visitor Portal
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-primary/40">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Verified by NEU Auth</span>
              </div>
            </div>
          </div>
        ) : !isUserLoading && (
          <div className="bg-white border border-black/5 shadow-sm rounded-2xl p-12 text-center">
             <h3 className="text-xl font-bold text-primary mb-2">Administrative Access Restricted</h3>
             <p className="text-muted-foreground mb-6">Please log in with your staff credentials to access the library dashboard.</p>
             <Button className="rounded-full px-8 bg-primary font-bold uppercase tracking-widest text-xs h-11" asChild suppressHydrationWarning>
                <Link href="/admin/login">Staff Login Portal</Link>
             </Button>
          </div>
        )}

        {/* Dashboard Content */}
        {user && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-black text-[#004D40] uppercase tracking-tight">
                  {userRole === "Library Staff" ? "Admin Operations" : "Attendance Dashboard"}
                </h2>
                <p className="text-sm text-muted-foreground font-medium italic">
                  {userRole === "Library Staff" ? "Real-time monitoring and security management" : "Your recent library visitation logs"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="flex items-center gap-2 text-black/80">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Today's Logs</span>
                  </div>
                  <h3 className="text-5xl font-black text-black tracking-tighter">{isMounted ? stats.today : 0}</h3>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="flex items-center gap-2 text-black/80">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold uppercase tracking-tight">Weekly Peak</span>
                  </div>
                  <h3 className="text-5xl font-black text-black tracking-tighter">{isMounted ? stats.week : 0}</h3>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <Ban className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Blocked Users</span>
                  </div>
                  <h3 className="text-5xl font-black text-black tracking-tighter">{isMounted ? stats.blocked : 0}</h3>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Monitor className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Active Sessions</span>
                  </div>
                  <h3 className="text-5xl font-black text-black tracking-tighter">{isMounted ? stats.active : 0}</h3>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border border-black/5 shadow-sm rounded-xl bg-white">
                  <div className="p-6 border-b border-black/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <h2 className="text-lg font-black text-black uppercase tracking-tight">Library Activity Log</h2>
                    {userRole === "Library Staff" && (
                      <Button className="bg-[#004D40] hover:bg-[#003d33] text-white rounded-lg h-10 gap-2 px-6 shadow-sm font-bold uppercase text-[10px] tracking-widest border-none" suppressHydrationWarning>
                        <FileText className="w-4 h-4" />
                        Export Report
                      </Button>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <RadioGroup defaultValue="day" className="flex items-center gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="day" id="day" className="w-4 h-4" />
                          <Label htmlFor="day" className="text-sm font-bold">Daily</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="week" id="week" className="w-4 h-4" />
                          <Label htmlFor="week" className="text-sm font-bold">Weekly</Label>
                        </div>
                      </RadioGroup>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search records..." 
                          className="pl-9 h-10 text-xs border-muted-foreground/30 bg-white rounded-md shadow-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          suppressHydrationWarning
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-black/5 overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader className="bg-[#F4F4F4]">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="text-xs font-bold text-black py-4">Time In</TableHead>
                            <TableHead className="text-xs font-bold text-black">Identity</TableHead>
                            <TableHead className="text-xs font-bold text-black">College</TableHead>
                            <TableHead className="text-xs font-bold text-black text-center">Security</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVisitors.map((visitor) => {
                            const isBlocked = blockedList.some(b => b.institutionalId === visitor.institutionalId);
                            return (
                              <TableRow 
                                key={visitor.id || visitor.institutionalId} 
                                className={cn(
                                  "hover:bg-muted/10 border-black/5 transition-colors",
                                  userRole === "Library Staff" && "cursor-pointer"
                                )}
                                onClick={() => userRole === "Library Staff" && !isBlocked && handleBlock(visitor)}
                              >
                                <TableCell className="text-sm font-medium py-4">{formatTime(visitor.timeIn)}</TableCell>
                                <TableCell>
                                  <div className="text-sm font-black text-black">{visitor.name}</div>
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase">{visitor.institutionalId}</div>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-black/70">{visitor.college}</TableCell>
                                <TableCell className="text-center">
                                  <div className={cn(
                                    "inline-flex items-center px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm",
                                    isBlocked 
                                      ? "bg-red-50 text-red-600 border border-red-200" 
                                      : "bg-green-50 text-green-700 border border-green-200"
                                  )}>
                                    {isBlocked ? "RESTRICTED" : "ACTIVE"}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border border-black/5 shadow-sm rounded-xl bg-white overflow-hidden">
                  <div className="p-5 border-b border-black/5 bg-[#F4F4F4]">
                    <h3 className="text-xs font-black text-black uppercase tracking-widest">Active Restrictions</h3>
                  </div>
                  <div className="p-0">
                    <Table>
                      <TableBody>
                        {blockedList.map((user) => (
                          <TableRow key={user.id || user.institutionalId} className="hover:bg-muted/10 border-black/5 group">
                            <TableCell className="py-4">
                              <div className="text-sm font-black text-black">{user.name}</div>
                              <div className="text-[10px] font-bold text-destructive uppercase">Security Flagged</div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => userRole === "Library Staff" && handleUnblock(user)}
                                className="h-8 px-3 text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all border border-red-100"
                                disabled={userRole !== "Library Staff"}
                                suppressHydrationWarning
                              >
                                {userRole === "Library Staff" ? "UNBLOCK" : "LOCKED"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {blockedList.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="py-12 text-center text-xs text-muted-foreground italic font-medium">
                              No security restrictions active
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                <Card className="border-none shadow-sm rounded-xl bg-primary text-white overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#FFD600]" />
                      <h4 className="text-sm font-black uppercase tracking-tight">Security Memo</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-white/80 font-medium">
                      Student accounts are flagged automatically for repeated policy violations. Use this portal to review logs and restore library access for verified students.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
