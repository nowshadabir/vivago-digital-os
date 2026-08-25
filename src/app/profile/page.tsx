"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Receipt,
  RotateCcw,
  Save,
  Scale,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TabKey = "general" | "access" | "projects" | "security";

type EmployeeProfile = {
  employeeId: string;
  fullName: string;
  designation: string;
  department: string;
  workEmail: string;
  workPhone: string;
  officeLocation: string;
  joiningDate: string;
  employmentType: string;
  reportingManager: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  systemRole: "Super Admin" | "Admin" | "Project Manager" | "Team Member";
  status: "Online" | "Away" | "Offline";
  image: string;
  responsibilities: string;
  timezone: string;
  workingHours: string;
  notifications: {
    emailInvoices: boolean;
    emailPayments: boolean;
    emailProjectUpdates: boolean;
    emailExpenses: boolean;
  };
};

const INITIAL_PROFILE: EmployeeProfile = {
  employeeId: "EMP-VIV-001",
  fullName: "Kazi Nowshad Abir",
  designation: "Managing Director",
  department: "Executive & Product Engineering",
  workEmail: "nowshad@getvivago.com",
  workPhone: "+880 1711 000000",
  officeLocation: "Dhaka HQ — Level 4, Block C",
  joiningDate: "January 15, 2023",
  employmentType: "Full-time (Permanent)",
  reportingManager: "Board of Directors",
  emergencyContactName: "Imtiaz Ahmed",
  emergencyContactPhone: "+880 1811 000000",
  systemRole: "Super Admin",
  status: "Online",
  image: "/uploads/profiles/avatar.png",
  responsibilities: "Responsible for overall company product roadmap, engineering quality assurance, technical architecture sign-off, and high-level client discovery.",
  timezone: "Asia/Dhaka (GMT+6)",
  workingHours: "10:00 AM – 07:00 PM",
  notifications: {
    emailInvoices: true,
    emailPayments: true,
    emailProjectUpdates: true,
    emailExpenses: true,
  },
};

const ASSIGNED_PROJECTS = [
  {
    id: 1,
    name: "E-commerce Redesign",
    client: "Acme Corp",
    role: "Lead Architect",
    status: "In Progress",
    valuation: 250000,
    deadline: "May 15, 2024",
  },
  {
    id: 2,
    name: "LodgeOS Integration",
    client: "Global Tech",
    role: "Managing Director",
    status: "Review",
    valuation: 450000,
    deadline: "Apr 20, 2024",
  },
  {
    id: 4,
    name: "Brand Identity & Design System",
    client: "Acme Corp",
    role: "Executive Sponsor",
    status: "Completed",
    valuation: 120000,
    deadline: "Feb 28, 2024",
  },
];

