"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  LockKeyhole,
  Pencil,
  Plus,
  Server,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_PROJECTS, MOCK_CREDENTIALS } from "@/lib/mock-data";

type CredentialCategory =
  | "Domain"
  | "SSL"
  | "Hosting"
  | "Email Hosting"
  | "cPanel"
  | "Admin Panel"
  | "Social/API"
  | "Database";

type CredentialStatus = "Active" | "Needs Rotation" | "Expired";
type CredentialTab = "All" | CredentialCategory;

type ProjectOption = {
  id: number;
  name: string;
};

type CredentialRecord = {
  id: number;
  projectId: number;
  projectName: string;
  category: CredentialCategory;
  service: string;
  username: string;
  password: string;
  endpoint: string;
  reviewDate: string;
  status: CredentialStatus;
  note: string;
};

type CredentialForm = {
  projectId: string;
  category: CredentialCategory;
  service: string;
  username: string;
  password: string;
  endpoint: string;
  reviewDate: string;
  status: CredentialStatus;
  note: string;
};

const defaultForm: CredentialForm = {
  projectId: "",
  category: "Domain",
  service: "",
  username: "",
  password: "",
  endpoint: "",
  reviewDate: "",
  status: "Active",
  note: "",
};

const credentialTabs: CredentialTab[] = [
  "All",
  "Domain",
  "SSL",
  "Hosting",
  "Email Hosting",
  "cPanel",
  "Admin Panel",
  "Social/API",
  "Database",
];

