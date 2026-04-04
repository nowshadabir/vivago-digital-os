import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  FolderKanban,
  ReceiptText,
  Users,
  type LucideIcon,
} from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";
import { Prisma } from "@prisma/client";

import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

type DashboardProject = {
  id: number;
  name: string;
  status: string;
  startDate: Date;
  estimatedDeadline: Date;
  valuation: number;
  companyCost: number;
  temporaryCost: number;
  client: {
    name: string;
  };
};

type DashboardReminder = {
  id: number;
  title: string;
  note: string | null;
  dueDate: string;
  dueTime: string;
  priority: string;
  status: string;
};

type MetricCard = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: LucideIcon;
  accent: string;
};

function pipelineStatusClasses(status: string) {
  if (status === "Final QA") return "bg-violet-100 text-violet-700";
  if (status === "Review") return "bg-cyan-100 text-cyan-700";
  if (status === "In progress") return "bg-blue-100 text-blue-700";
  if (status === "In Progress") return "bg-blue-100 text-blue-700";
  if (status === "Completed") return "bg-emerald-100 text-emerald-700";
  if (status === "On Hold") return "bg-amber-100 text-amber-700";
  return "bg-amber-100 text-amber-700";
}

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateLabel(value: Date) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "short",
    day: "numeric",
  }).format(value);
}

function calculateProgress(project: DashboardProject) {
  if (project.status === "Completed") return 100;

  const start = new Date(project.startDate).getTime();
  const deadline = new Date(project.estimatedDeadline).getTime();
  const now = Date.now();

  if (!Number.isFinite(start) || !Number.isFinite(deadline) || deadline <= start) {
    return project.status === "On Hold" ? 30 : project.status === "Planning" ? 15 : 50;
  }

  const ratio = (now - start) / (deadline - start);
  const baseProgress = Math.round(Math.max(0, Math.min(1, ratio)) * 100);

  if (project.status === "On Hold") {
    return Math.min(baseProgress, 75);
  }

  if (project.status === "Final QA") {
    return Math.max(baseProgress, 90);
  }

  if (project.status === "Review") {
    return Math.max(baseProgress, 70);
  }

  if (project.status === "In Progress") {
    return Math.max(baseProgress, 45);
  }

  return Math.max(baseProgress, 15);
}

