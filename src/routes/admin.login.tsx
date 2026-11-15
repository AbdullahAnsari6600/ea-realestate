
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  adminLogin,
  AdminAuthError,
} from "@/services/adminAuthService";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login | EA Real Estate Group™" },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("admin@earealestategroup.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await adminLogin(email.trim(), password);

      // Navigate after the backend successfully creates the session.
      window.location.assign("/admin");
    } catch (err) {
      if (err instanceof AdminAuthError) {
        setError(err.message);
      } else {
        setError("Unable to sign in. Please try again.");
      }

      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101827] px-5 py-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-[#1E3A8A]/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-[#B99A61]/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[460px]"
      >
        {/* Brand */}
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center border border-[#B99A61]/70 font-display text-2xl text-[#B99A61]">
              EA
            </span>

            <span className="text-left leading-tight">
              <span className="block font-display text-xl text-[#F5F1E9]">
                Early Approve
              </span>
              <span className="block text-[9px] uppercase tracking-[0.25em] text-[#B99A61]">
                Real Estate Group™
              </span>
            </span>
          </Link>
        </div>

        {/* Login card */}
        <div className="border border-white/10 bg-[#172235]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">

          {/* Back navigation and security label */}
          <div className="mb-7 flex items-center justify-between">
            <Link
              to="/"
              aria-label="Back to main website"
              title="Back to main website"
              className="inline-flex h-9 w-9 items-center justify-center border border-white/10 text-white/55 transition-all duration-300 hover:border-[#B99A61]/60 hover:bg-[#B99A61]/10 hover:text-[#B99A61]"
            >
              <ArrowLeft size={17} strokeWidth={1.6} />
            </Link>

            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B99A61]">
              <LockKeyhole size={14} strokeWidth={1.5} />
              Secure Administration
            </div>
          </div>

          {/* Login heading */}
          <div className="mb-5">
            <h1 className="font-display text-4xl text-[#F5F1E9]">
              Welcome Back
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Sign in to access your EA Real Estate Group administration
              dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-xs font-semibold text-white/75"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B99A61]/70"
                />

                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                  className="h-12 w-full border border-white/10 bg-[#101827] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B99A61]/70 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-xs font-semibold text-white/75"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B99A61]/70"
                />

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="h-12 w-full border border-white/10 bg-[#101827] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B99A61]/70 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-[#B99A61]"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 bg-[#B99A61] text-xs font-bold uppercase tracking-[0.16em] text-[#101827] transition duration-300 hover:bg-[#D5BC8C] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ShieldCheck size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security notice */}
          <div className="mt-7 flex items-center justify-center gap-2 border-t border-white/10 pt-6 text-[10px] text-white/35">
            <LockKeyhole size={12} />
            Restricted access · Authorised administrator only
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-5 text-center text-[9px] tracking-[0.2em] text-white/20">
          © {new Date().getFullYear()} EARLY APPROVE REAL ESTATE GROUP™
        </p>
      </motion.div>
    </main>
  );
}
