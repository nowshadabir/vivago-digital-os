"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FolderPlus,
  Layers,
  Plus,
  Save,
  Scale,
  Sparkles,
  Timer,
  Trash2,
  Users2,
  Wallet,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MOCK_PROJECTS,
  MOCK_CLIENTS,
  MOCK_TEAM,
} from "@/lib/mock-data";

type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Review"
  | "Final QA"
  | "Completed"
  | "On Hold";

type ClientOption = {
  id: number;
  name: string;
};

type ProjectTeamMember = {
  name: string;
  role: string;
};

type ProjectFormData = {
  name: string;
  clientId: string;
  status: ProjectStatus;
  startDate: string;
  estimatedDeadline: string;
  valuation: string;
  companyCost: string;
  temporaryCost: string;
  description: string;
  team: ProjectTeamMember[];
};

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function toDateInput(value: string | Date | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function ProjectCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    clientId: "",
    status: "Planning",
    startDate: new Date().toISOString().slice(0, 10),
    estimatedDeadline: "",
    valuation: "",
    companyCost: "0",
    temporaryCost: "0",
    description: "",
    team: [{ name: "Kazi Nowshad Abir", role: "Managing Director" }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setClients(MOCK_CLIENTS.map((c) => ({ id: c.id, name: c.name })));

    if (editId) {
      const existing = MOCK_PROJECTS.find((p) => p.id === Number(editId));
      if (existing) {
        setFormData({
          name: existing.name,
          clientId: String(existing.clientId),
          status: (existing.status as ProjectStatus) || "In Progress",
          startDate: toDateInput(existing.startDate),
          estimatedDeadline: toDateInput(existing.estimatedDeadline),
          valuation: String(existing.valuation),
          companyCost: String(existing.companyCost || 0),
          temporaryCost: String(existing.temporaryCost || 0),
          description: "Full-cycle digital delivery for client operations.",
          team: existing.team || [
            { name: "Kazi Nowshad Abir", role: "Managing Director" },
          ],
        });
      }
    }
  }, [editId]);

  const valuationNum = Number(formData.valuation || "0");
  const companyCostNum = Number(formData.companyCost || "0");
  const tempCostNum = Number(formData.temporaryCost || "0");
  const estimatedMargin = valuationNum - (companyCostNum + tempCostNum);
  const marginPercent =
    valuationNum > 0 ? Math.round((estimatedMargin / valuationNum) * 100) : 0;

  const isSubmitDisabled =
    !formData.name.trim() ||
    !formData.clientId ||
    !formData.startDate ||
    !formData.estimatedDeadline ||
    Number.isNaN(valuationNum) ||
    valuationNum <= 0;

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTeamMember = (memberName: string, defaultRole: string) => {
    setFormData((prev) => {
      const exists = prev.team.some((t) => t.name === memberName);
      if (exists) {
        return {
          ...prev,
          team: prev.team.filter((t) => t.name !== memberName),
        };
      }
      return {
        ...prev,
        team: [...prev.team, { name: memberName, role: defaultRole }],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    // Simulate brief save delay
    await new Promise((res) => setTimeout(res, 400));
    setSaveSuccess(true);

    setTimeout(() => {
      router.push("/projects");
    }, 500);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 md:px-8 md:py-8">
      {/* Background radial gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(59,130,246,0.14),transparent_25%),radial-gradient(circle_at_88%_10%,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_90%_90%,rgba(245,158,11,0.1),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/projects" />

        <SidebarInset className="space-y-6">
          {/* HEADER & BREADCRUMB */}
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Link
                  href="/projects"
                  className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Projects
                </Link>
                <span>/</span>
                <span className="text-cyan-700 font-medium">
                  {isEditing ? "Edit Project" : "Create New Project"}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {isEditing ? `Edit: ${formData.name || "Project"}` : "Create Project"}
              </h1>
              <p className="text-xs text-slate-600 sm:text-sm">
                Define project deliverables, client billing, financial health, and team assignments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/projects">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e as any)}
                disabled={isSubmitDisabled || isSubmitting}
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/10 gap-2"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Saved!
                  </>
                ) : isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditing ? "Save Changes" : "Publish Project"}
                  </>
                )}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pb-12">
            {/* GRID SECTIONS */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* LEFT 2 COLUMNS: CORE DETAILS */}
              <div className="space-y-6 lg:col-span-2">
                {/* 1. GENERAL INFORMATION */}
                <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
                        <BriefcaseBusiness className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-slate-900">
                          Project Identity & Client
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Basic metadata and account alignment
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 p-6">
                    <div className="space-y-2">
                      <Label htmlFor="projectName" className="text-xs font-semibold text-slate-700">
                        Project Name <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <BriefcaseBusiness className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="projectName"
                          placeholder="e.g. Acme Enterprise ERP Portal"
                          className="pl-10 h-11 rounded-xl border-slate-200 bg-white text-sm"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="clientSelect" className="text-xs font-semibold text-slate-700">
                          Client Account <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <select
                            id="clientSelect"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-xs outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10"
                            value={formData.clientId}
                            onChange={(e) => handleInputChange("clientId", e.target.value)}
                            required
                          >
                            <option value="" disabled>
                              Choose an associated client
                            </option>
                            {clients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="statusSelect" className="text-xs font-semibold text-slate-700">
                          Pipeline Status
                        </Label>
                        <select
                          id="statusSelect"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-xs outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10"
                          value={formData.status}
                          onChange={(e) =>
                            handleInputChange("status", e.target.value as ProjectStatus)
                          }
                        >
                          <option value="Planning">Planning</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Final QA">Final QA</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="projectDescription" className="text-xs font-semibold text-slate-700">
                        Scope & Objectives (Optional)
                      </Label>
                      <textarea
                        id="projectDescription"
                        rows={3}
                        placeholder="Brief summary of requirements, tech stack, and key milestones..."
                        className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 shadow-xs outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 2. TIMELINE & DATES */}
                <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                        <CalendarClock className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-slate-900">
                          Schedule & Milestones
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Target delivery dates and progress tracking
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-xs font-semibold text-slate-700">
                          Start Date <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          className="h-11 rounded-xl border-slate-200 bg-white text-sm"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange("startDate", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deadlineDate" className="text-xs font-semibold text-slate-700">
                          Estimated Deadline <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="deadlineDate"
                          type="date"
                          className="h-11 rounded-xl border-slate-200 bg-white text-sm"
                          value={formData.estimatedDeadline}
                          onChange={(e) =>
                            handleInputChange("estimatedDeadline", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. TEAM ASSIGNMENTS */}
                <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-800">
                        <Users2 className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-slate-900">
                          Assigned Team Members
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Allocate internal human resources to this initiative
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {MOCK_TEAM.map((member) => {
                        const isAssigned = formData.team.some(
                          (t) => t.name === member.name
                        );
                        return (
                          <div
                            key={member.id}
                            onClick={() => toggleTeamMember(member.name, member.role)}
                            className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition-all ${
                              isAssigned
                                ? "border-cyan-300 bg-cyan-50/70 shadow-xs"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-900">
                                  {member.name}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                isAssigned
                                  ? "bg-cyan-600 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {isAssigned ? "Assigned" : "Assign"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT 1 COLUMN: FINANCIALS & SUMMARY */}
              <div className="space-y-6">
                {/* FINANCIAL HEALTH CARD */}
                <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden sticky top-6">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                        <CircleDollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-slate-900">
                          Financial Valuation & Profit
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Budgeting and projected profit margin
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 p-6">
                    <div className="space-y-2">
                      <Label htmlFor="valuation" className="text-xs font-semibold text-slate-700">
                        Project Valuation (BDT) <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <CircleDollarSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="valuation"
                          type="number"
                          min="0"
                          placeholder="e.g. 350000"
                          className="pl-10 h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900"
                          value={formData.valuation}
                          onChange={(e) => handleInputChange("valuation", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyCost" className="text-xs font-semibold text-slate-700">
                        Company Cost (We Bear - BDT)
                      </Label>
                      <Input
                        id="companyCost"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="h-11 rounded-xl border-slate-200 bg-white text-sm"
                        value={formData.companyCost}
                        onChange={(e) => handleInputChange("companyCost", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tempCost" className="text-xs font-semibold text-slate-700">
                        Client Reimbursable / Temp Cost (BDT)
                      </Label>
                      <Input
                        id="tempCost"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="h-11 rounded-xl border-slate-200 bg-white text-sm"
                        value={formData.temporaryCost}
                        onChange={(e) => handleInputChange("temporaryCost", e.target.value)}
                      />
                    </div>

                    {/* LIVE MARGIN CALCULATOR */}
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Estimated Financial Breakdown
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Total Revenue</span>
                        <span className="font-semibold text-slate-900">
                          {formatBDT(valuationNum)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Direct Costs</span>
                        <span className="font-medium text-rose-600">
                          - {formatBDT(companyCostNum + tempCostNum)}
                        </span>
                      </div>

                      <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900">
                            Projected Net Profit
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {marginPercent}% net margin
                          </span>
                        </div>
                        <span
                          className={`font-display text-base font-bold ${
                            estimatedMargin >= 0
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {formatBDT(estimatedMargin)}
                        </span>
                      </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <Button
                      type="submit"
                      disabled={isSubmitDisabled || isSubmitting}
                      className="w-full h-12 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 font-semibold gap-2"
                    >
                      {saveSuccess ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Project Saved Successfully!
                        </>
                      ) : isSubmitting ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {isEditing ? "Update Project" : "Create Project"}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </SidebarInset>
      </section>
    </main>
  );
}

export default function ProjectCreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">Loading project editor...</div>}>
      <ProjectCreateForm />
    </Suspense>
  );
}
