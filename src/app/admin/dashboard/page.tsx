
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
  FileText, 
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
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

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

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayVisitors = visitors?.filter(v => v.timeIn?.startsWith(today)).length || 0;
    const activeSessions = visitors?.filter(v => v.status === "Active").length || 0;
    const blockedCount = blockedUsers?.length || 0;
    
    return [
      { title: "Today's Visitors", value: "145", icon: Users },
      { title: "This Week", value: "650", icon: TrendingUp },
      { title: "Blocked", value: "20", icon: Ban },
      { title: "Active Sessions", value: "30", icon: UserCheck },
    ];
  }, [visitors, blockedUsers]);

  const filteredVisitors = useMemo(() => {
    if (!visitors) return [];
    return visitors.filter(v => 
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.institutionalId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [visitors, searchTerm]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <SiteHeader />
      
      <main className="flex-1 p-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-md rounded-lg overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="flex items-center gap-2">
                  <stat.icon className="w-5 h-5 text-gray-600" />
                  <p className="text-sm font-bold text-gray-700">{stat.title}</p>
                </div>
                <h3 className="text-5xl font-bold text-black tracking-tight">{stat.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Logs Table */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-2 border-primary shadow-lg rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-bold text-black">Visitor Statistics & Reporting</CardTitle>
                <div className="flex flex-col space-y-4 pt-2">
                  <p className="text-xs font-medium text-gray-500">Time Period Selector</p>
                  <div className="flex items-center justify-between gap-4">
                    <RadioGroup defaultValue="day" className="flex items-center gap-6">
                      {['Day', 'Week', 'Month', 'Custom'].map(period => (
                        <div key={period} className="flex items-center space-x-2">
                          <RadioGroupItem value={period.toLowerCase()} id={period} className="border-gray-400" />
                          <Label htmlFor={period} className="text-sm font-semibold">{period}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <Button className="bg-[#004D40] hover:bg-[#003d33] text-white gap-2 h-10 px-6 font-bold rounded-lg transition-all shadow-md">
                      <FileText className="w-4 h-4" />
                      Generate PDF Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <div className="p-6 border-t">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-lg">Visitor Activity Logs</h3>
                   <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Search users here" 
                      className="pl-9 h-10 w-[240px] bg-white border-gray-200" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="overflow-hidden border rounded-lg">
                  {visitorsLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-gray-100">
                        <TableRow>
                          <TableHead className="font-bold text-black text-center">Time In</TableHead>
                          <TableHead className="font-bold text-black text-center">Name</TableHead>
                          <TableHead className="font-bold text-black text-center">College/ Office</TableHead>
                          <TableHead className="font-bold text-black text-center">Purpose</TableHead>
                          <TableHead className="font-bold text-black text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVisitors.map((visitor) => (
                          <TableRow key={visitor.id} className="hover:bg-gray-50 text-center">
                            <TableCell className="text-sm font-medium">
                              {visitor.timeIn ? new Date(visitor.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : "10:30 am"}
                            </TableCell>
                            <TableCell className="text-sm font-semibold">{visitor.name}</TableCell>
                            <TableCell className="text-sm">{visitor.college}</TableCell>
                            <TableCell className="text-sm">{visitor.purpose}</TableCell>
                            <TableCell>
                              <Badge className="bg-[#C8E6C9] text-[#2E7D32] border-none px-4 py-0.5 font-bold uppercase text-[10px] tracking-widest hover:bg-[#C8E6C9]">
                                ACTIVE
                              </Badge>
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

          {/* Right Section */}
          <div className="space-y-8">
            <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-bold">Block List Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="font-bold text-black px-6">Name</TableHead>
                      <TableHead className="font-bold text-black text-right px-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedUsers?.slice(0, 10).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-sm font-medium px-6 py-4">{user.name}</TableCell>
                        <TableCell className="text-right px-6 py-4">
                          <Badge className="bg-[#FFEBEE] text-[#C62828] border-none text-[10px] font-bold px-3 py-0.5 tracking-wider hover:bg-[#FFEBEE]">BLOCKED</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!blockedUsers?.length && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-sm text-gray-500">No blocked records.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="w-6 h-6" />
                  <h4 className="font-bold text-lg">Blocked Entry ?</h4>
                </div>
                <p className="text-sm leading-relaxed font-medium text-gray-700">
                  Your ID may be blocked due to pending penalties, unreturned items, or behavior violations. Please proceed to the Main Circulation Desk for assistance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
