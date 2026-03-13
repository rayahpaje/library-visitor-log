
"use client";

import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Search, 
  Calendar as CalendarIcon, 
  Filter,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
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
import { collection, query, orderBy, limit, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
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
    return dbLogs.length > 0 ? dbLogs : MOCK_VISITORS;
  }, [dbLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           log.institutionalId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollege = filterCollege === "all" || log.college === filterCollege;
      return matchesSearch && matchesCollege;
    });
  }, [logs, searchTerm, filterCollege]);

  const handleCheckout = (id: string) => {
    if (!db) return;
    updateDoc(doc(db, "visitors", id), { status: "Logged Out" });
    toast({ title: "Visitor Checked Out", description: "The session has been ended." });
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, "visitors", id));
    toast({ title: "Log Entry Deleted", description: "The record has been removed." });
  };

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen">
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
          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        <Card className="border-none shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-4 bg-white border-b">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search student name or ID..." 
                    className="pl-9" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterCollege} onValueChange={setFilterCollege}>
                  <SelectTrigger className="w-[200px]">
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
            {loading && dbLogs.length === 0 ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="font-bold text-black">Student Name</TableHead>
                    <TableHead className="font-bold text-black text-center">ID / Email</TableHead>
                    <TableHead className="font-bold text-black text-center">College / Office</TableHead>
                    <TableHead className="font-bold text-black text-center">Purpose</TableHead>
                    <TableHead className="font-bold text-black text-center">Time In</TableHead>
                    <TableHead className="font-bold text-black text-center">Status</TableHead>
                    <TableHead className="text-right font-bold text-black">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell className="font-bold text-primary">{log.name}</TableCell>
                      <TableCell className="text-center font-medium">{log.institutionalId}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-semibold border-primary/20 text-primary">
                          {log.college}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center max-w-[150px] truncate" title={log.purpose}>
                        {log.purpose}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-bold">
                          {new Date(log.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium">
                          {new Date(log.timeIn).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          className={log.status === 'Active' 
                            ? 'bg-[#C8E6C9] text-[#2E7D32] hover:bg-[#C8E6C9] px-4' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-200 px-4'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {log.status === 'Active' && (
                              <DropdownMenuItem onClick={() => handleCheckout(log.id)}>
                                Checkout Student
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive font-semibold" 
                              onClick={() => handleDelete(log.id)}
                            >
                              Delete Record
                            </DropdownMenuItem>
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