function formatSignedPercent(currentValue: number, previousValue: number) {
  if (previousValue === 0) {
    if (currentValue === 0) return "No change";
    return "New this month";
  }

  const percent = Math.round(((currentValue - previousValue) / previousValue) * 100);
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent}% vs last month`;
}

function formatDirection(value: number) {
  return value >= 0 ? "Positive" : "Negative";
}

export default async function DashboardPage() {
  noStore();

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [projects, activeClients, activeClientsTotal, currentReceived, previousReceived, currentCompanyCosts, previousCompanyCosts, currentTempCosts, previousTempCosts, openDueAmount, openDueCount, reminders]: [
    DashboardProject[],
    number,
    number,
    { _sum: { amount: number | null } },
    { _sum: { amount: number | null } },
    { _sum: { amount: number | null } },
    { _sum: { amount: number | null } },
    { _sum: { amount: number | null } },
    { _sum: { amount: number | null } },
    { _sum: { amount: number | null } },
    number,
    DashboardReminder[]
  ] = await Promise.all([
    prisma.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        estimatedDeadline: true,
        valuation: true,
        companyCost: true,
        temporaryCost: true,
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.client.count({ where: { status: "Active" } }),
    prisma.client.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        flow: "Received",
        date: { gte: currentMonthStart, lt: nextMonthStart },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        flow: "Received",
        date: { gte: previousMonthStart, lt: currentMonthStart },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        flow: "Given",
        costResponsibility: "Company Expense",
        date: { gte: currentMonthStart, lt: nextMonthStart },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        flow: "Given",
        costResponsibility: "Company Expense",
        date: { gte: previousMonthStart, lt: currentMonthStart },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        flow: "Given",
        costResponsibility: "Client Reimbursable",
        date: { gte: currentMonthStart, lt: nextMonthStart },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        flow: "Given",
        costResponsibility: "Client Reimbursable",
        date: { gte: previousMonthStart, lt: currentMonthStart },
      },
    }),
    prisma.dueRecord.aggregate({
      _sum: { amount: true },
      where: { status: { not: "Collected" } },
    }),
    prisma.dueRecord.count({ where: { status: { not: "Collected" } } }),
    prisma.$queryRaw<DashboardReminder[]>(Prisma.sql`
      SELECT
        id,
        title,
        note,
        dueDate,
        dueTime,
        priority,
        status
      FROM reminder
      WHERE status = 'Pending'
      ORDER BY dueDate ASC, dueTime ASC
      LIMIT 4
    `),
  ]);

  const activeProjects = projects.filter((project) => project.status !== "Completed");
  const currentReceivedTotal = currentReceived._sum.amount ?? 0;
  const previousReceivedTotal = previousReceived._sum.amount ?? 0;
  const currentCompanyCostTotal = currentCompanyCosts._sum.amount ?? 0;
  const previousCompanyCostTotal = previousCompanyCosts._sum.amount ?? 0;
  const currentTempCostTotal = currentTempCosts._sum.amount ?? 0;
  const previousTempCostTotal = previousTempCosts._sum.amount ?? 0;
  const openDueTotal = openDueAmount._sum.amount ?? 0;
  const netProfit = currentReceivedTotal - currentCompanyCostTotal - currentTempCostTotal;
  const profitValue = Math.max(netProfit, 0);
  const lossValue = Math.max(-netProfit, 0);

  const metrics: MetricCard[] = [
    {
      label: "Active Projects",
      value: String(activeProjects.length),
      delta: `${projects.length} total projects`,
      trend: "up",
      icon: FolderKanban,
      accent: "from-cyan-500/20 to-sky-500/10",
    },
    {
      label: "Monthly Revenue",
      value: formatBDT(currentReceivedTotal),
      delta: formatSignedPercent(currentReceivedTotal, previousReceivedTotal),
      trend: "up",
      icon: CircleDollarSign,
      accent: "from-emerald-500/20 to-lime-500/10",
    },
    {
      label: "Outstanding Due",
      value: formatBDT(openDueTotal),
      delta: `${openDueCount} open ${openDueCount === 1 ? "record" : "records"}`,
      trend: "down",
      icon: ReceiptText,
      accent: "from-amber-500/20 to-orange-500/10",
    },
    {
      label: "Agency-Borne Costs",
      value: formatBDT(currentCompanyCostTotal),
      delta: formatSignedPercent(currentCompanyCostTotal, previousCompanyCostTotal),
      trend: "down",
      icon: CircleDollarSign,
      accent: "from-rose-500/20 to-orange-500/10",
    },
    {
      label: "Temp Costs (Pending Reimb.)",
      value: formatBDT(currentTempCostTotal),
      delta: formatSignedPercent(currentTempCostTotal, previousTempCostTotal),
      trend: "down",
      icon: ReceiptText,
      accent: "from-violet-500/20 to-fuchsia-500/10",
    },
    {
      label: "Net Profit",
      value: formatBDT(netProfit),
      delta: formatDirection(netProfit),
      trend: "up",
      icon: ArrowUpRight,
      accent: "from-emerald-500/20 to-cyan-500/10",
    },
    {
      label: "Active Clients",
      value: String(activeClients),
      delta: `${activeClientsTotal} total clients`,
      trend: "up",
      icon: Users,
      accent: "from-violet-500/20 to-indigo-500/10",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(14,165,233,0.12),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.1),transparent_22%),radial-gradient(circle_at_90%_90%,rgba(245,158,11,0.09),transparent_20%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:46px_46px]" />

      <section className="relative w-full">
        <AppSidebar
          activePath="/dashboard"
          className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]"
        />

        <div className="space-y-5 lg:ml-[374px]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const TrendIcon = metric.trend === "up" ? ArrowUpRight : ArrowDownRight;
              const trendClass = metric.trend === "up" ? "text-emerald-700" : "text-amber-700";

              return (
                <Card
                  key={metric.label}
                  className={`border-slate-200 bg-gradient-to-br ${metric.accent} from-5% to-90%`}
                >
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-slate-600">{metric.label}</p>
                      <div className="rounded-xl bg-white/70 p-2 text-slate-700">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="font-display text-3xl font-semibold text-slate-900">{metric.value}</p>
                    <p className={`mt-3 inline-flex items-center gap-1 text-xs ${trendClass}`}>
                      <TrendIcon className="h-3.5 w-3.5" />
                      {metric.delta}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
            <Card className="border-slate-200 bg-white/85">
              <CardHeader>
                <CardTitle className="text-slate-900">Project Pipeline</CardTitle>
                <CardDescription className="text-slate-600">
                  Track delivery, budget, and execution status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-3">
                  <div>
                    <p className="uppercase tracking-wider text-slate-500">Total Pipeline Value</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatBDT(projects.reduce<number>((sum, project) => sum + project.valuation, 0))}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-slate-500">Avg Completion</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {projects.length === 0
                        ? "0%"
                        : `${Math.round(
                            projects.reduce<number>((sum, project) => sum + calculateProgress(project), 0) / projects.length
                          )}%`}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-slate-500">At-Risk Projects</p>
                    <p className="mt-1 font-semibold text-rose-700">
                      {projects.filter((project: DashboardProject) => calculateProgress(project) >= 85 && project.status !== "Completed").length} flagged
                    </p>
                  </div>
                </div>

                {activeProjects.slice(0, 5).map((project: DashboardProject) => {
                  const progress = calculateProgress(project);

                  return (
                  <div key={project.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{project.name}</p>
                        <p className="text-sm text-slate-600">
                          {project.client.name} · Deadline {formatDateLabel(project.estimatedDeadline)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${pipelineStatusClasses(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">Progress: {progress}%</span>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">Budget: {formatBDT(project.valuation)}</span>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">ETA: {formatDateLabel(project.estimatedDeadline)}</span>
                    </div>
                  </div>
                );
                })}

                {activeProjects.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-500">No active projects yet.</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-slate-200 bg-white/85">
                <CardHeader>
                  <CardTitle className="text-slate-900">Reminders</CardTitle>
                  <CardDescription className="text-slate-600">Important pending actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reminders.map((reminder: DashboardReminder) => (
                    <div key={reminder.id} className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{reminder.title}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            reminder.priority === "High"
                              ? "bg-rose-100 text-rose-700"
                              : reminder.priority === "Medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {reminder.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{reminder.note ?? "No details provided."}</p>
                      <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {reminder.dueDate} at {reminder.dueTime}
                      </p>
                    </div>
                  ))}

                  {reminders.length === 0 && (
                    <p className="py-8 text-center text-sm text-slate-500">No pending reminders.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/85">
                <CardHeader>
                  <CardTitle className="text-slate-900">Financial Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2.5">
                    <span>Profit (MTD)</span>
                    <span className="font-semibold text-emerald-700">{formatBDT(profitValue)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2.5">
                    <span>Loss (MTD)</span>
                    <span className="font-semibold text-rose-700">{formatBDT(lossValue)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2.5">
                    <span>Due Receivable</span>
                    <span className="font-semibold text-amber-700">{formatBDT(openDueTotal)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}