"use client";

import { useMemo, useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Ban, 
  Monitor,
  Search,
  BadgeCheck,
  CalendarDays,
  User as UserIcon,
  ShieldCheck,
  Filter,
  GraduationCap,
  Lock,
  UserCheck
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { 
  collection, 
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { format, parseISO, startOfWeek, startOfDay, endOfDay, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { MOCK_VISITORS } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

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

const PURPOSES = [
  "Reading books",
  "Research in thesis",
  "Use of computer",
  "Doing assignments"
];

const ADMIN_EMAILS = [
  "jcesperanza@neu.edu.ph",
  "rayahjenine.paje@neu.edu.ph",
  "admin@neu.edu.ph"
];

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("all");
  const [filterCollege, setFilterCollege] = useState<string>("all");
  const [filterPurpose, setFilterPurpose] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<"all" | "staff" | "student">("all");

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
    return dbBlocked || [];
  }, [dbBlocked]);

  const filteredData = useMemo(() => {
    return allVisitors.filter(v => {
      const vDate = new Date(v.timeIn);
      const isStaff = v.college === "Staff/Faculty";
      const now = new Date();

      let matchesDate = true;
      if (dateRange === "today") matchesDate = vDate >= startOfDay(now) && vDate <= endOfDay(now);
      else if (dateRange === "week") matchesDate = vDate >= startOfWeek(now);
      else if (dateRange === "month") matchesDate = vDate >= subDays(now, 30);

      const matchesCollege = filterCollege === "all" || v.college === filterCollege;
      const matchesPurpose = filterPurpose === "all" || v.purpose === filterPurpose;
      const matchesRole = filterRole === "all" || (filterRole === "staff" ? isStaff : !isStaff);
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           v.institutionalId.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesDate && matchesCollege && matchesPurpose && matchesRole && matchesSearch;
    });
  }, [allVisitors, dateRange, filterCollege, filterPurpose, filterRole, searchTerm]);

  const stats = useMemo(() => {
    const staffCount = filteredData.filter(v => v.college === "Staff/Faculty").length;
    return {
      total: filteredData.length,
      staff: staffCount,
      students: filteredData.length - staffCount,
      blocked: blockedList.length
    };
  }, [filteredData, blockedList]);

  const userRole = useMemo(() => {
    if (!user) return "Guest";
    if (ADMIN_EMAILS.includes(user.email || "")) return "Admin";
    return "Student";
  }, [user]);

  const isAuthorized = useMemo(() => userRole === "Admin", [userRole]);

  const toggleUserAccess = async (visitor: any) => {
    if (!db || !isAuthorized) return;

    const isCurrentlyBlocked = blockedList.some(b => b.institutionalId === visitor.institutionalId);

    if (isCurrentlyBlocked) {
      // Unblock Logic
      const q = query(collection(db, "blockList"), where("institutionalId", "==", visitor.institutionalId));
      const snapshot = await getDocs(q);
      snapshot.forEach((d) => deleteDoc(doc(db, "blockList", d.id)));
      
      if (visitor.id && !visitor.id.startsWith('v')) { 
        updateDoc(doc(db, "visitors", visitor.id), { status: "Active" });
      }
      
      toast({ title: "Access Restored", description: `${visitor.name} is now Active.` });
    } else {
      // Block Logic
      const blockDocRef = doc(collection(db, "blockList"));
      setDoc(blockDocRef, {
        name: visitor.name,
        institutionalId: visitor.institutionalId,
        reason: "Administrative block",
        dateBlocked: new Date().toISOString()
      });

      if (visitor.id && !visitor.id.startsWith('v')) {
        updateDoc(doc(db, "visitors", visitor.id), { status: "Inactive" });
      }

      toast({ variant: "destructive", title: "Access Restricted", description: `${visitor.name} is now Blocked.` });
    }
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
        {isMounted && user ? (
          <div className="bg-white border border-black/5 shadow-sm rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-0" />
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-xl">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                  <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">
                    {user.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-primary tracking-tight">Welcome to NEU Library</h2>
                  <div className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border flex items-center gap-1.5",
                    isAuthorized ? "bg-accent text-accent-foreground border-accent" : "bg-neutral-200 text-neutral-600 border-neutral-300"
                  )}>
                    {isAuthorized ? <BadgeCheck className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                    {isAuthorized ? "Admin" : "Student"}
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-primary font-black uppercase tracking-wider">{user.displayName || "Administrator"}</p>
                  <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-2">
                    <UserIcon className="w-3 h-3 text-primary" />
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : !isUserLoading && (
          <div className="bg-white border border-black/5 shadow-sm rounded-2xl p-12 text-center">
             <h3 className="text-xl font-bold text-primary mb-2">Staff Access Only</h3>
             <Button className="rounded-full px-8 bg-primary font-bold uppercase tracking-widest text-xs h-11" asChild>
                <Link href="/admin/login">Log In</Link>
             </Button>
          </div>
        )}

        {user && !isAuthorized && (
          <Card className="border-none shadow-sm rounded-2xl p-20 text-center bg-white flex flex-col items-center gap-4">
            <div className="bg-red-50 p-6 rounded-full text-red-500"><Lock className="w-12 h-12" /></div>
            <h2 className="text-2xl font-black text-primary uppercase">Restricted Area</h2>
            <p className="text-muted-foreground text-sm">Access is reserved for authorized Admins only.</p>
          </Card>
        )}

        {user && isAuthorized && (
          <>
            <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
              <div className="p-6 border-b border-black/5 flex items-center gap-3 bg-primary/5">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">Advanced Filters</h3>
              </div>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Date Range</label>
                  <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                    <SelectTrigger className="h-10 text-xs font-bold bg-[#F8F9FA] rounded-none border-black/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">College</label>
                  <Select value={filterCollege} onValueChange={setFilterCollege}>
                    <SelectTrigger className="h-10 text-xs font-bold bg-[#F8F9FA] rounded-none border-black/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Colleges</SelectItem>
                      {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Purpose</label>
                  <Select value={filterPurpose} onValueChange={setFilterPurpose}>
                    <SelectTrigger className="h-10 text-xs font-bold bg-[#F8F9FA] rounded-none border-black/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Purposes</SelectItem>
                      {PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Category</label>
                  <Select value={filterRole} onValueChange={(v: any) => setFilterRole(v)}>
                    <SelectTrigger className="h-10 text-xs font-bold bg-[#F8F9FA] rounded-none border-black/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="staff">Staff / Admin</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Name/ID..." 
                      className="pl-9 h-10 text-xs font-bold bg-[#F8F9FA] rounded-none border-black/10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Total Visits", val: stats.total, icon: Users, color: "text-primary" },
                { label: "Staff / Admin", val: stats.staff, icon: BadgeCheck, color: "text-primary" },
                { label: "Students", val: stats.students, icon: GraduationCap, color: "text-primary" },
                { label: "Blocked", val: stats.blocked, icon: Ban, color: "text-destructive" }
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <div className={cn("flex items-center gap-2", stat.color)}>
                      <stat.icon className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <h3 className="text-5xl font-black text-black tracking-tighter">{isMounted ? stat.val : "--"}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border border-black/5 shadow-sm rounded-xl bg-white">
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-black text-black uppercase">Live Activity Logs</h2>
                </div>
              </div>

              <div className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#F4F4F4]">
                    <TableRow className="border-none">
                      <TableHead className="text-[10px] font-black uppercase text-black py-4">Time & Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-black">Name & ID</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-black">College</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-black">Purpose</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-black">Identification</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-black text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.slice(0, 50).map((visitor) => {
                      const isBlocked = blockedList.some(b => b.institutionalId === visitor.institutionalId);
                      const isStaff = visitor.college === "Staff/Faculty";
                      
                      return (
                        <TableRow key={visitor.id || visitor.institutionalId} className={cn("hover:bg-muted/10 transition-colors", isBlocked && "bg-red-50/20")}>
                          <TableCell className="py-4">{formatDateTime(visitor.timeIn)}</TableCell>
                          <TableCell>
                            <div className="text-sm font-black text-black">{visitor.name}</div>
                            <div className="text-[9px] font-bold text-muted-foreground uppercase">{visitor.institutionalId}</div>
                          </TableCell>
                          <TableCell className="text-xs font-medium">{visitor.college}</TableCell>
                          <TableCell className="text-xs font-medium italic">"{visitor.purpose}"</TableCell>
                          <TableCell>
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                              isStaff ? "bg-accent text-accent-foreground" : "bg-neutral-200 text-neutral-600"
                            )}>
                              {isStaff ? <BadgeCheck className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                              {isStaff ? "Admin" : "Student"}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              disabled={!isAuthorized}
                              onClick={() => toggleUserAccess(visitor)}
                              className={cn(
                                "inline-flex items-center px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                                isBlocked 
                                  ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer" 
                                  : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 cursor-pointer",
                                !isAuthorized && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {isBlocked ? "Blocked" : "Active"}
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
