"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Code2,
  Download,
  FileCode2,
  FileUp,
  FolderCode,
  Globe,
  HardDrive,
  Loader2,
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
import { MOCK_PROJECTS, MOCK_FILES } from "@/lib/mock-data";

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
  
  // Simulated Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProjects(MOCK_PROJECTS.map(p => ({ id: p.id, name: p.name })));
      setFiles(MOCK_FILES.map(f => ({
        ...f,
        fileDate: toDateInput(f.fileDate),
        status: f.status as FileStatus,
        note: f.note ?? ""
      })));
      
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
    setFormData({
      ...defaultForm,
      fileDate: toDateInput(new Date())
    });
    setUploadedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadMethod("upload");
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
    setUploadedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadMethod(file.storagePath.startsWith("http") ? "url" : "upload");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFileId(null);
    setFormData(defaultForm);
    setUploadedFile(null);
  };

  const setField = (field: keyof ProjectFileForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveFileRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    closeModal();
  };

  const deleteFileRecord = (fileId: number) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleDownload = (file: ProjectFile) => {
    alert(`Initiating download for: ${file.fileName}\nSource: ${file.storagePath}`);
  };

  const detectMetadataFromUrl = (url: string) => {
    if (!url) return;
    try {
      const urlObj = new URL(url);
      const pathArr = urlObj.pathname.split('/');
      const fullName = pathArr[pathArr.length - 1] || "remote-asset";
      const extension = fullName.split('.').pop()?.toUpperCase() || "WEB";
      
      setFormData(prev => ({
        ...prev,
        fileName: prev.fileName || fullName,
        language: prev.language || extension,
        storagePath: url
      }));
    } catch {
      const fileNameMatch = url.match(/\/([^\/?#]+)$/);
      if (fileNameMatch) {
         const name = fileNameMatch[1];
         const ext = name.split('.').pop()?.toUpperCase() || "WEB";
         setFormData(prev => ({ ...prev, fileName: prev.fileName || name, language: prev.language || ext }));
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 120);

    const extension = file.name.split('.').pop()?.toUpperCase() || "UNKNOWN";
    setFormData(prev => ({
      ...prev,
      fileName: file.name,
      language: extension,
      sizeKb: (file.size / 1024).toFixed(1),
      storagePath: `/uploads/projects/${file.name}`
    }));
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(14,165,233,0.12),transparent_26%),radial-gradient(circle_at_82%_10%,rgba(34,197,94,0.1),transparent_22%),radial-gradient(circle_at_90%_88%,rgba(251,146,60,0.1),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/files" className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]" />

        <div className="space-y-5 lg:ml-[374px]">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div><p className="text-sm text-slate-500">Project Archive Storage</p><h2 className="font-display text-3xl font-semibold text-slate-900">Files Library</h2></div>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={openCreateModal}><Plus className="h-4 w-4" />Register New File</Button>
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
            <CardHeader><CardTitle className="text-slate-900">File Records</CardTitle><CardDescription className="text-slate-600">Keep project source files organized with secure storage and version tracking.</CardDescription></CardHeader>
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
                      <tr key={file.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-medium text-slate-900">{file.projectName}</td>
                        <td className="py-3 font-medium">{file.fileName}</td>
                        <td className="py-3 uppercase font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded w-fit border border-slate-200">{file.language}</td>
                        <td className="py-3">{file.sizeKb} KB</td>
                        <td className="py-3 text-xs text-slate-500 font-mono italic truncate max-w-[150px] opacity-60">{file.storagePath}</td>
                        <td className="py-3">{file.fileDate}</td>
                        <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(file.status)}`}>{file.status}</span></td>
                        <td className="py-3"><div className="flex justify-end gap-1.5"><Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-600 hover:bg-slate-100" title="Download" onClick={() => handleDownload(file)}><Download className="h-4 w-4" /></Button><Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-600 hover:bg-slate-100" title="Edit" onClick={() => openEditModal(file)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="outline" size="sm" className="h-8 w-8 p-0 border-rose-100 text-rose-600 hover:bg-rose-50" title="Delete" onClick={() => void deleteFileRecord(file.id)}><Trash2 className="h-4 w-4" /></Button></div></td>
                      </tr>
                    ))}
                    {!loading && !files.length ? (
                      <tr><td colSpan={8} className="py-8 text-center text-sm text-slate-500">No entries found. Record your first file asset.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <Card className="w-full max-w-3xl border-slate-200 bg-white shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-100 pb-5 pt-6 px-8 bg-slate-50/50">
              <div className="space-y-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-100/50 border border-cyan-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700">
                   <Upload className="h-3.5 w-3.5" />{editingFileId !== null ? "Modify Asset" : "Register File Asset"}
                </div>
                <CardTitle className="text-slate-900 font-display text-2xl">{editingFileId !== null ? "Modify Record" : "New File Record"}</CardTitle>
                <CardDescription className="text-slate-500 text-sm">Upload a physical file or link to a remote storage path.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white" onClick={closeModal}><X className="h-4 w-4" /></Button>
            </CardHeader>

            <CardContent className="pt-8 px-8 pb-8 overflow-y-auto max-h-[85vh]">
              <form className="space-y-6" onSubmit={saveFileRecord}>
                
                <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                   <button 
                     type="button"
                     onClick={() => setUploadMethod("upload")}
                     className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${uploadMethod === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                   >
                     <FileUp className="h-4 w-4" /> Upload
                   </button>
                   <button 
                     type="button"
                     onClick={() => setUploadMethod("url")}
                     className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${uploadMethod === "url" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                   >
                     <Globe className="h-4 w-4" /> Remote URL
                   </button>
                </div>

                <div className="space-y-3">
                   {uploadMethod === "upload" ? (
                      <div 
                        onClick={triggerUpload}
                        className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all cursor-pointer py-12 px-6 ${
                          uploadedFile ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                         <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                         
                         {isUploading ? (
                           <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                              <Loader2 className="h-10 w-10 text-cyan-600 animate-spin" />
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-cyan-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                              </div>
                              <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest animate-pulse">Processing {uploadProgress}%</p>
                           </div>
                         ) : uploadedFile ? (
                           <div className="flex flex-col items-center gap-3 text-center">
                              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 shadow-sm"><CheckCircle2 className="h-8 w-8" /></div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900">{uploadedFile.name}</p>
                                 <p className="text-[10px] font-medium text-slate-500 uppercase">{(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.name.split('.').pop()?.toUpperCase()} Asset</p>
                              </div>
                              <Button variant="outline" size="sm" className="mt-2 h-7 rounded-full text-[10px] border-slate-200 font-bold bg-white" onClick={(e) => { e.stopPropagation(); triggerUpload(); }}>Replace Machine File</Button>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center gap-4 text-center">
                              <div className="rounded-2xl bg-white p-4 shadow-sm text-slate-400"><FileUp className="h-10 w-10" /></div>
                              <p className="text-sm font-bold text-slate-900">Upload Project Master File</p>
                           </div>
                         )}
                      </div>
                   ) : (
                      <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 space-y-4">
                         <div className="flex items-center gap-3 text-slate-400 mb-1">
                            <Globe className="h-5 w-5" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Connect Remote Asset</p>
                         </div>
                         <Input 
                           placeholder="https://storage.provider.com/project/file.zip" 
                           className="rounded-2xl h-11 bg-white border-slate-200" 
                           value={formData.storagePath}
                           onBlur={(e) => detectMetadataFromUrl(e.target.value)}
                           onChange={(e) => setField("storagePath", e.target.value)}
                         />
                         <p className="text-[10px] text-slate-400 italic font-medium px-2">Metadata (Name, Language) will be auto-detected from the URL on blur.</p>
                      </div>
                   )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project" className="text-xs font-bold text-slate-600">LINKED PROJECT</Label>
                    <select id="project" className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 transition-all" value={formData.projectId} onChange={(event) => setField("projectId", event.target.value)} required>
                      <option value="" disabled>Select target project</option>
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="fileName" className="text-xs font-bold text-slate-600">RESOURCE NAME</Label><Input id="fileName" className="rounded-2xl h-11" value={formData.fileName} onChange={(event) => setField("fileName", event.target.value)} required /></div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2"><Label htmlFor="language" className="text-xs font-bold text-slate-600">LANGUAGE/FORMAT</Label><Input id="language" className="rounded-2xl h-11" placeholder="e.g. PDF, TSX" value={formData.language} onChange={(event) => setField("language", event.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="size" className="text-xs font-bold text-slate-600">SIZE (KB)</Label><Input id="size" className="rounded-2xl h-11" type="number" min="0" value={formData.sizeKb} onChange={(event) => setField("sizeKb", event.target.value)} required={uploadMethod === 'upload'} /></div>
                  <div className="space-y-2"><Label htmlFor="fileDate" className="text-xs font-bold text-slate-600">TAGGED DATE</Label><Input id="fileDate" className="rounded-2xl h-11" type="date" value={formData.fileDate} onChange={(event) => setField("fileDate", event.target.value)} required /></div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-xs font-bold text-slate-600">CURRENT STATUS</Label>
                    <select id="status" className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 transition-all" value={formData.status} onChange={(event) => setField("status", event.target.value as FileStatus)}>
                      <option>Active</option><option>Draft</option><option>Archived</option>
                    </select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="note" className="text-xs font-bold text-slate-600">ADMIN NOTE</Label><Input id="note" className="rounded-2xl h-11" value={formData.note} onChange={(event) => setField("note", event.target.value)} /></div>
                </div>

                <div className="flex gap-3 border-t border-slate-100 pt-6">
                  <Button type="submit" className="h-11 flex-1 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-bold uppercase tracking-widest text-[10px]" disabled={isUploading}>{editingFileId !== null ? "Save Update" : "Register File Record"}</Button>
                  <Button type="button" variant="outline" className="h-11 w-24 border-slate-300 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-bold text-xs" onClick={closeModal}>Discard</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
