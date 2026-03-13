"use client";

import { useMemo, useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  UserCheck, 
  Search,
  BookOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { isToday, startOfWeek, isAfter, parseISO } from "date-fns";
import { MOCK_VISITORS } from "@/lib/mock-data";

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

  const { data: dbVisitors } = useCollection(visitorsQuery);

  const visitors = useMemo(() => {
    const firestoreData = dbVisitors || [];
    const mockData = MOCK_VISITORS.filter(m => !firestoreData.find(f => f.institutionalId === m.institutionalId));
    return [...firestoreData, ...mockData];
  }, [dbVisitors]);

  const stats = useMemo(() => {
    if (!isClient) return [
      { title: "Today's Visitors", value: 0, icon: Users },
      { title: "This Week", value: 0, icon: TrendingUp },
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

    const activeSessions = visitors.filter(v => v.status === "Active").length;

    return [
      { title: "Today's Visitors", value: todayCount, icon: Users },
      { title: "This Week", value: weekCount, icon: TrendingUp },
      { title: "Active Sessions", value: activeSessions, icon: UserCheck },
    ];
  }, [visitors, isClient]);

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

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-body flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 p-6 md:p-8 max-w-[1400px] mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <div className="grid grid-cols-1 gap-6">
          <Card className="border-none shadow-sm rounded-none bg-white">
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
                    <TableHead className="text-[10px] font-bold uppercase">College / Office</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase">Purpose</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisitors.map((visitor) => (
                    <TableRow key={visitor.id || visitor.institutionalId} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-medium py-4">{formatTime(visitor.timeIn)}</TableCell>
                      <TableCell>
                        <div className="font-bold text-sm text-primary">{visitor.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{visitor.institutionalId}</div>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{visitor.college}</TableCell>
                      <TableCell className="text-xs font-medium">{visitor.purpose}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge className={cn(
                          "rounded-none px-3 py-0.5 font-bold text-[9px] uppercase tracking-widest border-none shadow-none",
                          "bg-[#C8E6C9] text-[#2E7D32]"
                        )}>
                          ACTIVE
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredVisitors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm italic">
                        No visitors found for today.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-none bg-primary text-white p-6 relative overflow-hidden">
            <BookOpen className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
            <div className="relative z-10 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-widest">Library Mission</h4>
              <p className="text-sm leading-relaxed text-white/80 max-w-2xl">
                The NEU Library Visitor Log helps us monitor facility utilization and improve resources for our students and faculty. Thank you for maintaining accurate records.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
