"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleDollarSign,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  KeyRound,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  Receipt,
  RefreshCw,
  RotateCcw,
  Save,
  Scale,
  ShieldCheck,
  User,
  UserCheck,
  Users,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast-context";
import {
  ModulePermissions,
  PermissionLevel,
  PresenceStatus,
  SystemRolePreset,
  TeamMember,
} from "../page";

const MODULE_CONFIG = [
  { key: "projects" as const, label: "Projects Management", icon: FolderKanban, desc: "Create, edit timelines, assign staff & milestones" },
  { key: "clients" as const, label: "Clients & CRM", icon: Users, desc: "Client directory, contracts & customer communications" },
  { key: "invoices" as const, label: "Invoices & Billing", icon: Receipt, desc: "Draft, issue, finalize PDF invoices and record settlements" },
  { key: "payments" as const, label: "Payments & Ledger", icon: CircleDollarSign, desc: "Record cash inflows/outflows and audit company ledger" },
  { key: "profitLoss" as const, label: "Profit & Loss / Finance", icon: Scale, desc: "Executive income statement, project margins & OPEX run-rate" },
  { key: "team" as const, label: "Team & Personnel", icon: User, desc: "Manage staff directory, system privileges and roles" },
  { key: "files" as const, label: "File Vault & Assets", icon: FileText, desc: "Upload and organize internal documents, source files & assets" },
  { key: "credentials" as const, label: "Credentials & Secrets", icon: KeyRound, desc: "Server API keys, database credentials & client keys" },
];

