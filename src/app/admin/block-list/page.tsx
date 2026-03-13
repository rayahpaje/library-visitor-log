
'use client';

import { useMemo, useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Ban, 
  Search, 
  UserCheck,
  Loader2
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
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { MOCK_BLOCKED } from "@/lib/mock-data";

export default function BlockListManagement() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [unblockedIds, setUnblockedIds] = useState<string[]>([]);

  const blockListQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "blockList");
  }, [db]);

  const { data: dbBlockedUsers, loading } = useCollection(blockListQuery);

  const blockedUsers = useMemo(() => {
    const firestoreData = dbBlockedUsers || [];
    const mockData = MOCK_BLOCKED.filter(m => !firestoreData.find(f => f.institutionalId === m.institutionalId));
    return [...firestoreData, ...mockData].filter(u => !unblockedIds.includes(u.institutionalId));
  }, [dbBlockedUsers, unblockedIds]);

  const filteredBlockedUsers = useMemo(() => {
    return (blockedUsers as any[]).filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.institutionalId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blockedUsers, searchTerm]);

  const handleUnrestrict = async (user: any) => {
    if (!db) return;
    
    // Optimistically update UI
    setUnblockedIds(prev => [...prev, user.institutionalId]);
    
    const q = query(collection(db, "blockList"), where("institutionalId", "==", user.institutionalId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      querySnapshot.forEach((docSnap) => {
        deleteDoc(doc(db, "blockList", docSnap.id));
      });
    }
    
    toast({ title: "Access Restored", description: `${user.name} library access is now ACTIVE.` });
  };

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-body">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Ban className="w-8 h-8 text-destructive" />
              Security Database
            </h1>
            <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mt-1">Manage library access restrictions</p>
          </div>
        </div>

        <Card className="border-none shadow-sm rounded-none overflow-hidden bg-white">
          <CardHeader className="pb-4 bg-white border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Restricted Individuals</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Filter block list..." 
                className="pl-9 w-[280px] h-10 text-xs border-muted-foreground/20 rounded-none bg-[#F8F9FA]" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (!dbBlockedUsers || dbBlockedUsers.length === 0) ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-[#F8F9FA]">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase py-4">Student Info</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase">Reason</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase">Date Blocked</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-right pr-6">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlockedUsers.map((user: any) => (
                    <TableRow key={user.id || user.institutionalId} className="group hover:bg-muted/30">
                      <TableCell className="py-4">
                        <div className="font-bold text-sm text-primary">{user.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.institutionalId}</div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground italic">"{user.reason}"</TableCell>
                      <TableCell className="text-xs font-medium">{user.dateBlocked}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-primary hover:bg-primary/5 gap-2 border-primary h-8 px-4 font-bold text-[10px] uppercase rounded-none"
                          onClick={() => handleUnrestrict(user)}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Unrestrict Access
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBlockedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-sm italic">
                        No restricted students found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
