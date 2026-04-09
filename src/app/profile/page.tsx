"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AtSign,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Fingerprint,
  Globe,
  Layers,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  Smartphone,
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
  expertise: string;
};

const defaultProfile: ProfileForm = {
  id: "1",
  fullName: "Kazi Nowshad Abir",
  position: "Managing Director",
  username: "nowshadabir",
  email: "nowshad@vivagodigital.com",
  role: "ADMIN",
  image: "/uploads/profiles/avatar.png",
  expertise: "Full-Stack (Frontend Focused)",
};

function ProfileSkeleton({ className }: { className?: string }) {
  return <span className={`inline-block h-5 animate-pulse rounded-full bg-slate-200/80 ${className || "w-32"}`} />;
}

function buildInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "V";

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileForm>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setProfile(defaultProfile);
      setIsLoading(false);
    }

    void loadProfile();
  }, []);

  const setField = (field: keyof ProfileForm, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const initials = useMemo(() => buildInitials(profile.fullName), [profile.fullName]);

  const handleSave = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage("Profile changes synchronized successfully.");
    }, 800);
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    setSaveMessage("");
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file);
      setField("image", fakeUrl);
      setIsUploading(false);
    }, 1200);
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

        <div className="space-y-6 lg:ml-[374px]">
          {/* Hero Section: Replaces messy header tiles and summary bars */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
             {/* Banner Art */}
             <div className="h-40 w-full bg-[linear-gradient(115deg,rgba(14,165,233,0.3),rgba(16,185,129,0.2),rgba(251,191,36,0.15))]" />
             
             <div className="relative flex flex-col items-center px-8 pb-10 md:flex-row md:items-end md:gap-8">
                {/* Avatar with Professional Hover */}
                <div 
                  className="group relative -mt-16 h-36 w-36 overflow-hidden rounded-[2.75rem] border-[6px] border-white bg-slate-100 shadow-2xl transition-all hover:shadow-cyan-200/50"
                  onClick={triggerImageUpload}
                >
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                   
                   {profile.image && (profile.image.startsWith("/") || profile.image.startsWith("blob:") || profile.image.startsWith("http")) ? (
                      <img src={profile.image} alt="Profile" className="h-full w-full object-cover" />
                   ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-slate-400">{initials}</div>
                   )}

                   {/* Unified Hover Overlay */}
                   <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/40 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                      <Camera className="h-7 w-7 text-white" />
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white">Edit Photo</p>
                   </div>

                   {/* Uploading State */}
                   {isUploading && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                         <Loader2 className="h-7 w-7 animate-spin text-cyan-600" />
                         <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-cyan-700">Syncing</p>
                      </div>
                   )}
                </div>

                {/* Identity Info */}
                <div className="mt-6 flex-1 text-center md:mt-0 md:pb-2 md:text-left">
                   <div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
                      <h1 className="font-display text-4xl font-bold text-slate-900">
                        {isLoading ? <ProfileSkeleton className="w-64 h-10" /> : profile.fullName}
                      </h1>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 border border-emerald-200">
                         <ShieldCheck className="h-3.5 w-3.5" /> Verified Account
                      </span>
                   </div>
                   <p className="mt-1 text-lg font-medium text-slate-500 italic">
                      {profile.position} — {profile.expertise}
                   </p>
                </div>
                
                {/* Secondary Quick-Stats */}
                <div className="hidden items-center gap-4 pb-2 xl:flex">
                   <div className="flex flex-col items-end border-r border-slate-100 pr-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Projects</p>
                      <p className="text-2xl font-bold text-slate-900">24 <span className="text-xs text-emerald-500">+2</span></p>
                   </div>
                   <div className="flex flex-col items-end px-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">System Auth</p>
                      <p className="text-2xl font-bold text-cyan-600">{profile.role}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
             {/* Left Column: Management Hub */}
             <div className="lg:col-span-8 space-y-6">
                <Card className="border-slate-200 bg-white/90 shadow-sm overflow-hidden rounded-[2rem]">
                   <CardHeader className="border-b border-slate-100 bg-slate-50/40 px-8 py-6">
                      <div className="flex items-center justify-between">
                         <div>
                            <CardTitle className="font-display text-xl text-slate-900">Identity Management</CardTitle>
                            <CardDescription>Customize your tactical data and correspondence details.</CardDescription>
                         </div>
                         <Fingerprint className="h-8 w-8 text-slate-200" />
                      </div>
                   </CardHeader>
                   <CardContent className="p-8">
                      <form onSubmit={handleSave} className="space-y-6">
                         <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                               <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Account Ownership</Label>
                               <Input value={profile.fullName} onChange={e => setField("fullName", e.target.value)} className="h-12 rounded-2xl border-slate-200" />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Tactical Position</Label>
                               <Input value={profile.position} onChange={e => setField("position", e.target.value)} className="h-12 rounded-2xl border-slate-200" />
                            </div>
                         </div>
                         <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                               <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Internal Alias</Label>
                               <div className="relative">
                                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors"><AtSign className="h-4 w-4" /></div>
                                  <Input value={profile.username} onChange={e => setField("username", e.target.value)} className="h-12 pl-10 rounded-2xl border-slate-200" />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Primary Expertise</Label>
                               <Input value={profile.expertise} onChange={e => setField("expertise", e.target.value)} className="h-12 rounded-2xl border-slate-200" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Correspondence Hub</Label>
                            <div className="relative">
                               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail className="h-4 w-4" /></div>
                               <Input type="email" value={profile.email} onChange={e => setField("email", e.target.value)} className="h-12 pl-10 rounded-2xl border-slate-200" />
                            </div>
                         </div>

                         {saveMessage && (
                            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-5 py-4 text-xs font-bold text-emerald-800 animate-in fade-in slide-in-from-top-1">
                               <CheckCircle2 className="h-5 w-5" /> {saveMessage}
                            </div>
                         )}

                         <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={isSaving} className="h-12 flex-1 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all">
                               {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing Hub...</> : <><Save className="mr-2 h-4 w-4" /> Commit Changes</>}
                            </Button>
                            <Button type="button" onClick={resetProfile} variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 text-slate-400 font-bold hover:bg-slate-50">Discard</Button>
                         </div>
                      </form>
                   </CardContent>
                </Card>
             </div>

             {/* Right Column: Connection & Meta */}
             <div className="lg:col-span-4 space-y-6">
                <Card className="border-slate-200 bg-white shadow-sm rounded-[2rem]">
                   <CardHeader className="pb-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Session Data</p>
                      <CardTitle className="text-lg text-slate-900">Device Activity</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 transition-all hover:border-cyan-200">
                         <div className="rounded-xl bg-cyan-100 p-2.5 text-cyan-700"><Smartphone className="h-5 w-5" /></div>
                         <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">iPhone 15 Pro Max</p>
                            <p className="text-[10px] text-slate-500">Dhaka, Bangladesh • Active Now</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-2xl bg-white p-4 border border-slate-100 transition-all hover:border-emerald-200">
                         <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700"><Globe className="h-5 w-5" /></div>
                         <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">MacBook Air M2</p>
                            <p className="text-[10px] text-slate-500">Last synced 2h ago</p>
                         </div>
                      </div>
                   </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm rounded-[2rem]">
                   <div className="p-8 text-center space-y-4">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,rgba(14,165,233,0.3),rgba(16,185,129,0.2))] text-cyan-700 shadow-inner">
                         <Layers className="h-8 w-8" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-900">Operations OS v2.4</p>
                         <p className="text-xs text-slate-500 mt-1">Your profile is part of the core executive team registry.</p>
                      </div>
                      <Button variant="outline" className="w-full rounded-2xl border-slate-200 h-10 text-[10px] uppercase font-bold tracking-widest text-slate-500">View Node Details</Button>
                   </div>
                </Card>
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}