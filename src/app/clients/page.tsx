"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CircleDollarSign,
  FolderKanban,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cachedJson, invalidateCachedJson } from "@/lib/client-cache";

type ClientStatus = "Active" | "Follow Up" | "Delinquent" | "Inactive";

type Client = {
  id: number;
  name: string;
  email: string;
  number: string;
  business: string;
  projectCount: number;
  totalPaid: number;
  due: number;
  status: ClientStatus;
};

type ClientFormData = {
  name: string;
  email: string;
  number: string;
  business: string;
  projectCount: string;
  totalPaid: string;
  due: string;
  status: ClientStatus;
};

const initialClients: Client[] = [];

const defaultFormData: ClientFormData = {
  name: "",
  email: "",
  number: "",
  business: "",
  projectCount: "0",
  totalPaid: "0",
  due: "0",
  status: "Active",
};

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusClasses(status: ClientStatus) {
  if (status === "Active") return "bg-emerald-100 text-emerald-700";
  if (status === "Follow Up") return "bg-cyan-100 text-cyan-700";
  if (status === "Delinquent") return "bg-rose-100 text-rose-700";

  return "bg-slate-200 text-slate-700";
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadClients() {
      try {
        const data = await cachedJson<{ clients: Client[] }>("/api/clients", 45_000);
        if (isMounted) {
          setClients(data.clients);
        }
      } catch {
        // Keep UI stable if API fails.
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadClients();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPaid = useMemo(
    () => clients.reduce((sum, client) => sum + client.totalPaid, 0),
    [clients]
  );

  const totalDue = useMemo(
    () => clients.reduce((sum, client) => sum + client.due, 0),
    [clients]
  );

  const totalProjects = useMemo(
    () => clients.reduce((sum, client) => sum + client.projectCount, 0),
    [clients]
  );

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingClientId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setFormData({
      name: client.name,
      email: client.email,
      number: client.number,
      business: client.business,
      projectCount: String(client.projectCount),
      totalPaid: String(client.totalPaid),
      due: String(client.due),
      status: client.status,
    });
    setEditingClientId(client.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteClient = async (clientId: number) => {
    const response = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    if (!response.ok) return;

    invalidateCachedJson("/api/clients");
    setClients((prevClients) => prevClients.filter((client) => client.id !== clientId));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedProjectCount = Number(formData.projectCount);
    const parsedTotalPaid = Number(formData.totalPaid);
    const parsedDue = Number(formData.due);

    if (
      !formData.name ||
      !formData.email ||
      !formData.number ||
      !formData.business ||
      Number.isNaN(parsedProjectCount) ||
      Number.isNaN(parsedTotalPaid) ||
      Number.isNaN(parsedDue)
    ) {
      return;
    }

    if (editingClientId !== null) {
      const response = await fetch(`/api/clients/${editingClientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          number: formData.number,
          business: formData.business,
          projectCount: parsedProjectCount,
          totalPaid: parsedTotalPaid,
          due: parsedDue,
          status: formData.status,
        }),
      });

      if (!response.ok) return;
      invalidateCachedJson("/api/clients");
      const data = (await response.json()) as { client: Client };

      setClients((prevClients) =>
        prevClients.map((client) => (client.id === editingClientId ? data.client : client))
      );
    } else {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          number: formData.number,
          business: formData.business,
          status: formData.status,
        }),
      });

      if (!response.ok) return;
      invalidateCachedJson("/api/clients");
      const data = (await response.json()) as { client: Client };
      setClients((prevClients) => [data.client, ...prevClients]);
    }

    closeModal();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(34,197,94,0.12),transparent_26%),radial-gradient(circle_at_78%_8%,rgba(14,165,233,0.12),transparent_22%),radial-gradient(circle_at_90%_88%,rgba(251,146,60,0.1),transparent_23%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar
          activePath="/clients"
          className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]"
        />

        <div className="space-y-5 lg:ml-[374px]">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Client Ledger</p>
              <h2 className="font-display text-3xl font-semibold text-slate-900">Client Details</h2>
            </div>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={openCreateModal}>
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading ? (
              <>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="mt-2 h-8 w-20" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="mt-2 h-8 w-20" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-20" /><SkeletonBlock className="mt-2 h-7 w-24" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-20" /><SkeletonBlock className="mt-2 h-7 w-24" /></CardContent></Card>
              </>
            ) : (
              <>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-2 text-slate-600"><Users className="h-4 w-4" /></div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Clients</p>
                    <p className="mt-1 font-display text-3xl font-semibold text-slate-900">{clients.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <div className="mb-3 inline-flex rounded-xl bg-cyan-100 p-2 text-cyan-700"><FolderKanban className="h-4 w-4" /></div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Projects</p>
                    <p className="mt-1 font-display text-3xl font-semibold text-slate-900">{totalProjects}</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700"><CircleDollarSign className="h-4 w-4" /></div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Paid</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-emerald-700">{formatBDT(totalPaid)}</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <div className="mb-3 inline-flex rounded-xl bg-amber-100 p-2 text-amber-700"><CircleDollarSign className="h-4 w-4" /></div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Due</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-amber-700">{formatBDT(totalDue)}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle className="text-slate-900">Client Directory</CardTitle>
              <CardDescription className="text-slate-600">
                Name, email, phone number, business, projects, total paid, due, status, and actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1020px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Number</th>
                      <th className="pb-3 font-medium">Business</th>
                      <th className="pb-3 font-medium">Projects</th>
                      <th className="pb-3 font-medium">Total Paid</th>
                      <th className="pb-3 font-medium">Due</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                          <td className="py-3"><SkeletonBlock className="h-4 w-40" /></td>
                          <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                          <td className="py-3"><SkeletonBlock className="h-4 w-32" /></td>
                          <td className="py-3"><SkeletonBlock className="mx-auto h-4 w-8" /></td>
                          <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                          <td className="py-3"><SkeletonBlock className="h-4 w-20" /></td>
                          <td className="py-3"><SkeletonBlock className="h-6 w-20 rounded-full" /></td>
                          <td className="py-3"><SkeletonBlock className="ml-auto h-9 w-28" /></td>
                        </tr>
                      ))
                    ) : clients.map((client) => (
                      <tr key={client.id} className="border-b border-slate-100 text-slate-700">
                        <td className="py-3 font-medium text-slate-900">{client.name}</td>
                        <td className="py-3">{client.email}</td>
                        <td className="py-3">{client.number}</td>
                        <td className="py-3">{client.business}</td>
                        <td className="py-3 text-center font-medium text-slate-900">{client.projectCount}</td>
                        <td className="py-3 font-medium text-emerald-700">{formatBDT(client.totalPaid)}</td>
                        <td className="py-3 font-medium text-amber-700">{formatBDT(client.due)}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(client.status)}`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              className="h-9 border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-100"
                              onClick={() => openEditModal(client)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              className="h-9 border-rose-200 bg-white px-3 text-rose-700 hover:bg-rose-50"
                              onClick={() => void handleDeleteClient(client.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && clients.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-sm text-slate-500">
                          No clients found. Add your first client.
                        </td>
                      </tr>
                    ) : null}
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
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  <Users className="h-3.5 w-3.5" />
                  {editingClientId !== null ? "Edit Client" : "New Client"}
                </div>
                <CardTitle className="text-slate-900">
                  {editingClientId !== null ? "Update Client" : "Add Client"}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Save client profile and billing details.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={closeModal} aria-label="Close client modal">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="pt-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Name</Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="clientName"
                        placeholder="Client name"
                        className="pl-10"
                        value={formData.name}
                        onChange={(event) => handleInputChange("name", event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="name@business.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(event) => handleInputChange("email", event.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clientNumber">Number</Label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="clientNumber"
                        placeholder="+8801XXXXXXXXX"
                        className="pl-10"
                        value={formData.number}
                        onChange={(event) => handleInputChange("number", event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientBusiness">Business</Label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="clientBusiness"
                        placeholder="Business or company"
                        className="pl-10"
                        value={formData.business}
                        onChange={(event) => handleInputChange("business", event.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="projectsCount">How Many Projects</Label>
                    <Input
                      id="projectsCount"
                      type="number"
                      min="0"
                      value={formData.projectCount}
                      readOnly
                      className="bg-slate-100 text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalPaid">Total Paid</Label>
                    <Input
                      id="totalPaid"
                      type="number"
                      min="0"
                      value={formData.totalPaid}
                      readOnly
                      className="bg-slate-100 text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalDue">Due</Label>
                    <Input
                      id="totalDue"
                      type="number"
                      min="0"
                      value={formData.due}
                      readOnly
                      className="bg-slate-100 text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientStatus">Status</Label>
                  <select
                    id="clientStatus"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                    value={formData.status}
                    onChange={(event) => handleInputChange("status", event.target.value as ClientStatus)}
                  >
                    <option>Active</option>
                    <option>Follow Up</option>
                    <option>Delinquent</option>
                    <option>Inactive</option>
                  </select>
                </div>

                <div className="flex gap-2 border-t border-slate-100 pt-2">
                  <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                    {editingClientId !== null ? "Save Changes" : "Add Client"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
