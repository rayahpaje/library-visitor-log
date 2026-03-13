"use client";

import { useMemo, useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  UserCheck, 
  Search,
  Calendar as CalendarIcon,
  Clock
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
import { isToday, startOfWeek, isAfter, parseISO, format } from "date-fns";
import { MOCK_VISITORS } from "@/lib/mock-data";

export default function AdminDashboard() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const visitorsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "visitors"), orderBy("timeIn", "desc"), limit(50));
  }, [db]);

  const { data: dbVisitors, loading } = useCollection(visitorsQuery);

  const visitors = useMemo(() => {
    const firestoreData = dbVisitors || [];
    const mockData = MOCK_VISITORS.filter(m => !firestoreData.find(f => f.institutionalId === m.institutionalId));
    return [...firestoreData, ...mockData].sort((a, b) => 
      new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime()
    );
  }, [dbVisitors]);

  const stats = useMemo(() => {
    if (!isMounted) return [
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
  }, [visitors, isMounted]);

  const filteredVisitors = useMemo(() => {
    return visitors.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.institutionalId.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 15);
  }, [visitors, searchTerm]);

  // Safe rendering for dates/times to avoid hydration mismatch
  const formatDate = (isoString: string) => {
    if (!isMounted) return "--/--/--";
    try {
      return format(parseISO(isoString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatTime = (isoString: string) => {
    if (!isMounted) return "--:--";
    try {
      return format(parseISO(isoString), "hh:mm a").toLowerCase();
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-body flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 p-6 md:p-8 max-w-[1400px] mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm rounded-none bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-[#004D40]/10 p-3 rounded-none">
                  <stat.icon className="w-6 h-6 text-[#004D40]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-[#004D40]">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-sm rounded-none bg-white">
          <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b pb-4 gap-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#004D40]">Visitor Activity Logs</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or student ID..." 
                className="pl-9 h-10 text-xs border-muted-foreground/20 rounded-none bg-[#F8F9FA]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#F8F9FA]">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase py-4">
                    <div className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Date</div>
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Time</div>
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">Student Information</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">College / Office</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">Purpose of Visit</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-right pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <TableRow key={visitor.id || visitor.institutionalId} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-semibold py-4 text-muted-foreground">
                      {formatDate(visitor.timeIn)}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-[#004D40]">
                      {formatTime(visitor.timeIn)}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-[#004D40]">{visitor.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{visitor.institutionalId}</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{visitor.college}</TableCell>
                    <TableCell className="text-xs font-medium italic">"{visitor.purpose}"</TableCell>
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
                {filteredVisitors.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm italic">
                      No matching visitor records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
