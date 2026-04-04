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
  const [loginError, setLoginError] = useState("");
  const [signupMessage, setSignupMessage] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loginChallengeId, setLoginChallengeId] = useState<number | null>(null);
  const [signupChallengeId, setSignupChallengeId] = useState<number | null>(null);
  const [loginOtp, setLoginOtp] = useState("");
  const [signupOtp, setSignupOtp] = useState("");
  const [loginOtpMessage, setLoginOtpMessage] = useState("");
  const [signupOtpMessage, setSignupOtpMessage] = useState("");
  const [loginStep, setLoginStep] = useState<"credentials" | "otp">("credentials");
  const [signupStep, setSignupStep] = useState<"credentials" | "otp">("credentials");
  const [loginEmail, setLoginEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setLoginOtpMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { ok?: boolean; otpRequired?: boolean; challengeId?: number; email?: string; message?: string };

      if (!response.ok) {
        setLoginError(data.message ?? "Login failed.");
        return;
      }

      if (data.otpRequired && data.challengeId) {
        setLoginChallengeId(data.challengeId);
        setLoginEmail(data.email ?? email);
        setLoginStep("otp");
        setLoginOtpMessage(`We sent a 6-digit code to ${data.email ?? email}.`);
        return;
      }

      window.location.assign("/dashboard");
    } catch {
      setLoginError("Could not connect to login service.");
    }
  }

  async function handleLoginOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    if (!loginChallengeId) {
      setLoginError("Missing login challenge.");
      return;
    }

    try {
      const response = await fetch("/api/auth/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ challengeId: loginChallengeId, code: loginOtp }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setLoginError(data.message ?? "OTP verification failed.");
        return;
      }

      window.location.assign("/dashboard");
    } catch {
      setLoginError("Could not verify OTP.");
    }
  }

  async function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupMessage("");
    setSignupError("");
    setSignupOtpMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { ok?: boolean; otpRequired?: boolean; challengeId?: number; email?: string; message?: string };

      if (!response.ok) {
        setSignupError(data.message ?? "Signup failed.");
        return;
      }

      if (data.otpRequired && data.challengeId) {
        setSignupChallengeId(data.challengeId);
        setSignupEmail(data.email ?? "");
        setSignupStep("otp");
        setSignupOtpMessage(`We sent a 6-digit code to ${data.email ?? "your email"}.`);
        return;
      }

      setSignupMessage("Account created. You can log in now.");
      setMode("login");
      setSelectedImage("");
      event.currentTarget.reset();
    } catch {
      setSignupError("Could not connect to signup service.");
    }
  }

  async function handleSignupOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupError("");

    if (!signupChallengeId) {
      setSignupError("Missing signup challenge.");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ challengeId: signupChallengeId, code: signupOtp }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setSignupError(data.message ?? "OTP verification failed.");
        return;
      }

      window.location.assign("/dashboard");
    } catch {
      setSignupError("Could not verify OTP.");
    }
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
                <h2 className="font-display text-base font-semibold text-slate-950">MySQL ready</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  OTP challenges are stored in the database with expiry and attempt tracking.
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

                    {loginError ? <p className="text-sm text-rose-600">{loginError}</p> : null}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      No account yet?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setSignupError("");
                          setSignupMessage("");
                          setMode("signup");
                          setLoginStep("credentials");
                          setSignupStep("credentials");
                          setLoginChallengeId(null);
                          setSignupChallengeId(null);
                        }}
                        className="font-semibold text-slate-950 hover:underline"
                      >
                        Create one
                      </button>
                    </div>

                    {signupMessage ? <p className="text-sm text-emerald-700">{signupMessage}</p> : null}
                  </form>
                ) : (
                  <form className="space-y-5" onSubmit={handleLoginOtpSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="login-otp">Verification Code</Label>
                      <Input
                        id="login-otp"
                        value={loginOtp}
                        onChange={(event) => setLoginOtp(event.target.value)}
                        placeholder="6-digit code"
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

                    {loginOtpMessage ? <p className="text-sm text-slate-600">{loginOtpMessage}</p> : null}
                    {loginError ? <p className="text-sm text-rose-600">{loginError}</p> : null}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginStep("credentials");
                          setLoginOtp("");
                          setLoginChallengeId(null);
                          setLoginOtpMessage("");
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

                  {signupError ? <p className="text-sm text-rose-600">{signupError}</p> : null}

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setSignupError("");
                        setSignupMessage("");
                        setMode("login");
                        setLoginStep("credentials");
                        setSignupStep("credentials");
                        setLoginChallengeId(null);
                        setSignupChallengeId(null);
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
                      value={signupOtp}
                      onChange={(event) => setSignupOtp(event.target.value)}
                      placeholder="6-digit code"
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

                  {signupOtpMessage ? <p className="text-sm text-slate-600">{signupOtpMessage}</p> : null}
                  {signupError ? <p className="text-sm text-rose-600">{signupError}</p> : null}

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <button
                      type="button"
                      onClick={() => {
                        setSignupStep("credentials");
                        setSignupOtp("");
                        setSignupChallengeId(null);
                        setSignupOtpMessage("");
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