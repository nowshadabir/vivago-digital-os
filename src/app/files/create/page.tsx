"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileCode2,
  FileUp,
  FolderCode,
  Globe,
  HardDrive,
  Loader2,
  Save,
  Upload,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_PROJECTS } from "@/lib/mock-data";

function FileCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [formData, setFormData] = useState({
    projectId: "1",
    fileName: "",
    language: "",
    sizeKb: "",
    storagePath: "",
    fileDate: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const setField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        return prev + 20;
      });
    }, 100);

    const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
    setFormData((prev) => ({
      ...prev,
      fileName: file.name,
      language: extension,
      sizeKb: (file.size / 1024).toFixed(1),
      storagePath: `/uploads/projects/${file.name}`,
    }));
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const detectMetadataFromUrl = (url: string) => {
    if (!url) return;
    try {
      const urlObj = new URL(url);
      const pathArr = urlObj.pathname.split("/");
      const fullName = pathArr[pathArr.length - 1] || "remote-asset";
      const extension = fullName.split(".").pop()?.toUpperCase() || "WEB";

      setFormData((prev) => ({
        ...prev,
        fileName: prev.fileName || fullName,
        language: prev.language || extension,
        storagePath: url,
      }));
    } catch {
      const fileNameMatch = url.match(/\/([^/?#]+)$/);
      if (fileNameMatch) {
        const name = fileNameMatch[1];
        const ext = name.split(".").pop()?.toUpperCase() || "WEB";
        setFormData((prev) => ({
          ...prev,
          fileName: prev.fileName || name,
          language: prev.language || ext,
          storagePath: url,
        }));
      }
    }
  };

  const isSubmitDisabled = !formData.fileName.trim() || !formData.projectId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 400));
    setSaveSuccess(true);

    setTimeout(() => {
      router.push("/files");
    }, 500);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8 font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_88%_10%,rgba(16,185,129,0.12),transparent_23%),radial-gradient(circle_at_90%_90%,rgba(245,158,11,0.1),transparent_21%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/files" />

        <SidebarInset className="space-y-6">
          {/* HEADER & ACTIONS */}
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Link
                  href="/files"
                  className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Files Library
                </Link>
                <span>/</span>
                <span className="text-cyan-700 font-medium">
                  {isEditing ? "Edit File Record" : "Register File"}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {isEditing ? "Edit File Record" : "Register Project File"}
              </h1>
              <p className="text-xs text-slate-600 sm:text-sm">
                Upload project source code, design assets, documents, or link remote storage paths.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/files">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e as any)}
                disabled={isSubmitDisabled || isSubmitting || isUploading}
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/10 gap-2 text-xs font-semibold"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Saved!
                  </>
                ) : isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditing ? "Update File Record" : "Register File"}
                  </>
                )}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pb-12">
            {/* 1. UPLOAD OR REMOTE URL SELECTOR */}
            <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base text-slate-900">
                      File Source
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Upload from local machine or connect remote repository / cloud URL
                    </CardDescription>
                  </div>

                  <div className="flex p-1 bg-slate-100 rounded-xl w-fit border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setUploadMethod("upload")}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        uploadMethod === "upload"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <FileUp className="h-3.5 w-3.5" /> Machine Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod("url")}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        uploadMethod === "url"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" /> Remote URL
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {uploadMethod === "upload" ? (
                  <div
                    onClick={triggerUpload}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer py-10 px-6 ${
                      uploadedFile
                        ? "border-emerald-300 bg-emerald-50/30"
                        : "border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3 w-full max-w-xs text-center">
                        <Loader2 className="h-8 w-8 text-cyan-600 animate-spin" />
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-cyan-600 h-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest animate-pulse">
                          Processing {uploadProgress}%
                        </p>
                      </div>
                    ) : uploadedFile ? (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600 shadow-xs">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{uploadedFile.name}</p>
                          <p className="text-xs text-slate-500">
                            {(uploadedFile.size / 1024).toFixed(1)} KB •{" "}
                            {uploadedFile.name.split(".").pop()?.toUpperCase()} Asset
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-1 h-8 rounded-xl text-xs font-semibold border-slate-200 bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerUpload();
                          }}
                        >
                          Replace File
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="rounded-2xl bg-white p-3 shadow-xs text-slate-500 border border-slate-200/60">
                          <FileUp className="h-8 w-8 text-cyan-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Click to upload or drag & drop file
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Supports ZIP, PDF, TSX, DOCX, PNG, Figma exports up to 50MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Globe className="h-4 w-4 text-cyan-700" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Connect Remote Asset URL
                      </p>
                    </div>
                    <Input
                      placeholder="https://storage.provider.com/project/production-archive.zip"
                      className="rounded-xl h-11 bg-white border-slate-200 text-xs font-mono"
                      value={formData.storagePath}
                      onBlur={(e) => detectMetadataFromUrl(e.target.value)}
                      onChange={(e) => setField("storagePath", e.target.value)}
                    />
                    <p className="text-[11px] text-slate-500 italic">
                      File name and language format will be auto-detected from the URL path on blur.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. ASSET METADATA */}
            <Card className="border-slate-200 bg-white/90 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-base text-slate-900">
                  Asset Details
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Target project, file name, language format, and storage size
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Linked Project */}
                  <div className="space-y-2">
                    <Label htmlFor="project" className="text-xs font-semibold text-slate-700">
                      Linked Project <span className="text-rose-500">*</span>
                    </Label>
                    <select
                      id="project"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-xs outline-none focus:border-cyan-400 font-semibold"
                      value={formData.projectId}
                      onChange={(e) => setField("projectId", e.target.value)}
                      required
                    >
                      {MOCK_PROJECTS.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name} ({project.clientName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Resource Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fileName" className="text-xs font-semibold text-slate-700">
                      Resource / File Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="fileName"
                      placeholder="e.g. core-api-schema.ts or build.zip"
                      className="h-11 rounded-xl border-slate-200 text-xs font-semibold"
                      value={formData.fileName}
                      onChange={(e) => setField("fileName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Language / Format */}
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-xs font-semibold text-slate-700">
                      Language / Format
                    </Label>
                    <Input
                      id="language"
                      placeholder="e.g. TSX, PDF, ZIP, FIGMA"
                      className="h-11 rounded-xl border-slate-200 text-xs font-mono uppercase"
                      value={formData.language}
                      onChange={(e) => setField("language", e.target.value)}
                    />
                  </div>

                  {/* Size KB */}
                  <div className="space-y-2">
                    <Label htmlFor="sizeKb" className="text-xs font-semibold text-slate-700">
                      Size (KB)
                    </Label>
                    <Input
                      id="sizeKb"
                      type="number"
                      min="0"
                      placeholder="0"
                      className="h-11 rounded-xl border-slate-200 text-xs font-mono"
                      value={formData.sizeKb}
                      onChange={(e) => setField("sizeKb", e.target.value)}
                    />
                  </div>

                  {/* Tagged Date */}
                  <div className="space-y-2">
                    <Label htmlFor="fileDate" className="text-xs font-semibold text-slate-700">
                      Tagged Date <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="fileDate"
                      type="date"
                      className="h-11 rounded-xl border-slate-200 text-xs"
                      value={formData.fileDate}
                      onChange={(e) => setField("fileDate", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Admin Note */}
                <div className="space-y-2">
                  <Label htmlFor="fileNote" className="text-xs font-semibold text-slate-700">
                    Admin / Version Note
                  </Label>
                  <Input
                    id="fileNote"
                    placeholder="e.g. Master production build bundle with edge functions..."
                    className="h-11 rounded-xl border-slate-200 text-xs"
                    value={formData.note}
                    onChange={(e) => setField("note", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* BOTTOM ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/files">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-slate-200 bg-white px-6 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitDisabled || isSubmitting || isUploading}
                className="h-11 bg-slate-900 px-8 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold shadow-lg shadow-slate-900/10 gap-2"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Saved!
                  </>
                ) : isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditing ? "Update File Record" : "Register File Record"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </SidebarInset>
      </section>
    </main>
  );
}

export default function FileCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">
          Loading file register...
        </div>
      }
    >
      <FileCreateForm />
    </Suspense>
  );
}
