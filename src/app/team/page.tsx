"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Filter,
  FolderKanban,
  Grid,
  KeyRound,
  List,
  Mail,
  Pencil,
  Phone,
  Plus,
  Receipt,
  Scale,
  Search,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast-context";

export type PresenceStatus = "Online" | "Away" | "Offline";

export type SystemRolePreset =
  | "Super Admin"
  | "Admin"
  | "Project Manager"
  | "Finance Officer"
  | "Engineer / Designer"
  | "Custom Access";

export type PermissionLevel = "none" | "view" | "manage";

export type ModulePermissions = {
  projects: PermissionLevel;
  clients: PermissionLevel;
  invoices: PermissionLevel;
  payments: PermissionLevel;
  profitLoss: PermissionLevel;
  team: PermissionLevel;
  files: PermissionLevel;
  credentials: PermissionLevel;
};

export type TeamMember = {
  id: number;
  employeeId: string;
  name: string;
  designation: string;
  department: "Executive" | "Engineering" | "Design" | "Operations" | "Finance";
  email: string;
  phone: string;
  rolePreset: SystemRolePreset;
  permissions: ModulePermissions;
  status: PresenceStatus;
  projects: string[];
  image: string | null;
  joinedDate: string;
};

export const PRESET_PERMISSIONS: Record<SystemRolePreset, ModulePermissions> = {
  "Super Admin": {
    projects: "manage",
    clients: "manage",
    invoices: "manage",
    payments: "manage",
    profitLoss: "manage",
    team: "manage",
    files: "manage",
    credentials: "manage",
  },
  "Admin": {
    projects: "manage",
    clients: "manage",
    invoices: "manage",
    payments: "manage",
    profitLoss: "view",
    team: "manage",
    files: "manage",
    credentials: "view",
  },
  "Project Manager": {
    projects: "manage",
    clients: "manage",
    invoices: "view",
    payments: "none",
    profitLoss: "none",
    team: "view",
    files: "manage",
    credentials: "none",
  },
  "Finance Officer": {
    projects: "view",
    clients: "view",
    invoices: "manage",
    payments: "manage",
    profitLoss: "manage",
    team: "view",
    files: "view",
    credentials: "none",
  },
  "Engineer / Designer": {
    projects: "manage",
    clients: "none",
    invoices: "none",
    payments: "none",
    profitLoss: "none",
    team: "view",
    files: "manage",
    credentials: "none",
  },
  "Custom Access": {
    projects: "view",
    clients: "view",
    invoices: "none",
    payments: "none",
    profitLoss: "none",
    team: "view",
    files: "view",
    credentials: "none",
  },
};

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 1,
    employeeId: "EMP-VIV-001",
    name: "Kazi Nowshad Abir",
    designation: "Managing Director",
    department: "Executive",
    email: "nowshad@getvivago.com",
    phone: "+880 1711 000000",
    rolePreset: "Super Admin",
    permissions: PRESET_PERMISSIONS["Super Admin"],
    status: "Online",
    projects: ["E-commerce Redesign", "LodgeOS Integration"],
    image: "/uploads/profiles/avatar.png",
    joinedDate: "Jan 15, 2023",
  },
  {
    id: 2,
    employeeId: "EMP-VIV-002",
    name: "Imtiaz Ahmed",
    designation: "CEO & Systems Architect",
    department: "Executive",
    email: "imtiaz@getvivago.com",
    phone: "+880 1811 000000",
    rolePreset: "Super Admin",
    permissions: PRESET_PERMISSIONS["Super Admin"],
    status: "Online",
    projects: ["E-commerce Redesign", "LodgeOS Integration"],
    image: null,
    joinedDate: "Jan 15, 2023",
  },
  {
    id: 3,
    employeeId: "EMP-VIV-003",
    name: "Tanvir Hassan",
    designation: "Senior Full-Stack Engineer",
    department: "Engineering",
    email: "tanvir@getvivago.com",
    phone: "+880 1912 345678",
    rolePreset: "Engineer / Designer",
    permissions: PRESET_PERMISSIONS["Engineer / Designer"],
    status: "Online",
    projects: ["E-commerce Redesign", "Mobile App Development"],
    image: null,
    joinedDate: "Jun 01, 2023",
  },
  {
    id: 4,
    employeeId: "EMP-VIV-004",
    name: "Nabila Rahman",
    designation: "Lead UI/UX Designer",
    department: "Design",
    email: "nabila@getvivago.com",
    phone: "+880 1612 987654",
    rolePreset: "Engineer / Designer",
    permissions: PRESET_PERMISSIONS["Engineer / Designer"],
    status: "Away",
    projects: ["Brand Identity", "LodgeOS Integration"],
    image: null,
    joinedDate: "Aug 10, 2023",
  },
  {
    id: 5,
    employeeId: "EMP-VIV-005",
    name: "Saif Chowdhury",
    designation: "Finance & Accounts Lead",
    department: "Finance",
    email: "saif@getvivago.com",
    phone: "+880 1511 223344",
    rolePreset: "Finance Officer",
    permissions: PRESET_PERMISSIONS["Finance Officer"],
    status: "Offline",
    projects: ["E-commerce Redesign"],
    image: null,
    joinedDate: "Nov 05, 2023",
  },
  {
    id: 6,
    employeeId: "EMP-VIV-006",
    name: "Rifat Karim",
    designation: "Technical Project Manager",
    department: "Operations",
    email: "rifat@getvivago.com",
    phone: "+880 1715 667788",
    rolePreset: "Project Manager",
    permissions: PRESET_PERMISSIONS["Project Manager"],
    status: "Online",
    projects: ["Mobile App Development", "LodgeOS Integration"],
    image: null,
    joinedDate: "Feb 20, 2024",
  },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "V";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function TeamPage() {
  const { toast } = useToast();
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Deletion Modal / Dialog State
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = team.length;
    const online = team.filter((m) => m.status === "Online").length;
    const admins = team.filter((m) => m.rolePreset === "Super Admin" || m.rolePreset === "Admin").length;
    const activeAssignments = team.reduce((acc, m) => acc + m.projects.length, 0);

    return { total, online, admins, activeAssignments };
  }, [team]);

  // Filtered List
  const filteredTeam = useMemo(() => {
    return team.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === "All" || member.department === selectedDept;
      const matchesRole = selectedRole === "All" || member.rolePreset === selectedRole;
      const matchesStatus = selectedStatus === "All" || member.status === selectedStatus;

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
    });
  }, [team, searchQuery, selectedDept, selectedRole, selectedStatus]);

  // Toggle Member Status Directly from Card / Row
  const toggleMemberStatus = (id: number) => {
    setTeam((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus: Record<PresenceStatus, PresenceStatus> = {
            Online: "Away",
            Away: "Offline",
            Offline: "Online",
          };
          const updated = nextStatus[m.status];
          toast.info(`${m.name} presence changed to ${updated}.`, "Presence Updated");
          return { ...m, status: updated };
        }
        return m;
      })
    );
  };

  // Confirm Delete Action
  const confirmDeleteMember = () => {
    if (!memberToDelete) return;
    setTeam((prev) => prev.filter((m) => m.id !== memberToDelete.id));
    toast.success(`Removed ${memberToDelete.name} from company directory.`, "Member Removed");
    setMemberToDelete(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      {/* Subtle Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.06),transparent_25%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.06),transparent_23%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/team" />

        <SidebarInset className="space-y-6">
          {/* Top Header */}
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200/60">
                  Personnel & Access Control
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">Vivago Digital OS</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 md:text-3xl flex items-center gap-2.5">
                <Users className="h-7 w-7 text-cyan-700" /> Team & Access Management
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/team/create">
                <Button className="h-11 rounded-2xl bg-slate-900 px-5 text-white shadow-sm hover:bg-slate-800 font-semibold text-xs transition-all flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Assign Team Member
                </Button>
              </Link>
            </div>
          </header>

          {/* 4 Financial & Personnel KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Staff</p>
                <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                  <Users className="h-4 w-4 text-slate-600" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <span className="text-xs text-slate-500 font-medium">Registered</span>
              </div>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Now</p>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-emerald-700">{stats.online}</p>
                <span className="text-xs text-slate-500 font-medium">Online presence</span>
              </div>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Admins & Leads</p>
                <div className="rounded-xl bg-cyan-50 p-2 text-cyan-700">
                  <ShieldCheck className="h-4 w-4 text-cyan-700" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{stats.admins}</p>
                <span className="text-xs text-slate-500 font-medium">Full / Elev. RBAC</span>
              </div>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Deployments</p>
                <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                  <BriefcaseBusiness className="h-4 w-4 text-amber-700" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{stats.activeAssignments}</p>
                <span className="text-xs text-slate-500 font-medium">Project slots</span>
              </div>
            </Card>
          </div>

          {/* Filter & Search Bar */}
          <Card className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search team member by name, designation, email, or employee ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-10 rounded-2xl border-slate-200 text-xs font-medium"
                />
              </div>

              {/* Filters & View Switcher */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Department Filter */}
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="All">All Departments</option>
                  <option value="Executive">Executive</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                </select>

                {/* Role Filter */}
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="All">All Roles</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Finance Officer">Finance Officer</option>
                  <option value="Engineer / Designer">Engineer / Designer</option>
                  <option value="Custom Access">Custom Access</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="All">All Presence</option>
                  <option value="Online">Online</option>
                  <option value="Away">Away</option>
                  <option value="Offline">Offline</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg p-1.5 transition-colors ${
                      viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="Card Grid View"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`rounded-lg p-1.5 transition-colors ${
                      viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="Data Table View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Members List Display */}
          {filteredTeam.length === 0 ? (
            <Card className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">No Team Members Found</h3>
              <p className="mt-1 text-xs text-slate-500">
                Try adjusting your search query or filter selections, or assign a new team member.
              </p>
              <Link href="/team/create">
                <Button className="mt-5 h-10 rounded-xl bg-slate-900 text-white font-semibold text-xs">
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Assign Team Member
                </Button>
              </Link>
            </Card>
          ) : viewMode === "grid" ? (
            /* GRID CARDS VIEW */
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTeam.map((member) => {
                const managedModulesCount = Object.values(member.permissions).filter((p) => p === "manage").length;
                const viewModulesCount = Object.values(member.permissions).filter((p) => p === "view").length;

                return (
                  <Card
                    key={member.id}
                    className="group relative rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-cyan-200/80 transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header & Avatar */}
                      <CardHeader className="pb-3 pt-6 px-6 border-b border-slate-100/80 bg-slate-50/40">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            {/* Avatar with Presence Indicator */}
                            <div className="relative flex-shrink-0">
                              <div className="h-13 w-13 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-display font-bold text-base border border-slate-200 shadow-inner overflow-hidden">
                                {member.image ? (
                                  <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                                ) : (
                                  getInitials(member.name)
                                )}
                              </div>
                              <span
                                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center ${
                                  member.status === "Online"
                                    ? "bg-emerald-500"
                                    : member.status === "Away"
                                    ? "bg-amber-500"
                                    : "bg-slate-400"
                                }`}
                                title={`Presence: ${member.status}`}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <CardTitle className="text-base font-bold text-slate-900 truncate">
                                  {member.name}
                                </CardTitle>
                              </div>
                              <p className="text-xs font-semibold text-cyan-700 truncate">{member.designation}</p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{member.employeeId}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Link href={`/team/edit?id=${member.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-xl text-slate-400 hover:text-cyan-700 hover:bg-cyan-50"
                                title="Edit Role & Permissions"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setMemberToDelete(member)}
                              className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Remove Team Member"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 space-y-4">
                        {/* System Role & RBAC Summary */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Role & Access</span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                                member.rolePreset === "Super Admin"
                                  ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                                  : member.rolePreset === "Admin"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : member.rolePreset === "Finance Officer"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : member.rolePreset === "Project Manager"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              <ShieldCheck className="h-3 w-3" />
                              {member.rolePreset}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                            <span className="font-semibold text-emerald-700">{managedModulesCount} Full Manage</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-semibold text-slate-600">{viewModulesCount} View Only</span>
                          </div>
                        </div>

                        {/* Contact Channels */}
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            <a href={`mailto:${member.email}`} className="truncate hover:text-cyan-700 transition-colors">
                              {member.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{member.phone}</span>
                          </div>
                        </div>

                        {/* Assigned Projects */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Deliverables</p>
                          {member.projects.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No current active projects</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {member.projects.map((proj, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/60"
                                >
                                  <BriefcaseBusiness className="h-3 w-3 text-cyan-700" />
                                  {proj}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </div>

                    {/* Bottom Status Toggle & Actions */}
                    <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      {/* Live Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleMemberStatus(member.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-all cursor-pointer hover:shadow-xs ${
                          member.status === "Online"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                            : member.status === "Away"
                            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70"
                        }`}
                        title="Click to cycle status (Online / Away / Offline)"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            member.status === "Online"
                              ? "bg-emerald-500 animate-pulse"
                              : member.status === "Away"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {member.status}
                      </button>

                      <Link href={`/team/edit?id=${member.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Manage Access
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* DATA TABLE VIEW */
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-4 pl-6 pr-4">Team Member</th>
                      <th className="px-4 py-4">Department & Role</th>
                      <th className="px-4 py-4">Access Level</th>
                      <th className="px-4 py-4">Assigned Projects</th>
                      <th className="px-4 py-4">Contacts</th>
                      <th className="px-4 py-4">Presence</th>
                      <th className="py-4 pl-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeam.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-display font-bold border border-slate-200 overflow-hidden">
                                {member.image ? (
                                  <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                                ) : (
                                  getInitials(member.name)
                                )}
                              </div>
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                                  member.status === "Online"
                                    ? "bg-emerald-500"
                                    : member.status === "Away"
                                    ? "bg-amber-500"
                                    : "bg-slate-400"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{member.name}</p>
                              <p className="text-[11px] font-mono text-slate-400">{member.employeeId}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800">{member.designation}</p>
                          <span className="text-[11px] text-slate-400">{member.department}</span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                              member.rolePreset === "Super Admin"
                                ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                                : member.rolePreset === "Admin"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : member.rolePreset === "Finance Officer"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : member.rolePreset === "Project Manager"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {member.rolePreset}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {member.projects.map((p, i) => (
                              <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-slate-800">{member.email}</p>
                          <p className="text-[11px] text-slate-400">{member.phone}</p>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => toggleMemberStatus(member.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                              member.status === "Online"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : member.status === "Away"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                member.status === "Online"
                                  ? "bg-emerald-500 animate-pulse"
                                  : member.status === "Away"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {member.status}
                          </button>
                        </td>

                        <td className="py-4 pl-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/team/edit?id=${member.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-xl border-slate-200 text-slate-600 hover:text-cyan-700"
                              >
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setMemberToDelete(member)}
                              className="h-8 rounded-xl border-slate-200 text-slate-600 hover:text-rose-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ================= CUSTOM CONFIRMATION MODAL FOR DELETION (NO BROWSER CONFIRM) ================= */}
          {memberToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
              <Card className="w-full max-w-md border-slate-200 bg-white shadow-2xl rounded-3xl overflow-hidden p-6 space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="rounded-2xl bg-rose-50 p-3 text-rose-600 border border-rose-100 flex-shrink-0">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">Remove Team Member</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Are you sure you want to remove <span className="font-bold text-slate-800">{memberToDelete.name}</span> ({memberToDelete.employeeId}) from the company personnel directory?
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMemberToDelete(null)}
                    className="h-10 rounded-xl border-slate-200 text-slate-600 font-semibold text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={confirmDeleteMember}
                    className="h-10 rounded-xl bg-rose-600 px-5 text-white font-semibold text-xs hover:bg-rose-700 shadow-sm"
                  >
                    Yes, Remove Member
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </SidebarInset>
      </section>
    </main>
  );
}
