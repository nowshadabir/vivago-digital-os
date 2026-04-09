"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Filter,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_REMINDERS } from "@/lib/mock-data";

type ReminderPriority = "Low" | "Medium" | "High";
type ReminderStatus = "Pending" | "Done";
type ReminderType = "Payment" | "Project" | "Client" | "Technical";
type ReminderTab = "All" | "Today" | "Upcoming" | "Done";

type Reminder = {
  id: number;
  title: string;
  type: ReminderType;
  dueDate: string;
  dueTime: string;
  priority: ReminderPriority;
  status: ReminderStatus;
  note: string;
};

type ReminderForm = {
  title: string;
  type: ReminderType;
  dueDate: string;
  dueTime: string;
  priority: ReminderPriority;
  status: ReminderStatus;
  note: string;
};

const defaultForm: ReminderForm = {
  title: "",
  type: "Payment",
  dueDate: "",
  dueTime: "",
  priority: "Medium",
  status: "Pending",
  note: "",
};

const tabs: ReminderTab[] = ["All", "Today", "Upcoming", "Done"];

function priorityClasses(priority: ReminderPriority) {
  if (priority === "High") return "bg-rose-100 text-rose-700";
  if (priority === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-cyan-100 text-cyan-700";
}

function typeClasses(type: ReminderType) {
  if (type === "Payment") return "bg-emerald-100 text-emerald-700";
  if (type === "Project") return "bg-cyan-100 text-cyan-700";
  if (type === "Client") return "bg-violet-100 text-violet-700";
  return "bg-slate-200 text-slate-700";
}

function todayValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function SkeletonCard() {
  return <div className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-slate-100/80" />;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<ReminderTab>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ReminderForm>(defaultForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const today = todayValue();

  useEffect(() => {
    async function loadReminders() {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setReminders(MOCK_REMINDERS.map(rem => ({
        ...rem,
        type: rem.type as ReminderType,
        priority: rem.priority as ReminderPriority,
        status: rem.status as ReminderStatus
      })));
      setIsLoading(false);
    }

    void loadReminders();
  }, []);

  const filteredReminders = useMemo(() => {
    if (activeTab === "Today") {
      return reminders.filter((item) => item.dueDate === today && item.status === "Pending");
    }

    if (activeTab === "Upcoming") {
      return reminders.filter((item) => item.dueDate > today && item.status === "Pending");
    }

    if (activeTab === "Done") {
      return reminders.filter((item) => item.status === "Done");
    }

    return reminders;
  }, [reminders, activeTab, today]);

  const stats = useMemo(() => {
    const pending = reminders.filter((item) => item.status === "Pending").length;
    const done = reminders.filter((item) => item.status === "Done").length;
    const highPriority = reminders.filter((item) => item.priority === "High" && item.status === "Pending").length;

    return { pending, done, highPriority };
  }, [reminders]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setFormData({
      title: reminder.title,
      type: reminder.type,
      dueDate: reminder.dueDate,
      dueTime: reminder.dueTime,
      priority: reminder.priority,
      status: reminder.status,
      note: reminder.note,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const setField = (field: keyof ReminderForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveReminder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    closeModal();
  };

  const markDone = (reminder: Reminder) => {
    setReminders((prev) => prev.map((item) => (item.id === reminder.id ? { ...item, status: "Done" } : item)));
  };

  const deleteReminder = (reminderId: number) => {
    setReminders((prev) => prev.filter((item) => item.id !== reminderId));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_16%,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.1),transparent_22%),radial-gradient(circle_at_92%_86%,rgba(251,146,60,0.1),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar
          activePath="/reminders"
          className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]"
        />

        <div className="space-y-5 lg:ml-[374px]">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Action Center</p>
              <h2 className="font-display text-3xl font-semibold text-slate-900">Reminders</h2>
            </div>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Reminder
            </Button>
          </header>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-slate-200 bg-white/90">
              <CardContent className="p-5">
                <div className="mb-3 inline-flex rounded-xl bg-cyan-100 p-2 text-cyan-700">
                  <Bell className="h-4 w-4" />
                </div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Pending</p>
                <p className="mt-1 font-display text-3xl font-semibold text-slate-900">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white/90">
              <CardContent className="p-5">
                <div className="mb-3 inline-flex rounded-xl bg-rose-100 p-2 text-rose-700">
                  <Clock3 className="h-4 w-4" />
                </div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">High Priority</p>
                <p className="mt-1 font-display text-3xl font-semibold text-rose-700">{stats.highPriority}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white/90">
              <CardContent className="p-5">
                <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Completed</p>
                <p className="mt-1 font-display text-3xl font-semibold text-emerald-700">{stats.done}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle className="text-slate-900">Reminder Board</CardTitle>
              <CardDescription className="text-slate-600">
                Plan payment follow-ups, project checkpoints, and operational reminders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-600">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </div>
                {tabs.map((tab) => (
                  <Button
                    key={tab}
                    type="button"
                    size="sm"
                    variant={activeTab === tab ? "default" : "outline"}
                    className={
                      activeTab === tab
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              {isLoading ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredReminders.map((item) => (
                      <Card key={item.id} className="border-slate-200 bg-white">
                        <CardContent className="space-y-3 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${typeClasses(item.type)}`}>
                              {item.type}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-slate-600">
                            <p className="inline-flex items-center gap-1.5">
                              <CalendarClock className="h-3.5 w-3.5" />
                              {item.dueDate} at {item.dueTime}
                            </p>
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityClasses(item.priority)}`}>
                              {item.priority} Priority
                            </span>
                            <p className="text-slate-500">{item.note}</p>
                          </div>

                          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2">
                            {item.status !== "Done" && (
                              <Button
                                type="button"
                                size="sm"
                                className="bg-emerald-600 text-white hover:bg-emerald-500"
                                onClick={() => markDone(item)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Mark Done
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                              onClick={() => openEdit(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                              onClick={() => deleteReminder(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredReminders.length === 0 && (
                    <p className="py-8 text-center text-sm text-slate-500">No reminders found for this filter.</p>
                  )}
                </>
              )}
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
                  <Bell className="h-3.5 w-3.5" />
                  {editingId !== null ? "Edit Reminder" : "New Reminder"}
                </div>
                <CardTitle className="text-slate-900">
                  {editingId !== null ? "Update Reminder" : "Add Reminder"}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Track due actions and keep follow-ups on time.
                </CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeModal} aria-label="Close modal">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="pt-6">
              <form className="space-y-5" onSubmit={saveReminder}>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(event) => setField("title", event.target.value)}
                    placeholder="Reminder title"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                      value={formData.type}
                      onChange={(event) => setField("type", event.target.value as ReminderType)}
                    >
                      <option>Payment</option>
                      <option>Project</option>
                      <option>Client</option>
                      <option>Technical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                      value={formData.priority}
                      onChange={(event) => setField("priority", event.target.value as ReminderPriority)}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(event) => setField("dueDate", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueTime">Due Time</Label>
                    <Input
                      id="dueTime"
                      type="time"
                      value={formData.dueTime}
                      onChange={(event) => setField("dueTime", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                      value={formData.status}
                      onChange={(event) => setField("status", event.target.value as ReminderStatus)}
                    >
                      <option>Pending</option>
                      <option>Done</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <textarea
                    id="note"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                    placeholder="Reminder details"
                    value={formData.note}
                    onChange={(event) => setField("note", event.target.value)}
                  />
                </div>

                <div className="flex gap-2 border-t border-slate-100 pt-2">
                  <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800" disabled={isSaving}>
                    {editingId !== null ? "Save Changes" : "Add Reminder"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                    onClick={closeModal}
                    disabled={isSaving}
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