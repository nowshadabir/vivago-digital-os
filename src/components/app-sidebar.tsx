"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CircleDollarSign,
  CircleUserRound,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Scale,
  ReceiptText,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  activePath:
    | "/dashboard"
    | "/projects"
    | "/clients"
    | "/invoices"
    | "/payment-record"
    | "/payments"
    | "/profit-loss"
    | "/files"
    | "/credentials"
    | "/reminders"
    | "/profile"
    | "/team";
  className?: string;
};

type SidebarUser = {
  id: string;
  name: string;
  position: string | null;
  email: string;
  role: "USER" | "ADMIN";
  image: string | null;
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BriefcaseBusiness, label: "Projects", href: "/projects" },
  { icon: Users, label: "Clients", href: "/clients" },
  { icon: ReceiptText, label: "Invoices", href: "/invoices" },
  { icon: CircleDollarSign, label: "Payments", href: "/payments" },
  { icon: Scale, label: "Profit/Loss", href: "/profit-loss" },
  { icon: FileText, label: "Files", href: "/files" },
  { icon: KeyRound, label: "Credentials", href: "/credentials" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
  { icon: Users, label: "Team", href: "/team" },
] as const;

const MOCK_SIDEBAR_USER: SidebarUser = {
  id: "1",
  name: "Kazi Nowshad Abir",
  position: "Operations Manager",
  email: "nowshad@vivagodigital.com",
  role: "ADMIN",
  image: "/uploads/profiles/avatar.png",
};

export function AppSidebar({ activePath, className }: AppSidebarProps) {
  const router = useRouter();
  const [loggedInUser, setLoggedInUser] = useState<SidebarUser | null>(MOCK_SIDEBAR_USER);

  useEffect(() => {
    // Already using mock data nowshad, no need to fetch.
    setLoggedInUser(MOCK_SIDEBAR_USER);
  }, []);

  const handleLogout = () => {
    setLoggedInUser(null);
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl lg:overflow-auto",
        className
      )}
    >
      <div className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">VIVAGO DIGITAL</p>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Operations OS</h1>
      </div>

      <nav className="space-y-2 text-sm">
        {navItems.map((item) => {
          const NavIcon = item.icon;
          const isActive = item.href === activePath;

          return (
            <Link
              key={item.label}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                isActive
                  ? "bg-cyan-100 text-cyan-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
              href={item.href}
            >
              <NavIcon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/profile"
        className={cn(
          "mt-4 flex items-center gap-3 rounded-2xl border px-3 py-3 transition",
          activePath === "/profile"
            ? "border-cyan-200 bg-cyan-50"
            : "border-slate-200 bg-white/90 hover:bg-slate-100"
        )}
      >
        {loggedInUser?.image && loggedInUser.image.startsWith("http") ? (
          <img
            src={loggedInUser.image}
            alt={loggedInUser.name}
            className="h-9 w-9 rounded-xl object-cover"
          />
        ) : (
          <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
            <CircleUserRound className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {loggedInUser?.name ?? "No user found"}
          </p>
          <p className="truncate text-xs text-slate-600">{loggedInUser?.position ?? loggedInUser?.role ?? "-"}</p>
          <p className="truncate text-[11px] text-slate-500">{loggedInUser?.email ?? "-"}</p>
        </div>
        <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
      </Link>

      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full justify-start border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </aside>
  );
}