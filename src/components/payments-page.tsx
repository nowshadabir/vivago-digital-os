"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  CircleDollarSign,
  HandCoins,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_PAYMENTS, MOCK_DUE_RECORDS, MOCK_PROJECTS, MOCK_CLIENTS } from "@/lib/mock-data";

type PaymentFlow = "Received" | "Given";
type PaymentStatus = "Completed" | "Pending" | "Failed";
type PaymentMethod = "Bank Transfer" | "Cash" | "Card" | "Mobile Banking";
type CostResponsibility = "Company Expense" | "Client Reimbursable";
type DueStatus = "Upcoming" | "Due Today" | "Overdue" | "Collected";
type PaymentAcknowledgement = "Advance Payment" | "Partial Payment" | "Final Payment" | "Due Payment";

type ClientOption = {
  id: number;
  name: string;
};

type ProjectOption = {
  id: number;
  name: string;
};

type PaymentRecord = {
  id: number;
  date: string;
  party: string;
  projectId: number | null;
  projectName: string | null;
  purpose: string;
  acknowledgement: PaymentAcknowledgement | null;
  method: PaymentMethod;
  amount: number;
  flow: PaymentFlow;
  costResponsibility: CostResponsibility | null;
  reimbursementClient: string;
  status: PaymentStatus;
  note: string;
};

type DueRecord = {
  id: number;
  clientId: number | null;
  clientName: string | null;
  projectId: number | null;
  projectName: string | null;
  dueDate: string;
  amount: number;
  status: DueStatus;
  note: string;
};

type PaymentForm = {
  date: string;
  party: string;
  projectId: string;
  purpose: string;
  acknowledgement: PaymentAcknowledgement | "";
  method: PaymentMethod;
  amount: string;
  flow: PaymentFlow;
  costResponsibility: CostResponsibility;
  reimbursementClient: string;
  status: PaymentStatus;
  note: string;
};

type DueForm = {
  clientId: string;
  projectId: string;
  dueDate: string;
  amount: string;
  status: DueStatus;
  note: string;
};

const defaultPaymentForm: PaymentForm = {
  date: "",
  party: "",
  projectId: "",
  purpose: "",
  acknowledgement: "",
  method: "Bank Transfer",
  amount: "",
  flow: "Received",
  costResponsibility: "Company Expense",
  reimbursementClient: "",
  status: "Completed",
  note: "",
};

const defaultDueForm: DueForm = {
  clientId: "",
  projectId: "",
  dueDate: "",
  amount: "",
  status: "Upcoming",
  note: "",
};

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function paymentFlowClasses(flow: PaymentFlow) {
  return flow === "Received" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
}

