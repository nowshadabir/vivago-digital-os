"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Code2,
  Download,
  FileCode2,
  FileUp,
  FolderCode,
  HardDrive,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MOCK_FILES, MOCK_PROJECTS } from "@/lib/mock-data";
import { useToast } from "@/components/toast-context";

type ProjectFile = {
  id: number;
  projectId: number;
  projectName: string;
  fileName: string;
  language: string;
  sizeKb: number;
  storagePath: string;
  fileDate: string;
  note: string;
};

function toDateInput(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export default function FilesPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setFiles(
        MOCK_FILES.map((f) => ({
          ...f,
          fileDate: toDateInput(f.fileDate),
          note: f.note ?? "",
        }))
      );

      setLoading(false);
    };
    void run();
  }, []);

  const summary = useMemo(() => {
    const totalSize = files.reduce((sum, file) => sum + file.sizeKb, 0);
    const languages = Array.from(new Set(files.map((f) => f.language)));
    return { totalSize, totalFiles: files.length, languageCount: languages.length };
  }, [files]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter(
      (f) =>
        f.fileName.toLowerCase().includes(q) ||
        f.projectName.toLowerCase().includes(q) ||
        f.language.toLowerCase().includes(q) ||
        f.note.toLowerCase().includes(q)
    );
  }, [files, searchQuery]);

  const deleteFileRecord = (fileId: number) => {
    const file = files.find((f) => f.id === fileId);
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
    toast.success(`Removed ${file?.fileName || "file"} from vault archive.`, "File Deleted");
  };

  const handleDownload = (file: ProjectFile) => {
    toast.info(`Preparing secure download for ${file.fileName} (${file.sizeKb} KB)...`, "Download Started");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8 font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(14,165,233,0.12),transparent_26%),radial-gradient(circle_at_82%_10%,rgba(34,197,94,0.1),transparent_22%),radial-gradient(circle_at_90%_88%,rgba(251,146,60,0.1),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/files" />

        <SidebarInset className="space-y-6">
          {/* HEADER & REGISTER ACTION */}
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Vault & Assets</span>
                <span>/</span>
                <span className="text-cyan-700 font-medium">Files Library</span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Project Files
              </h1>
              <p className="text-xs text-slate-600 sm:text-sm">
                Manage, archive, and register project source files, documents, and deliverables.
              </p>
            </div>

            <Link href="/files/create">
              <Button className="rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800 text-xs font-semibold gap-2 shadow-lg shadow-slate-900/10">
                <Plus className="h-4 w-4 text-emerald-400" />
                Register New File
              </Button>
            </Link>
          </header>

          {/* METRIC SUMMARY CARDS */}
          <div className="grid gap-4 sm:grid-cols-3">
            {loading ? (
              <>
                <Card className="border-slate-200 bg-white/90 rounded-3xl p-5">
                  <SkeletonBlock className="h-8 w-8 mb-3" />
                  <SkeletonBlock className="h-6 w-24" />
                </Card>
                <Card className="border-slate-200 bg-white/90 rounded-3xl p-5">
                  <SkeletonBlock className="h-8 w-8 mb-3" />
                  <SkeletonBlock className="h-6 w-24" />
                </Card>
                <Card className="border-slate-200 bg-white/90 rounded-3xl p-5">
                  <SkeletonBlock className="h-8 w-8 mb-3" />
                  <SkeletonBlock className="h-6 w-24" />
                </Card>
              </>
            ) : (
              <>
                <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Total Files
                      </span>
                      <div className="rounded-xl bg-cyan-50 p-2 text-cyan-700 border border-cyan-200/60">
                        <FileCode2 className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-3 font-display text-2xl font-bold text-slate-950">
                      {summary.totalFiles}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Active project archives</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Asset Formats
                      </span>
                      <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 border border-emerald-200/60">
                        <FolderCode className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-3 font-display text-2xl font-bold text-emerald-700">
                      {summary.languageCount} Types
                    </p>
                    <p className="mt-1 text-xs text-slate-500">TypeScript, PDF, Figma, Zip</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Archive Storage
                      </span>
                      <div className="rounded-xl bg-amber-50 p-2 text-amber-700 border border-amber-200/60">
                        <HardDrive className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-3 font-display text-2xl font-bold text-amber-700">
                      {summary.totalSize.toFixed(1)} KB
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Total storage utilized</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* SEARCH & FILES TABLE (Storage Path and Status columns removed) */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search files by name, project, or language..."
                  className="pl-10 h-10 rounded-xl border-slate-200 bg-white text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Showing {filteredFiles.length} file records
              </span>
            </div>

            <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wider text-[11px] font-bold text-slate-600">
                        <th className="px-5 py-3.5">Linked Project</th>
                        <th className="px-4 py-3.5">File Name & Details</th>
                        <th className="px-4 py-3.5">Format</th>
                        <th className="px-4 py-3.5 text-right">Size</th>
                        <th className="px-4 py-3.5">Date Tagged</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {loading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                          <tr key={index}>
                            <td className="px-5 py-4"><SkeletonBlock className="h-4 w-28" /></td>
                            <td className="px-4 py-4"><SkeletonBlock className="h-4 w-40" /></td>
                            <td className="px-4 py-4"><SkeletonBlock className="h-4 w-16" /></td>
                            <td className="px-4 py-4"><SkeletonBlock className="h-4 w-12 ml-auto" /></td>
                            <td className="px-4 py-4"><SkeletonBlock className="h-4 w-20" /></td>
                            <td className="px-5 py-4"><SkeletonBlock className="h-7 w-20 ml-auto" /></td>
                          </tr>
                        ))
                      ) : filteredFiles.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            No file records found. Register your first project file.
                          </td>
                        </tr>
                      ) : (
                        filteredFiles.map((file) => (
                          <tr
                            key={file.id}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="px-5 py-4 font-bold text-slate-900">
                              {file.projectName}
                            </td>

                            <td className="px-4 py-4">
                              <p className="font-semibold text-slate-950">{file.fileName}</p>
                              {file.note && (
                                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                                  {file.note}
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/80 text-slate-700">
                                {file.language}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-right font-mono font-semibold text-slate-700">
                              {file.sizeKb} KB
                            </td>

                            <td className="px-4 py-4 font-medium text-slate-700 font-mono">
                              {file.fileDate}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
                                  title="Download File"
                                  onClick={() => handleDownload(file)}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>

                                <Link href={`/files/create?id=${file.id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
                                    title="Edit File"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </Link>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50"
                                  title="Delete Record"
                                  onClick={() => deleteFileRecord(file.id)}
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
    </main>
  );
}
