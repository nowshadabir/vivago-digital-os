"use client";

import Link from "next/link";
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
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Scale,
  Settings,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/sidebar-context";
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
  | "/team"
  | "/settings";
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
  { icon: Settings, label: "Settings", href: "/settings" },
] as const;

const MOCK_SIDEBAR_USER: SidebarUser = {
  id: "1",
  name: "Kazi Nowshad Abir",
  position: "Operations Manager",
  email: "nowshad@getvivago.com",
  role: "ADMIN",
  image: "/uploads/profiles/avatar.png",
};

export function AppSidebar({ activePath, className }: AppSidebarProps) {
  const router = useRouter();
  const { isCollapsed, toggleSidebar, isMobileOpen, toggleMobile, closeMobile } =
    useSidebar();
  const [loggedInUser, setLoggedInUser] = useState<SidebarUser | null>(
    MOCK_SIDEBAR_USER
  );

  useEffect(() => {
    // Mock user state
    setLoggedInUser(MOCK_SIDEBAR_USER);
  }, []);

  const handleLogout = () => {
    setLoggedInUser(null);
    closeMobile();
    router.push("/");
  };

  return (
    <>
      {/* ---------------- MOBILE TOP BAR (< lg) ---------------- */}
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/85 p-3.5 shadow-sm backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMobile}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Vivago Technologies
            </p>
            <h1 className="font-display text-base font-semibold text-slate-900">
              Operations OS
            </h1>
          </div>
        </div>

        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
          title="My Profile"
        >
          {loggedInUser?.image && loggedInUser.image.startsWith("http") ? (
            <img
              src={loggedInUser.image}
              alt={loggedInUser.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <CircleUserRound className="h-5 w-5 text-slate-600" />
          )}
        </Link>
      </div>

      {/* ---------------- MOBILE DRAWER BACKDROP & PANEL ---------------- */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in-0"
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out animate-in slide-in-from-left">
            <div className="overflow-y-auto no-scrollbar">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                    Vivago Tech
                  </p>
                  <h2 className="font-display text-xl font-semibold text-slate-900">
                    Operations OS
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="space-y-1.5 text-sm">
                {navItems.map((item) => {
                  const NavIcon = item.icon;
                  const isActive = item.href === activePath;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMobile}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium transition",
                        isActive
                          ? "border border-cyan-200/60 bg-cyan-100/90 text-cyan-950 shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <NavIcon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-cyan-700" : "text-slate-500"
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom profile & logout */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <Link
                href="/profile"
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-2.5 transition",
                  activePath === "/profile"
                    ? "border-cyan-200 bg-cyan-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                )}
              >
                {loggedInUser?.image &&
                  loggedInUser.image.startsWith("http") ? (
                  <img
                    src={loggedInUser.image}
                    alt={loggedInUser.name}
                    className="h-8 w-8 rounded-xl object-cover"
                  />
                ) : (
                  <div className="rounded-xl bg-slate-100 p-1.5 text-slate-700">
                    <CircleUserRound className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {loggedInUser?.name ?? "No user"}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {loggedInUser?.position ?? loggedInUser?.role ?? "-"}
                  </p>
                </div>
              </Link>

              <Button
                type="button"
                variant="outline"
                className="mt-2.5 w-full justify-start gap-2 rounded-xl border-slate-200 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* ---------------- DESKTOP FIXED SIDEBAR (lg:) ---------------- */}
      <aside
        className={cn(
          "hidden lg:flex fixed bottom-4 left-4 top-4 z-40 flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl transition-[width,padding] duration-300 ease-in-out overflow-y-auto no-scrollbar",
          isCollapsed ? "w-[76px] p-3" : "w-[300px] p-5",
          className
        )}
      >
        {/* TOP / HEADER & NAVIGATION */}
        <div className="flex flex-col">
          {/* Header Row */}
          {isCollapsed ? (
            <div className="mb-6 flex flex-col items-center gap-3">
              {/* Brand Mini Badge */}
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-sky-700 text-white font-bold text-sm shadow-md shadow-cyan-600/20">
                VT
              </div>

              {/* Expand Toggle Button */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                title="Expand sidebar (Ctrl+B)"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4 transition-transform group-hover:scale-110" />

                {/* Hover Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3 hidden md:group-hover:flex items-center rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-xl whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  Expand sidebar (Ctrl+B)
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                </span>
              </button>
            </div>
          ) : (
            <div className="mb-6 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Vivago Technologies
                </p>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                  Operations OS
                </h1>
              </div>

              {/* Collapse Toggle Button */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="group relative mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                title="Collapse sidebar (Ctrl+B)"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4 transition-transform group-hover:scale-110" />

                {/* Hover Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3 hidden md:group-hover:flex items-center rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-xl whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  Collapse sidebar (Ctrl+B)
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                </span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-sm">
            {navItems.map((item) => {
              const NavIcon = item.icon;
              const isActive = item.href === activePath;

              if (isCollapsed) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "group relative flex h-11 w-11 items-center justify-center mx-auto rounded-2xl transition-all duration-150",
                      isActive
                        ? "border border-cyan-200/60 bg-cyan-100/90 text-cyan-900 shadow-xs"
                        : "text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <NavIcon
                      className={cn(
                        "h-4 w-4 transition-transform duration-150 group-hover:scale-110",
                        isActive ? "text-cyan-700" : "text-slate-500"
                      )}
                    />

                    {/* Collapsed Tooltip */}
                    <span className="pointer-events-none absolute left-full ml-3.5 hidden md:group-hover:flex items-center rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                      {item.label}
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium transition duration-150",
                    isActive
                      ? "border border-cyan-200/60 bg-cyan-100/90 text-cyan-950 shadow-xs font-semibold"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  )}
                >
                  <NavIcon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
                      isActive ? "text-cyan-700" : "text-slate-500"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM / USER PROFILE & LOGOUT */}
        <div className="mt-6 border-t border-slate-100/80 pt-3">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              {/* Collapsed User Avatar Link */}
              <Link
                href="/profile"
                className={cn(
                  "group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-150",
                  activePath === "/profile"
                    ? "border-cyan-300 bg-cyan-50 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-100"
                )}
              >
                {loggedInUser?.image &&
                  loggedInUser.image.startsWith("http") ? (
                  <img
                    src={loggedInUser.image}
                    alt={loggedInUser.name}
                    className="h-7 w-7 rounded-xl object-cover"
                  />
                ) : (
                  <CircleUserRound className="h-5 w-5 text-slate-700" />
                )}

                {/* User Tooltip */}
                <div className="pointer-events-none absolute left-full ml-3.5 hidden md:group-hover:flex flex-col rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-xl whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  <span className="font-semibold text-white">
                    {loggedInUser?.name ?? "Profile"}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {loggedInUser?.position ?? loggedInUser?.role ?? "User"}
                  </span>
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                </div>
              </Link>

              {/* Collapsed Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="group relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />

                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3.5 hidden md:group-hover:flex items-center rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-xl whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  Logout
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                </span>
              </button>
            </div>
          ) : (
            <>
              {/* Expanded User Profile Card */}
              <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-2.5 transition duration-150",
                  activePath === "/profile"
                    ? "border-cyan-200 bg-cyan-50/80 shadow-xs"
                    : "border-slate-200/80 bg-white/90 hover:border-slate-300 hover:bg-slate-100/70"
                )}
              >
                {loggedInUser?.image &&
                  loggedInUser.image.startsWith("http") ? (
                  <img
                    src={loggedInUser.image}
                    alt={loggedInUser.name}
                    className="h-9 w-9 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <CircleUserRound className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {loggedInUser?.name ?? "No user found"}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {loggedInUser?.position ?? loggedInUser?.role ?? "-"}
                  </p>
                  <p className="truncate text-[10px] text-slate-400">
                    {loggedInUser?.email ?? "-"}
                  </p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
              </Link>

              {/* Expanded Logout Button */}
              <Button
                type="button"
                variant="outline"
                className="mt-2.5 w-full justify-start gap-2.5 rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-none hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </Button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}