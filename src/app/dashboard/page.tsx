"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  CreditCard,
  FileText,
  FolderKanban,
  KeyRound,
  Plus,
  Receipt,
  ReceiptText,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MOCK_PROJECTS,
  MOCK_CLIENTS,
  MOCK_PAYMENTS,
  MOCK_DUE_RECORDS,
  MOCK_REMINDERS,
  MOCK_TEAM,
} from "@/lib/mock-data";

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStageBadge(status: string) {
  switch (status) {
    case "In Progress":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "Review":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Planning":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Final QA":
      return "bg-violet-50 text-violet-700 border-violet-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function DashboardPage() {
  // Financial Calculations
  const totalRevenue = useMemo(
    () => MOCK_PAYMENTS.filter((p) => p.flow === "Received").reduce((s, p) => s + p.amount, 0),
    []
  );

  const totalExpenses = useMemo(
    () => MOCK_PAYMENTS.filter((p) => p.flow === "Given").reduce((s, p) => s + p.amount, 0),
    []
  );

  const totalDues = useMemo(
    () => MOCK_DUE_RECORDS.reduce((s, d) => s + d.amount, 0),
    []
  );

  const overdueDues = useMemo(
    () =>
      MOCK_DUE_RECORDS.filter((d) => d.status === "Overdue").reduce((s, d) => s + d.amount, 0),
    []
  );

  const netOperatingProfit = totalRevenue - totalExpenses;
  const marginPercentage = totalRevenue > 0 ? ((netOperatingProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // Active Projects
  const activeProjects = useMemo(
    () => MOCK_PROJECTS.filter((p) => p.status !== "Completed"),
    []
  );

  const totalPipelineValuation = useMemo(
    () => MOCK_PROJECTS.reduce((s, p) => s + p.valuation, 0),
    []
  );

  // Recent Cash Activity (5 most recent)
  const recentTransactions = useMemo(() => MOCK_PAYMENTS.slice(0, 5), []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      {/* Subtle Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.06),transparent_25%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.06),transparent_23%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/dashboard" />

        <SidebarInset className="space-y-6">
          {/* Top Executive Header */}
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200/60">
                  Software Company Operations
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">Executive Overview</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
                Operations & Delivery Command
              </h1>
            </div>

            {/* Quick Action Triggers */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/projects/create">
                <Button className="h-10 rounded-xl bg-slate-900 px-4 text-white shadow-sm hover:bg-slate-800 font-semibold text-xs transition-all flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> New Project
                </Button>
              </Link>
              <Link href="/invoices/create">
                <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-cyan-700" /> Create Invoice
                </Button>
              </Link>
              <Link href="/payments">
                <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1.5">
                  <CircleDollarSign className="h-3.5 w-3.5 text-emerald-600" /> Record Payment
                </Button>
              </Link>
            </div>
          </header>

          {/* 4 Core Executive Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Active Deliverables */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-cyan-200">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Deliverables</p>
                <div className="rounded-xl bg-cyan-50 p-2 text-cyan-700">
                  <FolderKanban className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{activeProjects.length} In Flight</p>
                <span className="text-xs text-slate-500 font-medium">of {MOCK_PROJECTS.length} total</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Pipeline Value: <span className="font-semibold text-slate-800">{formatBDT(totalPipelineValuation)}</span>
              </p>
            </Card>

            {/* 2. Realized Cash Inflow */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-200">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cash Inflows (MTD)</p>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                  <CircleDollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-emerald-700">{formatBDT(totalRevenue)}</p>
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700">
                  <ArrowUpRight className="h-3 w-3" /> +18%
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Verified bank & mobile settlements</p>
            </Card>

            {/* 3. Outstanding Receivables */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-amber-200">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Dues</p>
                <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                  <ReceiptText className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{formatBDT(totalDues)}</p>
                <span className="text-xs text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                  {MOCK_DUE_RECORDS.length} Pending
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Overdue: <span className="font-semibold text-rose-600">{formatBDT(overdueDues)}</span>
              </p>
            </Card>

            {/* 4. Net Operating Margin */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-violet-200">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Operating Margin</p>
                <div className="rounded-xl bg-violet-50 p-2 text-violet-700">
                  <Scale className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{formatBDT(netOperatingProfit)}</p>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {marginPercentage}%
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Net EBITDA after COGS & OPEX</p>
            </Card>
          </div>

          {/* Main 2-Column Dashboard Layout */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column (8 cols): Software Deliverables & Cash Activity */}
            <div className="lg:col-span-8 space-y-6">
              {/* Active Software Deliverables */}
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-cyan-700" /> Active Software Deliverables
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Live status, contract valuation, and sprint milestones.
                    </CardDescription>
                  </div>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                  >
                    View All ({MOCK_PROJECTS.length}) <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {MOCK_PROJECTS.map((project) => (
                      <div
                        key={project.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:border-cyan-200 hover:shadow-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2.5">
                            <span className="font-display font-bold text-slate-900 text-sm truncate">
                              {project.name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStageBadge(
                                project.status
                              )}`}
                            >
                              {project.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            Client: <span className="font-semibold text-slate-700">{project.clientName}</span> • Team Lead:{" "}
                            <span className="font-semibold text-cyan-700">{project.team[0]?.name || "Lead Assigned"}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center flex-shrink-0">
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</p>
                            <p className="text-xs font-bold text-slate-900">{formatBDT(project.valuation)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target</p>
                            <p className="text-xs font-bold text-slate-700">{project.estimatedDeadline}</p>
                          </div>
                          <Link
                            href={`/projects/view?id=${project.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            title="Open Project Dashboard"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions & Inflows */}
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-600" /> Recent Cash Transactions
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Itemized client inflows and verified company disbursements.
                    </CardDescription>
                  </div>
                  <Link
                    href="/payments"
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                  >
                    Open Ledger <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="divide-y divide-slate-100">
                    {recentTransactions.map((tx) => (
                      <div key={tx.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-xl p-2 text-xs font-bold ${
                              tx.flow === "Received"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : "bg-rose-50 text-rose-700 border border-rose-200/60"
                            }`}
                          >
                            {tx.flow === "Received" ? "IN" : "OUT"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{tx.party}</p>
                            <p className="text-[11px] text-slate-500">
                              {tx.purpose} • {tx.method}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-xs font-bold font-display ${
                              tx.flow === "Received" ? "text-emerald-700" : "text-slate-800"
                            }`}
                          >
                            {tx.flow === "Received" ? "+" : "-"}
                            {formatBDT(tx.amount)}
                          </p>
                          <p className="text-[10px] text-slate-400">{tx.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (4 cols): Action Items, Team Availability & Quick Launch */}
            <div className="lg:col-span-4 space-y-6">
              {/* Priority Action Items / Due List */}
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                  <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                    <ReceiptText className="h-4 w-4 text-amber-600" /> Pending Receivables
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Unsettled client balances pending collection.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {MOCK_DUE_RECORDS.map((due) => (
                    <div
                      key={due.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5 transition-all hover:bg-slate-50 hover:border-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{due.clientName}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            due.status === "Overdue"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : due.status === "Due Today"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {due.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{due.projectName}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-xs">
                        <span className="text-slate-400 font-medium">Due {due.dueDate}</span>
                        <span className="font-bold text-slate-900">{formatBDT(due.amount)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Engineering Team Presence */}
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-700" /> Crew Availability
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">Live operational readiness.</CardDescription>
                  </div>
                  <Link
                    href="/team"
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                  >
                    Directory <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {MOCK_TEAM.map((member) => (
                    <div key={member.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                            {member.name.charAt(0)}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{member.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex-shrink-0">
                        Online
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Operations Launchpad */}
              <Card className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-6 shadow-sm">
                <div className="space-y-1 mb-4">
                  <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" /> Operations OS Quick Navigation
                  </h3>
                  <p className="text-xs text-slate-400">Direct shortcuts to critical business modules.</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/profit-loss"
                    className="flex items-center gap-2 rounded-xl bg-slate-800/80 p-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700/60"
                  >
                    <Scale className="h-3.5 w-3.5 text-cyan-400" />
                    <span>P&L Statement</span>
                  </Link>

                  <Link
                    href="/invoices"
                    className="flex items-center gap-2 rounded-xl bg-slate-800/80 p-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700/60"
                  >
                    <Receipt className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Invoices Vault</span>
                  </Link>

                  <Link
                    href="/files"
                    className="flex items-center gap-2 rounded-xl bg-slate-800/80 p-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700/60"
                  >
                    <FileText className="h-3.5 w-3.5 text-amber-400" />
                    <span>Project Files</span>
                  </Link>

                  <Link
                    href="/credentials"
                    className="flex items-center gap-2 rounded-xl bg-slate-800/80 p-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700/60"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-violet-400" />
                    <span>Secrets Vault</span>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </section>
    </main>
  );
}