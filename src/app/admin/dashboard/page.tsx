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
  Database,
  ArrowRight
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
import { collection, query, orderBy, limit, addDoc, writeBatch, doc } from "firebase/firestore";
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
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  // Queries
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

  // Fallback to mock data if Firestore is empty/loading
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
      toast({ title: "System Initialized", description: "Student database imported successfully." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to initialize records." });
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
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-11 px-6 font-bold uppercase tracking-wider text-xs rounded-none shadow-lg border-b-4 border-[#E6B800]"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Initialize Student Database
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm rounded-none bg-white overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="flex items-center gap-2">
                  <stat.icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Visitor Activity Logs</CardTitle>
                  <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-9 px-5 font-bold uppercase tracking-wider text-[10px] rounded-none shadow-sm">
                    <FileText className="w-3.5 h-3.5" />
                    Generate PDF Report
                  </Button>
                </div>
                
                <div className="flex items-center gap-6 mt-6">
                  <RadioGroup defaultValue="day" className="flex items-center gap-6">
                    {['Day', 'Week', 'Month'].map(period => (
                      <div key={period} className="flex items-center space-x-2">
                        <RadioGroupItem value={period.toLowerCase()} id={period} className="border-muted-foreground/30 text-primary h-3.5 w-3.5" />
                        <Label htmlFor={period} className="text-[10px] font-bold uppercase tracking-widest">{period}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                    <Input 
                      placeholder="Search students by name or ID..." 
                      className="pl-9 h-9 w-full bg-[#F8F9FA] border-none rounded-none text-xs font-medium" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <div className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50 border-b">
                    <TableRow>
                      <TableHead className="font-bold text-black text-center text-[10px] uppercase tracking-widest h-10">Time In</TableHead>
                      <TableHead className="font-bold text-black text-center text-[10px] uppercase tracking-widest h-10">Student Name</TableHead>
                      <TableHead className="font-bold text-black text-center text-[10px] uppercase tracking-widest h-10">College</TableHead>
                      <TableHead className="font-bold text-black text-center text-[10px] uppercase tracking-widest h-10">Purpose</TableHead>
                      <TableHead className="font-bold text-black text-center text-[10px] uppercase tracking-widest h-10">Status</TableHead>
                      <TableHead className="sr-only">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors.map((visitor: any) => (
                      <TableRow key={visitor.id || visitor.name} className="hover:bg-gray-50 text-center group border-b last:border-0">
                        <TableCell className="text-xs font-medium py-4">
                          {visitor.timeIn ? new Date(visitor.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : "N/A"}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-primary py-4">{visitor.name}</TableCell>
                        <TableCell className="text-[11px] py-4">{visitor.college}</TableCell>
                        <TableCell className="text-[11px] italic text-muted-foreground py-4">{visitor.purpose}</TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            className={cn(
                              "border-none px-3 py-0.5 font-bold uppercase text-[9px] tracking-widest rounded-none",
                              visitor.status === "Active" 
                                ? "bg-[#C8E6C9] text-[#2E7D32]"
                                : "bg-gray-200 text-gray-600"
                            )}
                          >
                            {visitor.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none group-hover:bg-muted"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-none border-none shadow-xl">
                              <DropdownMenuItem onClick={() => handleBlockUser(visitor)} className="text-destructive font-bold uppercase text-[10px] tracking-widest cursor-pointer">
                                <Ban className="w-3.5 h-3.5 mr-2" />
                                Restrict Access
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-sm rounded-none overflow-hidden bg-white">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Security Database</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50 border-b">
                    <TableRow>
                      <TableHead className="font-bold text-black px-6 text-[10px] uppercase tracking-widest h-10">Name</TableHead>
                      <TableHead className="font-bold text-black text-right px-6 text-[10px] uppercase tracking-widest h-10">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedUsers?.slice(0, 10).map((user: any) => (
                      <TableRow key={user.id || user.name} className="hover:bg-destructive/5 border-b last:border-0">
                        <TableCell className="text-xs font-bold px-6 py-4">{user.name}</TableCell>
                        <TableCell className="text-right px-6 py-4">
                          <Badge className="bg-[#FFEBEE] text-[#C62828] border-none text-[9px] font-bold px-2 py-0.5 tracking-widest rounded-none uppercase">RESTRICTED</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {blockedUsers.length > 0 && (
                  <div className="p-4 border-t bg-gray-50 text-center">
                    <Button variant="link" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:no-underline">
                      View All Security Alerts <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-none overflow-hidden bg-[#004D40] text-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <AlertCircle className="w-5 h-5" />
                  <h4 className="font-bold text-xs uppercase tracking-widest">Security Protocol</h4>
                </div>
                <p className="text-[11px] leading-relaxed font-medium text-white/80 italic">
                  "Ensure all restricted individuals are handled with protocol. Direct blocked visitors to the Main Circulation Desk for assistance or verification."
                </p>
                <div className="pt-2">
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none rounded-none text-[10px] font-bold uppercase tracking-widest h-9">
                    Review Protocols
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