function toDateInput(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function statusClasses(status: CredentialStatus) {
  if (status === "Active") return "bg-emerald-100 text-emerald-700";
  if (status === "Needs Rotation") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function categoryIcon(category: CredentialCategory) {
  if (category === "Domain") return Globe;
  if (category === "SSL") return ShieldCheck;
  if (category === "Hosting") return Server;
  if (category === "Email Hosting") return User;
  if (category === "Database") return Server;
  return KeyRound;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export default function CredentialsPage() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [credentials, setCredentials] = useState<CredentialRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<CredentialTab>("All");
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<number[]>([]);
  const [formData, setFormData] = useState<CredentialForm>(defaultForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProjects(MOCK_PROJECTS.map(p => ({ id: p.id, name: p.name })));
      setCredentials(MOCK_CREDENTIALS.map(c => ({
        ...c,
        category: c.category as CredentialCategory,
        reviewDate: toDateInput(c.reviewDate),
        status: c.status as CredentialStatus,
        note: c.note ?? ""
      })));
      
      setLoading(false);
    };
    void run();
  }, []);

  const filteredCredentials = useMemo(() => {
    if (activeTab === "All") return credentials;
    return credentials.filter((item) => item.category === activeTab);
  }, [credentials, activeTab]);

  const counts = useMemo(() => {
    const active = filteredCredentials.filter((item) => item.status === "Active").length;
    const needsRotation = filteredCredentials.filter((item) => item.status === "Needs Rotation").length;
    const expired = filteredCredentials.filter((item) => item.status === "Expired").length;
    return { active, needsRotation, expired };
  }, [filteredCredentials]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEdit = (record: CredentialRecord) => {
    setEditingId(record.id);
    setFormData({
      projectId: String(record.projectId),
      category: record.category,
      service: record.service,
      username: record.username,
      password: record.password,
      endpoint: record.endpoint,
      reviewDate: record.reviewDate,
      status: record.status,
      note: record.note,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const setField = (field: keyof CredentialForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswordIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const saveCredential = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    closeModal();
  };

  const deleteCredential = (id: number) => {
    setCredentials((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_84%_8%,rgba(34,197,94,0.1),transparent_22%),radial-gradient(circle_at_90%_88%,rgba(251,146,60,0.1),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/credentials" className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]" />

        <div className="space-y-5 lg:ml-[374px]">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div><p className="text-sm text-slate-500">Access Vault</p><h2 className="font-display text-3xl font-semibold text-slate-900">Credentials</h2></div>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={openCreate}><Plus className="h-4 w-4" />Add Credential</Button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              <>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-24" /><SkeletonBlock className="mt-2 h-8 w-20" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="mt-2 h-8 w-20" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-28" /><SkeletonBlock className="mt-2 h-8 w-20" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="mt-2 h-8 w-20" /></CardContent></Card>
              </>
            ) : (
              <>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-cyan-100 p-2 text-cyan-700"><LockKeyhole className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Records</p><p className="mt-1 font-display text-3xl font-semibold text-slate-900">{filteredCredentials.length}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700"><ShieldCheck className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Active</p><p className="mt-1 font-display text-3xl font-semibold text-emerald-700">{counts.active}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-amber-100 p-2 text-amber-700"><KeyRound className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Needs Rotation</p><p className="mt-1 font-display text-3xl font-semibold text-amber-700">{counts.needsRotation}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-rose-100 p-2 text-rose-700"><X className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Expired</p><p className="mt-1 font-display text-3xl font-semibold text-rose-700">{counts.expired}</p></CardContent></Card>
              </>
            )}
          </div>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader><CardTitle className="text-slate-900">Credential Records</CardTitle><CardDescription className="text-slate-600">Domains, SSL, hosting, email hosting, cPanel, admin, social/API, and database access.</CardDescription></CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">{credentialTabs.map((tab) => <Button key={tab} type="button" size="sm" variant={activeTab === tab ? "default" : "outline"} className={activeTab === tab ? "bg-slate-900 text-white hover:bg-slate-800" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"} onClick={() => setActiveTab(tab)}>{tab}</Button>)}</div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
                  <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="pb-3 font-medium">Category</th><th className="pb-3 font-medium">Service</th><th className="pb-3 font-medium">Project</th><th className="pb-3 font-medium">Username</th><th className="pb-3 font-medium">Password</th><th className="pb-3 font-medium">Domain/Host/Endpoint</th><th className="pb-3 font-medium">Expiry/Review</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead>
                  <tbody>
                    {loading ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-32" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-36" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-20 rounded-full" /></td>
                        <td className="py-3"><SkeletonBlock className="ml-auto h-9 w-28" /></td>
                      </tr>
                    )) : filteredCredentials.map((record) => {
                      const Icon = categoryIcon(record.category);
                      const isVisible = visiblePasswordIds.includes(record.id);

                      return (
                        <tr key={record.id} className="border-b border-slate-100 text-slate-700">
                          <td className="py-3"><div className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-slate-500" /><span>{record.category}</span></div></td>
                          <td className="py-3 font-medium text-slate-900">{record.service}</td>
                          <td className="py-3">{record.projectName}</td>
                          <td className="py-3">{record.username}</td>
                          <td className="py-3"><div className="inline-flex items-center gap-2"><span className="font-mono text-xs text-slate-700">{isVisible ? record.password : "*".repeat(Math.max(record.password.length, 8))}</span><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePasswordVisibility(record.id)}>{isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></td>
                          <td className="py-3 text-xs text-slate-600">{record.endpoint}</td>
                          <td className="py-3">{record.reviewDate}</td>
                          <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(record.status)}`}>{record.status}</span></td>
                          <td className="py-3"><div className="flex justify-end gap-2"><Button type="button" variant="outline" className="h-9 border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-100" onClick={() => openEdit(record)}><Pencil className="h-3.5 w-3.5" />Edit</Button><Button type="button" variant="outline" className="h-9 border-rose-200 bg-white px-3 text-rose-700 hover:bg-rose-50" onClick={() => void deleteCredential(record.id)}><Trash2 className="h-3.5 w-3.5" />Delete</Button></div></td>
                        </tr>
                      );
                    })}
                    {!loading && filteredCredentials.length === 0 && (<tr><td colSpan={9} className="py-10 text-center text-sm text-slate-500">No credentials found for this type.</td></tr>)}
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
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700"><KeyRound className="h-3.5 w-3.5" />{editingId !== null ? "Edit Credential" : "New Credential"}</div>
                <CardTitle className="text-slate-900">{editingId !== null ? "Update Credential" : "Add Credential"}</CardTitle>
                <CardDescription className="text-slate-600">Store domain, SSL, hosting, cPanel, admin, social/API, and database access.</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeModal}><X className="h-4 w-4" /></Button>
            </CardHeader>

            <CardContent className="pt-6">
              <form className="space-y-5" onSubmit={saveCredential}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <select id="project" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={formData.projectId} onChange={(event) => setField("projectId", event.target.value)} required>
                      <option value="" disabled>Select project</option>
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select id="category" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={formData.category} onChange={(event) => setField("category", event.target.value as CredentialCategory)}>
                      <option>Domain</option><option>SSL</option><option>Hosting</option><option>Email Hosting</option><option>cPanel</option><option>Admin Panel</option><option>Social/API</option><option>Database</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="service">Service</Label><Input id="service" value={formData.service} onChange={(event) => setField("service", event.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="endpoint">Domain/Host/Endpoint</Label><Input id="endpoint" value={formData.endpoint} onChange={(event) => setField("endpoint", event.target.value)} required /></div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2"><Label htmlFor="username">Username/Email</Label><Input id="username" value={formData.username} onChange={(event) => setField("username", event.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="text" value={formData.password} onChange={(event) => setField("password", event.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="reviewDate">Expiry or Review Date</Label><Input id="reviewDate" type="date" value={formData.reviewDate} onChange={(event) => setField("reviewDate", event.target.value)} required /></div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select id="status" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={formData.status} onChange={(event) => setField("status", event.target.value as CredentialStatus)}>
                      <option>Active</option><option>Needs Rotation</option><option>Expired</option>
                    </select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="note">Note</Label><Input id="note" value={formData.note} onChange={(event) => setField("note", event.target.value)} /></div>
                </div>

                <div className="flex gap-2 border-t border-slate-100 pt-2">
                  <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">{editingId !== null ? "Save Changes" : "Add Credential"}</Button>
                  <Button type="button" variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100" onClick={closeModal}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
