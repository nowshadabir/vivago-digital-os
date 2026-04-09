"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ImageUp,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
  AtSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [selectedImage, setSelectedImage] = useState("");
  const [loginStep, setLoginStep] = useState<"credentials" | "otp">("credentials");
  const [signupStep, setSignupStep] = useState<"credentials" | "otp">("credentials");
  const [loginEmail, setLoginEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [otp, setOtp] = useState("");

  function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    setLoginEmail(email);
    setLoginStep("otp");
  }

  function handleLoginOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.assign("/dashboard");
  }

  function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    setSignupEmail(email);
    setSignupStep("otp");
  }

  function handleSignupOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.assign("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-hero-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-sky-400/15 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-slate-950" />
              Secure workspace access
            </div>

            <div className="space-y-5">
              <h1 className="font-display text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl">
                {mode === "login" ? "Login to continue." : "Create your account."}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                {mode === "login"
                  ? "Sign in with your email and password, then confirm the one-time code sent to Gmail."
                  : "Fill in your details and confirm the Gmail OTP before your account is created."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur">
                <h2 className="font-display text-base font-semibold text-slate-950">
                  {mode === "login" ? "Two-step sign in" : "Verified signup"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {mode === "login"
                    ? "Password plus OTP adds an extra layer before access is granted."
                    : "Account creation only completes after the code is confirmed."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur">
                <h2 className="font-display text-base font-semibold text-slate-950">UI Prototype</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This is a UI-only prototype. You can use any credentials to "log in" and explore the app.
                </p>
              </div>
            </div>
          </div>

          <Card className="border-slate-200/70 shadow-2xl shadow-slate-950/10">
            <CardHeader className="space-y-3">
              <CardTitle>{mode === "login" ? "Welcome back" : "Create account"}</CardTitle>
              <CardDescription>
                {mode === "login"
                  ? loginStep === "credentials"
                    ? "Enter your credentials to receive a verification code."
                    : "Check Gmail and enter the code to finish logging in."
                  : signupStep === "credentials"
                    ? "Enter your details to receive a verification code."
                    : "Check Gmail and enter the code to finish creating your account."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {mode === "login" ? (
                loginStep === "credentials" ? (
                  <form className="space-y-5" onSubmit={handleLoginSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input id="login-email" name="email" type="email" placeholder="you@example.com" className="pl-10" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input id="login-password" name="password" type="password" placeholder="Enter your password" className="pl-10" required />
                      </div>
                    </div>

                    <Button className="w-full shadow-lg shadow-slate-950/10" size="lg" type="submit">
                      Send OTP
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      No account yet?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signup");
                          setLoginStep("credentials");
                          setSignupStep("credentials");
                        }}
                        className="font-semibold text-slate-950 hover:underline"
                      >
                        Create one
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className="space-y-5" onSubmit={handleLoginOtpSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="login-otp">Verification Code</Label>
                      <Input
                        id="login-otp"
                        value={otp}
                        onChange={(event) => setOtp(event.target.value)}
                        placeholder="Any 6 digits will work"
                        inputMode="numeric"
                        maxLength={6}
                        required
                      />
                      <p className="text-xs text-slate-500">Sent to {loginEmail || "your email"}.</p>
                    </div>

                    <Button className="w-full shadow-lg shadow-slate-950/10" size="lg" type="submit">
                      Verify OTP
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                    <p className="text-sm text-slate-600 italic">Hint: Since this is a prototype, any code will work.</p>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginStep("credentials");
                          setOtp("");
                        }}
                        className="font-semibold text-slate-950 hover:underline"
                      >
                        Back to login details
                      </button>
                    </div>
                  </form>
                )
              ) : signupStep === "credentials" ? (
                <form className="space-y-5" onSubmit={handleSignupSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input id="name" name="name" type="text" placeholder="Full name" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <div className="relative">
                      <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input id="position" name="position" type="text" placeholder="Operations Manager" className="pl-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input id="username" name="username" type="text" placeholder="unique-handle" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input id="password" name="password" type="password" placeholder="Create a password" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <div className="relative">
                      <BadgeCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        id="role"
                        name="role"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-950 shadow-sm outline-none transition-colors focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                        defaultValue="USER"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Profile image</Label>
                    <div className="relative">
                      <ImageUp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={(event) => setSelectedImage(event.target.files?.[0]?.name ?? "")}
                        className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white pl-10 pr-3 pt-2.5 text-sm text-slate-700 shadow-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                      />
                    </div>
                    {selectedImage ? <p className="text-xs text-slate-500">Selected: {selectedImage}</p> : null}
                  </div>

                  <Button className="w-full shadow-lg shadow-slate-950/10" size="lg" type="submit">
                    Send OTP
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setLoginStep("credentials");
                        setSignupStep("credentials");
                      }}
                      className="font-semibold text-slate-950 hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              ) : (
                <form className="space-y-5" onSubmit={handleSignupOtpSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="signup-otp">Verification Code</Label>
                    <Input
                      id="signup-otp"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      placeholder="Any 6 digits will work"
                      inputMode="numeric"
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-slate-500">Sent to {signupEmail || "your email"}.</p>
                  </div>

                  <Button className="w-full shadow-lg shadow-slate-950/10" size="lg" type="submit">
                    Verify OTP
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <p className="text-sm text-slate-600 italic">Hint: Since this is a prototype, any code will work.</p>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <button
                      type="button"
                      onClick={() => {
                        setSignupStep("credentials");
                        setOtp("");
                      }}
                      className="font-semibold text-slate-950 hover:underline"
                    >
                      Back to signup details
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