function paymentStatusClasses(status: PaymentStatus) {
  if (status === "Completed") return "bg-cyan-100 text-cyan-700";
  if (status === "Pending") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function costResponsibilityClasses(responsibility: CostResponsibility | null) {
  if (!responsibility) return "bg-slate-100 text-slate-600";
  if (responsibility === "Client Reimbursable") return "bg-violet-100 text-violet-700";
  return "bg-slate-100 text-slate-700";
}

function dueStatusClasses(status: DueStatus) {
  if (status === "Collected") return "bg-emerald-100 text-emerald-700";
  if (status === "Due Today") return "bg-cyan-100 text-cyan-700";
  if (status === "Overdue") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function toDateInput(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [dues, setDues] = useState<DueRecord[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(defaultPaymentForm);

  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [editingDueId, setEditingDueId] = useState<number | null>(null);
  const [dueForm, setDueForm] = useState<DueForm>(defaultDueForm);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProjects(MOCK_PROJECTS.map(p => ({ id: p.id, name: p.name })));
      setClients(MOCK_CLIENTS.map(c => ({ id: c.id, name: c.name })));
      setPayments(MOCK_PAYMENTS.map(p => ({
        ...p,
        date: toDateInput(p.date),
        acknowledgement: p.acknowledgement as PaymentAcknowledgement | null,
        method: p.method as PaymentMethod,
        flow: p.flow as PaymentFlow,
        costResponsibility: p.costResponsibility as CostResponsibility | null,
        reimbursementClient: p.reimbursementClient ?? "",
        status: p.status as PaymentStatus,
        note: p.note ?? ""
      })));
      setDues(MOCK_DUE_RECORDS.map(d => ({
        ...d,
        dueDate: toDateInput(d.dueDate),
        status: d.status as DueStatus,
        note: d.note ?? ""
      })));
      
      setLoading(false);
    };

    void run();
  }, []);

  const totals = useMemo(() => {
    const received = payments.filter((payment) => payment.flow === "Received").reduce((sum, payment) => sum + payment.amount, 0);
    const given = payments.filter((payment) => payment.flow === "Given").reduce((sum, payment) => sum + payment.amount, 0);
    const dueIncoming = dues.filter((due) => due.status !== "Collected").reduce((sum, due) => sum + due.amount, 0);
    const reimbursableCosts = payments
      .filter((payment) => payment.flow === "Given" && payment.costResponsibility === "Client Reimbursable")
      .reduce((sum, payment) => sum + payment.amount, 0);

    return { received, given, dueIncoming, reimbursableCosts };
  }, [payments, dues]);

  const paymentOpen = () => {
    setEditingPaymentId(null);
    setPaymentForm(defaultPaymentForm);
    setIsPaymentModalOpen(true);
  };

  const paymentEdit = (record: PaymentRecord) => {
    setEditingPaymentId(record.id);
    setPaymentForm({
      date: record.date,
      party: record.party,
      projectId: record.projectId ? String(record.projectId) : "",
      purpose: record.purpose,
      acknowledgement: record.acknowledgement ?? "",
      method: record.method,
      amount: String(record.amount),
      flow: record.flow,
      costResponsibility: record.costResponsibility ?? "Company Expense",
      reimbursementClient: record.reimbursementClient,
      status: record.status,
      note: record.note,
    });
    setIsPaymentModalOpen(true);
  };

  const paymentClose = () => {
    setIsPaymentModalOpen(false);
    setEditingPaymentId(null);
    setPaymentForm(defaultPaymentForm);
  };

  const dueOpen = () => {
    setEditingDueId(null);
    setDueForm(defaultDueForm);
    setIsDueModalOpen(true);
  };

  const dueEdit = (record: DueRecord) => {
    setEditingDueId(record.id);
    setDueForm({
      clientId: record.clientId ? String(record.clientId) : "",
      projectId: record.projectId ? String(record.projectId) : "",
      dueDate: record.dueDate,
      amount: String(record.amount),
      status: record.status,
      note: record.note,
    });
    setIsDueModalOpen(true);
  };

  const dueClose = () => {
    setIsDueModalOpen(false);
    setEditingDueId(null);
    setDueForm(defaultDueForm);
  };

  const savePayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    paymentClose();
  };

  const saveDue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dueClose();
  };

  const deletePayment = (id: number) => {
    setPayments((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteDue = (id: number) => {
    setDues((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(34,197,94,0.12),transparent_26%),radial-gradient(circle_at_84%_9%,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_88%_90%,rgba(251,146,60,0.1),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/payments" className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]" />

        <div className="space-y-5 lg:ml-[374px]">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Payment Ledger</p>
              <h2 className="font-display text-3xl font-semibold text-slate-900">Payments</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100" onClick={dueOpen}>
                <CalendarClock className="h-4 w-4" />
                Add Due Item
              </Button>
              <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={paymentOpen}>
                <Plus className="h-4 w-4" />
                Add Payment
              </Button>
            </div>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              <>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-20" /><SkeletonBlock className="mt-2 h-8 w-24" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="mt-2 h-8 w-24" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-28" /><SkeletonBlock className="mt-2 h-8 w-24" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-28" /><SkeletonBlock className="mt-2 h-8 w-24" /></CardContent></Card>
              </>
            ) : (
              <>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700"><ArrowDownLeft className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Received</p><p className="mt-1 font-display text-2xl font-semibold text-emerald-700">{formatBDT(totals.received)}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-amber-100 p-2 text-amber-700"><ArrowUpRight className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Given</p><p className="mt-1 font-display text-2xl font-semibold text-amber-700">{formatBDT(totals.given)}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-cyan-100 p-2 text-cyan-700"><HandCoins className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Due From Clients</p><p className="mt-1 font-display text-2xl font-semibold text-cyan-700">{formatBDT(totals.dueIncoming)}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-violet-100 p-2 text-violet-700"><HandCoins className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Reimbursable Costs</p><p className="mt-1 font-display text-2xl font-semibold text-violet-700">{formatBDT(totals.reimbursableCosts)}</p></CardContent></Card>
              </>
            )}
          </div>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle className="text-slate-900">All Payments We Got and Given</CardTitle>
              <CardDescription className="text-slate-600">Persisted payment records linked to projects.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1020px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Party</th>
                      <th className="pb-3 font-medium">Project</th>
                      <th className="pb-3 font-medium">Purpose</th>
                      <th className="pb-3 font-medium">Acknowledgement</th>
                      <th className="pb-3 font-medium">Method</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Flow</th>
                      <th className="pb-3 font-medium">Cost Type</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-20" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-20 rounded-full" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-24 rounded-full" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-20 rounded-full" /></td>
                        <td className="py-3"><SkeletonBlock className="ml-auto h-9 w-28" /></td>
                      </tr>
                    )) : payments.map((record) => (
                      <tr key={record.id} className="border-b border-slate-100 text-slate-700">
                        <td className="py-3">{record.date}</td>
                        <td className="py-3 font-medium text-slate-900">{record.party}</td>
                        <td className="py-3">{record.projectName ?? "-"}</td>
                        <td className="py-3">{record.purpose}</td>
                        <td className="py-3 text-slate-700">{record.acknowledgement ?? "-"}</td>
                        <td className="py-3">{record.method}</td>
                        <td className="py-3 font-semibold text-slate-900">{formatBDT(record.amount)}</td>
                        <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${paymentFlowClasses(record.flow)}`}>{record.flow}</span></td>
                        <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${costResponsibilityClasses(record.costResponsibility)}`}>{record.flow === "Given" ? record.costResponsibility : "-"}</span></td>
                        <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${paymentStatusClasses(record.status)}`}>{record.status}</span></td>
                        <td className="py-3"><div className="flex justify-end gap-2"><Button variant="outline" className="h-9 border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-100" onClick={() => paymentEdit(record)}><Pencil className="h-3.5 w-3.5" />Edit</Button><Button variant="outline" className="h-9 border-rose-200 bg-white px-3 text-rose-700 hover:bg-rose-50" onClick={() => void deletePayment(record.id)}><Trash2 className="h-3.5 w-3.5" />Delete</Button></div></td>
                      </tr>
                    ))}
                    {!loading && !payments.length ? (
                      <tr><td colSpan={11} className="py-8 text-center text-sm text-slate-500">No payment records yet.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle className="text-slate-900">Due List From Clients</CardTitle>
              <CardDescription className="text-slate-600">Client receivables linked to project and client records.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="pb-3 font-medium">Client</th>
                      <th className="pb-3 font-medium">Project</th>
                      <th className="pb-3 font-medium">Due Date</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Note</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? Array.from({ length: 3 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3"><SkeletonBlock className="h-4 w-36" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-36" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-20 rounded-full" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-40" /></td>
                        <td className="py-3"><SkeletonBlock className="ml-auto h-9 w-28" /></td>
                      </tr>
                    )) : dues.map((record) => (
                      <tr key={record.id} className="border-b border-slate-100 text-slate-700">
                        <td className="py-3 font-medium text-slate-900">{record.clientName ?? "-"}</td>
                        <td className="py-3">{record.projectName ?? "-"}</td>
                        <td className="py-3">{record.dueDate}</td>
                        <td className="py-3 font-semibold text-cyan-700">{formatBDT(record.amount)}</td>
                        <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${dueStatusClasses(record.status)}`}>{record.status}</span></td>
                        <td className="py-3">{record.note}</td>
                        <td className="py-3"><div className="flex justify-end gap-2"><Button variant="outline" className="h-9 border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-100" onClick={() => dueEdit(record)}><Pencil className="h-3.5 w-3.5" />Edit</Button><Button variant="outline" className="h-9 border-rose-200 bg-white px-3 text-rose-700 hover:bg-rose-50" onClick={() => void deleteDue(record.id)}><Trash2 className="h-3.5 w-3.5" />Delete</Button></div></td>
                      </tr>
                    ))}
                    {!loading && !dues.length ? (
                      <tr><td colSpan={7} className="py-8 text-center text-sm text-slate-500">No due records yet.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-3xl border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700"><Wallet className="h-3.5 w-3.5" />{editingPaymentId !== null ? "Edit Payment" : "New Payment"}</div>
                <CardTitle className="text-slate-900">{editingPaymentId !== null ? "Update Payment Record" : "Create Payment Record"}</CardTitle>
                <CardDescription className="text-slate-600">Track company expenses and client reimbursable costs.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={paymentClose} aria-label="Close payment modal"><X className="h-4 w-4" /></Button>
            </CardHeader>

            <CardContent className="pt-6">
              <form className="space-y-5" onSubmit={savePayment}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="payDate">Date</Label><Input id="payDate" type="date" value={paymentForm.date} onChange={(event) => setPaymentForm((prev) => ({ ...prev, date: event.target.value }))} required /></div>
                  <div className="space-y-2"><Label htmlFor="payParty">Party</Label><div className="relative"><UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="payParty" placeholder="Client or vendor name" className="pl-10" value={paymentForm.party} onChange={(event) => setPaymentForm((prev) => ({ ...prev, party: event.target.value }))} required /></div></div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payProject">Project</Label>
                    <select id="payProject" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={paymentForm.projectId} onChange={(event) => setPaymentForm((prev) => ({ ...prev, projectId: event.target.value }))}>
                      <option value="">Select project</option>
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="payPurpose">Purpose</Label><Input id="payPurpose" placeholder="Advance, partial, final, expense" value={paymentForm.purpose} onChange={(event) => setPaymentForm((prev) => ({ ...prev, purpose: event.target.value }))} required /></div>
                </div>

                {paymentForm.flow === "Received" ? (
                  <div className="space-y-2">
                    <Label htmlFor="payAcknowledgement">Customer Payment Type</Label>
                    <select
                      id="payAcknowledgement"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                      value={paymentForm.acknowledgement}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          acknowledgement: event.target.value as PaymentAcknowledgement,
                        }))
                      }
                      required
                    >
                      <option value="" disabled>
                        Select customer payment type
                      </option>
                      <option>Advance Payment</option>
                      <option>Partial Payment</option>
                      <option>Final Payment</option>
                      <option>Due Payment</option>
                    </select>
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="payAmount">Amount</Label><div className="relative"><CircleDollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="payAmount" type="number" min="0" className="pl-10" value={paymentForm.amount} onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))} required /></div></div>
                  <div className="space-y-2"><Label htmlFor="payCostResponsibility">Cost Responsibility</Label><select id="payCostResponsibility" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50 disabled:text-slate-400" value={paymentForm.costResponsibility} onChange={(event) => setPaymentForm((prev) => ({ ...prev, costResponsibility: event.target.value as CostResponsibility }))} disabled={paymentForm.flow !== "Given"}><option>Company Expense</option><option>Client Reimbursable</option></select></div>
                </div>

                {paymentForm.flow === "Given" && paymentForm.costResponsibility === "Client Reimbursable" ? (
                  <div className="space-y-2"><Label htmlFor="payReimbursementClient">Client Who Will Reimburse</Label><Input id="payReimbursementClient" placeholder="Client name" value={paymentForm.reimbursementClient} onChange={(event) => setPaymentForm((prev) => ({ ...prev, reimbursementClient: event.target.value }))} required /></div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2"><Label htmlFor="payFlow">Flow</Label><select id="payFlow" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={paymentForm.flow} onChange={(event) => setPaymentForm((prev) => ({ ...prev, flow: event.target.value as PaymentFlow }))}><option>Received</option><option>Given</option></select></div>
                  <div className="space-y-2"><Label htmlFor="payMethod">Payment Method</Label><select id="payMethod" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={paymentForm.method} onChange={(event) => setPaymentForm((prev) => ({ ...prev, method: event.target.value as PaymentMethod }))}><option>Bank Transfer</option><option>Cash</option><option>Card</option><option>Mobile Banking</option></select></div>
                  <div className="space-y-2"><Label htmlFor="payStatus">Status</Label><select id="payStatus" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={paymentForm.status} onChange={(event) => setPaymentForm((prev) => ({ ...prev, status: event.target.value as PaymentStatus }))}><option>Completed</option><option>Pending</option><option>Failed</option></select></div>
                </div>

                <div className="space-y-2"><Label htmlFor="payNote">Note</Label><textarea id="payNote" rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" placeholder="Reference, transaction id, remarks" value={paymentForm.note} onChange={(event) => setPaymentForm((prev) => ({ ...prev, note: event.target.value }))} /></div>

                <div className="flex gap-2 border-t border-slate-100 pt-2"><Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">{editingPaymentId !== null ? "Save Changes" : "Create Payment"}</Button><Button type="button" variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100" onClick={paymentClose}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {isDueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-3xl border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700"><CalendarClock className="h-3.5 w-3.5" />{editingDueId !== null ? "Edit Due" : "New Due"}</div>
                <CardTitle className="text-slate-900">{editingDueId !== null ? "Update Due Record" : "Create Due Record"}</CardTitle>
                <CardDescription className="text-slate-600">Track money clients still need to pay.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={dueClose} aria-label="Close due modal"><X className="h-4 w-4" /></Button>
            </CardHeader>

            <CardContent className="pt-6">
              <form className="space-y-5" onSubmit={saveDue}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dueClient">Client</Label>
                    <select id="dueClient" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={dueForm.clientId} onChange={(event) => setDueForm((prev) => ({ ...prev, clientId: event.target.value }))} required>
                      <option value="">Select client</option>
                      {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueProject">Project</Label>
                    <select id="dueProject" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={dueForm.projectId} onChange={(event) => setDueForm((prev) => ({ ...prev, projectId: event.target.value }))} required>
                      <option value="">Select project</option>
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2"><Label htmlFor="dueDate">Due Date</Label><Input id="dueDate" type="date" value={dueForm.dueDate} onChange={(event) => setDueForm((prev) => ({ ...prev, dueDate: event.target.value }))} required /></div>
                  <div className="space-y-2"><Label htmlFor="dueAmount">Amount</Label><Input id="dueAmount" type="number" min="0" value={dueForm.amount} onChange={(event) => setDueForm((prev) => ({ ...prev, amount: event.target.value }))} required /></div>
                  <div className="space-y-2"><Label htmlFor="dueStatus">Status</Label><select id="dueStatus" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={dueForm.status} onChange={(event) => setDueForm((prev) => ({ ...prev, status: event.target.value as DueStatus }))}><option>Upcoming</option><option>Due Today</option><option>Overdue</option><option>Collected</option></select></div>
                </div>

                <div className="space-y-2"><Label htmlFor="dueNote">Note</Label><textarea id="dueNote" rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" placeholder="Reminder details or follow-up notes" value={dueForm.note} onChange={(event) => setDueForm((prev) => ({ ...prev, note: event.target.value }))} /></div>

                <div className="flex gap-2 border-t border-slate-100 pt-2"><Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">{editingDueId !== null ? "Save Changes" : "Create Due"}</Button><Button type="button" variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100" onClick={dueClose}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
