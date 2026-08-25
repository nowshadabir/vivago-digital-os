"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [loginStep, setLoginStep] = useState<"credentials" | "otp">("credentials");
  const [loginEmail, setLoginEmail] = useState("nowshad@getvivago.com");
  const [otp, setOtp] = useState("");

  function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    if (email) setLoginEmail(email);
    setLoginStep("otp");
  }

  function handleLoginOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.assign("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Dynamic Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.08),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.06),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left Column: Brand & Security Guarantee */}
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-slate-700 shadow-xs backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Vivago Digital OS • Internal Workspace</span>
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
                Company Operations & CRM Platform.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                Authorized access for Vivago Technologies personnel. Sign in with your verified company credentials to access client pipelines, invoices, cash ledgers, and project vaults.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 shadow-xs backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold font-display text-sm">
                  <ShieldCheck className="h-4 w-4 text-cyan-700" />
                  <span>Two-Step Verification</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enterprise 2FA OTP confirmation ensures hardened authentication for financial and credential vaults.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 shadow-xs backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold font-display text-sm">
                  <KeyRound className="h-4 w-4 text-emerald-600" />
                  <span>Role-Based Access (RBAC)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Permissions and modules are managed centrally by the Board of Directors & Operations Leads.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <Card className="rounded-3xl border border-slate-200/90 bg-white/90 shadow-xl backdrop-blur-xl p-2 sm:p-4">
            <CardHeader className="space-y-2 pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-xl font-bold text-slate-900">
                  {loginStep === "credentials" ? "Employee Sign In" : "Two-Factor Verification"}
                </CardTitle>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                  Internal SSO
                </span>
              </div>
              <CardDescription className="text-xs text-slate-500">
                {loginStep === "credentials"
                  ? "Enter your company email and password to receive a one-time passcode."
                  : `Enter the 6-digit code sent to ${loginEmail}.`}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {loginStep === "credentials" ? (
                <form className="space-y-5" onSubmit={handleLoginSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Work Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        defaultValue="nowshad@getvivago.com"
                        placeholder="yourname@getvivago.com"
                        className="h-11 pl-10 rounded-xl border-slate-200 font-medium text-xs text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Password
                      </Label>
                    </div>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        defaultValue="••••••••••••"
                        placeholder="Enter your security password"
                        className="h-11 pl-10 rounded-xl border-slate-200 font-medium text-xs text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <Button className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 shadow-md transition-all flex items-center justify-center gap-2" size="lg" type="submit">
                    Send Verification Code
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center text-xs text-slate-500 leading-relaxed">
                    Need account access or password reset? <br />
                    <span className="font-semibold text-slate-700">Contact IT Operations & HR Administration</span>
                  </div>
                </form>
              ) : (
                <form className="space-y-5" onSubmit={handleLoginOtpSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="login-otp" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      6-Digit Security OTP
                    </Label>
                    <Input
                      id="login-otp"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      placeholder="e.g. 582914"
                      inputMode="numeric"
                      maxLength={6}
                      className="h-12 rounded-xl border-slate-200 font-mono text-center text-lg tracking-[0.3em] font-bold text-slate-900"
                      required
                    />
                    <p className="text-[11px] text-slate-400 text-center">
                      Security code dispatched to <span className="font-semibold text-slate-600">{loginEmail}</span>
                    </p>
                  </div>

                  <Button className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 shadow-md transition-all flex items-center justify-center gap-2" size="lg" type="submit">
                    Verify & Enter Workspace
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <p className="text-center text-xs text-slate-400 italic">
                    Prototype demo: Any 6 digits will authorize your sign-in.
                  </p>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStep("credentials");
                        setOtp("");
                      }}
                      className="text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                    >
                      ← Back to credential entry
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}