const PERMISSIONS_MATRIX = [
  {
    module: "Project Management",
    icon: FolderKanban,
    access: "Full Access",
    desc: "Create, assign, edit milestones, and review project financials & timelines.",
  },
  {
    module: "Clients & CRM",
    icon: Users,
    access: "Full Access",
    desc: "Onboard new client companies, manage contacts, and view total customer value.",
  },
  {
    module: "Invoices & Billing",
    icon: Receipt,
    access: "Full Access",
    desc: "Draft, issue, finalize PDF invoices, and authorize discounts or status changes.",
  },
  {
    module: "Payments & Ledger",
    icon: CircleDollarSign,
    access: "Full Access",
    desc: "Record incoming client payments, log vendor outflows, and audit transaction records.",
  },
  {
    module: "Profit & Loss / Finance",
    icon: Scale,
    access: "Full Access",
    desc: "Executive view of GAAP income statements, project margins, OPEX, and SaaS subscriptions.",
  },
  {
    module: "Team & Personnel",
    icon: User,
    access: "Full Access",
    desc: "Add team members, edit designations, assign roles, and update availability status.",
  },
  {
    module: "Company Files & Vault",
    icon: FileText,
    access: "Full Access",
    desc: "Upload project documentation, contract PDFs, design archives, and cloud links.",
  },
  {
    module: "Credentials & Secrets",
    icon: KeyRound,
    access: "Full Access",
    desc: "Manage internal company server credentials, API tokens, and client environment access.",
  },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile>(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const initials = useMemo(() => {
    return profile.fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }, [profile.fullName]);

  const handleFieldChange = (field: keyof EmployeeProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (key: keyof EmployeeProfile["notifications"]) => {
    setProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    handleFieldChange("image", objectUrl);
  };

  const handleSave = (e?: FormEvent) => {
    e?.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 600);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setSecurityMessage({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 8) {
      setSecurityMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setSecurityMessage({ type: "success", text: "Account password updated successfully." });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSecurityMessage(null), 4000);
  };

  const handleDiscard = () => {
    setProfile(INITIAL_PROFILE);
    setSaveSuccess(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      {/* Subtle Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.06),transparent_25%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.06),transparent_23%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/profile" />

        <SidebarInset className="space-y-6">
          {/* Top Title Bar */}
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200/60">
                  Internal OS Account
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">{profile.employeeId}</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
                Employee Profile & Settings
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscard}
                className="h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Discard
              </Button>
              <Button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="h-10 rounded-xl bg-slate-900 px-5 text-white shadow-sm hover:bg-slate-800 font-semibold text-xs transition-all"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-1.5 h-3.5 w-3.5" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </header>

          {/* Save Success Banner */}
          {saveSuccess && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-5 py-3.5 text-xs font-semibold text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Employee profile changes have been synchronized across the internal management system.</span>
            </div>
          )}

          {/* Primary Profile Identity Card */}
          <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                {/* Left: Avatar & Identity Details */}
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                  {/* Avatar with clean upload trigger */}
                  <div className="relative group">
                    <div className="h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-inner flex items-center justify-center">
                      {profile.image && (profile.image.startsWith("/") || profile.image.startsWith("blob:") || profile.image.startsWith("http")) ? (
                        <img src={profile.image} alt={profile.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-display text-3xl font-bold text-slate-400">{initials}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-2xl bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                      title="Update profile photo"
                    >
                      <Camera className="h-5 w-5 mb-0.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />

                    {/* Presence Dot on Avatar */}
                    <span
                      className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                        profile.status === "Online"
                          ? "bg-emerald-500"
                          : profile.status === "Away"
                          ? "bg-amber-500"
                          : "bg-slate-400"
                      }`}
                      title={`Status: ${profile.status}`}
                    />
                  </div>

                  {/* Text Meta */}
                  <div className="text-center sm:text-left space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <h2 className="font-display text-2xl font-bold text-slate-900">{profile.fullName}</h2>
                      
                      {/* Online / Offline Presence Badge */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus: Record<string, "Online" | "Away" | "Offline"> = {
                            Online: "Away",
                            Away: "Offline",
                            Offline: "Online",
                          };
                          handleFieldChange("status", nextStatus[profile.status] || "Online");
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-all cursor-pointer hover:shadow-xs ${
                          profile.status === "Online"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                            : profile.status === "Away"
                            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70"
                        }`}
                        title="Click to toggle status (Online / Away / Offline)"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            profile.status === "Online"
                              ? "bg-emerald-500 animate-pulse"
                              : profile.status === "Away"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {profile.status}
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-slate-700">
                      {profile.designation} <span className="text-slate-400 font-normal">•</span>{" "}
                      <span className="text-slate-500 font-normal">{profile.department}</span>
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <a href={`mailto:${profile.workEmail}`} className="hover:text-cyan-700 transition-colors">
                          {profile.workEmail}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{profile.workPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{profile.officeLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Key Quick Stats */}
                <div className="flex items-center justify-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 sm:self-center md:self-auto">
                  <div className="text-center px-3 border-r border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Role</p>
                    <p className="text-sm font-bold text-cyan-700 mt-0.5">{profile.systemRole}</p>
                  </div>
                  <div className="text-center px-3 border-r border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Joined</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{profile.joiningDate.split(",")[1]?.trim() || "2023"}</p>
                  </div>
                  <div className="text-center px-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projects</p>
                    <p className="text-sm font-bold text-emerald-700 mt-0.5">{ASSIGNED_PROJECTS.length} Active</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    activeTab === "general"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  Personal & Employment Info
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("access")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    activeTab === "access"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  System Permissions & Access
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("projects")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    activeTab === "projects"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  Assigned Projects ({ASSIGNED_PROJECTS.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    activeTab === "security"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  Security & Preferences
                </button>
              </div>
            </CardContent>
          </Card>

          {/* TAB 1: General & Work Details */}
          {activeTab === "general" && (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Main Info Form */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-slate-100 px-6 py-5">
                    <CardTitle className="font-display text-lg text-slate-900">Employment & Organizational Details</CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Official internal company employee record and hierarchy mapping.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSave} className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Legal Name</Label>
                          <Input
                            value={profile.fullName}
                            onChange={(e) => handleFieldChange("fullName", e.target.value)}
                            className="h-11 rounded-xl border-slate-200 font-medium"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Employee ID</Label>
                          <Input
                            value={profile.employeeId}
                            disabled
                            className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-500 font-mono font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Designation</Label>
                          <Input
                            value={profile.designation}
                            onChange={(e) => handleFieldChange("designation", e.target.value)}
                            className="h-11 rounded-xl border-slate-200 font-medium"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Department</Label>
                          <select
                            value={profile.department}
                            onChange={(e) => handleFieldChange("department", e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
                          >
                            <option value="Executive & Product Engineering">Executive & Product Engineering</option>
                            <option value="Software Engineering">Software Engineering</option>
                            <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                            <option value="Operations & Project Management">Operations & Project Management</option>
                            <option value="Finance & Accounts">Finance & Accounts</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Office Location / Base</Label>
                          <Input
                            value={profile.officeLocation}
                            onChange={(e) => handleFieldChange("officeLocation", e.target.value)}
                            className="h-11 rounded-xl border-slate-200 font-medium"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reporting Line</Label>
                          <Input
                            value={profile.reportingManager}
                            onChange={(e) => handleFieldChange("reportingManager", e.target.value)}
                            className="h-11 rounded-xl border-slate-200 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Scope of Work & Core Responsibilities</Label>
                        <textarea
                          rows={4}
                          value={profile.responsibilities}
                          onChange={(e) => handleFieldChange("responsibilities", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 leading-relaxed"
                          placeholder="Brief description of primary duties within Vivago Digital..."
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button type="submit" disabled={isSaving} className="h-11 rounded-xl bg-slate-900 px-6 text-white font-semibold text-xs hover:bg-slate-800">
                          <Save className="mr-1.5 h-3.5 w-3.5" /> Save Information
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Contact Channels & HR Info */}
              <div className="lg:col-span-4 space-y-6">
                {/* Official Contact Details */}
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-slate-100 px-6 py-5">
                    <CardTitle className="font-display text-base text-slate-900">Direct Work Contacts</CardTitle>
                    <CardDescription className="text-xs text-slate-500">Primary correspondence channels.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Work Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="email"
                          value={profile.workEmail}
                          onChange={(e) => handleFieldChange("workEmail", e.target.value)}
                          className="h-10 pl-10 rounded-xl border-slate-200 text-sm font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Direct Extension / Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={profile.workPhone}
                          onChange={(e) => handleFieldChange("workPhone", e.target.value)}
                          className="h-10 pl-10 rounded-xl border-slate-200 text-sm font-medium"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-slate-100 px-6 py-5">
                    <CardTitle className="font-display text-base text-slate-900">Emergency Contact</CardTitle>
                    <CardDescription className="text-xs text-slate-500">Internal HR emergency correspondence.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Person</Label>
                      <Input
                        value={profile.emergencyContactName}
                        onChange={(e) => handleFieldChange("emergencyContactName", e.target.value)}
                        className="h-10 rounded-xl border-slate-200 text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Emergency Phone</Label>
                      <Input
                        value={profile.emergencyContactPhone}
                        onChange={(e) => handleFieldChange("emergencyContactPhone", e.target.value)}
                        className="h-10 rounded-xl border-slate-200 text-sm font-medium"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Employment Summary Snapshot */}
                <Card className="rounded-3xl border border-slate-200 bg-slate-50/60 shadow-sm p-6">
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Employment Type</span>
                      <span className="font-bold text-slate-800">{profile.employmentType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Joining Date</span>
                      <span className="font-bold text-slate-800">{profile.joiningDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Workstation Node</span>
                      <span className="font-mono font-bold text-slate-700">HQ-FL4-C01</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: System Permissions & RBAC Access */}
          {activeTab === "access" && (
            <div className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100 px-6 py-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="font-display text-lg text-slate-900">Role-Based Access Control (RBAC)</CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        System privileges granted to this account within the Vivago Digital OS suite.
                      </CardDescription>
                    </div>
                    <span className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 border border-cyan-200">
                      <ShieldCheck className="h-4 w-4 text-cyan-700" />
                      Assigned: {profile.systemRole} Tier
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {PERMISSIONS_MATRIX.map((perm, idx) => {
                      const Icon = perm.icon;
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-slate-200 hover:bg-slate-50"
                        >
                          <div className="rounded-xl bg-white p-2.5 text-slate-700 shadow-xs border border-slate-200/80">
                            <Icon className="h-5 w-5 text-cyan-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-bold text-slate-900 truncate">{perm.module}</p>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                <Check className="h-3 w-3" /> {perm.access}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{perm.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-2xl bg-amber-50/60 border border-amber-200/70 p-4 text-xs text-amber-900 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Privilege Modification Notice</p>
                      <p className="mt-0.5 text-amber-800">
                        System permissions for Super Administrator accounts can only be altered through direct database security configuration or root administrator access.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: Assigned Projects */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-lg text-slate-900">Directly Supervised Projects</CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Active software contracts and client deliverables where you are assigned as Lead or Sponsor.
                      </CardDescription>
                    </div>
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                    >
                      View All Projects <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {ASSIGNED_PROJECTS.map((proj) => (
                      <div
                        key={proj.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:border-cyan-200 hover:shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-display font-bold text-slate-900 text-base">{proj.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                proj.status === "In Progress"
                                  ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                                  : proj.status === "Review"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {proj.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Client: <span className="font-semibold text-slate-700">{proj.client}</span> • Assigned Role:{" "}
                            <span className="font-semibold text-cyan-700">{proj.role}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center">
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valuation</p>
                            <p className="text-xs font-bold text-slate-900">৳{proj.valuation.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deadline</p>
                            <p className="text-xs font-bold text-slate-700">{proj.deadline}</p>
                          </div>
                          <Link
                            href={`/projects/view?id=${proj.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            title="Open Project View"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: Security & Preferences */}
          {activeTab === "security" && (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Password & Authentication */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-slate-100 px-6 py-5">
                    <CardTitle className="font-display text-lg text-slate-900">Account Credentials</CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Update your login password and manage account security.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      {securityMessage && (
                        <div
                          className={`flex items-center gap-2.5 rounded-xl p-3.5 text-xs font-semibold ${
                            securityMessage.type === "success"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {securityMessage.type === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                          )}
                          <span>{securityMessage.text}</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="h-11 pr-10 rounded-xl border-slate-200 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</Label>
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            className="h-11 rounded-xl border-slate-200 font-medium"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm New Password</Label>
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            className="h-11 rounded-xl border-slate-200 font-medium"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button type="submit" className="h-11 rounded-xl bg-slate-900 px-6 text-white font-semibold text-xs hover:bg-slate-800">
                          <Lock className="mr-1.5 h-3.5 w-3.5" /> Update Password
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Work Schedule & Notifications */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-slate-100 px-6 py-5">
                    <CardTitle className="font-display text-base text-slate-900">Work Schedule & Availability</CardTitle>
                    <CardDescription className="text-xs text-slate-500">Live presence status and standard operational hours.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Presence Status</Label>
                      <select
                        value={profile.status}
                        onChange={(e) => handleFieldChange("status", e.target.value as EmployeeProfile["status"])}
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
                      >
                        <option value="Online">🟢 Online (Active Now)</option>
                        <option value="Away">🟡 Away (Temporarily Unavailable)</option>
                        <option value="Offline">⚪ Offline (Not Logged In)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Operational Timezone</Label>
                      <Input
                        value={profile.timezone}
                        onChange={(e) => handleFieldChange("timezone", e.target.value)}
                        className="h-10 rounded-xl border-slate-200 text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Working Hours</Label>
                      <Input
                        value={profile.workingHours}
                        onChange={(e) => handleFieldChange("workingHours", e.target.value)}
                        className="h-10 rounded-xl border-slate-200 text-sm font-medium"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Email Notifications */}
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-slate-100 px-6 py-5">
                    <CardTitle className="font-display text-base text-slate-900">Internal Alerts & Notifications</CardTitle>
                    <CardDescription className="text-xs text-slate-500">Configure notifications sent to your work email.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <label className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-semibold text-slate-700">New Invoices Issued & Overdue Alerts</span>
                      <input
                        type="checkbox"
                        checked={profile.notifications.emailInvoices}
                        onChange={() => handleNotificationToggle("emailInvoices")}
                        className="h-4 w-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-semibold text-slate-700">Client Payment Receipts & Settlements</span>
                      <input
                        type="checkbox"
                        checked={profile.notifications.emailPayments}
                        onChange={() => handleNotificationToggle("emailPayments")}
                        className="h-4 w-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-semibold text-slate-700">Project Milestones & Task Assignments</span>
                      <input
                        type="checkbox"
                        checked={profile.notifications.emailProjectUpdates}
                        onChange={() => handleNotificationToggle("emailProjectUpdates")}
                        className="h-4 w-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-semibold text-slate-700">Company Expense & Outflow Submissions</span>
                      <input
                        type="checkbox"
                        checked={profile.notifications.emailExpenses}
                        onChange={() => handleNotificationToggle("emailExpenses")}
                        className="h-4 w-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                      />
                    </label>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </SidebarInset>
      </section>
    </main>
  );
}