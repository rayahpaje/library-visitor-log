'use client';

import { useMemo, useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  Ban, 
  UserCheck, 
  Search, 
  MoreHorizontal,
  ShieldAlert
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit, addDoc, doc, deleteDoc, where, getDocs } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { isToday, startOfWeek, isAfter, parseISO } from "date-fns";
import { MOCK_VISITORS, MOCK_BLOCKED } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export default function AdminDashboard() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const visitorsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "visitors"), orderBy("timeIn", "desc"), limit(50));
  }, [db]);

  const blockListQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "blockList");
  }, [db]);

  const { data: dbVisitors } = useCollection(visitorsQuery);
  const { data: dbBlockedUsers } = useCollection(blockListQuery);

  const blockedUserIds = useMemo(() => {
    return new Set((dbBlockedUsers || []).map(u => u.institutionalId));
  }, [dbBlockedUsers]);

  const visitors = useMemo(() => {
    const firestoreData = dbVisitors || [];
    const mockData = MOCK_VISITORS.filter(m => !firestoreData.find(f => f.institutionalId === m.institutionalId));
    return [...firestoreData, ...mockData];
  }, [dbVisitors]);

  const blockedUsers = useMemo(() => {
    const firestoreData = dbBlockedUsers || [];
    const mockData = MOCK_BLOCKED.filter(m => !firestoreData.find(f => f.institutionalId === m.institutionalId));
    return [...firestoreData, ...mockData];
  }, [dbBlockedUsers]);

  const stats = useMemo(() => {
    if (!isClient) return [
      { title: "Today's Visitors", value: 0, icon: Users },
      { title: "This Week", value: 0, icon: TrendingUp },
      { title: "Blocked", value: 0, icon: Ban },
      { title: "Active Sessions", value: 0, icon: UserCheck },
    ];

    const today = new Date();
    const weekStart = startOfWeek(today);

    const todayCount = visitors.filter(v => {
      try { return isToday(parseISO(v.timeIn)); } catch { return false; }
    }).length;

    const weekCount = visitors.filter(v => {
      try { return isAfter(parseISO(v.timeIn), weekStart); } catch { return false; }
    }).length;

    const totalBlocked = dbBlockedUsers?.length || MOCK_BLOCKED.length;
    const activeSessions = visitors.filter(v => v.status === "Active" && !blockedUserIds.has(v.institutionalId)).length;

    return [
      { title: "Today's Visitors", value: todayCount, icon: Users },
      { title: "This Week", value: weekCount, icon: TrendingUp },
      { title: "Blocked", value: totalBlocked, icon: Ban },
      { title: "Active Sessions", value: activeSessions, icon: UserCheck },
    ];
  }, [visitors, dbBlockedUsers, blockedUserIds, isClient]);

  const formatTime = (isoString: string) => {
    if (!isClient) return "--:--";
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    } catch {
      return "N/A";
    }
  };

  const handleBlockUser = async (visitor: any) => {
    if (!db) return;
    
    const blockData = {
      name: visitor.name,
      institutionalId: visitor.institutionalId,
      reason: "Administrative Restriction",
      dateBlocked: new Date().toISOString().split('T')[0]
    };

    addDoc(collection(db, "blockList"), blockData)
      .then(() => {
        toast({ title: "User Blocked", description: `${visitor.name} has been restricted.` });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: "blockList",
          operation: "create",
          requestResourceData: blockData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleUnblockUser = async (id: string, name: string) => {
    if (!db) return;
    
    try {
      const q = query(collection(db, "blockList"), where("institutionalId", "==", id));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        querySnapshot.forEach((docSnap) => {
          deleteDoc(doc(db, "blockList", docSnap.id));
        });
        toast({ title: "Access Restored", description: `${name} is now active.` });
      } else {
        toast({ variant: "destructive", title: "Action Required", description: "This is a demo user. Please use the 'Import Records' tool to manage mock data." });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.institutionalId.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8);
  }, [visitors, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-body flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 p-6 md:p-8 max-w-[1400px] mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm rounded-none bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-none">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-primary">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm rounded-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Visitor Activity Logs</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter by name or ID..." 
                  className="pl-9 h-9 text-xs border-muted-foreground/20 rounded-none bg-[#F8F9FA]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#F8F9FA]">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase py-4">Time</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase">Student</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase">Purpose</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase">Status</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisitors.map((visitor) => {
                    const isBlocked = blockedUserIds.has(visitor.institutionalId);
                    return (
                      <TableRow key={visitor.id || visitor.institutionalId} className="hover:bg-muted/30">
                        <TableCell className="text-xs font-medium py-4">{formatTime(visitor.timeIn)}</TableCell>
                        <TableCell>
                          <div className="font-bold text-sm text-primary">{visitor.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{visitor.institutionalId}</div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{visitor.purpose}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "rounded-none px-3 py-0.5 font-bold text-[9px] uppercase tracking-widest border-none shadow-none",
                            isBlocked ? "bg-destructive text-white" : "bg-[#C8E6C9] text-[#2E7D32]"
                          )}>
                            {isBlocked ? "BLOCK" : "ACTIVE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          {!isBlocked && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-none">
                                <DropdownMenuItem 
                                  onClick={() => handleBlockUser(visitor)}
                                  className="text-destructive font-bold cursor-pointer text-xs uppercase"
                                >
                                  Restrict Entry
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-none bg-white">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Block List Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    {blockedUsers.slice(0, 6).map((user) => (
                      <TableRow key={user.id || user.institutionalId} className="hover:bg-muted/30">
                        <TableCell className="py-4 pl-6">
                          <div className="font-bold text-sm">{user.name}</div>
                          <div className="text-[10px] text-muted-foreground">{user.institutionalId}</div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="link" 
                            className="text-destructive font-bold text-[10px] uppercase p-0 h-auto tracking-widest"
                            onClick={() => handleUnblockUser(user.institutionalId, user.name)}
                          >
                            Unblock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {blockedUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground text-xs italic">
                          No restricted students found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="p-4 border-t">
                  <Button variant="outline" className="w-full text-[10px] font-bold uppercase tracking-widest h-10 rounded-none border-primary text-primary hover:bg-primary/5">
                    View Full Block List
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-none bg-primary text-white p-6 relative overflow-hidden">
              <ShieldAlert className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
              <div className="relative z-10 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-widest">Security Protocol</h4>
                <p className="text-sm leading-relaxed text-white/80">
                  Blocking a student ID denies all library privileges instantly. Verify identity before restriction.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}