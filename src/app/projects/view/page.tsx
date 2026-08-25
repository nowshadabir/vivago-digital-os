"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Eye,
  FileBadge2,
  FileCheck2,
  FileClock,
  FileCode2,
  FileText,
  HandCoins,
  History,
  KeyRound,
  Layers,
  Pencil,
  ShieldCheck,
  Timer,
  Trash2,
  Users2,
  Wallet,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MOCK_PROJECTS,
  MOCK_CLIENTS,
  MOCK_ASSETS,
  MOCK_PAYMENTS,
  MOCK_DUE_RECORDS,
} from "@/lib/mock-data";

type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Review"
  | "Final QA"
  | "Completed"
  | "On Hold";

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadge(status: ProjectStatus) {
  if (status === "Completed") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "On Hold") return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "In Progress") return "bg-blue-100 text-blue-800 border-blue-200";
  if (status === "Final QA") return "bg-violet-100 text-violet-800 border-violet-200";
  if (status === "Review") return "bg-cyan-100 text-cyan-800 border-cyan-200";
  return "bg-slate-100 text-slate-800 border-slate-200";
}

function ProjectViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const projectId = idParam ? Number(idParam) : MOCK_PROJECTS[0]?.id || 1;

  const project = useMemo(() => {
    return MOCK_PROJECTS.find((p) => p.id === projectId) || MOCK_PROJECTS[0];
  }, [projectId]);

  const financials = useMemo(() => {
    if (!project) return { received: 0, due: 0 };
    const received = MOCK_PAYMENTS.filter(
      (p) => p.projectId === project.id && p.flow === "Received"
    ).reduce((sum, p) => sum + p.amount, 0);

    const due = MOCK_DUE_RECORDS.filter(
      (d) => d.projectId === project.id && (d.status as string) !== "Collected"
    ).reduce((sum, d) => sum + d.amount, 0);

    return { received, due };
  }, [project]);

  const projectPayments = useMemo(() => {
    if (!project) return [];
    return MOCK_PAYMENTS.filter((p) => p.projectId === project.id).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [project]);

  const agreementFiles = useMemo(() => {
    return MOCK_ASSETS.files
      .filter((f) => f.fileName.toLowerCase().includes("agreement"))
      .sort(
        (a, b) => new Date(b.fileDate).getTime() - new Date(a.fileDate).getTime()
      );
  }, []);

  const projectCredentials = useMemo(() => {
    return MOCK_ASSETS.credentials;
  }, []);

  if (!project) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-center">
        <p className="text-slate-500">Project not found.</p>
        <Link href="/projects" className="mt-4 inline-block text-cyan-600 font-semibold underline">
          Back to Projects
        </Link>
      </main>
    );
  }

  const startDateStr =
    typeof project.startDate === "string"
      ? project.startDate
      : new Date(project.startDate).toISOString().slice(0, 10);
  const deadlineStr =
    typeof project.estimatedDeadline === "string"
      ? project.estimatedDeadline
      : new Date(project.estimatedDeadline).toISOString().slice(0, 10);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 md:px-8 md:py-8">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(59,130,246,0.14),transparent_25%),radial-gradient(circle_at_88%_10%,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_90%_90%,rgba(245,158,11,0.1),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/projects" />

        <SidebarInset className="space-y-6">
          {/* HEADER & ACTIONS */}
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
                <span className="text-cyan-700 font-medium">Project Overview</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {project.name}
                </h1>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                    project.status as ProjectStatus
                  )}`}
                >
                  {project.status}
                </span>
              </div>
              <p className="flex items-center gap-2 text-xs text-slate-600 sm:text-sm">
                <Building2 className="h-4 w-4 text-slate-400" />
                Client: <span className="font-semibold text-slate-900">{project.clientName}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/projects">
                <Button
                  variant="outline"
                  className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back
                </Button>
              </Link>
              <Link href={`/projects/edit?id=${project.id}`}>
                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/10 gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit Project
                </Button>
              </Link>
            </div>
          </div>

          {/* FINANCIAL SUMMARY CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-emerald-200/80 bg-emerald-50/40 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Total Valuation
                </p>
                <p className="mt-1.5 font-display text-2xl font-bold text-emerald-950">
                  {formatBDT(project.valuation)}
                </p>
                <p className="mt-1 text-[11px] text-emerald-700">Agreed client contract value</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200/80 bg-blue-50/40 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Total Received
                </p>
                <p className="mt-1.5 font-display text-2xl font-bold text-blue-950">
                  {formatBDT(financials.received)}
                </p>
                <p className="mt-1 text-[11px] text-blue-700">Collected in company account</p>
              </CardContent>
            </Card>

            <Card className="border-rose-200/80 bg-rose-50/40 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                  Remaining Due
                </p>
                <p className="mt-1.5 font-display text-2xl font-bold text-rose-950">
                  {formatBDT(financials.due)}
                </p>
                <p className="mt-1 text-[11px] text-rose-700">Pending receivables</p>
              </CardContent>
            </Card>

            <Card className="border-violet-200/80 bg-violet-50/40 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-violet-700">
                  Estimated Net Profit
                </p>
                <p className="mt-1.5 font-display text-2xl font-bold text-violet-950">
                  {formatBDT(
                    project.valuation - ((project.companyCost || 0) + (project.temporaryCost || 0))
                  )}
                </p>
                <p className="mt-1 text-[11px] text-violet-700">
                  After direct expenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* TWO COLUMN CONTENT LAYOUT */}
          <div className="grid gap-6 lg:grid-cols-[1fr_340px] pb-12">
            {/* LEFT COLUMN: TRANSACTIONS & AGREEMENTS */}
            <div className="space-y-6">
              {/* TRANSACTION HISTORY */}
              <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                        <History className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-slate-900">
                          Project Transaction History
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Payment ledger entries related to this project
                        </CardDescription>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {projectPayments.length} records
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-bold uppercase">
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Purpose</th>
                          <th className="px-5 py-3">Method</th>
                          <th className="px-5 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectPayments.length ? (
                          projectPayments.map((row) => (
                            <tr
                              key={row.id}
                              className="border-t border-slate-50 text-slate-600 hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-5 py-3.5 font-medium text-slate-900">
                                {row.date}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-900">
                                    {row.purpose}
                                  </span>
                                  {row.note && (
                                    <span className="text-[11px] text-slate-400 italic">
                                      {row.note}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <CreditCard className="h-3.5 w-3.5" />
                                  {row.method}
                                </div>
                              </td>
                              <td
                                className={`px-5 py-3.5 text-right font-bold ${
                                  row.flow === "Received"
                                    ? "text-emerald-600"
                                    : "text-rose-600"
                                }`}
                              >
                                <div className="flex items-center justify-end gap-1 font-mono">
                                  {row.flow === "Received" ? (
                                    <ArrowDownLeft className="h-3.5 w-3.5" />
                                  ) : (
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  )}
                                  {formatBDT(row.amount)}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="px-5 py-8 text-center text-slate-400 italic"
                              colSpan={4}
                            >
                              No financial transactions recorded for this project yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* AGREEMENT PAPERS */}
              <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                        <FileBadge2 className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-slate-900">
                          Agreement Papers & Legal Documents
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Contractual documents and signatures
                        </CardDescription>
                      </div>
                    </div>
                    <Link
                      href="/files"
                      className="text-xs font-semibold text-cyan-700 hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Manage in Files
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {agreementFiles.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {agreementFiles.map((file, idx) => (
                        <div
                          key={file.id}
                          className={`rounded-2xl border p-4 transition-all hover:border-slate-300 ${
                            idx === 0
                              ? "border-emerald-200 bg-emerald-50/30 shadow-xs"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="mb-3 flex items-start justify-between">
                            <div
                              className={`rounded-xl p-2.5 ${
                                idx === 0
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {idx === 0 ? (
                                <FileCheck2 className="h-5 w-5" />
                              ) : (
                                <FileClock className="h-5 w-5" />
                              )}
                            </div>
                            {idx === 0 && (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                Active Contract
                              </span>
                            )}
                          </div>
                          <p className="truncate text-sm font-bold text-slate-900">
                            {file.fileName}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span>{file.fileDate}</span>
                            <span>{file.sizeKb} KB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center">
                      <p className="text-xs font-semibold text-slate-400">
                        No matching agreements found
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* PROJECT ASSETS & VAULT ACCESS */}
              <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-800">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-slate-900">
                          Vault Access & Secondary Credentials
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Server, API, and hosting credentials
                        </CardDescription>
                      </div>
                    </div>
                    <Link
                      href="/credentials"
                      className="text-xs font-semibold text-cyan-700 hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Open Vault
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-bold uppercase">
                          <th className="px-5 py-3">Category</th>
                          <th className="px-5 py-3">Service</th>
                          <th className="px-5 py-3">Access Details</th>
                          <th className="px-5 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectCredentials.length ? (
                          projectCredentials.map((row) => (
                            <tr
                              key={row.id}
                              className="border-t border-slate-50 text-slate-600 hover:bg-slate-50/50"
                            >
                              <td className="px-5 py-3.5 font-medium text-slate-900">
                                {row.category}
                              </td>
                              <td className="px-5 py-3.5 font-bold text-slate-900">
                                {row.service}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="opacity-80">{row.username}</span> /{" "}
                                <span className="text-slate-300 font-mono">••••••••</span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                                  {row.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="px-5 py-6 text-center text-slate-400"
                              colSpan={4}
                            >
                              No secondary assets found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: CLIENT & TIMELINE WIDGETS */}
            <div className="space-y-6">
              {/* CLIENT DETAILS */}
              <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-slate-900">
                        Client Information
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Organization account details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 font-bold text-white shadow-md shadow-cyan-500/20">
                      {project.clientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {project.clientName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        Record ID: VDG-C-{project.clientId}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Status</span>
                      <span className="font-semibold text-emerald-700">Verified Partner</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Account Tier</span>
                      <span className="font-semibold text-slate-800">Standard Enterprise</span>
                    </div>
                  </div>

                  <Link href="/clients" className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-slate-200 text-xs">
                      View Client Directory
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* TIMELINE */}
              <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                      <Timer className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-slate-900">
                        Project Timeline
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Milestone milestones & schedule
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  <div className="relative border-l-2 border-slate-200 pl-4 space-y-4 ml-2">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Commencement Date
                      </p>
                      <p className="text-xs font-bold text-slate-800">{startDateStr}</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-white" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Target Completion
                      </p>
                      <p className="text-xs font-bold text-slate-800">{deadlineStr}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ASSIGNED TEAM */}
              <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-800">
                      <Users2 className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-slate-900">
                        Assigned Crew
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Personnel attached to this project
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 p-5">
                  {project.team?.length ? (
                    project.team.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-xs hover:border-slate-200 transition-all"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {member.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No team members assigned.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </section>
    </main>
  );
}

export default function ProjectViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">
          Loading project details...
        </div>
      }
    >
      <ProjectViewContent />
    </Suspense>
  );
}
