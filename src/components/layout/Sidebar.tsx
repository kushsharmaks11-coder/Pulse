"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Grid,
  Users,
  FileText,
  Clock,
  CreditCard,
  Settings,
  User,
  Zap,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const initials = user?.full_name 
    ? user.full_name.substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "?";

  return (
    <div className="w-[80px] flex-shrink-0 bg-sidebar flex flex-col items-center py-6 h-screen border-r border-sidebar">
      {/* Logo */}
      <div className="mb-8 w-full">
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 group">
          <div className="w-10 h-10 bg-black flex items-center justify-center rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-brand/10">
             <Zap className="text-brand w-6 h-6 group-hover:animate-pulse" />
          </div>
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-gray-400 group-hover:text-gray-200 transition-colors">Pulse</span>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex flex-col gap-6 w-full items-center">
        <NavItem href="/dashboard" icon={<Grid className="w-5 h-5" />} active={pathname === "/dashboard"} title="Dashboard" />
        <NavItem href="/clients" icon={<Users className="w-5 h-5" />} active={pathname?.startsWith("/clients")} title="Clients" />
        <NavItem href="/orders" icon={<FileText className="w-5 h-5" />} active={pathname?.startsWith("/orders")} title="Orders" />
        <NavItem href="/billing" icon={<CreditCard className="w-5 h-5" />} active={pathname?.startsWith("/billing")} title="Billing" />
      </nav>

      {/* Bottom Nav */}
      <div className="mt-auto flex flex-col gap-6 w-full items-center">
        <NavItem href="/settings" icon={<Settings className="w-5 h-5" />} active={pathname?.startsWith("/settings")} title="Settings" />
        <div 
          className="w-8 h-8 rounded-full bg-brand/10 overflow-hidden flex items-center justify-center border border-brand/30 text-brand font-medium text-xs mb-2" 
          title={user?.email || ""}
        >
           {initials}
        </div>
        <form action={logout} className="w-full flex justify-center mb-4">
          <button type="submit" className="flex flex-col items-center gap-1 p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Log Out">
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-medium opacity-70">Logout</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function NavItem({ href, icon, active = false, title }: { href: string; icon: React.ReactNode; active?: boolean; title?: string }) {
  return (
    <Link
      href={href}
      title={title}
      className={`p-3 rounded-xl flex items-center justify-center transition-colors ${
        active ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
    </Link>
  );
}
