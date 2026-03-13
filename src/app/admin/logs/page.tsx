"use client";

import { useMemo, useState } from "react";
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
import { collection, query, orderBy, limit, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { MOCK_VISITORS } from "@/lib/mock-data";

export default function VisitorLogs() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollege, setFilterCollege] = useState("all");

  const logsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "visitors"), orderBy("timeIn", "desc"), limit(100));
  }, [db]);

  const { data: dbLogs, loading } = useCollection(logsQuery);

  const logs = useMemo(() => {
    if (dbLogs && dbLogs.length > 0) return dbLogs;
    return MOCK_VISITORS;
  }, [dbLogs]);

  const filteredLogs = useMemo(() => {
    return (logs as any[]).filter(log => {
      const matchesSearch = log.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           log.institutionalId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollege = filterCollege === "all" || log.college === filterCollege;
      return matchesSearch && matchesCollege;
    });
  }, [logs, searchTerm, filterCollege]);

  const handleCheckout = (id: string) => {
    if (!db || !id) return;
    
    // Check if it's a demo record
    if (id.length < 5) {
      toast({ title: "Demo Mode", description: "Checkout complete (Simulation only)." });
      return;
    }

    const docRef = doc(db, "visitors", id);
    updateDoc(docRef, { status: "Logged Out" })
      .then(() => {
        toast({ title: "Visitor Checked Out", description: "The session has been ended." });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: "update",
          requestResourceData: { status: "Logged Out" },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDelete = (id: string) => {
    if (!db || !id) return;

    if (id.length < 5) {
      toast({ title: "Demo Mode", description: "Cannot delete built-in demo records. Please initialize the system." });
      return;
    }

    const docRef = doc(db, "visitors", id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Log Entry Deleted", description: "The record has been removed." });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: "delete",
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleBlockUser = (visitor: any) => {
    if (!db) return;
    
    const blockData = {
      name: visitor.name,
      institutionalId: visitor.institutionalId,
      reason: "Blocked from activity logs for investigation.",
      dateBlocked: new Date().toISOString().split('T')[0]
    };

    addDoc(collection(db, "blockList"), blockData)
      .then(() => {
        toast({ title: "Visitor Restricted", description: `${visitor.name} has been added to the security database.` });
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
            <p className="text-muted-foreground">Comprehensive history of library entries and exits.</p>
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
                    placeholder="Search student name or ID..." 
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
                    <SelectItem value="Staff/Faculty">Staff/Faculty</SelectItem>
                    <SelectItem value="External Visitor">External Visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Filter className="w-4 h-4" />
                <span>Showing {filteredLogs.length} entries</span>
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
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="font-bold text-black uppercase text-[10px] tracking-widest">Student Name</TableHead>
                    <TableHead className="font-bold text-black text-center uppercase text-[10px] tracking-widest">ID / Email</TableHead>
                    <TableHead className="font-bold text-black text-center uppercase text-[10px] tracking-widest">College / Office</TableHead>
                    <TableHead className="font-bold text-black text-center uppercase text-[10px] tracking-widest">Purpose</TableHead>
                    <TableHead className="font-bold text-black text-center uppercase text-[10px] tracking-widest">Time In</TableHead>
                    <TableHead className="font-bold text-black text-center uppercase text-[10px] tracking-widest">Status</TableHead>
                    <TableHead className="text-right font-bold text-black uppercase text-[10px] tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log: any) => (
                    <TableRow key={log.id || log.name} className="hover:bg-gray-50 border-b">
                      <TableCell className="font-bold text-primary py-4">{log.name}</TableCell>
                      <TableCell className="text-center font-medium">{log.institutionalId}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-semibold border-primary/20 text-primary rounded-none">
                          {log.college}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center max-w-[150px] truncate" title={log.purpose}>
                        {log.purpose}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-bold">
                          {log.timeIn ? new Date(log.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : "N/A"}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium uppercase">
                          {log.timeIn ? new Date(log.timeIn).toLocaleDateString() : ""}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          className={log.status === 'Active' 
                            ? 'bg-[#C8E6C9] text-[#2E7D32] hover:bg-[#C8E6C9] px-4 rounded-none font-bold uppercase text-[10px] tracking-widest' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-200 px-4 rounded-none font-bold uppercase text-[10px] tracking-widest'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-none">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-none border-none shadow-xl">
                            {log.status === 'Active' && log.id && (
                              <DropdownMenuItem onClick={() => handleCheckout(log.id)} className="font-bold text-xs uppercase tracking-widest cursor-pointer">
                                Checkout Student
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleBlockUser(log)} className="text-destructive font-bold text-xs uppercase tracking-widest cursor-pointer">
                              <Ban className="w-4 h-4 mr-2" />
                              Restrict Access
                            </DropdownMenuItem>
                            {log.id && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-muted-foreground font-bold text-xs uppercase tracking-widest cursor-pointer" 
                                  onClick={() => handleDelete(log.id)}
                                >
                                  Delete Record
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
