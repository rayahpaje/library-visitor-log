
"use client";

import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  Ban, 
  UserCheck, 
  Search, 
  FileDown,
  Loader2,
  ShieldAlert,
  MoreVertical,
  UserX
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
import { collection, query, orderBy, limit, addDoc } from "firebase/firestore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  const visitorsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "visitors"), orderBy("timeIn", "desc"), limit(100));
  }, [db]);

  const blockListQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "blockList");
  }, [db]);

  const { data: visitors, loading: visitorsLoading } = useCollection(visitorsQuery);
  const { data: blockedUsers } = useCollection(blockListQuery);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayVisitors = visitors?.filter(v => v.timeIn?.startsWith(today)).length || 0;
    const activeSessions = visitors?.filter(v => v.status === "Active").length || 0;
    const blockedCount = blockedUsers?.length || 0;
    
    return [
      { title: "Today's Visitors", value: todayVisitors.toString(), icon: Users },
      { title: "Total Records", value: (visitors?.length || 0).toString(), icon: TrendingUp },
      { title: "Blocked Users", value: blockedCount.toString(), icon: Ban },
      { title: "Active Sessions", value: activeSessions.toString(), icon: UserCheck },
    ];
  }, [visitors, blockedUsers]);

  const filteredVisitors = useMemo(() => {
    if (!visitors) return [];
    return visitors.filter(v => 
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.institutionalId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [visitors, searchTerm]);

  const handleBlockUser = async (visitor: any) => {
    if (!db) return;
    try {
      await addDoc(collection(db, "blockList"), {
        name: visitor.name,
        institutionalId: visitor.institutionalId,
        reason: "Manual Block from Dashboard",
        dateBlocked: new Date().toISOString().split('T')[0]
      });
      toast({ title: "User Blocked", description: `${visitor.name} has been restricted and added to the block list.` });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <SiteHeader />
      
      <main className="flex-1 p-6 md:p-10 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-primary">Administration Overview</h2>
            <p className="text-sm text-muted-foreground">Monitor and manage NEU Library facility usage.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm rounded-none border-l-4 border-primary">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <stat.icon className="w-3.5 h-3.5" />
                    {stat.title}
                  </p>
                  <h3 className="text-4xl font-bold text-[#333]">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Logs Table */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm rounded-none">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Visitor Statistics & Reporting</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Time Period Selector</p>
                    <RadioGroup defaultValue="day" className="flex items-center gap-4">
                      {['Day', 'Week', 'Month', 'Custom'].map(period => (
                        <div key={period} className="flex items-center space-x-2">
                          <RadioGroupItem value={period.toLowerCase()} id={period} className="border-primary text-primary" />
                          <Label htmlFor={period} className="text-xs font-medium">{period}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <Button variant="default" className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-sm text-xs font-bold uppercase">
                    <FileDown className="w-4 h-4" />
                    Generate PDF Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-none overflow-hidden">
              <CardHeader className="pb-4 flex flex-row items-center justify-between bg-white border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Visitor Activity Logs</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Search students here..." 
                    className="pl-9 h-8 text-xs border-muted-foreground/20 w-[200px]" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {visitorsLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <Table>
                    <TableHeader className="bg-[#F8F9FA]">
                      <TableRow>
                        <TableHead className="text-[10px] font-bold uppercase py-4">Time In</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase">Name</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase">College/Office</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase">Purpose</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisitors.map((visitor) => (
                        <TableRow key={visitor.id} className="border-b transition-colors hover:bg-muted/30">
                          <TableCell className="text-xs font-medium text-muted-foreground">
                            {visitor.timeIn ? new Date(visitor.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : "N/A"}
                          </TableCell>
                          <TableCell className="text-sm font-semibold">{visitor.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{visitor.college}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{visitor.purpose}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  className="text-destructive gap-2"
                                  onClick={() => handleBlockUser(visitor)}
                                >
                                  <UserX className="w-4 h-4" />
                                  Block Student
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredVisitors.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 text-xs text-muted-foreground italic">
                            No student records found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel: Block List */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-none">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Security Database</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-[#F8F9FA]">
                    <TableRow>
                      <TableHead className="text-[10px] font-bold uppercase">Blocked Individuals</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedUsers?.slice(0, 10).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-xs font-medium">
                          {user.name}
                          <div className="text-[9px] text-muted-foreground uppercase">{user.institutionalId}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive" className="bg-[#F8D7DA] text-[#842029] border-none text-[8px] font-bold py-0 h-4">BLOCKED</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {blockedUsers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4 text-xs text-muted-foreground italic">
                          No blocked students.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {blockedUsers && blockedUsers.length > 10 && (
                  <div className="p-3 text-center bg-[#F8F9FA] border-t">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                      + {blockedUsers.length - 10} more restricted records
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-white p-6 border-l-4 border-destructive shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-destructive">Enforcement Protocol</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Automatic ID verification is active. If a restricted ID is tapped, the visitor will be directed to the Circulation Desk for resolution.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
