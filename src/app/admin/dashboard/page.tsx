"use client";

import { useMemo } from "react";
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
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const db = useFirestore();

  const visitorsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "visitors"), orderBy("timeIn", "desc"), limit(50));
  }, [db]);

  const blockListQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "blockList");
  }, [db]);

  const { data: visitors, loading: visitorsLoading } = useCollection(visitorsQuery);
  const { data: blockedUsers } = useCollection(blockListQuery);

  const activeVisitors = visitors?.filter(v => v.status === "Active") || [];
  
  const stats = [
    { title: "Today's Visitors", value: "145", icon: Users },
    { title: "This Week", value: "650", icon: TrendingUp },
    { title: "Blocked", value: "20", icon: Ban },
    { title: "Active Sessions", value: "30", icon: UserCheck },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <SiteHeader />
      
      <main className="flex-1 p-6 md:p-10 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm rounded-none">
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
                  <Input placeholder="Search users here..." className="pl-9 h-8 text-xs border-muted-foreground/20 w-[200px]" />
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
                        <TableHead className="text-[10px] font-bold uppercase">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitors?.map((visitor) => (
                        <TableRow key={visitor.id} className="border-b">
                          <TableCell className="text-xs font-medium text-muted-foreground">
                            {new Date(visitor.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
                          </TableCell>
                          <TableCell className="text-sm font-semibold">{visitor.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{visitor.college}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{visitor.purpose}</TableCell>
                          <TableCell>
                            <Badge className="bg-[#D1E7DD] text-[#0F5132] border-none px-3 py-0.5 text-[10px] font-bold uppercase">ACTIVE</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
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
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Block List Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-[#F8F9FA]">
                    <TableRow>
                      <TableHead className="text-[10px] font-bold uppercase">Name</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedUsers?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-xs font-medium">{user.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive" className="bg-[#F8D7DA] text-[#842029] border-none text-[9px] font-bold py-0">BLOCKED</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="bg-white p-6 border-l-4 border-destructive shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-destructive">Blocked Entry?</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Your ID may be blocked due to pending penalties, unreturned items, or behavior violations. Please proceed to the Main Circulation Desk for assistance.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}