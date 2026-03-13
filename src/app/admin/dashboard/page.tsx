'use client';

import { useMemo, useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  Ban, 
  UserCheck, 
  Search, 
  MoreHorizontal,
  UserX,
  Loader2,
  AlertCircle
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
import { collection, query, orderBy, limit, addDoc, doc, deleteDoc } from "firebase/firestore";
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

  const { data: dbVisitors, loading: visitorsLoading } = useCollection(visitorsQuery);
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
    const today = new Date();
    const weekStart = startOfWeek(today);

    const todayCount = visitors.filter(v => {
      try {
        return isToday(parseISO(v.timeIn));
      } catch {
        return false;
      }
    }).length;

    const weekCount = visitors.filter(v => {
      try {
        return isAfter(parseISO(v.timeIn), weekStart);
      } catch {
        return false;
      }
    }).length;

    const totalBlocked = blockedUsers.length;
    const activeSessions = visitors.filter(v => v.status === "Active" && !blockedUserIds.has(v.institutionalId)).length;

    return [
      { title: "Today's Visitors", value: todayCount, icon: Users },
      { title: "This Week", value: weekCount, icon: TrendingUp },
      { title: "Blocked", value: totalBlocked, icon: Ban },
      { title: "Active Sessions", value: activeSessions, icon: UserCheck },
    ];
  }, [visitors, blockedUsers, blockedUserIds]);

  const formatTime = (isoString: string) => {
    if (!isClient) return "--:--";
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    } catch {
      return "N/A";
    }
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.institutionalId.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [visitors, searchTerm]);

  const handleBlockUser = (visitor: any) => {
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

  const handleUnblockUser = (user: any) => {
    if (!db) return;
    if (user.id && !user.id.toString().startsWith('b')) {
      const docRef = doc(db, "blockList", user.id);
      deleteDoc(docRef)
        .then(() => {
          toast({ title: "Access Restored", description: `${user.name} is no longer restricted.` });
        })
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: "delete",
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      toast({ title: "Demo Restricted", description: "Use the Block List page to manage demo users." });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] font-body flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full space-y-8">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-md rounded-xl bg-white overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-3 mb-3">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm font-bold text-black uppercase tracking-tight">{stat.title}</p>
                </div>
                <h3 className="text-5xl font-extrabold text-black">{stat.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-md rounded-xl bg-white overflow-hidden">
              <div className="px-6 py-5 flex items-center justify-between border-b bg-[#F8F9FA]/50">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-lg font-bold">Visitor Activity Logs</CardTitle>
                  <div className="relative w-64 hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search users here" 
                      className="pl-9 h-10 bg-white border-muted-foreground/20 rounded-md text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary/5 font-bold h-9 px-4 rounded-md text-xs uppercase tracking-wider">
                  View Full Logs
                </Button>
              </div>
              <div className="p-0">
                <Table>
                  <TableHeader className="bg-[#E9ECEF]">
                    <TableRow>
                      <TableHead className="font-bold text-black text-sm py-4">Time In</TableHead>
                      <TableHead className="font-bold text-black text-sm">Name</TableHead>
                      <TableHead className="font-bold text-black text-sm">Purpose</TableHead>
                      <TableHead className="font-bold text-black text-sm">Status</TableHead>
                      <TableHead className="font-bold text-black text-sm text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors.map((visitor) => {
                      const isBlocked = blockedUserIds.has(visitor.institutionalId);
                      return (
                        <TableRow key={visitor.id} className="border-b last:border-0 hover:bg-muted/30">
                          <TableCell className="text-sm font-medium py-4">{formatTime(visitor.timeIn)}</TableCell>
                          <TableCell className="text-sm font-medium">
                            <div>{visitor.name}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">{visitor.institutionalId}</div>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{visitor.purpose}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "border-none px-4 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider",
                              isBlocked ? "bg-[#FFCDD2] text-[#C62828]" : "bg-[#C8E6C9] text-[#2E7D32]"
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
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => handleBlockUser(visitor)}
                                    className="text-destructive font-bold cursor-pointer"
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Block Student
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
              </div>
            </Card>
          </div>

          {/* Right Section */}
          <div className="space-y-8">
            <Card className="border-none shadow-md rounded-xl bg-white overflow-hidden">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-bold">Block List Management</CardTitle>
              </CardHeader>
              <div className="p-0">
                <Table>
                  <TableHeader className="bg-[#E9ECEF]">
                    <TableRow>
                      <TableHead className="font-bold text-black text-sm py-3">Name</TableHead>
                      <TableHead className="font-bold text-black text-sm text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedUsers.slice(0, 7).map((user) => (
                      <TableRow key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                        <TableCell className="text-sm font-medium py-4 pl-6">
                          <div>{user.name}</div>
                          <div className="text-[10px] text-muted-foreground">{user.institutionalId}</div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="link" 
                            className="text-[#C62828] font-bold text-[10px] uppercase p-0 h-auto"
                            onClick={() => handleUnblockUser(user)}
                          >
                            Unblock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {blockedUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground text-xs italic">
                          No blocked students found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Card className="border-none shadow-md rounded-xl bg-white p-6 space-y-4">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-6 h-6" />
                <h4 className="font-bold text-lg">System Notice</h4>
              </div>
              <p className="text-sm text-black leading-relaxed">
                Blocking a student ID will instantly deny them access across all library terminals. Please verify records before restriction.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
