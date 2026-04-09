"use client";

import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Mail,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserPlus,
  Users2,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_TEAM } from "@/lib/mock-data";

type MemberStatus = "Active" | "Away" | "Busy" | "On Break" | "Inactive";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: MemberStatus;
  expertise: string[];
  projects: string[];
  image: string | null;
};

type MemberFormData = {
  name: string;
  role: string;
  email: string;
  phone: string;
  status: MemberStatus;
  expertise: string;
};

const defaultMemberForm: MemberFormData = {
  name: "",
  role: "",
  email: "",
  phone: "",
  status: "Active",
  expertise: "",
};

function statusBadge(status: MemberStatus) {
  switch (status) {
    case "Active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Away": return "bg-amber-100 text-amber-700 border-amber-200";
    case "Busy": return "bg-rose-100 text-rose-700 border-rose-200";
    case "On Break": return "bg-slate-100 text-slate-700 border-slate-200";
    default: return "bg-slate-50 text-slate-400 border-slate-100";
  }
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [formData, setFormData] = useState<MemberFormData>(defaultMemberForm);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      setTeam(MOCK_TEAM as TeamMember[]);
      setLoading(false);
    };
    void run();
  }, []);

  const openCreateModal = () => {
    setEditingMemberId(null);
    setFormData(defaultMemberForm);
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      status: member.status,
      expertise: member.expertise.join(", "),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMemberId(null);
  };

  const deleteMember = (id: number) => {
    setTeam(prev => prev.filter(m => m.id !== id));
  };

  const saveMember = (e: React.FormEvent) => {
    e.preventDefault();
    closeModal();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.1),transparent_25%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.1),transparent_23%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/team" className="lg:fixed lg:bottom-4 lg:left-4 lg:top-4 lg:w-[350px]" />

        <div className="space-y-6 lg:ml-[374px]">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Organization Resources</p>
              <h2 className="font-display text-3xl font-semibold text-slate-900 flex items-center gap-3">
                 <Users2 className="h-8 w-8 text-cyan-600" /> Crew Directory
              </h2>
            </div>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-11 px-6 shadow-lg shadow-slate-900/10" onClick={openCreateModal}>
               <UserPlus className="h-4 w-4" /> Add Team Member
            </Button>
          </header>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-slate-200 bg-white/90">
                <CardContent className="p-6 space-y-4">
                   <div className="flex items-center gap-4">
                      <SkeletonBlock className="h-12 w-12 rounded-2xl" />
                      <div className="space-y-2"><SkeletonBlock className="h-4 w-32" /><SkeletonBlock className="h-3 w-20" /></div>
                   </div>
                   <SkeletonBlock className="h-20 w-full" />
                </CardContent>
              </Card>
            )) : team.map((member) => (
              <Card key={member.id} className="group relative border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all duration-300 rounded-3xl overflow-hidden">
                 <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                       <div className="flex items-center gap-4">
                          <div className="relative">
                             <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner overflow-hidden">
                                {member.image ? <img src={member.image} alt={member.name} className="h-full w-full object-cover" /> : <Users2 className="h-6 w-6" />}
                             </div>
                             <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center ${member.status === 'Active' ? 'bg-emerald-500' : member.status === 'Busy' ? 'bg-rose-500' : 'bg-slate-300'}`}>
                                {member.status === 'Active' ? <Wifi className="h-2 w-2 text-white" /> : <WifiOff className="h-2 w-2 text-white" />}
                             </div>
                          </div>
                          <div className="min-w-0">
                             <CardTitle className="text-base font-bold text-slate-900 truncate">{member.name}</CardTitle>
                             <CardDescription className="text-xs font-medium text-cyan-600 truncate">{member.role}</CardDescription>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                       </Button>
                    </div>
                 </CardHeader>
                 <CardContent className="space-y-5">
                    <div className="flex flex-wrap gap-1.5">
                       {member.expertise.map((skill, idx) => (
                          <span key={idx} className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border border-slate-100">{skill}</span>
                       ))}
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-slate-50">
                       <div className="flex items-center gap-3 text-xs text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400" /> {member.email}</div>
                       <div className="flex items-center gap-3 text-xs text-slate-600"><Phone className="h-3.5 w-3.5 text-slate-400" /> {member.phone}</div>
                    </div>

                    <div className="space-y-3">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Current Deployments</p>
                       <div className="flex flex-col gap-2">
                          {member.projects.map((proj, idx) => (
                             <div key={idx} className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                                <BriefcaseBusiness className="h-3 w-3 text-emerald-600" />
                                <span className="text-[11px] font-medium text-slate-700">{proj}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 gap-2">
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusBadge(member.status)}`}>{member.status}</span>
                       <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-100 text-slate-400 hover:text-cyan-600 rounded-full" onClick={() => openEditModal(member)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-100 text-slate-400 hover:text-rose-600 rounded-full" onClick={() => deleteMember(member.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                       </div>
                    </div>
                 </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <Card className="w-full max-w-2xl border-slate-200 bg-white shadow-2xl rounded-[32px] overflow-hidden">
             <CardHeader className="border-b border-slate-100 pb-5 pt-8 px-8 bg-slate-50/50 flex flex-row items-start justify-between">
                <div className="space-y-2">
                   <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100/50 border border-cyan-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700">
                      <UserPlus className="h-4 w-4" /> Personnel Command
                   </div>
                   <CardTitle className="text-2xl font-display">{editingMemberId ? "Modify Crew Profile" : "Onboard New Pilot"}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={closeModal}><X className="h-4 w-4" /></Button>
             </CardHeader>
             <CardContent className="p-8">
                <form onSubmit={saveMember} className="space-y-6">
                   <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Full Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-11 rounded-2xl" placeholder="Pilot Name" required /></div>
                      <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Tactical Role</Label><Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="h-11 rounded-2xl" placeholder="e.g. Lead Engineer" required /></div>
                   </div>
                   <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Comms Frequency (Email)</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-11 rounded-2xl" placeholder="email@vivagodigital.com" required /></div>
                      <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Direct Line (Phone)</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-11 rounded-2xl" placeholder="+880..." required /></div>
                   </div>
                   <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                         <Label className="text-xs font-bold uppercase text-slate-400">Deployment Status</Label>
                         <select className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/10" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as MemberStatus})}>
                            <option>Active</option><option>Away</option><option>Busy</option><option>On Break</option><option>Inactive</option>
                         </select>
                      </div>
                      <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Expertise (Comma separated)</Label><Input value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})} className="h-11 rounded-2xl" placeholder="NextJS, UI, DevOps" /></div>
                   </div>
                   <div className="flex gap-4 pt-6">
                      <Button type="submit" className="flex-1 h-12 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all">{editingMemberId ? "Confirm Modifications" : "Initiate Onboarding"}</Button>
                      <Button type="button" variant="outline" className="w-32 h-12 border-slate-200 rounded-2xl font-bold text-slate-500" onClick={closeModal}>Abort</Button>
                   </div>
                </form>
             </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
