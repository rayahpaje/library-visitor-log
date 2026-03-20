"use client";

import { useMemo, useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Search, 
  Download,
  Calendar as CalendarIcon,
  Clock
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { format, parseISO } from "date-fns";
import { MOCK_VISITORS } from "@/lib/mock-data";

export default function VisitorLogs() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollege, setFilterCollege] = useState("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "visitors"), orderBy("timeIn", "desc"), limit(100));
  }, [db]);

  const { data: dbLogs, loading } = useCollection(logsQuery);

  const logs = useMemo(() => {
    const firestoreData = dbLogs || [];
    const mockData = MOCK_VISITORS.filter(m => !firestoreData.find(f => f.institutionalId === m.institutionalId));
    return [...firestoreData, ...mockData].sort((a, b) => 
      new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime()
    );
  }, [dbLogs]);

  const filteredLogs = useMemo(() => {
    return (logs as any[]).filter(log => {
      const matchesSearch = log.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           log.institutionalId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollege = filterCollege === "all" || log.college === filterCollege;
      return matchesSearch && matchesCollege;
    });
  }, [logs, searchTerm, filterCollege]);

  const formatDate = (isoString: string) => {
    if (!isMounted) return "--/--/--";
    try {
      return format(parseISO(isoString), "MMMM dd, yyyy");
    } catch {
      return "";
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#004D40] flex items-center gap-3">
              <Users className="w-8 h-8" />
              Detailed Student Logs
            </h1>
            <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest mt-1">Archive of all library entries</p>
          </div>
          <Button variant="outline" className="gap-2 border-[#004D40] text-[#004D40] hover:bg-[#004D40]/10 rounded-none h-10 px-6 font-bold uppercase tracking-wider text-xs">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        <Card className="border-none shadow-sm rounded-none overflow-hidden bg-white">
          <CardHeader className="pb-4 bg-white border-b">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <div className="relative w-full md:w-[350px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filter by name or ID..." 
                    className="pl-9 rounded-none h-10 border-muted-foreground/20 bg-[#F8F9FA] text-xs" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterCollege} onValueChange={setFilterCollege}>
                  <SelectTrigger className="w-full md:w-[220px] rounded-none h-10 border-muted-foreground/20 bg-[#F8F9FA] text-xs">
                    <SelectValue placeholder="All Colleges" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="all">All Colleges</SelectItem>
                    <SelectItem value="College of Informatics and Computing Science">College of Informatics and Computing Science</SelectItem>
                    <SelectItem value="College of Arts">College of Arts</SelectItem>
                    <SelectItem value="College of Science">College of Science</SelectItem>
                    <SelectItem value="College of Engineering">College of Engineering</SelectItem>
                    <SelectItem value="College of Business">College of Business</SelectItem>
                    <SelectItem value="College of Nursing">College of Nursing</SelectItem>
                    <SelectItem value="Staff/Faculty">Staff/Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#F8F9FA]">
                <TableRow>
                  <TableHead className="font-bold text-black uppercase text-[10px] tracking-widest py-4">
                    <div className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Date</div>
                  </TableHead>
                  <TableHead className="font-bold text-black uppercase text-[10px] tracking-widest">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Time In</div>
                  </TableHead>
                  <TableHead className="font-bold text-black uppercase text-[10px] tracking-widest">Student Information</TableHead>
                  <TableHead className="font-bold text-black uppercase text-[10px] tracking-widest">College / Office</TableHead>
                  <TableHead className="font-bold text-black uppercase text-[10px] tracking-widest">Purpose</TableHead>
                  <TableHead className="font-bold text-black text-right uppercase text-[10px] tracking-widest pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: any) => (
                  <TableRow key={log.id || log.name} className="hover:bg-muted/30 border-b">
                    <TableCell className="text-xs font-semibold py-4 text-muted-foreground">
                      {formatDate(log.timeIn)}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-[#004D40]">
                      {formatTime(log.timeIn)}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-[#004D40]">{log.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{log.institutionalId}</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{log.college}</TableCell>
                    <TableCell className="text-xs font-medium italic">"{log.purpose}"</TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge className="rounded-none px-3 py-0.5 font-bold text-[9px] uppercase tracking-widest border-none shadow-none bg-[#C8E6C9] text-[#2E7D32]">
                        ACTIVE
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}