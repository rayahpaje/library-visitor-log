
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
  User as UserIcon
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
import { useCollection, useFirestore, useUser } from "@/firebase";
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

export default function AdminDashboard() {
  const db = useFirestore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [unblockedIds, setUnblockedIds] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const visitorCollection = useMemo(() => db ? collection(db, "visitors") : null, [db]);
  const blockCollection = useMemo(() => db ? collection(db, "blockList") : null, [db]);

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
    return [...firestoreData, ...mockData].filter(u => !unblockedIds.includes(u.institutionalId));
  }, [dbBlocked, unblockedIds]);

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

  const handleBlock = async (visitor: any) => {
    if (!db) return;
    const isAlreadyBlocked = blockedList.find(b => b.institutionalId === visitor.institutionalId);
    if (isAlreadyBlocked) return;

    setUnblockedIds(prev => prev.filter(id => id !== visitor.institutionalId));

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
    setUnblockedIds(prev => [...prev, blockedUser.institutionalId]);

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
    if (!isMounted) return "10:30 am";
    try { return format(parseISO(isoString), "hh:mm a").toLowerCase(); } catch { return "10:30 am"; }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] font-body flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full space-y-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#004D40]">Dashboard Overview</h2>
            <p className="text-sm text-muted-foreground font-medium">Monitoring library attendance and security</p>
          </div>
          {user && (
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-black/5">
              <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Admin"} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  {user.displayName?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col -space-y-1">
                <span className="text-sm font-bold text-black">{user.displayName || "Administrator"}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Library Staff</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-[0_4px_10px_rgba(0,0,0,0.05)] rounded-xl bg-white overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="flex items-center gap-2 text-black/80">
                <Users className="w-5 h-5" />
                <span className="text-sm font-bold">Today's Visitors</span>
              </div>
              <h3 className="text-5xl font-extrabold text-black tracking-tighter">{stats.today}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_4px_10px_rgba(0,0,0,0.05)] rounded-xl bg-white overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="flex items-center gap-2 text-black/80">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-bold">This Week</span>
              </div>
              <h3 className="text-5xl font-extrabold text-black tracking-tighter">{stats.week}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_4px_10px_rgba(0,0,0,0.05)] rounded-xl bg-white overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="flex items-center gap-2 text-black/80">
                <Ban className="w-5 h-5 text-destructive" />
                <span className="text-sm font-bold">Blocked</span>
              </div>
              <h3 className="text-5xl font-extrabold text-black tracking-tighter">{stats.blocked}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_4px_10px_rgba(0,0,0,0.05)] rounded-xl bg-white overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="flex items-center gap-2 text-black/80">
                <Monitor className="w-5 h-5" />
                <span className="text-sm font-bold">Active Sessions</span>
              </div>
              <h3 className="text-5xl font-extrabold text-black tracking-tighter">{stats.active}</h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border border-black/5 shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-xl bg-white">
              <div className="p-6 border-b border-black/5">
                <h2 className="text-lg font-bold text-black mb-1">Visitor Statistics & Reporting</h2>
                <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">Time Period Selector</p>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <RadioGroup defaultValue="day" className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="day" id="day" className="w-4 h-4" />
                      <Label htmlFor="day" className="text-sm font-bold">Day</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="week" id="week" className="w-4 h-4" />
                      <Label htmlFor="week" className="text-sm font-bold">Week</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="month" id="month" className="w-4 h-4" />
                      <Label htmlFor="month" className="text-sm font-bold">Month</Label>
                    </div>
                  </RadioGroup>
                  <Button className="bg-[#004D40] hover:bg-[#003d33] text-white rounded-lg h-10 gap-2 px-6 shadow-sm font-bold uppercase text-[10px] tracking-widest border-none">
                    <FileText className="w-4 h-4" />
                    Generate PDF Report
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-md font-bold text-black uppercase tracking-tight">Visitor Activity Logs</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search users here" 
                      className="pl-9 h-10 text-xs border-muted-foreground/30 bg-white rounded-md shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-black/5 overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-[#F4F4F4]">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="text-xs font-bold text-black py-4">Time In</TableHead>
                        <TableHead className="text-xs font-bold text-black">Name</TableHead>
                        <TableHead className="text-xs font-bold text-black">College/ Office</TableHead>
                        <TableHead className="text-xs font-bold text-black">Purpose</TableHead>
                        <TableHead className="text-xs font-bold text-black text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisitors.map((visitor) => {
                        const isBlocked = blockedList.some(b => b.institutionalId === visitor.institutionalId);
                        return (
                          <TableRow 
                            key={visitor.id || visitor.institutionalId} 
                            className="hover:bg-muted/10 cursor-pointer border-black/5"
                            onClick={() => !isBlocked && handleBlock(visitor)}
                          >
                            <TableCell className="text-sm font-medium py-4">{formatTime(visitor.timeIn)}</TableCell>
                            <TableCell className="text-sm font-bold text-black">{visitor.name}</TableCell>
                            <TableCell className="text-sm font-medium text-black/70">{visitor.college}</TableCell>
                            <TableCell className="text-sm font-medium text-black/70">{visitor.purpose?.split(' ')[0]}</TableCell>
                            <TableCell className="text-center">
                              <div className={cn(
                                "inline-flex items-center px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-all",
                                isBlocked 
                                  ? "bg-[#FFEBEE] text-[#D32F2F] border border-[#D32F2F]/10" 
                                  : "bg-[#C8E6C9] text-[#2E7D32] border border-[#2E7D32]/10"
                              )}>
                                {isBlocked ? "BLOCKED" : "ACTIVE"}
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
            <Card className="border border-black/5 shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-xl bg-white overflow-hidden">
              <div className="p-5 border-b border-black/5">
                <h3 className="text-sm font-bold text-black uppercase tracking-tight">Block List Management</h3>
              </div>
              <div className="p-0">
                <Table>
                  <TableHeader className="bg-[#F4F4F4]">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="text-xs font-bold text-black py-3">Name</TableHead>
                      <TableHead className="text-xs font-bold text-black text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedList.map((user) => (
                      <TableRow 
                        key={user.id || user.institutionalId} 
                        className="hover:bg-muted/10 border-black/5 group cursor-pointer"
                        onClick={() => handleUnblock(user)}
                      >
                        <TableCell className="py-4 text-sm font-bold text-black">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider bg-[#FFEBEE] text-[#D32F2F] border border-[#D32F2F]/10 hover:bg-[#D32F2F] hover:text-white rounded-md shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-all"
                          >
                            Unblock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {blockedList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="py-8 text-center text-xs text-muted-foreground italic">
                          No restricted students
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Card className="border border-black/5 shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-xl bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-destructive">
                  <Ban className="w-5 h-5" />
                  <h4 className="text-sm font-bold text-black">Blocked Entry?</h4>
                </div>
                <p className="text-xs leading-relaxed text-black/80 font-medium italic">
                  Student ID may be blocked due to pending penalties, unreturned items, or behavior violations. Please proceed to the Main Circulation Desk for assistance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
