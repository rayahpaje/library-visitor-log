
"use client";

import { useMemo, useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Search, 
  Download,
  Loader2,
  MoreHorizontal,
  Filter,
  Ban
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
import { collection, query, orderBy, limit, addDoc } from "firebase/firestore";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { MOCK_VISITORS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function VisitorLogs() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollege, setFilterCollege] = useState("all");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const logsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "visitors"), orderBy("timeIn", "desc"), limit(100));
  }, [db]);

  const blockListQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "blockList");
  }, [db]);

  const { data: dbLogs, loading } = useCollection(logsQuery);
  const { data: dbBlockedUsers } = useCollection(blockListQuery);

  const blockedUserIds = useMemo(() => {
    return new Set((dbBlockedUsers || []).map(u => u.institutionalId));
  }, [dbBlockedUsers]);

  const logs = useMemo(() => {
    const firestoreData = dbLogs || [];
    const mockData = MOCK_VISITORS.filter(m => !firestoreData.find(f => f.institutionalId === m.institutionalId));
    return [...firestoreData, ...mockData];
  }, [dbLogs]);

  const filteredLogs = useMemo(() => {
    return (logs as any[]).filter(log => {
      const matchesSearch = log.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           log.institutionalId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollege = filterCollege === "all" || log.college === filterCollege;
      return matchesSearch && matchesCollege;
    });
  }, [logs, searchTerm, filterCollege]);

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

  const formatTime = (isoString: string) => {
    if (!isClient) return "--:--";
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    } catch {
      return "N/A";
    }
  };

  const formatDate = (isoString: string) => {
    if (!isClient) return "---";
    try {
      return new Date(isoString).toLocaleDateString();
    } catch {
      return "";
    }
  };

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-body">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Users className="w-8 h-8" />
              Detailed Student Logs
            </h1>
            <p className="text-muted-foreground">Comprehensive history of library entries.</p>
          </div>
          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10 rounded-none h-10 px-6 font-bold uppercase tracking-wider text-xs">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        <Card className="border-none shadow-sm rounded-none overflow-hidden bg-white">
          <CardHeader className="pb-4 bg-white border-b">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search students..." 
                    className="pl-9 rounded-none h-10 border-muted-foreground/20" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterCollege} onValueChange={setFilterCollege}>
                  <SelectTrigger className="w-[200px] rounded-none h-10 border-muted-foreground/20">
                    <SelectValue placeholder="Filter by College" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colleges</SelectItem>
                    <SelectItem value="College of Computing">College of Computing</SelectItem>
                    <SelectItem value="College of Arts">College of Arts</SelectItem>
                    <SelectItem value="College of Science">College of Science</SelectItem>
                    <SelectItem value="College of Engineering">College of Engineering</SelectItem>
                    <SelectItem value="College of Business">College of Business</SelectItem>
                    <SelectItem value="College of Nursing">College of Nursing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && dbLogs?.length === 0 ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-bold text-black uppercase text-[10px] tracking-widest">Student Name</TableHead>
                    <TableHead className="font-bold text-black text-center uppercase text-[10px] tracking-widest">ID / Email</TableHead>
                    <TableHead className="font-bold text-black text-center uppercase text-[10px] tracking-widest">College</TableHead>
                    <TableHead className="font-bold text-black text-center uppercase text-[10px] tracking-widest">Time In</TableHead>
                    <TableHead className="font-bold text-black text-center uppercase text-[10px] tracking-widest">Status</TableHead>
                    <TableHead className="text-right font-bold text-black uppercase text-[10px] tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log: any) => {
                    const isBlocked = blockedUserIds.has(log.institutionalId);
                    return (
                      <TableRow key={log.id || log.name} className="hover:bg-gray-50 border-b">
                        <TableCell className="font-bold text-primary py-4">{log.name}</TableCell>
                        <TableCell className="text-center font-medium">{log.institutionalId}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-semibold border-primary/20 text-primary rounded-none">
                            {log.college}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">{formatTime(log.timeIn)}</div>
                          <div className="text-[10px] text-muted-foreground font-medium uppercase">{formatDate(log.timeIn)}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={cn(
                              "px-4 rounded-none font-bold uppercase text-[10px] tracking-widest border-none",
                              isBlocked 
                                ? "bg-destructive/10 text-destructive"
                                : "bg-[#C8E6C9] text-[#2E7D32]"
                            )}
                          >
                            {isBlocked ? "BLOCK" : "ACTIVE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!isBlocked && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-none">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-none border-none shadow-xl">
                                <DropdownMenuItem onClick={() => handleBlockUser(log)} className="text-destructive font-bold text-xs uppercase tracking-widest cursor-pointer">
                                  <Ban className="w-4 h-4 mr-2" />
                                  Block Access
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
