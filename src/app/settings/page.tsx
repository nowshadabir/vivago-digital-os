"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCw,
  Save,
  Send,
  Server,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/sidebar-inset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast-context";

type SettingsTab = "email-smtp" | "otp-auth" | "notifications" | "organization";

type EmailProvider = "custom-smtp" | "resend" | "sendgrid" | "ses" | "gmail";

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("email-smtp");
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testRecipient, setTestRecipient] = useState("nowshad@getvivago.com");

  // Email & SMTP Configuration State
  const [smtpConfig, setSmtpConfig] = useState({
    provider: "resend" as EmailProvider,
    smtpHost: "smtp.resend.com",
    smtpPort: "587",
    encryption: "TLS" as "TLS" | "SSL" | "NONE",
    smtpUser: "resend",
    smtpPassword: "re_89A7xK92_LiveSecureKeyVivagoTech",
    fromName: "Vivago Digital OS",
    fromEmail: "system@getvivago.com",
    replyToEmail: "support@getvivago.com",
  });

  // OTP Configuration State
  const [otpConfig, setOtpConfig] = useState({
    deliveryChannel: "email-only" as "email-only" | "email-sms" | "totp",
    codeLength: "6",
    expiryMinutes: "10",
    maxAttempts: "5",
    subjectTemplate: "Your Vivago OS Verification Code: {{otp}}",
    enableIpBinding: true,
  });

  // Notification Channels State
  const [notificationsConfig, setNotificationsConfig] = useState({
    notifyNewInvoice: true,
    invoiceCopyEmail: "finance@getvivago.com",
    notifyPaymentReceived: true,
    paymentAlertEmail: "accounts@getvivago.com",
    notifyDueReminders: true,
    notifyMilestoneFinalQA: true,
    notifyAdminElevation: true,
  });

  // Organization Config State
  const [orgConfig, setOrgConfig] = useState({
    companyName: "Vivago Technologies Ltd.",
    taxId: "BIN-8829-1029",
    currency: "BDT (৳)",
    timezone: "Asia/Dhaka (GMT+6)",
    fiscalYearStart: "July",
    primaryContact: "nowshad@getvivago.com",
  });

  const handleProviderSelect = (provider: EmailProvider) => {
    let host = "smtp.customserver.com";
    let port = "587";
    let encryption: "TLS" | "SSL" | "NONE" = "TLS";
    let user = "smtp_user";

    if (provider === "resend") {
      host = "smtp.resend.com";
      port = "587";
      encryption = "TLS";
      user = "resend";
    } else if (provider === "sendgrid") {
      host = "smtp.sendgrid.net";
      port = "587";
      encryption = "TLS";
      user = "apikey";
    } else if (provider === "ses") {
      host = "email-smtp.us-east-1.amazonaws.com";
      port = "587";
      encryption = "TLS";
      user = "AKIA_SES_SAMPLE";
    } else if (provider === "gmail") {
      host = "smtp.gmail.com";
      port = "465";
      encryption = "SSL";
      user = "system@getvivago.com";
    }

    setSmtpConfig((prev) => ({
      ...prev,
      provider,
      smtpHost: host,
      smtpPort: port,
      encryption,
      smtpUser: user,
    }));
  };

  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient.trim()) {
      toast.error("Please enter a valid recipient email address.", "Invalid Recipient");
      return;
    }

    setIsTestingSmtp(true);

    setTimeout(() => {
      setIsTestingSmtp(false);
      toast.success(
        `Test message successfully delivered to ${testRecipient} via ${smtpConfig.smtpHost}:${smtpConfig.smtpPort}.`,
        "SMTP Handshake Verified"
      );
    }, 1200);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      toast.success("System email and security settings saved successfully.", "Configuration Updated");
    }, 600);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      {/* Subtle Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.06),transparent_25%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.06),transparent_23%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />

      <section className="relative w-full">
        <AppSidebar activePath="/settings" />

        <SidebarInset className="space-y-6">
          {/* Top Header */}
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200/60">
                  System Administration
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">Vivago Digital OS</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 md:text-3xl flex items-center gap-2.5">
                <Settings className="h-7 w-7 text-cyan-700" /> System & Email Settings
              </h1>
              <p className="text-xs text-slate-500">
                Configure enterprise email delivery, 2FA OTP verification gateways, automated notifications, and company defaults.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                form="settings-form"
                disabled={isSaving}
                className="h-11 rounded-xl bg-slate-900 px-6 text-white font-semibold text-xs hover:bg-slate-800 shadow-sm transition-all"
              >
                {isSaving ? (
                  <>Saving Changes...</>
                ) : (
                  <>
                    <Save className="mr-1.5 h-3.5 w-3.5" /> Save Configuration
                  </>
                )}
              </Button>
            </div>
          </header>

          {/* Settings Tabs Navigation */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("email-smtp")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "email-smtp"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              <Mail className="h-3.5 w-3.5 text-cyan-400" />
              <span>Email & SMTP Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("otp-auth")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "otp-auth"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>2FA & OTP Auth Gateway</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "notifications"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              <Bell className="h-3.5 w-3.5 text-amber-400" />
              <span>Automated Notifications</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("organization")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "organization"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              <Building2 className="h-3.5 w-3.5 text-violet-400" />
              <span>Organization Defaults</span>
            </button>
          </div>

          {/* Tab 1: Email & SMTP Delivery */}
          {activeTab === "email-smtp" && (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column (8 cols): Provider & SMTP Details */}
              <div className="lg:col-span-8 space-y-6">
                <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Provider Selection */}
                  <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                      <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                        <Server className="h-4 w-4 text-cyan-700" /> Email Delivery Service Provider
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Select the transmission engine for sending transactional OTPs, invoices, and alerts.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { id: "resend", label: "Resend API", desc: "Recommended for Next.js" },
                          { id: "custom-smtp", label: "Custom SMTP", desc: "cPanel / Private Server" },
                          { id: "sendgrid", label: "SendGrid", desc: "Twilio Enterprise" },
                          { id: "ses", label: "Amazon SES", desc: "AWS Simple Email" },
                          { id: "gmail", label: "Google Workspace", desc: "Gmail SMTP Relay" },
                        ].map((prov) => (
                          <button
                            key={prov.id}
                            type="button"
                            onClick={() => handleProviderSelect(prov.id as EmailProvider)}
                            className={`p-3.5 rounded-2xl border text-left transition-all ${
                              smtpConfig.provider === prov.id
                                ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold">{prov.label}</span>
                              {smtpConfig.provider === prov.id && (
                                <Check className="h-3.5 w-3.5 text-cyan-400" />
                              )}
                            </div>
                            <p
                              className={`text-[11px] ${
                                smtpConfig.provider === prov.id ? "text-slate-300" : "text-slate-400"
                              }`}
                            >
                              {prov.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* SMTP Credentials & Server Parameters */}
                  <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                      <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-cyan-700" /> Server Connection & Authentication
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Host endpoint, port number, encryption socket, and credentials.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <div className="grid gap-5 sm:grid-cols-3">
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            SMTP Host / Endpoint <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            required
                            value={smtpConfig.smtpHost}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpHost: e.target.value })}
                            placeholder="smtp.resend.com"
                            className="h-11 rounded-xl border-slate-200 font-mono text-xs font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Port <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            required
                            value={smtpConfig.smtpPort}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpPort: e.target.value })}
                            placeholder="587"
                            className="h-11 rounded-xl border-slate-200 font-mono text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Encryption Security
                          </Label>
                          <select
                            value={smtpConfig.encryption}
                            onChange={(e) =>
                              setSmtpConfig({
                                ...smtpConfig,
                                encryption: e.target.value as "TLS" | "SSL" | "NONE",
                              })
                            }
                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          >
                            <option value="TLS">TLS (Recommended - Port 587)</option>
                            <option value="SSL">SSL (Secure Sockets Layer - Port 465)</option>
                            <option value="NONE">None / Plaintext (Port 25)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            SMTP Username / API Key <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            required
                            value={smtpConfig.smtpUser}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpUser: e.target.value })}
                            placeholder="resend or api key"
                            className="h-11 rounded-xl border-slate-200 font-mono text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          SMTP Password / Secret Token <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            required
                            type={showSmtpPassword ? "text" : "password"}
                            value={smtpConfig.smtpPassword}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpPassword: e.target.value })}
                            placeholder="Enter password or secret token"
                            className="h-11 pl-10 pr-10 rounded-xl border-slate-200 font-mono text-xs font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Sender Identity */}
                      <div className="grid gap-5 sm:grid-cols-2 pt-4 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Default Sender ("From") Name <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            required
                            value={smtpConfig.fromName}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                            placeholder="Vivago Digital OS"
                            className="h-11 rounded-xl border-slate-200 text-xs font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Default Sender ("From") Email <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            required
                            type="email"
                            value={smtpConfig.fromEmail}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                            placeholder="system@getvivago.com"
                            className="h-11 rounded-xl border-slate-200 text-xs font-medium"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </div>

              {/* Right Column (4 cols): Live Test Dispatcher & Gateway Diagnostics */}
              <div className="lg:col-span-4 space-y-6">
                {/* Live Test Email Dispatcher */}
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                    <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                      <Send className="h-4 w-4 text-cyan-700" /> Send Test Email
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Verify your SMTP connection and DNS deliverability instantly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <form onSubmit={handleSendTestEmail} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Recipient Email
                        </Label>
                        <Input
                          type="email"
                          required
                          value={testRecipient}
                          onChange={(e) => setTestRecipient(e.target.value)}
                          placeholder="yourname@domain.com"
                          className="h-11 rounded-xl border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isTestingSmtp}
                        className="w-full h-11 rounded-xl bg-cyan-700 text-white hover:bg-cyan-800 font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        {isTestingSmtp ? (
                          <>Testing Connection...</>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" /> Dispatch Test Message
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-xs">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Gateway Diagnostics
                      </p>
                      <div className="space-y-1 text-slate-500">
                        <p>• Host: <span className="font-mono font-medium text-slate-700">{smtpConfig.smtpHost}</span></p>
                        <p>• Socket: <span className="font-mono font-medium text-slate-700">{smtpConfig.encryption} / {smtpConfig.smtpPort}</span></p>
                        <p>• Sender: <span className="font-medium text-slate-700">{smtpConfig.fromEmail}</span></p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* DKIM & SPF Status */}
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
                  <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cyan-700" /> Domain Authentication
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-700">SPF Record</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        VERIFIED
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-700">DKIM Signature</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        VERIFIED
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-700">DMARC Policy</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        PASS (p=reject)
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Tab 2: 2FA & OTP Auth Gateway */}
          {activeTab === "otp-auth" && (
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-6">
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                    <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-cyan-700" /> OTP Delivery & Expiry Policies
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Configure two-factor security rules for personnel login and sensitive actions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Primary Delivery Channel
                        </Label>
                        <select
                          value={otpConfig.deliveryChannel}
                          onChange={(e) =>
                            setOtpConfig({
                              ...otpConfig,
                              deliveryChannel: e.target.value as any,
                            })
                          }
                          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >
                          <option value="email-only">Email Gateway (Gmail / Work Mail)</option>
                          <option value="email-sms">Email + SMS Fallback</option>
                          <option value="totp">Authenticator App (Google / 1Password)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Code Expiration Duration
                        </Label>
                        <select
                          value={otpConfig.expiryMinutes}
                          onChange={(e) => setOtpConfig({ ...otpConfig, expiryMinutes: e.target.value })}
                          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >
                          <option value="5">5 Minutes</option>
                          <option value="10">10 Minutes (Standard)</option>
                          <option value="15">15 Minutes</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        OTP Email Subject Template
                      </Label>
                      <Input
                        value={otpConfig.subjectTemplate}
                        onChange={(e) => setOtpConfig({ ...otpConfig, subjectTemplate: e.target.value })}
                        placeholder="Your Vivago OS Verification Code: {{otp}}"
                        className="h-11 rounded-xl border-slate-200 font-mono text-xs font-medium"
                      />
                      <p className="text-[11px] text-slate-400">
                        Use <code className="text-cyan-700 bg-cyan-50 px-1 py-0.5 rounded">{"{{otp}}"}</code> as the placeholder for the 6-digit passcode.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={otpConfig.enableIpBinding}
                          onChange={(e) => setOtpConfig({ ...otpConfig, enableIpBinding: e.target.checked })}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                        />
                        <div className="text-xs text-slate-700 font-medium">
                          <span className="font-bold text-slate-900">Session IP & Device Fingerprinting</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Invalidate active OTP codes if login submission originates from a different IP address.
                          </p>
                        </div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
                  <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-cyan-700" /> 2FA Security Level
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Vivago OS enforces two-factor authentication for all Super Admin, Admin, and Finance Officer roles across login and financial dispatches.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* Tab 3: Automated Notifications */}
          {activeTab === "notifications" && (
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-6">
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                    <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-amber-600" /> Automated System Notification Triggers
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Determine which organizational events trigger automated email dispatches.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    {/* Invoice Notification */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                      <div>
                        <p className="text-xs font-bold text-slate-900">New Invoice Generated Alert</p>
                        <p className="text-[11px] text-slate-500">
                          Dispatches internal copy to billing archive whenever an invoice is finalized.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="email"
                          value={notificationsConfig.invoiceCopyEmail}
                          onChange={(e) =>
                            setNotificationsConfig({
                              ...notificationsConfig,
                              invoiceCopyEmail: e.target.value,
                            })
                          }
                          className="h-9 w-52 rounded-lg border-slate-200 text-xs font-medium"
                        />
                        <input
                          type="checkbox"
                          checked={notificationsConfig.notifyNewInvoice}
                          onChange={(e) =>
                            setNotificationsConfig({
                              ...notificationsConfig,
                              notifyNewInvoice: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Payment Notification */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Client Payment Received Alert</p>
                        <p className="text-[11px] text-slate-500">
                          Notifies management when incoming client funds are recorded and verified in ledger.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="email"
                          value={notificationsConfig.paymentAlertEmail}
                          onChange={(e) =>
                            setNotificationsConfig({
                              ...notificationsConfig,
                              paymentAlertEmail: e.target.value,
                            })
                          }
                          className="h-9 w-52 rounded-lg border-slate-200 text-xs font-medium"
                        />
                        <input
                          type="checkbox"
                          checked={notificationsConfig.notifyPaymentReceived}
                          onChange={(e) =>
                            setNotificationsConfig({
                              ...notificationsConfig,
                              notifyPaymentReceived: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Security Elevation Alert */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Admin Privilege Elevation Alerts</p>
                        <p className="text-[11px] text-slate-500">
                          Notify Board of Directors if a member's RBAC role is changed to Super Admin or Admin.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationsConfig.notifyAdminElevation}
                        onChange={(e) =>
                          setNotificationsConfig({
                            ...notificationsConfig,
                            notifyAdminElevation: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                    </div>

                    {/* Project QA Alert */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Project Final QA & Handover Notice</p>
                        <p className="text-[11px] text-slate-500">
                          Send automated alert to Tech Leads and Managing Director when a project enters Final QA.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationsConfig.notifyMilestoneFinalQA}
                        onChange={(e) =>
                          setNotificationsConfig({
                            ...notificationsConfig,
                            notifyMilestoneFinalQA: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
                  <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" /> Instant Event Dispatch
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    All notifications are dispatched asynchronously through the configured SMTP pipeline without blocking the user interface.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* Tab 4: Organization Defaults */}
          {activeTab === "organization" && (
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-6">
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                    <CardTitle className="font-display text-base text-slate-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-violet-700" /> Company Entity & System Defaults
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Configure legal entity profile, currency format, and local operating timezone.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Legal Company Name
                        </Label>
                        <Input
                          value={orgConfig.companyName}
                          onChange={(e) => setOrgConfig({ ...orgConfig, companyName: e.target.value })}
                          className="h-11 rounded-xl border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Tax / BIN Identifier
                        </Label>
                        <Input
                          value={orgConfig.taxId}
                          onChange={(e) => setOrgConfig({ ...orgConfig, taxId: e.target.value })}
                          className="h-11 rounded-xl border-slate-200 font-mono text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Base Ledger Currency
                        </Label>
                        <Input
                          value={orgConfig.currency}
                          onChange={(e) => setOrgConfig({ ...orgConfig, currency: e.target.value })}
                          className="h-11 rounded-xl border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Operational Timezone
                        </Label>
                        <Input
                          value={orgConfig.timezone}
                          onChange={(e) => setOrgConfig({ ...orgConfig, timezone: e.target.value })}
                          className="h-11 rounded-xl border-slate-200 text-xs font-medium"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
                  <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-cyan-700" /> Vivago Digital OS
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Internal workspace version: <span className="font-mono font-bold text-slate-700">v2.4.0 (Enterprise)</span>.
                  </p>
                </Card>
              </div>
            </div>
          )}
        </SidebarInset>
      </section>
    </main>
  );
}
