"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  BookOpen,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Visitor Logs", href: "/admin/logs", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r bg-white h-screen sticky top-0 flex flex-col shadow-sm">
      <div className="p-6 border-b flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg text-primary tracking-tight">Admin Portal</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              pathname === item.href
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground hover:bg-secondary hover:text-primary"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              pathname === item.href ? "text-white" : "text-muted-foreground group-hover:text-primary"
            )} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary">
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </Button>
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/5">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </Link>
      </div>
    </div>
  );
}