const PRESET_PERMISSIONS: Record<SystemRolePreset, ModulePermissions> = {
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

const AVAILABLE_PROJECTS = [
  "E-commerce Redesign",
  "LodgeOS Integration",
  "Mobile App Development",
  "Brand Identity",
];

const MOCK_INITIAL_MEMBERS: Record<number, Partial<TeamMember>> = {
  1: {
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
  },
  2: {
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
  },
  3: {
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
  },
  4: {
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
  },
  5: {
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
  },
  6: {
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
  },
};

function generateRandomPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%";
  let pass = "Vivago#";
  for (let i = 0; i < 4; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass + "!";
}

function EditTeamMemberContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const idParam = searchParams.get("id");
  const memberId = idParam ? parseInt(idParam, 10) : 1;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    designation: "",
    department: "Engineering" as TeamMember["department"],
    email: "",
    phone: "",
    newPassword: "",
    rolePreset: "Engineer / Designer" as SystemRolePreset,
    permissions: { ...PRESET_PERMISSIONS["Engineer / Designer"] },
    status: "Online" as PresenceStatus,
    projects: [] as string[],
    notes: "",
  });

  useEffect(() => {
    const existing = MOCK_INITIAL_MEMBERS[memberId] || MOCK_INITIAL_MEMBERS[1];
    if (existing) {
      setFormData({
        name: existing.name || "",
        employeeId: existing.employeeId || `EMP-VIV-00${memberId}`,
        designation: existing.designation || "",
        department: existing.department || "Engineering",
        email: existing.email || "",
        phone: existing.phone || "",
        newPassword: "",
        rolePreset: existing.rolePreset || "Engineer / Designer",
        permissions: existing.permissions ? { ...existing.permissions } : { ...PRESET_PERMISSIONS["Engineer / Designer"] },
        status: existing.status || "Online",
        projects: existing.projects ? [...existing.projects] : [],
        notes: "",
      });
    }
  }, [memberId]);

  const handleGeneratePassword = () => {
    const newPass = generateRandomPassword();
    setFormData((prev) => ({ ...prev, newPassword: newPass }));
    toast.info("Generated new reset password.", "Password Created");
  };

  const handlePresetChange = (preset: SystemRolePreset) => {
    setFormData((prev) => ({
      ...prev,
      rolePreset: preset,
      permissions: { ...PRESET_PERMISSIONS[preset] },
    }));
  };

  const handlePermissionChange = (moduleKey: keyof ModulePermissions, level: PermissionLevel) => {
    setFormData((prev) => {
      const updatedPermissions = {
        ...prev.permissions,
        [moduleKey]: level,
      };

      let matchedPreset: SystemRolePreset = "Custom Access";
      for (const [presetName, presetPerms] of Object.entries(PRESET_PERMISSIONS)) {
        if (presetName === "Custom Access") continue;
        const matches = Object.keys(presetPerms).every(
          (k) => (presetPerms as any)[k] === (updatedPermissions as any)[k]
        );
        if (matches) {
          matchedPreset = presetName as SystemRolePreset;
          break;
        }
      }

      return {
        ...prev,
        rolePreset: matchedPreset,
        permissions: updatedPermissions,
      };
    });
  };

  const handleProjectToggle = (projectName: string) => {
    setFormData((prev) => {
      const exists = prev.projects.includes(projectName);
      return {
        ...prev,
        projects: exists
          ? prev.projects.filter((p) => p !== projectName)
          : [...prev.projects, projectName],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.designation.trim()) {
      toast.error("Please fill in all required employee and identity fields.", "Incomplete Form");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        `Updated role, permissions, and security settings for ${formData.name}.`,
        "Member Updated"
      );
      router.push("/team");
    }, 600);
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
            <div className="space-y-1">
              <Link
                href="/team"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cyan-700 transition-colors mb-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Team Directory
              </Link>
              <h1 className="font-display text-2xl font-bold text-slate-900 md:text-3xl flex items-center gap-2.5">
                <Pencil className="h-7 w-7 text-cyan-700" /> Modify Team Member & Permissions
              </h1>
              <p className="text-xs text-slate-500">
                Update designation, reconfigure role presets, reset credentials, or fine-tune granular module privileges for{" "}
                <span className="font-semibold text-slate-800">{formData.name || "Employee"}</span> ({formData.employeeId}).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/team">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                form="edit-team-form"
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-slate-900 px-6 text-white font-semibold text-xs hover:bg-slate-800 shadow-sm transition-all"
              >
                {isSubmitting ? (
                  <>Saving...</>
                ) : (
                  <>
                    <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </header>

          {/* Main Form */}
          <form id="edit-team-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: Member Information & Role Matrix */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Identity & Security Credentials Card */}
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                    <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-cyan-700" /> Member Identity & Access Credentials
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Official company credentials, contact info, and workspace authentication.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Full Legal Name <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-11 rounded-xl border-slate-200 font-medium text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Employee ID <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          required
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                          className="h-11 rounded-xl border-slate-200 font-mono font-medium text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Official Work Email <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-11 pl-10 rounded-xl border-slate-200 font-medium text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Work Phone / Direct Extension <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-11 pl-10 rounded-xl border-slate-200 font-medium text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-3">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Official Designation <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          required
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          className="h-11 rounded-xl border-slate-200 font-medium text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Department</Label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value as TeamMember["department"] })}
                          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >
                          <option value="Executive">Executive</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Design">Design</option>
                          <option value="Operations">Operations</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>
                    </div>

                    {/* PASSWORD RESET / CHANGE OPTION */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="space-y-1.5 max-w-lg">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Reset Password (Optional)
                          </Label>
                          <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                          >
                            <RefreshCw className="h-3 w-3" /> Auto-Generate
                          </button>
                        </div>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            placeholder="Leave blank to retain current password"
                            className="h-11 pl-10 pr-10 rounded-xl border-slate-200 font-mono text-xs font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Provide a new password to overwrite existing login credentials.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Granular RBAC Permissions Card */}
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-cyan-700" /> Custom Role & Module Permissions
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Pick a role preset or configure individual module access privileges.
                        </CardDescription>
                      </div>
                      <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
                        {formData.rolePreset}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Role Presets */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Role Preset</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {(
                          [
                            "Super Admin",
                            "Admin",
                            "Project Manager",
                            "Finance Officer",
                            "Engineer / Designer",
                            "Custom Access",
                          ] as SystemRolePreset[]
                        ).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handlePresetChange(preset)}
                            className={`flex items-center justify-center rounded-xl p-3 text-xs font-bold transition-all border ${
                              formData.rolePreset === preset
                                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 8-Module Permission Matrix */}
                    <div className="space-y-2 pt-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Granular Module Privileges (Customize Below)
                      </Label>
                      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/40 overflow-hidden">
                        {MODULE_CONFIG.map((mod) => {
                          const Icon = mod.icon;
                          const currentLevel = formData.permissions[mod.key];

                          return (
                            <div
                              key={mod.key}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/70 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-slate-100 p-2.5 text-cyan-800 border border-slate-200/60">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{mod.label}</p>
                                  <p className="text-[11px] text-slate-400">{mod.desc}</p>
                                </div>
                              </div>

                              {/* 3-Tier Access Switch */}
                              <div className="flex items-center rounded-xl bg-slate-100 p-1 self-start sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handlePermissionChange(mod.key, "none")}
                                  className={`rounded-lg px-3 py-1 text-[11px] font-bold transition-colors ${
                                    currentLevel === "none"
                                      ? "bg-white text-rose-700 shadow-xs"
                                      : "text-slate-400 hover:text-slate-700"
                                  }`}
                                >
                                  No Access
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePermissionChange(mod.key, "view")}
                                  className={`rounded-lg px-3 py-1 text-[11px] font-bold transition-colors ${
                                    currentLevel === "view"
                                      ? "bg-white text-slate-900 shadow-xs"
                                      : "text-slate-400 hover:text-slate-700"
                                  }`}
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePermissionChange(mod.key, "manage")}
                                  className={`rounded-lg px-3 py-1 text-[11px] font-bold transition-colors ${
                                    currentLevel === "manage"
                                      ? "bg-white text-emerald-700 shadow-xs"
                                      : "text-slate-400 hover:text-slate-700"
                                  }`}
                                >
                                  Full Manage
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Presence, Project Allocations & Notes */}
              <div className="lg:col-span-4 space-y-6">
                {/* Initial Presence Status */}
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Presence Status</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PresenceStatus })}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="Online">🟢 Online (Active Now)</option>
                    <option value="Away">🟡 Away (Temporarily Unavailable)</option>
                    <option value="Offline">⚪ Offline (Not Logged In)</option>
                  </select>
                </Card>

                {/* Project Allocation Checklist */}
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4 text-cyan-700" /> Allocate to Projects
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Assign active contract responsibilities.</p>
                  </div>

                  <div className="space-y-2">
                    {AVAILABLE_PROJECTS.map((proj) => {
                      const isAssigned = formData.projects.includes(proj);
                      return (
                        <label
                          key={proj}
                          onClick={() => handleProjectToggle(proj)}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                            isAssigned
                              ? "border-cyan-300 bg-cyan-50/50 text-cyan-900 font-semibold"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                              isAssigned ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300 bg-white"
                            }`}
                          >
                            {isAssigned && <Check className="h-3 w-3" />}
                          </div>
                          <span className="text-xs">{proj}</span>
                        </label>
                      );
                    })}
                  </div>
                </Card>

                {/* Internal HR Notes */}
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Internal HR / Scope Notes</Label>
                  <textarea
                    rows={4}
                    placeholder="Optional onboarding notes, workstation details or contract remarks..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 leading-relaxed"
                  />
                </Card>
              </div>
            </div>
          </form>
        </SidebarInset>
      </section>
    </main>
  );
}

export default function EditTeamMemberPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">Loading Member Profile...</div>}>
      <EditTeamMemberContent />
    </Suspense>
  );
}
