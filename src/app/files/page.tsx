"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Code2,
  FileCode2,
  FolderCode,
  HardDrive,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cachedJson, invalidateCachedJson } from "@/lib/client-cache";

type FileStatus = "Active" | "Archived" | "Draft";

type ProjectOption = {
  id: number;
  name: string;
};

type ProjectFile = {
  id: number;
  projectId: number;
  projectName: string;
  fileName: string;
  language: string;
  sizeKb: number;
  storagePath: string;
  fileDate: string;
  status: FileStatus;
  note: string;
};

type ProjectFileForm = {
  projectId: string;
  fileName: string;
  language: string;
  sizeKb: string;
  storagePath: string;
  fileDate: string;
  status: FileStatus;
  note: string;
};

const defaultForm: ProjectFileForm = {
  projectId: "",
  fileName: "",
  language: "",
  sizeKb: "",
  storagePath: "",
  fileDate: "",
  status: "Active",
  note: "",
};

function toDateInput(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function statusClasses(status: FileStatus) {
  if (status === "Active") return "bg-emerald-100 text-emerald-700";
  if (status === "Draft") return "bg-cyan-100 text-cyan-700";
  return "bg-slate-200 text-slate-700";
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export default function FilesPage() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProjectFileForm>(defaultForm);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    const data = await cachedJson<{ projects: Array<{ id: number; name: string }> }>("/api/projects", 45_000);
    setProjects(data.projects.map((project) => ({ id: project.id, name: project.name })));
  };

  const loadFiles = async () => {
    const data = await cachedJson<{
      files: Array<{
        id: number;
        projectId: number;
        projectName: string;
        fileName: string;
        language: string;
        sizeKb: number;
        storagePath: string;
        fileDate: string;
        status: string;
        note: string | null;
      }>;
    }>("/api/files", 20_000);

    setFiles(
      data.files.map((file) => ({
        id: file.id,
        projectId: file.projectId,
        projectName: file.projectName,
        fileName: file.fileName,
        language: file.language,
        sizeKb: file.sizeKb,
        storagePath: file.storagePath,
        fileDate: toDateInput(file.fileDate),
        status: file.status as FileStatus,
        note: file.note ?? "",
      }))
    );
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await Promise.all([loadProjects(), loadFiles()]);
      setLoading(false);
    };
    void run();
  }, []);

  const summary = useMemo(() => {
    const totalSize = files.reduce((sum, file) => sum + file.sizeKb, 0);
    const activeCount = files.filter((file) => file.status === "Active").length;
    const archivedCount = files.filter((file) => file.status === "Archived").length;
    return { totalSize, activeCount, archivedCount };
  }, [files]);

  const openCreateModal = () => {
    setEditingFileId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (file: ProjectFile) => {
    setEditingFileId(file.id);
    setFormData({
      projectId: String(file.projectId),
      fileName: file.fileName,
      language: file.language,
      sizeKb: String(file.sizeKb),
      storagePath: file.storagePath,
      fileDate: file.fileDate,
      status: file.status,
      note: file.note,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFileId(null);
    setFormData(defaultForm);
  };

  const setField = (field: keyof ProjectFileForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveFileRecord = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      projectId: Number(formData.projectId),
      fileName: formData.fileName.trim(),
      language: formData.language.trim(),
      sizeKb: Number(formData.sizeKb || "0"),
      storagePath: formData.storagePath.trim(),
      fileDate: formData.fileDate,
      status: formData.status,
      note: formData.note.trim(),
    };

    const isEditing = editingFileId !== null;
    const endpoint = isEditing ? `/api/files/${editingFileId}` : "/api/files";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return;
    invalidateCachedJson("/api/files");
    await loadFiles();
    closeModal();
  };

  const deleteFileRecord = async (fileId: number) => {
    const response = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
    if (!response.ok) return;
    invalidateCachedJson("/api/files");
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(14,165,233,0.12),transparent_26%),radial-gradient(circle_at_82%_10%,rgba(34,197,94,0.1),transparent_22%),radial-gradient(circle_at_90%_88%,rgba(251,146,60,0.1),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/files" className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]" />

        <div className="space-y-5 lg:ml-[374px]">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div><p className="text-sm text-slate-500">Project Code Storage</p><h2 className="font-display text-3xl font-semibold text-slate-900">Files Library</h2></div>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={openCreateModal}><Plus className="h-4 w-4" />Add Code File</Button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              <>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="mt-2 h-8 w-20" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="mt-2 h-8 w-20" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="mt-2 h-8 w-20" /></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><SkeletonBlock className="mb-3 h-8 w-8" /><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="mt-2 h-8 w-20" /></CardContent></Card>
              </>
            ) : (
              <>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-cyan-100 p-2 text-cyan-700"><FileCode2 className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Files</p><p className="mt-1 font-display text-3xl font-semibold text-slate-900">{files.length}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700"><FolderCode className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Active</p><p className="mt-1 font-display text-3xl font-semibold text-emerald-700">{summary.activeCount}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-slate-200 p-2 text-slate-700"><Code2 className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Archived</p><p className="mt-1 font-display text-3xl font-semibold text-slate-700">{summary.archivedCount}</p></CardContent></Card>
                <Card className="border-slate-200 bg-white/90"><CardContent className="p-5"><div className="mb-3 inline-flex rounded-xl bg-amber-100 p-2 text-amber-700"><HardDrive className="h-4 w-4" /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Storage</p><p className="mt-1 font-display text-3xl font-semibold text-amber-700">{summary.totalSize} KB</p></CardContent></Card>
              </>
            )}
          </div>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader><CardTitle className="text-slate-900">Code File Records</CardTitle><CardDescription className="text-slate-600">Keep project source files organized with storage path and status.</CardDescription></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="pb-3 font-medium">Project</th><th className="pb-3 font-medium">File Name</th><th className="pb-3 font-medium">Language</th><th className="pb-3 font-medium">Size</th><th className="pb-3 font-medium">Storage Path</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead>
                  <tbody>
                    {loading ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3"><SkeletonBlock className="h-4 w-28" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-36" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-20" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-40" /></td>
                        <td className="py-3"><SkeletonBlock className="h-4 w-24" /></td>
                        <td className="py-3"><SkeletonBlock className="h-6 w-20 rounded-full" /></td>
                        <td className="py-3"><SkeletonBlock className="ml-auto h-9 w-28" /></td>
                      </tr>
                    )) : files.map((file) => (
                      <tr key={file.id} className="border-b border-slate-100 text-slate-700">
                        <td className="py-3 font-medium text-slate-900">{file.projectName}</td>
                        <td className="py-3">{file.fileName}</td>
                        <td className="py-3">{file.language}</td>
                        <td className="py-3">{file.sizeKb} KB</td>
                        <td className="py-3 text-xs text-slate-600">{file.storagePath}</td>
                        <td className="py-3">{file.fileDate}</td>
                        <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(file.status)}`}>{file.status}</span></td>
                        <td className="py-3"><div className="flex justify-end gap-2"><Button variant="outline" className="h-9 border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-100" onClick={() => openEditModal(file)}><Pencil className="h-3.5 w-3.5" />Edit</Button><Button variant="outline" className="h-9 border-rose-200 bg-white px-3 text-rose-700 hover:bg-rose-50" onClick={() => void deleteFileRecord(file.id)}><Trash2 className="h-3.5 w-3.5" />Delete</Button></div></td>
                      </tr>
                    ))}
                    {!loading && !files.length ? (
                      <tr><td colSpan={8} className="py-8 text-center text-sm text-slate-500">No files found. Add your first code file.</td></tr>
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
              <div className="space-y-2"><div className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700"><Upload className="h-3.5 w-3.5" />{editingFileId !== null ? "Edit File" : "New File"}</div><CardTitle className="text-slate-900">{editingFileId !== null ? "Update File Record" : "Create File Record"}</CardTitle><CardDescription className="text-slate-600">Store metadata for your project code files.</CardDescription></div>
              <Button variant="ghost" size="icon" onClick={closeModal}><X className="h-4 w-4" /></Button>
            </CardHeader>

            <CardContent className="pt-6">
              <form className="space-y-5" onSubmit={(event) => void saveFileRecord(event)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <select id="project" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={formData.projectId} onChange={(event) => setField("projectId", event.target.value)} required>
                      <option value="" disabled>Select project</option>
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="fileName">File Name</Label><Input id="fileName" value={formData.fileName} onChange={(event) => setField("fileName", event.target.value)} required /></div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2"><Label htmlFor="language">Language</Label><Input id="language" value={formData.language} onChange={(event) => setField("language", event.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="size">File Size (KB)</Label><Input id="size" type="number" min="0" value={formData.sizeKb} onChange={(event) => setField("sizeKb", event.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="fileDate">Date</Label><Input id="fileDate" type="date" value={formData.fileDate} onChange={(event) => setField("fileDate", event.target.value)} required /></div>
                </div>

                <div className="space-y-2"><Label htmlFor="storagePath">Storage Path</Label><Input id="storagePath" value={formData.storagePath} onChange={(event) => setField("storagePath", event.target.value)} required /></div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select id="status" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10" value={formData.status} onChange={(event) => setField("status", event.target.value as FileStatus)}>
                      <option>Active</option><option>Draft</option><option>Archived</option>
                    </select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="note">Note</Label><Input id="note" value={formData.note} onChange={(event) => setField("note", event.target.value)} /></div>
                </div>

                <div className="flex gap-2 border-t border-slate-100 pt-2">
                  <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">{editingFileId !== null ? "Save Changes" : "Create File Record"}</Button>
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
