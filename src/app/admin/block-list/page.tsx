"use client";

import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Ban, 
  Search, 
  Plus, 
  UserCheck,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  UserX
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, doc, deleteDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { MOCK_BLOCKED } from "@/lib/mock-data";

export default function BlockListManagement() {
  const db = useFirestore();
  const [isAdding, setIsAdding] = useState(false);
  const [newBlock, setNewBlock] = useState({ name: "", institutionalId: "", reason: "" });
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const blockListQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "blockList");
  }, [db]);

  const { data: dbBlockedUsers, loading } = useCollection(blockListQuery);

  const blockedUsers = useMemo(() => {
    if (dbBlockedUsers && dbBlockedUsers.length > 0) return dbBlockedUsers;
    return MOCK_BLOCKED;
  }, [dbBlockedUsers]);

  const filteredBlockedUsers = useMemo(() => {
    return (blockedUsers as any[]).filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.institutionalId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blockedUsers, searchTerm]);

  const handleAddBlock = () => {
    if (!db || !newBlock.name || !newBlock.institutionalId) {
      toast({ variant: "destructive", title: "Missing info", description: "Name and ID are required." });
      return;
    }

    setIsAdding(true);
    const blockData = {
      ...newBlock,
      dateBlocked: new Date().toISOString().split('T')[0]
    };

    addDoc(collection(db, "blockList"), blockData)
      .then(() => {
        setNewBlock({ name: "", institutionalId: "", reason: "" });
        setOpen(false);
        setIsAdding(false);
        toast({ title: "Individual Blocked", description: `${newBlock.name} has been restricted.` });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: "blockList",
          operation: "create",
          requestResourceData: blockData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setIsAdding(false);
      });
  };

  const handleRemoveBlock = (id: string, name: string) => {
    if (!db || !id) return;
    
    // Check if it's a mock record (mock records usually don't have Firestore-style IDs)
    if (id.startsWith('b') && id.length < 5) {
      toast({ title: "Demo Record", description: "This is a hardcoded demonstration record and cannot be deleted from the database. Please initialize the system to use real records." });
      return;
    }

    const docRef = doc(db, "blockList", id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Access Restored", description: `${name} can now access the library.` });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: "delete",
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
              <Ban className="w-8 h-8 text-destructive" />
              Security Database
            </h1>
            <p className="text-muted-foreground">Manage restricted individuals and maintain library safety.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-destructive hover:bg-destructive/90 text-white gap-2 h-11 px-6 font-bold uppercase tracking-wider text-xs shadow-lg rounded-none border-b-4 border-[#B00000]">
                <Plus className="w-4 h-4" />
                Manually Restrict
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-none border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-primary font-bold">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                  RESTRICT ACCESS
                </DialogTitle>
                <DialogDescription>
                  Enter details for the individual who will be restricted from library access.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    className="bg-[#F4F7F5] border-none font-medium h-10 rounded-none"
                    value={newBlock.name}
                    onChange={(e) => setNewBlock({...newBlock, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="id" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Institutional ID / Email</Label>
                  <Input 
                    id="id" 
                    placeholder="e.g. 2019-XXXX" 
                    className="bg-[#F4F7F5] border-none font-medium h-10 rounded-none"
                    value={newBlock.institutionalId}
                    onChange={(e) => setNewBlock({...newBlock, institutionalId: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reason for Restriction</Label>
                  <Textarea 
                    id="reason" 
                    placeholder="Detail the violation or security concern..." 
                    className="bg-[#F4F7F5] border-none font-medium min-h-[100px] rounded-none"
                    value={newBlock.reason}
                    onChange={(e) => setNewBlock({...newBlock, reason: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="rounded-none font-bold uppercase text-xs" onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="destructive" className="rounded-none font-bold uppercase text-xs shadow-md" onClick={handleAddBlock} disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Confirm Restriction"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm rounded-none overflow-hidden bg-white">
            <CardHeader className="pb-4 bg-white border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Blocked Visitors</CardTitle>
                <CardDescription className="text-xs">Active restrictions currently being enforced.</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter blocked users..." 
                  className="pl-9 w-[240px] h-9 text-xs border-muted-foreground/20 rounded-none" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading && dbBlockedUsers?.length === 0 ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-destructive" />
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-[#F8F9FA]">
                    <TableRow>
                      <TableHead className="text-[10px] font-bold uppercase py-4">Individual</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Date Blocked</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Reason</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBlockedUsers.map((user: any) => (
                      <TableRow key={user.id || user.name} className="group hover:bg-muted/30">
                        <TableCell>
                          <div className="font-bold text-sm">{user.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.institutionalId}</div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{user.dateBlocked}</TableCell>
                        <TableCell className="text-xs italic text-muted-foreground max-w-[200px] truncate" title={user.reason}>
                          {user.reason || "No reason specified"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-primary hover:bg-primary/10 gap-2 border-primary h-8 px-4 font-bold text-[10px] uppercase rounded-none"
                            onClick={() => handleRemoveBlock(user.id, user.name)}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Unblock Access
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredBlockedUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-sm italic">
                          No restricted individuals found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none bg-primary text-white shadow-lg overflow-hidden relative rounded-none">
              <UserX className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest">Policy Enforcement</CardTitle>
                <CardDescription className="text-white/70 text-xs">
                  Restriction on access is a critical measure for institutional safety.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white/10 border-l-2 border-white/30 text-xs leading-relaxed font-medium">
                  <strong>Security:</strong> All visitor IDs are automatically checked against this database during sign-in.
                </div>
                <div className="p-4 bg-white/10 border-l-2 border-white/30 text-xs leading-relaxed font-medium">
                  <strong>Logging:</strong> All blocked entry attempts are recorded for administrative review and security monitoring.
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-none bg-white">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Recent Incident Log</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {filteredBlockedUsers?.slice(0, 5).map((user: any) => (
                  <div key={user.id || user.name} className="flex gap-3 items-start border-b border-secondary pb-4 last:border-0 last:pb-0">
                    <div className="p-2 bg-destructive/10 rounded-sm">
                      <AlertTriangle className="w-3 h-3 text-destructive" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground italic leading-tight mt-1">"{user.reason || 'No reason specified'}"</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
