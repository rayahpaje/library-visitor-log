
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCollection, useFirestore } from "@/firebase";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs
} from "firebase/firestore";
import { format, parseISO, isToday, isAfter, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { MOCK_VISITORS, MOCK_BLOCKED } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [unblockedIds, setUnblockedIds] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch data
  const { data: dbVisitors } = useCollection(db ? collection(db, "visitors") : null);
  const { data: dbBlocked } = useCollection(db ? collection(db, "blockList") : null);

  // Merge Mock and DB data
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
    // Filter out users that have been unblocked in this session
    return [...firestoreData, ...mockData].filter(u => !unblockedIds.includes(u.institutionalId));
  }, [dbBlocked, unblockedIds]);

  // Statistics
  const stats = useMemo(() => {
    if (!isMounted) return { today: 0, week: 0, blocked: 0, active: 0 };
    
    const today = new Date();
    const weekStart = startOfWeek(today);

    const todayCount = allVisitors.filter(v => {
      try { return isToday(parseISO(v.timeIn)); } catch { return false; }
    }).length;

    const weekCount = allVisitors.filter(v => {
      try { return isAfter(parseISO(v.timeIn), weekStart); } catch { return false; }
    }).length;

    return {
      today: todayCount,
      week: weekCount,
      blocked: blockedList.length,
      active: allVisitors.filter(v => !blockedList.find(b => b.institutionalId === v.institutionalId)).length
    };
  }, [allVisitors, blockedList, isMounted]);

  // Filter logs
  const filteredVisitors = useMemo(() => {
    return allVisitors.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.institutionalId.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [allVisitors, searchTerm]);

  // Handle Blocking
  const handleBlock = async (visitor: any) => {
    if (!db) return;
    const isAlreadyBlocked = blockedList.find(b => b.institutionalId === visitor.institutionalId);
    if (isAlreadyBlocked) return;

    // Remove from unblockedIds if they were there
    setUnblockedIds(prev => prev.filter(id => id !== visitor.institutionalId));

    const blockData = {
      name: visitor.name,
      institutionalId: visitor.institutionalId,
      reason: "Administrative block from dashboard",
      dateBlocked: new Date().toISOString()
    };

    addDoc(collection(db, "blockList"), blockData);
    toast({ title: "Student Blocked", description: `${visitor.name} has been restricted.` });
  };

  // Handle Unblocking
  const handleUnblock = async (blockedUser: any) => {
    if (!db) return;
    
    // Optimistically update UI for the demo
    setUnblockedIds(prev => [...prev, blockedUser.institutionalId]);

    const q = query(collection(db, "blockList"), where("institutionalId", "==", blockedUser.institutionalId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      querySnapshot.forEach((docSnap) => {
        deleteDoc(doc(db, "blockList", docSnap.id));
      });
    }
    
    toast({ title: "Access Restored", description: `${blockedUser.name} is now ACTIVE.` });
  };

  const formatTime = (isoString: string) => {
    if (!isMounted) return "--:-- --";
    try { return format(parseISO(isoString), "hh:mm a").toLowerCase(); } catch { return "N/A"; }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] font-body flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-md rounded-xl bg-white overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-bold">Today's Visitors</span>
                </div>
                <h3 className="text-4xl font-extrabold text-black">{stats.today}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-xl bg-white overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-bold">This Week</span>
                </div>
                <h3 className="text-4xl font-extrabold text-black">{stats.week}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-xl bg-white overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ban className="w-5 h-5 text-destructive" />
                  <span className="text-sm font-bold">Blocked</span>
                </div>
                <h3 className="text-4xl font-extrabold text-black">{stats.blocked}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-xl bg-white overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Monitor className="w-5 h-5" />
                  <span className="text-sm font-bold">Active Sessions</span>
                </div>
                <h3 className="text-4xl font-extrabold text-black">{stats.active}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Logs & Reporting */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-md rounded-xl bg-white">
              <div className="p-6 border-b">
                <h2 className="text-lg font-bold text-black mb-1">Visitor Statistics & Reporting</h2>
                <p className="text-xs text-muted-foreground mb-4">Activity Insights</p>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <RadioGroup defaultValue="day" className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="day" id="day" className="w-4 h-4 border-muted-foreground" />
                      <Label htmlFor="day" className="text-sm font-medium">Day</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="week" id="week" className="w-4 h-4 border-muted-foreground" />
                      <Label htmlFor="week" className="text-sm font-medium">Week</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="month" id="month" className="w-4 h-4 border-muted-foreground" />
                      <Label htmlFor="month" className="text-sm font-medium">Month</Label>
                    </div>
                  </RadioGroup>
                  <Button className="bg-[#004D40] hover:bg-[#003d33] text-white rounded-lg h-10 gap-2 px-6 shadow-sm">
                    <FileText className="w-4 h-4" />
                    Generate PDF Report
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-md font-bold text-black">Visitor Activity Logs</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search users here" 
                      className="pl-9 h-10 text-xs border-muted-foreground/30 bg-[#F8F9FA] rounded-md"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[#F4F4F4]">
                      <TableRow>
                        <TableHead className="text-xs font-bold text-black py-4">Time In</TableHead>
                        <TableHead className="text-xs font-bold text-black">Name</TableHead>
                        <TableHead className="text-xs font-bold text-black">College/ Office</TableHead>
                        <TableHead className="text-xs font-bold text-black">Purpose</TableHead>
                        <TableHead className="text-xs font-bold text-black">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisitors.map((visitor) => {
                        const isBlocked = blockedList.some(b => b.institutionalId === visitor.institutionalId);
                        return (
                          <TableRow 
                            key={visitor.id || visitor.institutionalId} 
                            className="hover:bg-muted/10 cursor-pointer group"
                            onClick={() => !isBlocked && handleBlock(visitor)}
                          >
                            <TableCell className="text-xs font-medium py-4">{formatTime(visitor.timeIn)}</TableCell>
                            <TableCell className="text-xs font-bold text-black">{visitor.name}</TableCell>
                            <TableCell className="text-xs font-medium text-muted-foreground">{visitor.college}</TableCell>
                            <TableCell className="text-xs font-medium text-muted-foreground">{visitor.purpose?.split(' ')[0]}</TableCell>
                            <TableCell>
                              <div className={cn(
                                "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                isBlocked ? "bg-[#FFEBEE] text-[#D32F2F]" : "bg-[#E8F5E9] text-[#2E7D32]"
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

          {/* Right: Block List & Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-md rounded-xl bg-white overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="text-sm font-bold text-black">Block List Management</h3>
              </div>
              <div className="p-0">
                <Table>
                  <TableHeader className="bg-[#F4F4F4]">
                    <TableRow>
                      <TableHead className="text-xs font-bold text-black py-3">Name</TableHead>
                      <TableHead className="text-xs font-bold text-black text-right pr-6">Management</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedList.map((user) => (
                      <TableRow key={user.id || user.institutionalId} className="hover:bg-muted/10">
                        <TableCell className="py-3 text-xs font-medium text-black">
                          <div>{user.name}</div>
                          <div className="text-[10px] text-muted-foreground">{user.institutionalId}</div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[10px] font-bold uppercase border-primary text-primary hover:bg-primary/5 px-3 rounded-md gap-1.5"
                            onClick={() => handleUnblock(user)}
                          >
                            <UserCheck className="w-3 h-3" />
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

            <Card className="border-none shadow-md rounded-xl bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-destructive">
                  <Ban className="w-5 h-5" />
                  <h4 className="text-sm font-bold">Blocked Entry?</h4>
                </div>
                <p className="text-xs leading-relaxed text-black font-medium">
                  ID restrictions are managed here. Removing a student from this list restores their full library access immediately.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
