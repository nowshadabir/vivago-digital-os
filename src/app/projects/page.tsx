"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CircleDollarSign,
  FolderPlus,
  Pencil,
  Timer,
  Trash2,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cachedJson, invalidateCachedJson } from "@/lib/client-cache";

type ProjectStatus = "Planning" | "In Progress" | "Review" | "Final QA" | "Completed" | "On Hold";

type ClientOption = {
  id: number;
  name: string;
};

type Project = {
  id: number;
  name: string;
  clientId: number;
  clientName: string;
  status: ProjectStatus;
  startDate: string;
  estimatedDeadline: string;
  valuation: number;
  companyCost: number;
  temporaryCost: number;
};

type ProjectFormData = {
  name: string;
  clientId: string;
  status: ProjectStatus;
  startDate: string;
  estimatedDeadline: string;
  valuation: string;
};

type ProjectAssets = {
  credentials: Array<{
    id: number;
    category: string;
    service: string;
    username: string;
    password: string;
    endpoint: string;
    reviewDate: string;
    status: string;
  }>;
  files: Array<{
    id: number;
    fileName: string;
    language: string;
    sizeKb: number;
    storagePath: string;
    fileDate: string;
    status: string;
  }>;
};

const defaultFormData: ProjectFormData = {
  name: "",
  clientId: "",
  status: "Planning",
  startDate: "",
  estimatedDeadline: "",
  valuation: "",
};

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function toDateInput(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getStatusBadge(status: ProjectStatus) {
  if (status === "Completed") return "bg-emerald-100 text-emerald-700";
  if (status === "On Hold") return "bg-amber-100 text-amber-700";
  if (status === "In Progress") return "bg-blue-100 text-blue-700";
  if (status === "Final QA") return "bg-violet-100 text-violet-700";
  if (status === "Review") return "bg-cyan-100 text-cyan-700";

  return "bg-slate-100 text-slate-700";
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);
  const [assets, setAssets] = useState<ProjectAssets>({ credentials: [], files: [] });
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    const data = await cachedJson<{
      projects: Array<{
        id: number;
        name: string;
        clientId: number;
        clientName: string;
        status: string;
        startDate: string;
        estimatedDeadline: string;
        valuation: number;
        companyCost: number;
        temporaryCost: number;
      }>;
    }>("/api/projects", 45_000);

    setProjects(
      data.projects.map((project) => ({
        ...project,
        status: project.status as ProjectStatus,
        startDate: toDateInput(project.startDate),
        estimatedDeadline: toDateInput(project.estimatedDeadline),
      }))
    );
  };

  const loadClients = async () => {
    const data = await cachedJson<{ clients: Array<{ id: number; name: string }> }>("/api/clients", 45_000);
    setClients(data.clients.map((client) => ({ id: client.id, name: client.name })));
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await Promise.all([loadProjects(), loadClients()]);
      setLoading(false);
    };
    void run();
  }, []);

  const totalValue = useMemo(() => projects.reduce((sum, project) => sum + project.valuation, 0), [projects]);
  const ongoingCount = useMemo(
    () => projects.filter((project) => project.status === "In Progress" || project.status === "Review").length,
    [projects]
  );
  const temporaryCostTotal = useMemo(
    () => projects.reduce((sum, project) => sum + project.temporaryCost, 0),
    [projects]
  );

  const activeProjects = useMemo(() => projects.filter((project) => project.status !== "Completed"), [projects]);
  const previousProjects = useMemo(() => projects.filter((project) => project.status === "Completed"), [projects]);

  const valuationPreview = Number(formData.valuation || "0");
  const isSubmitDisabled =
    !formData.name.trim() ||
    !formData.clientId ||
    !formData.startDate ||
    !formData.estimatedDeadline ||
    Number.isNaN(valuationPreview);

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingProjectId(null);
    setAssets({ credentials: [], files: [] });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = async (project: Project) => {
    setFormData({
      name: project.name,
      clientId: String(project.clientId),
      status: project.status,
      startDate: project.startDate,
      estimatedDeadline: project.estimatedDeadline,
      valuation: String(project.valuation),
    });
    setEditingProjectId(project.id);

    const response = await fetch(`/api/projects/${project.id}/assets`, { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as ProjectAssets;
      setAssets({
        credentials: data.credentials.map((item) => ({ ...item, reviewDate: toDateInput(item.reviewDate) })),
        files: data.files.map((item) => ({ ...item, fileDate: toDateInput(item.fileDate) })),
      });
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteProject = async (projectId: number) => {
    const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (!response.ok) return;
    invalidateCachedJson("/api/projects");
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      clientId: Number(formData.clientId),
      status: formData.status,
      startDate: formData.startDate,
      estimatedDeadline: formData.estimatedDeadline,
      valuation: Number(formData.valuation || "0"),
    };

    const isEditing = editingProjectId !== null;
    const endpoint = isEditing ? `/api/projects/${editingProjectId}` : "/api/projects";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return;
    invalidateCachedJson("/api/projects");
    invalidateCachedJson("/api/clients");
    await loadProjects();
    closeModal();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_88%_10%,rgba(16,185,129,0.12),transparent_23%),radial-gradient(circle_at_90%_90%,rgba(245,158,11,0.1),transparent_21%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/projects" className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]" />

        <div className="grid gap-5 lg:ml-[374px]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              <>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="h-3 w-24" /><SkeletonBlock className="mt-3 h-8 w-20" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="h-3 w-20" /><SkeletonBlock className="mt-3 h-8 w-20" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="h-3 w-24" /><SkeletonBlock className="mt-3 h-8 w-28" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="h-3 w-28" /><SkeletonBlock className="mt-3 h-8 w-24" /></CardContent></Card>
              </>
            ) : (
              <>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Projects</p><p className="mt-2 font-display text-3xl font-semibold text-slate-900">{projects.length}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ongoing</p><p className="mt-2 font-display text-3xl font-semibold text-blue-700">{ongoingCount}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Value</p><p className="mt-2 font-display text-2xl font-semibold text-emerald-700">{formatBDT(totalValue)}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Temporary Costs</p><p className="mt-2 font-display text-2xl font-semibold text-violet-700">{formatBDT(temporaryCostTotal)}</p></CardContent></Card>
              </>
            )}
          </div>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-slate-900">Active Projects</CardTitle>
                <CardDescription className="text-slate-600">Manage your active work with quick edit and delete actions.</CardDescription>
              </div>
              <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={openCreateModal}><FolderPlus className="h-4 w-4" />Create Project</Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="border-slate-200 bg-white">
                      <CardHeader className="space-y-3 border-b border-slate-100 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <SkeletonBlock className="h-5 w-40" />
                            <SkeletonBlock className="h-4 w-28" />
                          </div>
                          <SkeletonBlock className="h-6 w-20 rounded-full" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2 text-sm text-slate-600">
                          <SkeletonBlock className="h-4 w-32" />
                          <SkeletonBlock className="h-4 w-36" />
                          <SkeletonBlock className="h-4 w-40" />
                          <SkeletonBlock className="h-4 w-36" />
                          <SkeletonBlock className="h-4 w-40" />
                        </div>
                        <div className="flex gap-2 border-t border-slate-100 pt-3">
                          <SkeletonBlock className="h-9 flex-1" />
                          <SkeletonBlock className="h-9 flex-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {activeProjects.map((project) => (
                    <Card key={project.id} className="border-slate-200 bg-white">
                      <CardHeader className="space-y-3 border-b border-slate-100 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg text-slate-900">{project.name}</CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-1.5 text-slate-600"><Building2 className="h-3.5 w-3.5" />{project.clientName}</CardDescription>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(project.status)}`}>{project.status}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2 text-sm text-slate-600">
                          <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-slate-400" />Start: {project.startDate}</p>
                          <p className="flex items-center gap-2"><Timer className="h-4 w-4 text-slate-400" />Deadline: {project.estimatedDeadline}</p>
                          <p className="flex items-center gap-2 font-semibold text-slate-900"><CircleDollarSign className="h-4 w-4 text-emerald-600" />Valuation: {formatBDT(project.valuation)}</p>
                          <p className="flex items-center gap-2 text-slate-700"><CircleDollarSign className="h-4 w-4 text-slate-400" />Company Cost: {formatBDT(project.companyCost)}</p>
                          <p className="flex items-center gap-2 text-violet-700"><CircleDollarSign className="h-4 w-4" />Temporary Cost: {formatBDT(project.temporaryCost)}</p>
                        </div>
                        <div className="flex gap-2 border-t border-slate-100 pt-3">
                          <Button variant="outline" className="flex-1 border-slate-300 bg-white text-slate-900 hover:bg-slate-100" onClick={() => void openEditModal(project)}><Pencil className="h-4 w-4" />Edit</Button>
                          <Button variant="outline" className="flex-1 border-rose-200 bg-white text-rose-700 hover:bg-rose-50" onClick={() => void handleDeleteProject(project.id)}><Trash2 className="h-4 w-4" />Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader><CardTitle className="text-slate-900">Previous Project Cards</CardTitle><CardDescription className="text-slate-600">Completed projects for historical reference.</CardDescription></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {previousProjects.length ? previousProjects.map((project) => (
                  <Card key={project.id} className="border-slate-200 bg-white">
                    <CardHeader className="space-y-3 border-b border-slate-100 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg text-slate-900">{project.name}</CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-1.5 text-slate-600"><Building2 className="h-3.5 w-3.5" />{project.clientName}</CardDescription>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(project.status)}`}>{project.status}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-slate-700">Valuation: <span className="font-semibold text-slate-900">{formatBDT(project.valuation)}</span></p>
                    </CardContent>
                  </Card>
                )) : <p className="text-sm text-slate-500">No completed projects yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <Card className="flex h-[96vh] w-full flex-col rounded-none border-slate-200 bg-white sm:h-auto sm:max-h-[92vh] sm:max-w-4xl sm:rounded-xl">
            <CardHeader className="sticky top-0 z-10 flex flex-row items-start justify-between gap-4 border-b border-slate-100 bg-white pb-5">
              <div className="space-y-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700"><FolderPlus className="h-3.5 w-3.5" />{editingProjectId !== null ? "Edit Project" : "New Project"}</div>
                <CardTitle className="text-slate-900">{editingProjectId !== null ? "Update Project" : "Create Project"}</CardTitle>
                <CardDescription className="text-slate-600">Project details with linked credentials and files from their own pages.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={closeModal} aria-label="Close project modal"><X className="h-4 w-4" /></Button>
            </CardHeader>

            <CardContent className="overflow-y-auto pt-6">
              <form className="space-y-5 pb-24" onSubmit={(event) => void handleSubmit(event)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <div className="relative">
                      <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input id="projectName" className="pl-10" value={formData.name} onChange={(event) => handleInputChange("name", event.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientName">Select Client</Label>
                    <select id="clientName" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={formData.clientId} onChange={(event) => handleInputChange("clientId", event.target.value)} required>
                      <option value="" disabled>Select a client</option>
                      {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select id="status" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={formData.status} onChange={(event) => handleInputChange("status", event.target.value as ProjectStatus)}>
                      <option>Planning</option><option>In Progress</option><option>Review</option><option>Final QA</option><option>Completed</option><option>On Hold</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" value={formData.startDate} onChange={(event) => handleInputChange("startDate", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Estimated Deadline</Label>
                    <Input id="deadline" type="date" value={formData.estimatedDeadline} onChange={(event) => handleInputChange("estimatedDeadline", event.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectValue">Project Valuation (BDT)</Label>
                  <Input id="projectValue" type="number" min="0" value={formData.valuation} onChange={(event) => handleInputChange("valuation", event.target.value)} required />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-900">Cost Planning (Read-only)</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Cost We Bear (BDT)</Label><Input value={editingProjectId ? String(projects.find((item) => item.id === editingProjectId)?.companyCost ?? 0) : "0"} readOnly /></div>
                    <div className="space-y-2"><Label>Cost We Bear Temporarily (BDT)</Label><Input value={editingProjectId ? String(projects.find((item) => item.id === editingProjectId)?.temporaryCost ?? 0) : "0"} readOnly /></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                  <p className="text-sm font-semibold text-slate-900">Project Assets and Access</p>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[840px] text-left text-xs">
                      <thead><tr className="border-b border-slate-200 text-slate-500"><th className="px-3 py-2">Credential Type</th><th className="px-3 py-2">Service</th><th className="px-3 py-2">Username</th><th className="px-3 py-2">Password</th><th className="px-3 py-2">Endpoint</th><th className="px-3 py-2">Review</th></tr></thead>
                      <tbody>
                        {assets.credentials.length ? assets.credentials.map((row) => (
                          <tr key={row.id} className="border-t border-slate-100 text-slate-700"><td className="px-3 py-2">{row.category}</td><td className="px-3 py-2">{row.service}</td><td className="px-3 py-2">{row.username}</td><td className="px-3 py-2 font-mono">{row.password}</td><td className="px-3 py-2">{row.endpoint}</td><td className="px-3 py-2">{row.reviewDate}</td></tr>
                        )) : <tr><td className="px-3 py-2 text-slate-500" colSpan={6}>No linked credentials yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead><tr className="border-b border-slate-200 text-slate-500"><th className="px-3 py-2">File Name</th><th className="px-3 py-2">Language</th><th className="px-3 py-2">Size</th><th className="px-3 py-2">Storage Path</th><th className="px-3 py-2">Date</th></tr></thead>
                      <tbody>
                        {assets.files.length ? assets.files.map((row) => (
                          <tr key={row.id} className="border-t border-slate-100 text-slate-700"><td className="px-3 py-2">{row.fileName}</td><td className="px-3 py-2">{row.language}</td><td className="px-3 py-2">{row.sizeKb} KB</td><td className="px-3 py-2">{row.storagePath}</td><td className="px-3 py-2">{row.fileDate}</td></tr>
                        )) : <tr><td className="px-3 py-2 text-slate-500" colSpan={5}>No linked files yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="sticky bottom-0 -mx-6 border-t border-slate-100 bg-white px-6 pt-3">
                  <div className="flex flex-wrap gap-2 pb-1">
                    <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300" disabled={isSubmitDisabled}>{editingProjectId !== null ? "Save Changes" : "Create Project"}</Button>
                    <Button type="button" variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100" onClick={closeModal}>Cancel</Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
