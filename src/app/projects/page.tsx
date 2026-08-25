"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CircleDollarSign,
  Eye,
  FolderPlus,
  Pencil,
  Timer,
  Trash2,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_PROJECTS, MOCK_CLIENTS } from "@/lib/mock-data";

type ProjectStatus = "Planning" | "In Progress" | "Review" | "Final QA" | "Completed" | "On Hold";

type ClientOption = {
  id: number;
  name: string;
};

type ProjectTeamMember = {
  name: string;
  role: string;
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
  team: ProjectTeamMember[];
};

function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function toDateInput(value: string | Date | undefined) {
  if (!value) return "";
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
  const [loading, setLoading] = useState(true);

  const loadProjects = () => {
    setProjects(
      MOCK_PROJECTS.map((project) => ({
        ...project,
        status: project.status as ProjectStatus,
        startDate: toDateInput(project.startDate),
        estimatedDeadline: toDateInput(project.estimatedDeadline),
      })) as Project[]
    );
  };

  const loadClients = () => {
    setClients(MOCK_CLIENTS.map((client) => ({ id: client.id, name: client.name })));
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      loadProjects();
      loadClients();
      setLoading(false);
    };
    void run();
  }, []);

  const totalValue = useMemo(
    () => projects.reduce((sum, project) => sum + project.valuation, 0),
    [projects]
  );
  const ongoingCount = useMemo(
    () =>
      projects.filter(
        (project) => project.status === "In Progress" || project.status === "Review"
      ).length,
    [projects]
  );
  const temporaryCostTotal = useMemo(
    () => projects.reduce((sum, project) => sum + project.temporaryCost, 0),
    [projects]
  );

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== "Completed"),
    [projects]
  );
  const previousProjects = useMemo(
    () => projects.filter((project) => project.status === "Completed"),
    [projects]
  );

  const handleDeleteProject = (projectId: number) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_88%_10%,rgba(16,185,129,0.12),transparent_23%),radial-gradient(circle_at_90%_90%,rgba(245,158,11,0.1),transparent_21%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/projects" />

        <SidebarInset className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              <>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="mt-3 h-8 w-20" />
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="mt-3 h-8 w-20" />
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="mt-3 h-8 w-28" />
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <SkeletonBlock className="h-3 w-28" />
                    <SkeletonBlock className="mt-3 h-8 w-24" />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Total Projects
                    </p>
                    <p className="mt-2 font-display text-3xl font-semibold text-slate-900">
                      {projects.length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Ongoing
                    </p>
                    <p className="mt-2 font-display text-3xl font-semibold text-blue-700">
                      {ongoingCount}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Total Value
                    </p>
                    <p className="mt-2 font-display text-2xl font-semibold text-emerald-700">
                      {formatBDT(totalValue)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white/90">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Temporary Costs
                    </p>
                    <p className="mt-2 font-display text-2xl font-semibold text-violet-700">
                      {formatBDT(temporaryCostTotal)}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-slate-900">Active Projects</CardTitle>
                <CardDescription className="text-slate-600">
                  Manage your active work with quick view, edit, and delete actions.
                </CardDescription>
              </div>
              <Link href="/projects/create">
                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl gap-2">
                  <FolderPlus className="h-4 w-4" />
                  Create Project
                </Button>
              </Link>
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
                    <Card key={project.id} className="border-slate-200 bg-white hover:shadow-md transition-shadow">
                      <CardHeader className="space-y-3 border-b border-slate-100 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg text-slate-900">
                              {project.name}
                            </CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-1.5 text-slate-600">
                              <Building2 className="h-3.5 w-3.5" />
                              {project.clientName}
                            </CardDescription>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(
                              project.status
                            )}`}
                          >
                            {project.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2 text-sm text-slate-600">
                          <p className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-slate-400" />
                            Start: {project.startDate}
                          </p>
                          <p className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-slate-400" />
                            Deadline: {project.estimatedDeadline}
                          </p>
                          <p className="flex items-center gap-2 font-semibold text-slate-900">
                            <CircleDollarSign className="h-4 w-4 text-emerald-600" />
                            Valuation: {formatBDT(project.valuation)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                          <Link href={`/projects/view?id=${project.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100 gap-1.5"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/projects/edit?id=${project.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100 gap-1.5"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                            onClick={() => void handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle className="text-slate-900">Previous Project Cards</CardTitle>
              <CardDescription className="text-slate-600">
                Completed projects for historical reference.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {previousProjects.length ? (
                  previousProjects.map((project) => (
                    <Card key={project.id} className="border-slate-200 bg-white hover:shadow-md transition-shadow">
                      <CardHeader className="space-y-3 border-b border-slate-100 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg text-slate-900">
                              {project.name}
                            </CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-1.5 text-slate-600">
                              <Building2 className="h-3.5 w-3.5" />
                              {project.clientName}
                            </CardDescription>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(
                              project.status
                            )}`}
                          >
                            {project.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        <p className="text-sm text-slate-700">
                          Valuation:{" "}
                          <span className="font-semibold text-slate-900">
                            {formatBDT(project.valuation)}
                          </span>
                        </p>
                        <div className="flex gap-2 border-t border-slate-100 pt-3">
                          <Link href={`/projects/view?id=${project.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100 gap-1.5"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                            onClick={() => void handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No completed projects yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </SidebarInset>
      </section>
    </main>
  );
}
