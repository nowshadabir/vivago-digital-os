"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  FolderKanban,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_CLIENTS, MOCK_PROJECTS } from "@/lib/mock-data";
import { useToast } from "@/components/toast-context";

export type ClientStatus = "Active" | "Follow Up" | "VIP" | "Inactive";

export type ClientRecord = {
  id: number;
  business: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  projectCount: number;
  totalPaid: number;
  due: number;
  status: ClientStatus;
  country: string;
  clientSince: string;
  assignedLead: string;
  notes?: string;
};

export const INITIAL_CLIENTS: ClientRecord[] = [
  {
    id: 1,
    business: "Acme Corp",
    contactName: "Alex Vance",
    contactRole: "Chief Technology Officer",
    email: "billing@acme.com",
    phone: "+880 1711-223344",
    projectCount: 2,
    totalPaid: 370000,
    due: 100000,
    status: "VIP",
    country: "Bangladesh / US",
    clientSince: "January 2024",
    assignedLead: "Kazi Nowshad Abir",
    notes: "Enterprise retail client. Retainer and custom e-commerce web platform.",
  },
  {
    id: 2,
    business: "Global Tech",
    contactName: "Sarah Connor",
    contactRole: "Head of Digital Operations",
    email: "accounts@globaltech.com",
    phone: "+880 1819-556677",
    projectCount: 1,
    totalPaid: 400000,
    due: 50000,
    status: "Active",
    country: "Singapore / BD",
    clientSince: "February 2024",
    assignedLead: "Imtiaz",
    notes: "LodgeOS enterprise hotel management and cloud infrastructure integration.",
  },
  {
    id: 3,
    business: "Nebula Systems",
    contactName: "David Bowman",
    contactRole: "Product Lead",
    email: "contact@nebulasystems.io",
    phone: "+880 1912-334455",
    projectCount: 1,
    totalPaid: 300000,
    due: 0,
    status: "Active",
    country: "United Kingdom",
    clientSince: "April 2024",
    assignedLead: "Kazi Nowshad Abir",
    notes: "Mobile application development with React Native & Supabase backend.",
  },
  {
    id: 4,
    business: "Starlight Inc",
    contactName: "Elena Rostova",
    contactRole: "Creative Director",
    email: "finance@starlight.org",
    phone: "+880 1610-998877",
    projectCount: 1,
    totalPaid: 120000,
    due: 0,
    status: "Inactive",
    country: "Canada",
    clientSince: "January 2024",
    assignedLead: "Nowshad Abir",
    notes: "Completed brand identity package and SaaS marketing website.",
  },
];

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusBadgeClasses(status: ClientStatus) {
  switch (status) {
    case "VIP":
      return "bg-amber-50 text-amber-800 border-amber-200/80";
    case "Active":
      return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
    case "Follow Up":
      return "bg-cyan-50 text-cyan-800 border-cyan-200/80";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200/80";
  }
}

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientRecord[]>(INITIAL_CLIENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    business: "",
    contactName: "",
    contactRole: "",
    email: "",
    phone: "",
    status: "Active" as ClientStatus,
    country: "Bangladesh",
    assignedLead: "Kazi Nowshad Abir",
    notes: "",
  });

  const summary = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === "Active" || c.status === "VIP").length;
    const totalCollected = clients.reduce((sum, c) => sum + c.totalPaid, 0);
    const totalDue = clients.reduce((sum, c) => sum + c.due, 0);
    const totalProjects = clients.reduce((sum, c) => sum + c.projectCount, 0);

    return { totalClients, activeClients, totalCollected, totalDue, totalProjects };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesStatus = statusFilter === "All" ? true : client.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        client.business.toLowerCase().includes(q) ||
        client.contactName.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.phone.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [clients, statusFilter, searchQuery]);

  const openCreateModal = () => {
    setEditingClientId(null);
    setFormData({
      business: "",
      contactName: "",
      contactRole: "Product Lead",
      email: "",
      phone: "+880 ",
      status: "Active",
      country: "Bangladesh",
      assignedLead: "Kazi Nowshad Abir",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: ClientRecord) => {
    setEditingClientId(client.id);
    setFormData({
      business: client.business,
      contactName: client.contactName,
      contactRole: client.contactRole,
      email: client.email,
      phone: client.phone,
      status: client.status,
      country: client.country,
      assignedLead: client.assignedLead,
      notes: client.notes || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClientId(null);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business.trim()) return;

    if (editingClientId) {
      setClients((prev) =>
        prev.map((c) => (c.id === editingClientId ? { ...c, ...formData } : c))
      );
    } else {
      const newClient: ClientRecord = {
        id: Date.now(),
        business: formData.business,
        contactName: formData.contactName,
        contactRole: formData.contactRole || "Representative",
        email: formData.email,
        phone: formData.phone,
        projectCount: 0,
        totalPaid: 0,
        due: 0,
        status: formData.status,
        country: formData.country,
        clientSince: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        assignedLead: formData.assignedLead,
        notes: formData.notes,
      };
      setClients((prev) => [newClient, ...prev]);
    }
    closeModal();
  };

  const handleDeleteClient = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    toast.success(`Removed ${client?.business || "client"} from CRM records.`, "Client Removed");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8 font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(34,197,94,0.12),transparent_26%),radial-gradient(circle_at_78%_8%,rgba(14,165,233,0.12),transparent_22%),radial-gradient(circle_at_90%_88%,rgba(251,146,60,0.1),transparent_23%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/clients" />

        <SidebarInset className="space-y-6">
          {/* HEADER & ADD CLIENT ACTION */}
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>CRM & Accounts</span>
                <span>/</span>
                <span className="text-cyan-700 font-medium">Clients Directory</span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Clients
              </h1>
              <p className="text-xs text-slate-600 sm:text-sm">
                Corporate clients, active project portfolios, and billing profiles.
              </p>
            </div>

            <Button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800 text-xs font-semibold gap-2 shadow-lg shadow-slate-900/10"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              Add New Client
            </Button>
          </header>

          {/* STREAMLINED SUMMARY METRICS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Active Clients
                  </span>
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700 border border-slate-200/60">
                    <Building2 className="h-4 w-4 text-cyan-700" />
                  </div>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-slate-950">
                  {summary.activeClients}
                  <span className="text-xs font-normal text-slate-400 ml-1.5">
                    / {summary.totalClients} Total
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">Engaged corporate partners</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contracted Projects
                  </span>
                  <div className="rounded-xl bg-cyan-50 p-2 text-cyan-700 border border-cyan-200/60">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-cyan-700">
                  {summary.totalProjects} Projects
                </p>
                <p className="mt-1 text-xs text-slate-500">Across client portfolios</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Inflow Paid
                  </span>
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 border border-emerald-200/60">
                    <CircleDollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-emerald-700">
                  {formatBDT(summary.totalCollected)}
                </p>
                <p className="mt-1 text-xs text-slate-500">Lifetime realized payments</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Outstanding Receivables
                  </span>
                  <div className="rounded-xl bg-amber-50 p-2 text-amber-700 border border-amber-200/60">
                    <CircleDollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-amber-700">
                  {formatBDT(summary.totalDue)}
                </p>
                <p className="mt-1 text-xs text-slate-500">Active unsettled dues</p>
              </CardContent>
            </Card>
          </div>

          {/* SEARCH & STREAMLINED CLIENT DIRECTORY TABLE */}
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search client by company name, contact, or email..."
                  className="pl-10 h-10 rounded-xl border-slate-200 bg-white text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                {(["All", "Active", "VIP", "Follow Up", "Inactive"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                      statusFilter === st
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Streamlined Clean Table */}
            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                        <th className="px-5 py-3.5">Client & Organization</th>
                        <th className="px-4 py-3.5">Contact Channels</th>
                        <th className="px-4 py-3.5 text-center">Projects</th>
                        <th className="px-4 py-3.5 text-right">Paid / Balance</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {filteredClients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            No clients match your filter.
                          </td>
                        </tr>
                      ) : (
                        filteredClients.map((client) => (
                          <tr
                            key={client.id}
                            className="hover:bg-slate-50/70 transition-colors group"
                          >
                            {/* 1. Client & Organization */}
                            <td className="px-5 py-4">
                              <Link
                                href={`/clients/view?id=${client.id}`}
                                className="flex items-center gap-3 group-hover:text-cyan-800 transition-colors"
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                                  {client.business.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-950 text-sm group-hover:text-cyan-800 transition-colors">
                                    {client.business}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {client.contactName} • {client.contactRole}
                                  </p>
                                </div>
                              </Link>
                            </td>

                            {/* 2. Contact Channels */}
                            <td className="px-4 py-4 text-slate-700">
                              <p className="font-mono text-slate-900 font-medium">{client.email}</p>
                              <p className="font-mono text-slate-400 text-[11px] mt-0.5">
                                {client.phone}
                              </p>
                            </td>

                            {/* 3. Projects Count */}
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-200/60">
                                <Briefcase className="h-3 w-3 text-cyan-600" />
                                {client.projectCount}
                              </span>
                            </td>

                            {/* 4. Financial Position (Paid vs Due) */}
                            <td className="px-4 py-4 text-right">
                              <p className="font-mono font-bold text-emerald-700">
                                {formatBDT(client.totalPaid)}
                              </p>
                              {client.due > 0 ? (
                                <p className="font-mono text-[11px] font-semibold text-amber-700">
                                  {formatBDT(client.due)} due
                                </p>
                              ) : (
                                <p className="text-[10px] text-emerald-600 font-semibold">
                                  Settled
                                </p>
                              )}
                            </td>

                            {/* 5. Status Badge */}
                            <td className="px-4 py-4">
                              <span
                                className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold border ${statusBadgeClasses(
                                  client.status
                                )}`}
                              >
                                {client.status}
                              </span>
                            </td>

                            {/* 6. Dedicated Profile and Quick Actions */}
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/clients/view?id=${client.id}`}>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-xl border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 hover:text-cyan-800 gap-1.5 shadow-xs"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-cyan-700" />
                                    Profile
                                  </Button>
                                </Link>

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
                                  title="Edit Client"
                                  onClick={() => openEditModal(client)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50"
                                  title="Delete Client"
                                  onClick={() => handleDeleteClient(client.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </section>

      {/* CREATE / EDIT CLIENT POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {editingClientId ? "Edit Client Details" : "Add New Client"}
                </h3>
                <p className="text-xs text-slate-500">
                  Manage primary company credentials and contact channels.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cBusiness" className="text-xs font-semibold text-slate-700">
                  Business / Company Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="cBusiness"
                  placeholder="e.g. Acme Corporation"
                  className="h-11 rounded-xl border-slate-200 text-xs font-semibold"
                  value={formData.business}
                  onChange={(e) => setFormData((prev) => ({ ...prev, business: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cContact" className="text-xs font-semibold text-slate-700">
                    Primary Contact Person
                  </Label>
                  <Input
                    id="cContact"
                    placeholder="e.g. Alex Vance"
                    className="h-11 rounded-xl border-slate-200 text-xs"
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contactName: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cRole" className="text-xs font-semibold text-slate-700">
                    Contact Designation / Role
                  </Label>
                  <Input
                    id="cRole"
                    placeholder="e.g. CTO / Product Lead"
                    className="h-11 rounded-xl border-slate-200 text-xs"
                    value={formData.contactRole}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contactRole: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cEmail" className="text-xs font-semibold text-slate-700">
                    Email Address
                  </Label>
                  <Input
                    id="cEmail"
                    type="email"
                    placeholder="billing@acme.com"
                    className="h-11 rounded-xl border-slate-200 text-xs font-mono"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cPhone" className="text-xs font-semibold text-slate-700">
                    Phone / WhatsApp Number
                  </Label>
                  <Input
                    id="cPhone"
                    placeholder="+880 1711-000000"
                    className="h-11 rounded-xl border-slate-200 text-xs font-mono"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cStatus" className="text-xs font-semibold text-slate-700">
                    Client Status
                  </Label>
                  <select
                    id="cStatus"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-xs outline-none focus:border-cyan-400 font-semibold"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, status: e.target.value as ClientStatus }))
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="VIP">VIP</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cCountry" className="text-xs font-semibold text-slate-700">
                    Operating Country / Location
                  </Label>
                  <Input
                    id="cCountry"
                    placeholder="e.g. Bangladesh"
                    className="h-11 rounded-xl border-slate-200 text-xs"
                    value={formData.country}
                    onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cNotes" className="text-xs font-semibold text-slate-700">
                  Internal Notes & Scope
                </Label>
                <Input
                  id="cNotes"
                  placeholder="Key agreements, retainers, preferred payment methods..."
                  className="h-11 rounded-xl border-slate-200 text-xs"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="rounded-xl border-slate-200 bg-white text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-6 text-white hover:bg-slate-800 text-xs font-semibold shadow-lg shadow-slate-900/10 gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {editingClientId ? "Save Changes" : "Create Client"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
