
"use client";

import { useMemo, useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Users, 
  Search, 
  Download,
  Calendar as CalendarIcon,
  Clock,
  BadgeCheck,
  GraduationCap
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
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { format, parseISO } from "date-fns";
import { MOCK_VISITORS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function VisitorLogs() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollege, setFilterCollege] = useState("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "visitors"), orderBy("timeIn", "desc"), limit(200));
  }, [db]);

  const blockQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "blockList");
  }, [db]);

  const { data: dbLogs } = useCollection(logsQuery);
  const { data: dbBlocked } = useCollection(blockQuery);

  const logs = useMemo(() => {
    const firestoreData = dbLogs || [];
    const mockData = MOCK_VISITORS.filter(m => !firestoreData.find(f => f.institutionalId === m.institutionalId));
    return [...firestoreData, ...mockData].sort((a, b) => 
      new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime()
    );
  }, [dbLogs]);

  const blockedIds = useMemo(() => {
    return new Set((dbBlocked || []).map(b => b.institutionalId));
  }, [dbBlocked]);

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
    try { return format(parseISO(isoString), "MMMM dd, yyyy"); } catch { return ""; }
  };

  const formatTime = (isoString: string) => {
    if (!isMounted) return "--:--";
    try { return format(parseISO(isoString), "hh:mm a").toLowerCase(); } catch { return "N/A"; }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-body flex flex-col">
      <SiteHeader />
      <main className="flex-1 p-6 md:p-8 max-w-[1400px] mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3">
              <Users className="w-8 h-8" />
              Detailed Student Logs
            </h1>
            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Archive of all library entries</p>
          </div>
          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5 rounded-none h-10 px-6 font-bold uppercase tracking-wider text-xs shadow-sm transition-all">
            <Download className="w-4 h-4" />
            Export Archive
          </Button>
        </div>

        <Card className="border-none shadow-sm rounded-none overflow-hidden bg-white">
          <CardHeader className="pb-4 bg-white border-b">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <div className="relative w-full md:w-[400px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search logs by student name or ID..." 
                    className="pl-9 rounded-none h-10 border-muted-foreground/20 bg-[#F8F9FA] text-xs font-bold" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterCollege} onValueChange={setFilterCollege}>
                  <SelectTrigger className="w-full md:w-[250px] rounded-none h-10 border-muted-foreground/20 bg-[#F8F9FA] text-xs font-bold">
                    <SelectValue placeholder="All Colleges" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="all">All Colleges / Depts</SelectItem>
                    <SelectItem value="College of Informatics and Computing Science">CICS</SelectItem>
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
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F8F9FA]">
                <TableRow className="border-b">
                  <TableHead className="font-black text-black uppercase text-[10px] tracking-widest py-4">Date & Time In</TableHead>
                  <TableHead className="font-black text-black uppercase text-[10px] tracking-widest">Student Information</TableHead>
                  <TableHead className="font-black text-black uppercase text-[10px] tracking-widest">College / Office</TableHead>
                  <TableHead className="font-black text-black uppercase text-[10px] tracking-widest">Identification</TableHead>
                  <TableHead className="font-black text-black uppercase text-[10px] tracking-widest">Purpose of Visit</TableHead>
                  <TableHead className="font-black text-black text-right uppercase text-[10px] tracking-widest pr-10">Current Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: any) => {
                  const isStaff = log.college === "Staff/Faculty";
                  const isInactive = blockedIds.has(log.institutionalId);
                  
                  return (
                    <TableRow key={log.id || `${log.institutionalId}-${log.timeIn}`} className={cn("hover:bg-muted/30 border-b", isInactive && "bg-red-50/20")}>
                      <TableCell className="py-4">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-black text-primary flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatTime(log.timeIn)}</span>
                          <span className="text-muted-foreground font-bold flex items-center gap-1.5"><CalendarIcon className="w-3 h-3" /> {formatDate(log.timeIn)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-black text-sm text-primary">{log.name}</div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{log.institutionalId}</div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-muted-foreground">{log.college}</TableCell>
                      <TableCell>
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                          isStaff ? "bg-accent text-accent-foreground shadow-sm" : "bg-neutral-200 text-neutral-600"
                        )}>
                          {isStaff ? <BadgeCheck className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                          {isStaff ? "Staff / Admin" : "Student"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold italic text-primary">"{log.purpose}"</TableCell>
                      <TableCell className="text-right pr-10">
                        <Badge className={cn(
                          "rounded-none px-4 py-1 font-black text-[9px] uppercase tracking-[0.2em] border-none shadow-none",
                          isInactive ? "bg-red-100 text-red-700" : "bg-[#C8E6C9] text-[#2E7D32]"
                        )}>
                          {isInactive ? "INACTIVE" : "ACTIVE"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
