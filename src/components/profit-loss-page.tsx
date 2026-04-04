"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Calculator, Pencil, Plus, Scale, Trash2, Wallet, X } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cachedJson, invalidateCachedJson } from "@/lib/client-cache";

type ClientOption = {
  id: number;
  name: string;
};

type ProjectOption = {
  id: number;
  name: string;
  clientId: number;
  clientName: string;
  valuation: number;
  companyCost: number;
  temporaryCost: number;
};

type PaymentAcknowledgement = "Advance Payment" | "Partial Payment" | "Final Payment" | "Due Payment";

type CostResponsibility = "Company Expense" | "Client Reimbursable";

type PaymentRecord = {
  id: number;
  date: string;
  party: string;
  projectId: number | null;
  projectName: string | null;
  purpose: string;
  acknowledgement: PaymentAcknowledgement | null;
  method: string;
  amount: number;
  flow: string;
  costResponsibility: CostResponsibility | null;
  reimbursementClient: string | null;
  status: string;
  note: string | null;
};

type ProjectBreakdownRow = {
  id: number;
  projectName: string;
  clientName: string;
  valuation: number;
  receivedTotal: number;
  givenTotal: number;
  companyExpenseTotal: number;
  clientReimbursableTotal: number;
  companyCostTotal: number;
  temporaryCostTotal: number;
  netProfitLoss: number;
  operatingProfit: number;
  receivedCount: number;
  givenCount: number;
  dueCount: number;
};

type ProfitLossRecord = {
  id: number;
  clientId: number;
  clientName: string;
  projectId: number;
  projectName: string;
  revenue: number;
  companyCost: number;
  temporaryCost: number;
  note: string;
};

type ProfitLossForm = {
  clientId: string;
  projectId: string;
  revenue: string;
  companyCost: string;
  temporaryCost: string;
  note: string;
};

