"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AtSign,
  BriefcaseBusiness,
  Camera,
  Mail,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileForm = {
  id: string;
  fullName: string;
  position: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  image: string;
};

const defaultProfile: ProfileForm = {
  id: "",
  fullName: "",
  position: "",
  username: "",
  email: "",
  role: "USER",
  image: "",
};

function ProfileSkeleton() {
  return <div className="h-5 animate-pulse rounded-full bg-slate-200/80" />;
}

function buildInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "V";

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function roleLabel(role: ProfileForm["role"]) {
  return role === "ADMIN" ? "Administrator" : "Team Member";
}

function positionLabel(position: string) {
  return position.trim() || "Position not set";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileForm>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile/current", { cache: "no-store", credentials: "include" });
        if (!response.ok) return;

        const data = (await response.json()) as {
          user: {
            id: string;
            name: string;
            position: string | null;
            username: string;
            email: string;
            role: "USER" | "ADMIN";
            image: string | null;
          } | null;
        };

        if (isMounted && data.user) {
          setProfile({
            id: data.user.id,
            fullName: data.user.name,
            position: data.user.position ?? "",
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
            image: data.user.image ?? "",
          });
        }
      } catch {
        // Keep defaults if loading fails.
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const setField = (field: keyof ProfileForm, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const initials = useMemo(() => buildInitials(profile.fullName), [profile.fullName]);

  const handleSave = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setSaveMessage("");

    if (!profile.id) {
      setSaveMessage("No user found in database.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: profile.id,
          name: profile.fullName,
          position: profile.position || null,
          username: profile.username,
          email: profile.email,
          role: profile.role,
          image: profile.image || null,
        }),
      });

      if (!response.ok) {
        setSaveMessage("Could not save profile.");
        return;
      }

      setSaveMessage("Profile updated successfully.");
    } catch {
      setSaveMessage("Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    setSaveMessage("");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(14,165,233,0.14),transparent_24%),radial-gradient(circle_at_80%_8%,rgba(16,185,129,0.1),transparent_22%),radial-gradient(circle_at_92%_86%,rgba(245,158,11,0.1),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar
          activePath="/profile"
          className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]"
        />

        <div className="space-y-5 lg:ml-[374px]">
          <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white/85 shadow-sm backdrop-blur-xl">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Account Center</p>
                  <h2 className="font-display text-3xl font-semibold text-slate-900">Profile</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure profile settings
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-5 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Role</p>
                    <p className="text-lg font-semibold text-slate-900">{profile.role || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
                    <p className="truncate text-lg font-semibold text-slate-900">{profile.email || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Access</p>
                    <p className="text-lg font-semibold text-slate-900">{roleLabel(profile.role)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Position</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {isLoading ? <ProfileSkeleton /> : positionLabel(profile.position)}
                </p>
              </div>
            </div>
          </header>

          <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
            <Card className="overflow-hidden border-slate-200 bg-white/90">
              <div className="h-28 bg-[linear-gradient(135deg,rgba(14,165,233,0.2),rgba(16,185,129,0.14),rgba(251,191,36,0.12))]" />
              <CardContent className="relative px-6 pb-6 pt-0">
                <div className="-mt-14 flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="grid h-28 w-28 place-items-center rounded-[2rem] border-4 border-white bg-slate-100 text-3xl font-semibold text-slate-700 shadow-lg">
                      {profile.image ? (
                        <Image
                          src={profile.image}
                          alt={profile.fullName || "Profile avatar"}
                          width={112}
                          height={112}
                          className="h-28 w-28 rounded-[2rem] object-cover"
                        />
                      ) : isLoading ? (
                        <ProfileSkeleton />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm">
                      <Camera className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-5 space-y-1">
                    <h3 className="text-2xl font-semibold text-slate-900">
                      {isLoading ? <ProfileSkeleton /> : profile.fullName || "No user found"}
                    </h3>
                    <p className="text-sm text-slate-500">{roleLabel(profile.role)}</p>
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                      <AtSign className="h-3.5 w-3.5" />
                      {profile.username || "-"}
                    </p>
                  </div>

                  <div className="mt-6 grid w-full gap-3 text-left sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Current profile</p>
                      <p className="mt-1 text-sm text-slate-700">
                        {profile.fullName ? `${profile.fullName} is the active account.` : "Profile data will appear here after loading."}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Profile image</p>
                      <p className="mt-1 text-sm text-slate-700">
                        Use a direct image URL for a quick avatar update.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-slate-900">Profile Details</CardTitle>
                    <CardDescription className="text-slate-600">
                      Update your account identity and visual profile.
                    </CardDescription>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Live account data
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form className="space-y-6" onSubmit={handleSave}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(event) => setField("fullName", event.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={profile.position}
                        onChange={(event) => setField("position", event.target.value)}
                        placeholder="e.g. Operations Lead"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(event) => setField("email", event.target.value)}
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(event) => setField("username", event.target.value)}
                        placeholder="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                        value={profile.role}
                        onChange={(event) => setField("role", event.target.value as "USER" | "ADMIN")}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input
                      id="image"
                      value={profile.image}
                      onChange={(event) => setField("image", event.target.value)}
                      placeholder="https://..."
                    />
                    <p className="text-xs text-slate-500">Provide a direct image URL. It will be used in the sidebar and profile header.</p>
                  </div>

                  {saveMessage && (
                    <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      {saveMessage}
                    </p>
                  )}

                  {isLoading && (
                    <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      Loading profile...
                    </p>
                  )}

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                    <Button
                      type="submit"
                      className="bg-slate-900 text-white hover:bg-slate-800"
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Profile"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                      onClick={resetProfile}
                      disabled={isSaving}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}