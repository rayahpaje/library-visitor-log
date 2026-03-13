"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { MOCK_VISITORS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  UserPlus, 
  Ban, 
  Clock, 
  Search, 
  Download, 
  MoreHorizontal,
  ArrowUpRight
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
  const stats = [
    { title: "Today's Visitors", value: "128", icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { title: "Active Sessions", value: "42", icon: UserPlus, color: "text-accent", bg: "bg-accent/10" },
    { title: "Weekly Average", value: "854", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Blocked Individuals", value: "12", icon: Ban, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard Overview</h1>
            <p className="text-muted-foreground">Real-time visitor analytics and control center.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Live Feed
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Logs Table */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="text-xl font-bold">Recent Visitor Activity</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">A comprehensive record of today's library entries.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search name, ID or college..." className="pl-9 w-[300px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="font-bold text-primary">Visitor Name</TableHead>
                  <TableHead className="font-bold text-primary">Institutional ID</TableHead>
                  <TableHead className="font-bold text-primary">College / Office</TableHead>
                  <TableHead className="font-bold text-primary">Purpose</TableHead>
                  <TableHead className="font-bold text-primary">Time In</TableHead>
                  <TableHead className="font-bold text-primary">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_VISITORS.map((visitor) => (
                  <TableRow key={visitor.id} className="hover:bg-accent/5">
                    <TableCell className="font-medium">{visitor.name}</TableCell>
                    <TableCell>{visitor.institutionalId}</TableCell>
                    <TableCell>{visitor.college}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{visitor.purpose}</TableCell>
                    <TableCell>{new Date(visitor.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={visitor.status === 'Active' ? 'default' : 'secondary'}
                        className={visitor.status === 'Active' ? 'bg-accent text-white hover:bg-accent/90' : ''}
                      >
                        {visitor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Checkout Visitor</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Block Visitor</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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