const defaultForm: ProfitLossForm = {
  clientId: "",
  projectId: "",
  revenue: "",
  companyCost: "",
  temporaryCost: "",
  note: "",
};

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export function ProfitLossPage() {
  const [records, setRecords] = useState<ProfitLossRecord[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProfitLossForm>(defaultForm);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    const data = await cachedJson<{ clients: Array<{ id: number; name: string }> }>("/api/clients", 45_000);
    setClients(data.clients.map((client) => ({ id: client.id, name: client.name })));
  };

  const loadProjects = async () => {
    const data = await cachedJson<{
      projects: Array<{
        id: number;
        name: string;
        clientId: number;
        clientName: string;
        valuation: number;
        companyCost: number;
        temporaryCost: number;
      }>;
    }>("/api/projects", 45_000);

    setProjects(
      data.projects.map((project) => ({
        id: project.id,
        name: project.name,
        clientId: project.clientId,
        clientName: project.clientName,
        valuation: project.valuation,
        companyCost: project.companyCost,
        temporaryCost: project.temporaryCost,
      }))
    );
  };

  const loadRecords = async () => {
    const data = await cachedJson<{
      records: Array<{
        id: number;
        clientId: number;
        clientName: string;
        projectId: number;
        projectName: string;
        revenue: number;
        companyCost: number;
        temporaryCost: number;
        note: string | null;
      }>;
    }>("/api/profit-loss", 20_000);

    setRecords(
      data.records.map((record) => ({
        id: record.id,
        clientId: record.clientId,
        clientName: record.clientName,
        projectId: record.projectId,
        projectName: record.projectName,
        revenue: record.revenue,
        companyCost: record.companyCost,
        temporaryCost: record.temporaryCost,
        note: record.note ?? "",
      }))
    );
  };

  const loadPayments = async () => {
    const data = await cachedJson<{
      payments: Array<{
        id: number;
        date: string;
        party: string;
        projectId: number | null;
        projectName: string | null;
        purpose: string;
        acknowledgement: string | null;
        method: string;
        amount: number;
        flow: string;
        costResponsibility: string | null;
        reimbursementClient: string | null;
        status: string;
        note: string | null;
      }>;
    }>("/api/payments", 20_000);

    setPayments(
      data.payments.map((payment) => ({
        id: payment.id,
        date: payment.date,
        party: payment.party,
        projectId: payment.projectId,
        projectName: payment.projectName,
        purpose: payment.purpose,
        acknowledgement: payment.acknowledgement as PaymentAcknowledgement | null,
        method: payment.method,
        amount: payment.amount,
        flow: payment.flow,
        costResponsibility: payment.costResponsibility as CostResponsibility | null,
        reimbursementClient: payment.reimbursementClient,
        status: payment.status,
        note: payment.note,
      }))
    );
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await Promise.all([loadClients(), loadProjects(), loadRecords(), loadPayments()]);
      setLoading(false);
    };

    void run();
  }, []);

  const projectBreakdown = useMemo(() => {
    const rowsByProject = new Map<number, ProjectBreakdownRow>();

    for (const project of projects) {
      rowsByProject.set(project.id, {
        id: project.id,
        projectName: project.name,
        clientName: project.clientName,
        valuation: project.valuation,
        receivedTotal: 0,
        givenTotal: 0,
        companyExpenseTotal: 0,
        clientReimbursableTotal: 0,
        companyCostTotal: project.companyCost,
        temporaryCostTotal: project.temporaryCost,
        netProfitLoss: 0,
        operatingProfit: 0,
        receivedCount: 0,
        givenCount: 0,
        dueCount: 0,
      });
    }

    for (const payment of payments) {
      if (payment.projectId === null) {
        continue;
      }

      const row = rowsByProject.get(payment.projectId);
      if (!row) {
        continue;
      }

      if (payment.flow === "Received") {
        row.receivedTotal += payment.amount;
        row.receivedCount += 1;
        continue;
      }

      if (payment.flow === "Given") {
        row.givenTotal += payment.amount;
        row.givenCount += 1;

        if (payment.costResponsibility === "Client Reimbursable") {
          row.clientReimbursableTotal += payment.amount;
        } else {
          row.companyExpenseTotal += payment.amount;
        }

        continue;
      }

      if (payment.flow === "Due") {
        row.dueCount += 1;
      }
    }

    return Array.from(rowsByProject.values()).map((row) => {
      const companyCostTotal = row.companyCostTotal + row.companyExpenseTotal;
      const temporaryCostTotal = row.temporaryCostTotal + row.clientReimbursableTotal;
      const operatingProfit = row.receivedTotal - companyCostTotal;
      const netProfitLoss = row.receivedTotal - companyCostTotal - temporaryCostTotal;

      return {
        ...row,
        companyCostTotal,
        temporaryCostTotal,
        operatingProfit,
        netProfitLoss,
      };
    });
  }, [payments, projects]);

  const manualRecords = useMemo(() => {
    return records.map((record) => {
      const netProfit = record.revenue - record.companyCost;
      const operatingProfit = record.revenue - record.companyCost - record.temporaryCost;

      return { ...record, netProfit, operatingProfit };
    });
  }, [records]);

  const totals = useMemo(() => {
    const totalRevenue = projectBreakdown.reduce((sum, row) => sum + row.receivedTotal, 0);
    const totalCost = projectBreakdown.reduce((sum, row) => sum + row.companyCostTotal, 0);
    const totalTemporary = projectBreakdown.reduce((sum, row) => sum + row.temporaryCostTotal, 0);
    const netProfitTotal = projectBreakdown.reduce((sum, row) => sum + row.netProfitLoss, 0);

    return { totalRevenue, totalCost, totalTemporary, netProfitTotal };
  }, [projectBreakdown]);

  const receiptSummary = useMemo(() => {
    const receiptRows = payments.filter((payment) => payment.flow === "Received");

    const advanceTotal = receiptRows
      .filter((payment) => payment.acknowledgement === "Advance Payment")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const partialTotal = receiptRows
      .filter((payment) => payment.acknowledgement === "Partial Payment")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const finalTotal = receiptRows
      .filter((payment) => payment.acknowledgement === "Final Payment")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const dueTotal = receiptRows
      .filter((payment) => payment.acknowledgement === "Due Payment")
      .reduce((sum, payment) => sum + payment.amount, 0);

    return { receiptRows, advanceTotal, partialTotal, finalTotal, dueTotal };
  }, [payments]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEdit = (record: ProfitLossRecord) => {
    setEditingId(record.id);
    setFormData({
      clientId: String(record.clientId),
      projectId: String(record.projectId),
      revenue: String(record.revenue),
      companyCost: String(record.companyCost),
      temporaryCost: String(record.temporaryCost),
      note: record.note,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const setField = (field: keyof ProfitLossForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((item) => String(item.id) === projectId);
    setFormData((prev) => ({
      ...prev,
      projectId,
      clientId: project ? String(project.clientId) : prev.clientId,
      revenue: project ? String(project.valuation) : prev.revenue,
      companyCost: project ? String(project.companyCost) : prev.companyCost,
      temporaryCost: project ? String(project.temporaryCost) : prev.temporaryCost,
    }));
  };

  const saveRecord = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const clientId = Number(formData.clientId);
    const projectId = Number(formData.projectId);
    const revenue = Number(formData.revenue);
    const companyCost = Number(formData.companyCost);
    const temporaryCost = Number(formData.temporaryCost);

    if (
      Number.isNaN(clientId) ||
      Number.isNaN(projectId) ||
      Number.isNaN(revenue) ||
      Number.isNaN(companyCost) ||
      Number.isNaN(temporaryCost)
    ) {
      return;
    }

    const payload = {
      clientId,
      projectId,
      revenue,
      companyCost,
      temporaryCost,
      note: formData.note.trim(),
    };

    const endpoint = editingId !== null ? `/api/profit-loss/${editingId}` : "/api/profit-loss";
    const method = editingId !== null ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return;
    invalidateCachedJson("/api/profit-loss");
    await loadRecords();
    closeModal();
  };

  const deleteRecord = async (id: number) => {
    const response = await fetch(`/api/profit-loss/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    invalidateCachedJson("/api/profit-loss");
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(14,165,233,0.1),transparent_24%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.09),transparent_24%),radial-gradient(circle_at_90%_88%,rgba(244,114,182,0.08),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/profit-loss" className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]" />

        <div className="space-y-5 lg:ml-[374px]">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Project Finance Health</p>
              <h2 className="font-display text-3xl font-semibold text-slate-900">Profit / Loss</h2>
            </div>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Download Report
            </Button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              <>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-24" /><SkeletonBlock className="mt-2 h-8 w-24" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-24" /><SkeletonBlock className="mt-2 h-8 w-24" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-24" /><SkeletonBlock className="mt-2 h-8 w-24" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-24" /><SkeletonBlock className="mt-2 h-8 w-24" /></CardContent></Card>
              </>
            ) : (
              <>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700"><Wallet className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Revenue</p><p className="mt-1 font-display text-2xl font-semibold text-emerald-700">{formatBDT(totals.totalRevenue)}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-amber-100 p-2 text-amber-700"><Calculator className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Company Cost</p><p className="mt-1 font-display text-2xl font-semibold text-amber-700">{formatBDT(totals.totalCost)}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-violet-100 p-2 text-violet-700"><Scale className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Temporary Cost</p><p className="mt-1 font-display text-2xl font-semibold text-violet-700">{formatBDT(totals.totalTemporary)}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className={`mb-3 inline-flex rounded-xl p-2 ${totals.netProfitTotal >= 0 ? "bg-cyan-100 text-cyan-700" : "bg-rose-100 text-rose-700"}`}>{totals.netProfitTotal >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}</div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Net Profit/Loss</p><p className={`mt-1 font-display text-2xl font-semibold ${totals.netProfitTotal >= 0 ? "text-cyan-700" : "text-rose-700"}`}>{formatBDT(totals.netProfitTotal)}</p></CardContent></Card>
              </>
            )}
          </div>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle className="text-slate-900">Project Profitability Breakdown</CardTitle>
              <CardDescription className="text-slate-600">Live project summary built from project records plus related received and given payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="pb-3 font-medium">Project</th>
                      <th className="pb-3 font-medium">Client</th>
                      <th className="pb-3 font-medium">Payments</th>
                      <th className="pb-3 font-medium">Received</th>
                      <th className="pb-3 font-medium">Given</th>
                      <th className="pb-3 font-medium">Company Cost</th>
                      <th className="pb-3 font-medium">Temporary Cost</th>
                      <th className="pb-3 font-medium">Net Profit/Loss</th>
                      <th className="pb-3 font-medium">Operating Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3"><SkeletonBlock className="h-4 w-40" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-24 rounded-full" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-24 rounded-full" /></td>
                      </tr>
                    )) : projectBreakdown.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 text-slate-700">
                        <td className="py-3 font-medium text-slate-900">
                          <div>{item.projectName}</div>
                          <div className="text-xs text-slate-500">Valuation {formatBDT(item.valuation)}</div>
                        </td>
                        <td className="py-3">{item.clientName}</td>
                        <td className="py-3 text-sm text-slate-600">
                          <div>{item.receivedCount} received</div>
                          <div>{item.givenCount} given</div>
                          <div>{item.dueCount} due</div>
                        </td>
                        <td className="py-3 font-semibold text-emerald-700">{formatBDT(item.receivedTotal)}</td>
                        <td className="py-3 font-semibold text-amber-700">{formatBDT(item.givenTotal)}</td>
                        <td className="py-3">{formatBDT(item.companyCostTotal)}</td>
                        <td className="py-3">{formatBDT(item.temporaryCostTotal)}</td>
                        <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.netProfitLoss >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{formatBDT(item.netProfitLoss)}</span></td>
                        <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.operatingProfit >= 0 ? "bg-cyan-100 text-cyan-700" : "bg-rose-100 text-rose-700"}`}>{formatBDT(item.operatingProfit)}</span></td>
                      </tr>
                    ))}
                    {!projectBreakdown.length ? <tr><td colSpan={9} className="py-8 text-center text-sm text-slate-500">No project payment breakdown available yet.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle className="text-slate-900">Customer Payment Acknowledgements</CardTitle>
              <CardDescription className="text-slate-600">Received payments grouped by advance, partial, final, and due stages.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Advance Payment</p><p className="mt-2 font-display text-2xl font-semibold text-slate-900">{formatBDT(receiptSummary.advanceTotal)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Partial Payment</p><p className="mt-2 font-display text-2xl font-semibold text-slate-900">{formatBDT(receiptSummary.partialTotal)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Final Payment</p><p className="mt-2 font-display text-2xl font-semibold text-slate-900">{formatBDT(receiptSummary.finalTotal)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Due Payment</p><p className="mt-2 font-display text-2xl font-semibold text-slate-900">{formatBDT(receiptSummary.dueTotal)}</p></div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Project</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-24 rounded-full" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                      </tr>
                    )) : receiptSummary.receiptRows.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100 text-slate-700">
                        <td className="py-3">{payment.date}</td>
                        <td className="py-3 font-medium text-slate-900">{payment.party}</td>
                        <td className="py-3">{payment.projectName ?? "-"}</td>
                        <td className="py-3">{payment.acknowledgement ?? "-"}</td>
                        <td className="py-3 font-semibold text-emerald-700">{formatBDT(payment.amount)}</td>
                        <td className="py-3">{payment.purpose}</td>
                      </tr>
                    ))}
                    {!receiptSummary.receiptRows.length ? (
                      <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-500">No customer payment acknowledgements yet.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle className="text-slate-900">Saved Profit/Loss Records</CardTitle>
              <CardDescription className="text-slate-600">Manual project rows saved in MySQL.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="pb-3 font-medium">Project</th>
                      <th className="pb-3 font-medium">Client</th>
                      <th className="pb-3 font-medium">Revenue</th>
                      <th className="pb-3 font-medium">Company Cost</th>
                      <th className="pb-3 font-medium">Temporary Cost</th>
                      <th className="pb-3 font-medium">Net Profit/Loss</th>
                      <th className="pb-3 font-medium">Operating Profit</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? Array.from({ length: 3 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-24 rounded-full" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-24 rounded-full" /></td>
                        <td className="py-3"><SkeletonBlock className="ml-auto h-9 w-28" /></td>
                      </tr>
                    )) : manualRecords.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 text-slate-700">
                        <td className="py-3 font-medium text-slate-900">{item.projectName}</td>
                        <td className="py-3">{item.clientName}</td>
                        <td className="py-3 font-semibold text-emerald-700">{formatBDT(item.revenue)}</td>
                        <td className="py-3">{formatBDT(item.companyCost)}</td>
                        <td className="py-3">{formatBDT(item.temporaryCost)}</td>
                        <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.netProfit >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{formatBDT(item.netProfit)}</span></td>
                        <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.operatingProfit >= 0 ? "bg-cyan-100 text-cyan-700" : "bg-rose-100 text-rose-700"}`}>{formatBDT(item.operatingProfit)}</span></td>
                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" className="h-9 border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-100" onClick={() => openEdit(item)}>
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button variant="outline" className="h-9 border-rose-200 bg-white px-3 text-rose-700 hover:bg-rose-50" onClick={() => void deleteRecord(item.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!manualRecords.length ? <tr><td colSpan={8} className="py-8 text-center text-sm text-slate-500">No profit/loss records yet.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-3xl border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700"><Scale className="h-3.5 w-3.5" />{editingId !== null ? "Edit Record" : "New Record"}</div>
                <CardTitle className="text-slate-900">{editingId !== null ? "Update Profit/Loss Record" : "Create Profit/Loss Record"}</CardTitle>
                <CardDescription className="text-slate-600">Persist project-level revenue and costs in MySQL.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={closeModal} aria-label="Close profit/loss modal"><X className="h-4 w-4" /></Button>
            </CardHeader>

            <CardContent className="pt-6">
              <form className="space-y-5" onSubmit={saveRecord}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Project</Label>
                    <select id="projectId" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={formData.projectId} onChange={(event) => handleProjectChange(event.target.value)} required>
                      <option value="">Select project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.name} - {project.clientName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client</Label>
                    <select id="clientId" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={formData.clientId} onChange={(event) => setField("clientId", event.target.value)} required>
                      <option value="">Select client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2"><Label htmlFor="revenue">Revenue</Label><Input id="revenue" type="number" min="0" value={formData.revenue} onChange={(event) => setField("revenue", event.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="companyCost">Company Cost</Label><Input id="companyCost" type="number" min="0" value={formData.companyCost} onChange={(event) => setField("companyCost", event.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="temporaryCost">Temporary Cost</Label><Input id="temporaryCost" type="number" min="0" value={formData.temporaryCost} onChange={(event) => setField("temporaryCost", event.target.value)} required /></div>
                </div>

                <div className="space-y-2"><Label htmlFor="note">Note</Label><textarea id="note" rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" placeholder="Optional note" value={formData.note} onChange={(event) => setField("note", event.target.value)} /></div>

                <div className="flex gap-2 border-t border-slate-100 pt-2"><Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">{editingId !== null ? "Save Changes" : "Create Record"}</Button><Button type="button" variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100" onClick={closeModal}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
