
"use client";

import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  Ban, 
  UserCheck, 
  Search, 
  FileText, 
  Loader2,
  AlertCircle,
  MoreVertical,
  Database
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
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit, addDoc, getDocs, writeBatch, doc } from "firebase/firestore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { MOCK_VISITORS, MOCK_BLOCKED } from "@/lib/mock-data";

export default function AdminDashboard() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  const visitorsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "visitors"), orderBy("timeIn", "desc"), limit(20));
  }, [db]);

  const blockListQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "blockList");
  }, [db]);

  const { data: dbVisitors, loading: visitorsLoading } = useCollection(visitorsQuery);
  const { data: dbBlockedUsers, loading: blocksLoading } = useCollection(blockListQuery);

  // Use Firestore data if available, otherwise fallback to mock data for visual consistency
  const visitors = useMemo(() => {
    if (dbVisitors && dbVisitors.length > 0) return dbVisitors;
    return MOCK_VISITORS;
  }, [dbVisitors]);

  const blockedUsers = useMemo(() => {
    if (dbBlockedUsers && dbBlockedUsers.length > 0) return dbBlockedUsers;
    return MOCK_BLOCKED;
  }, [dbBlockedUsers]);

  const stats = useMemo(() => {
    const activeCount = (visitors as any[]).filter(v => v.status === "Active").length;
    return [
      { title: "Today's Visitors", value: visitors.length.toString(), icon: Users },
      { title: "This Week", value: (visitors.length * 4.5).toFixed(0), icon: TrendingUp },
      { title: "Blocked", value: blockedUsers.length.toString(), icon: Ban },
      { title: "Active Sessions", value: activeCount.toString(), icon: UserCheck },
    ];
  }, [visitors, blockedUsers]);

  const filteredVisitors = useMemo(() => {
    return (visitors as any[]).filter(v => 
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.institutionalId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [visitors, searchTerm]);

  const handleBlockUser = (visitor: any) => {
    if (!db) return;
    
    const blockData = {
      name: visitor.name,
      institutionalId: visitor.institutionalId,
      reason: "Blocked from Dashboard activity log",
      dateBlocked: new Date().toISOString().split('T')[0]
    };

    addDoc(collection(db, "blockList"), blockData)
      .then(() => {
        toast({ title: "User Blocked", description: `${visitor.name} has been added to the block list.` });
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

  const seedDatabase = async () => {
    if (!db) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      
      MOCK_VISITORS.forEach((v) => {
        const ref = doc(collection(db, "visitors"));
        batch.set(ref, {
          name: v.name,
          institutionalId: v.institutionalId,
          college: v.college,
          purpose: v.purpose,
          timeIn: v.timeIn,
          status: v.status
        });
      });

      MOCK_BLOCKED.forEach((b) => {
        const ref = doc(collection(db, "blockList"));
        batch.set(ref, {
          name: b.name,
          institutionalId: b.institutionalId,
          reason: b.reason,
          dateBlocked: b.dateBlocked
        });
      });

      await batch.commit();
      toast({ title: "Database Initialized", description: "All student records have been imported." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to import records." });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-body">
      <AdminSidebar />
      
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Library Overview</h1>
            <p className="text-muted-foreground text-sm">Real-time monitoring of campus library usage.</p>
          </div>
          {(!dbVisitors || dbVisitors.length === 0) && (
            <Button 
              onClick={seedDatabase} 
              disabled={isSeeding}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-10 px-6 font-bold uppercase tracking-wider text-xs rounded-none shadow-md"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Import Student Database
            </Button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm rounded-none bg-white overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="flex items-center gap-2">
                  <stat.icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                </div>
                <h3 className="text-5xl font-bold text-black tracking-tighter">{stat.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm rounded-none overflow-hidden bg-white">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Visitor Activity Logs</CardTitle>
                <div className="flex flex-col space-y-4 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <RadioGroup defaultValue="day" className="flex items-center gap-6">
                      {['Day', 'Week', 'Month'].map(period => (
                        <div key={period} className="flex items-center space-x-2">
                          <RadioGroupItem value={period.toLowerCase()} id={period} className="border-muted-foreground/30 text-primary" />
                          <Label htmlFor={period} className="text-xs font-bold uppercase tracking-wider">{period}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-10 px-6 font-bold uppercase tracking-wider text-xs rounded-none shadow-md">
                      <FileText className="w-4 h-4" />
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Sessions</h3>
                   <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <Input 
                      placeholder="Search users..." 
                      className="pl-9 h-9 w-[240px] bg-white border-muted-foreground/20 rounded-none text-xs" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="overflow-hidden border border-muted-foreground/10">
                  {visitorsLoading && dbVisitors?.length === 0 ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-bold text-black text-center text-[10px] uppercase tracking-widest">Time In</TableHead>
                          <TableHead className="font-bold text-black text-center text-[10px] uppercase tracking-widest">Name</TableHead>
                          <TableHead className="font-bold text-black text-center text-[10px] uppercase tracking-widest">College</TableHead>
                          <TableHead className="font-bold text-black text-center text-[10px] uppercase tracking-widest">Purpose</TableHead>
                          <TableHead className="font-bold text-black text-center text-[10px] uppercase tracking-widest">Status</TableHead>
                          <TableHead className="sr-only">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVisitors.map((visitor: any) => (
                          <TableRow key={visitor.id || visitor.name} className="hover:bg-gray-50 text-center">
                            <TableCell className="text-xs font-medium">
                              {visitor.timeIn ? new Date(visitor.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : "N/A"}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-primary">{visitor.name}</TableCell>
                            <TableCell className="text-xs">{visitor.college}</TableCell>
                            <TableCell className="text-xs italic text-muted-foreground">{visitor.purpose}</TableCell>
                            <TableCell>
                              <Badge 
                                className={visitor.status === "Active" 
                                  ? "bg-[#C8E6C9] text-[#2E7D32] border-none px-3 py-0.5 font-bold uppercase text-[9px] tracking-widest rounded-none"
                                  : "bg-gray-200 text-gray-600 border-none px-3 py-0.5 font-bold uppercase text-[9px] tracking-widest rounded-none"
                                }
                              >
                                {visitor.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-none border-none shadow-xl">
                                  <DropdownMenuItem onClick={() => handleBlockUser(visitor)} className="text-destructive font-bold uppercase text-[10px] tracking-widest">
                                    Restrict Access
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-sm rounded-none overflow-hidden bg-white">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Blocked List</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {blocksLoading && dbBlockedUsers?.length === 0 ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-destructive" /></div>
                ) : (
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-bold text-black px-6 text-[10px] uppercase tracking-widest">Name</TableHead>
                        <TableHead className="font-bold text-black text-right px-6 text-[10px] uppercase tracking-widest">Security</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blockedUsers?.slice(0, 10).map((user: any) => (
                        <TableRow key={user.id || user.name} className="hover:bg-destructive/5">
                          <TableCell className="text-xs font-bold px-6 py-4">{user.name}</TableCell>
                          <TableCell className="text-right px-6 py-4">
                            <Badge className="bg-[#FFEBEE] text-[#C62828] border-none text-[9px] font-bold px-2 py-0.5 tracking-widest rounded-none uppercase">RESTRICTED</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-none overflow-hidden bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  <h4 className="font-bold text-xs uppercase tracking-widest">Security Protocol</h4>
                </div>
                <p className="text-[11px] leading-relaxed font-medium text-muted-foreground italic">
                  "Ensure all restricted individuals are handled with protocol. Direct blocked visitors to the Main Circulation Desk for assistance or verification."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
