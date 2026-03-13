
"use client";

import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Ban, 
  Search, 
  Plus, 
  Trash2, 
  UserX,
  ShieldAlert,
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

export default function BlockListManagement() {
  const db = useFirestore();
  const [isAdding, setIsAdding] = useState(false);
  const [newBlock, setNewBlock] = useState({ name: "", institutionalId: "", reason: "" });
  const [open, setOpen] = useState(false);

  const blockListQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "blockList");
  }, [db]);

  const { data: blockedUsers, loading } = useCollection(blockListQuery);

  const handleAddBlock = async () => {
    if (!db || !newBlock.name || !newBlock.institutionalId) {
      toast({ variant: "destructive", title: "Missing info", description: "All fields are required." });
      return;
    }

    setIsAdding(true);
    try {
      await addDoc(collection(db, "blockList"), {
        ...newBlock,
        dateBlocked: new Date().toISOString().split('T')[0]
      });
      setNewBlock({ name: "", institutionalId: "", reason: "" });
      setOpen(false);
      toast({ title: "Individual Blocked", description: `${newBlock.name} has been restricted.` });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveBlock = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "blockList", id));
      toast({ title: "Restriction Removed", description: "The individual can now access the library." });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Ban className="w-8 h-8 text-destructive" />
              Block List Management
            </h1>
            <p className="text-muted-foreground">Manage restricted individuals and maintain library safety.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-destructive hover:bg-destructive/90 text-white gap-2">
                <Plus className="w-4 h-4" />
                Restrict Access
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                  Add to Block List
                </DialogTitle>
                <DialogDescription>
                  Enter details for the individual who will be restricted from library access.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    value={newBlock.name}
                    onChange={(e) => setNewBlock({...newBlock, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="id">Institutional ID / Email</Label>
                  <Input 
                    id="id" 
                    placeholder="e.g. 2019-XXXX" 
                    value={newBlock.institutionalId}
                    onChange={(e) => setNewBlock({...newBlock, institutionalId: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">Reason for Restriction</Label>
                  <Textarea 
                    id="reason" 
                    placeholder="Detail the violation or security concern..." 
                    value={newBlock.reason}
                    onChange={(e) => setNewBlock({...newBlock, reason: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleAddBlock} disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Confirm Restriction"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Restricted Access Logs</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Filter blocked users..." className="pl-9 w-[240px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-destructive" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Individual</TableHead>
                      <TableHead className="font-bold">Date Blocked</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedUsers?.map((user) => (
                      <TableRow key={user.id} className="group">
                        <TableCell>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.institutionalId}</div>
                        </TableCell>
                        <TableCell>{user.dateBlocked}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                            Blocked
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveBlock(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {blockedUsers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
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
            <Card className="border-none bg-primary text-white shadow-lg overflow-hidden relative">
              <UserX className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
              <CardHeader>
                <CardTitle className="text-lg">Policy Enforcement</CardTitle>
                <CardDescription className="text-white/70">
                  Restriction on access is a critical measure for institutional safety.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-white/10 rounded-lg text-sm">
                  <strong>Security:</strong> All visitor IDs are automatically checked against this database.
                </div>
                <div className="p-3 bg-white/10 rounded-lg text-sm">
                  <strong>Logging:</strong> All blocked entry attempts are recorded for administrative review.
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Recent Reasons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {blockedUsers?.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex gap-4 items-start border-b border-secondary pb-4 last:border-0 last:pb-0">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <Ban className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground italic">"{user.reason || 'No reason provided'}"</p>
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
