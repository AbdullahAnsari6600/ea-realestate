
import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  FileEdit,
  Home,
} from "lucide-react";

import {
  getCurrentAdmin,
  AdminAuthError,
  type Admin,
} from "@/services/adminAuthService";

import {
  getAdminPropertyDashboardStats,
  AdminPropertyError,
  type AdminPropertyDashboardStats,
} from "@/services/adminPropertyService";

import AdminLayout from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | EA Real Estate Group" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [status, setStatus] = useState<"checking" | "ready" | "error">(
    "checking"
  );
  const [error, setError] = useState("");

  const [stats, setStats] = useState<AdminPropertyDashboardStats | null>(
    null
  );
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError("");

    try {
      const result = await getAdminPropertyDashboardStats();
      setStats(result);
    } catch (err) {
      if (err instanceof AdminPropertyError && err.status === 401) {
        window.location.replace("/admin/login");
        return;
      }

      setStatsError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard statistics."
      );
    } finally {
      setStatsLoading(false);
    }
  }, []);

  async function verifySession() {
    setStatus("checking");
    setError("");

    try {
      const currentAdmin = await getCurrentAdmin();
      setAdmin(currentAdmin);
      setStatus("ready");
    } catch (err) {
      if (err instanceof AdminAuthError && err.status === 401) {
        window.location.replace("/admin/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Unable to verify your admin session."
      );
      setStatus("error");
    }
  }

  useEffect(() => {
    void verifySession();
  }, []);

  useEffect(() => {
    if (status === "ready" && admin) {
      void loadStats();
    }
  }, [status, admin, loadStats]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D17] text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-[#C5A46D] border-t-transparent" />
          <p className="text-sm tracking-wide text-white/60">
            Verifying secure admin session...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D17] px-5 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-8 text-center">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[#C5A46D]" />

          <h1 className="text-xl font-semibold">
            Session verification failed
          </h1>

          <p className="mt-3 text-sm text-white/55">{error}</p>

          <button
            onClick={() => void verifySession()}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C5A46D] px-5 py-3 text-sm font-semibold text-[#080D17] transition hover:bg-[#D6B987]"
          >
            <RefreshCw size={16} />
            Try again
          </button>

          <button
            onClick={() => window.location.replace("/admin/login")}
            className="mt-3 block w-full text-sm text-white/50 hover:text-white"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  const dashboardCards = [
    {
      label: "Total Properties",
      value: stats?.totalProperties,
      icon: Building2,
      description: "All active database records",
    },
    {
      label: "Published Listings",
      value: stats?.publishedProperties,
      icon: LayoutDashboard,
      description: "Published properties",
    },
    {
      label: "Draft Properties",
      value: stats?.draftProperties,
      icon: FileEdit,
      description: "Unpublished properties",
    },
    {
      label: "Available Properties",
      value: stats?.availableProperties,
      icon: Home,
      description: "Available for buyers and renters",
    },
  ];

  return (
    <AdminLayout admin={admin} title="Overview">
      <div className="px-5 py-9 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-[#C5A46D]">
              ADMINISTRATION
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back.
            </h1>

            <p className="mt-3 text-sm text-white/45">
              Manage your real estate platform from one central workspace.
            </p>
          </div>

          <button
            onClick={() => void loadStats()}
            disabled={statsLoading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 transition hover:border-[#C5A46D]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={15}
              className={statsLoading ? "animate-spin" : ""}
            />
            Refresh statistics
          </button>
        </div>

        {statsError && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-red-300">
                Unable to load dashboard statistics
              </p>
              <p className="mt-1 text-xs text-red-200/60">{statsError}</p>
            </div>

            <button
              onClick={() => void loadStats()}
              disabled={statsLoading}
              className="inline-flex items-center gap-2 self-start text-sm text-[#C5A46D] hover:text-[#D6B987] disabled:opacity-50"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-[#111827] p-6 transition hover:border-[#C5A46D]/30"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/45">{item.label}</p>
                  <Icon size={19} className="text-[#C5A46D]" />
                </div>

                <p className="mt-7 text-3xl font-semibold tabular-nums text-white">
                  {statsLoading && !stats ? (
                    <span className="inline-block h-8 w-12 animate-pulse rounded bg-white/10" />
                  ) : stats ? (
                    item.value ?? 0
                  ) : (
                    "—"
                  )}
                </p>

                <p className="mt-2 text-[11px] text-white/35">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-white/10 bg-[#111827] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[#C5A46D]/10 p-3">
              <ShieldCheck className="h-6 w-6 text-[#C5A46D]" />
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold">
                Your admin workspace is ready
                <CheckCircle2 size={16} className="text-emerald-400" />
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                Your administrator session is verified by the backend.
                Property statistics are now connected directly to your
                database and reflect the latest property records.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] tracking-wide text-white/25">
          © {new Date().getFullYear()} EA Real Estate Group™. All rights reserved.
        </p>
      </div>
    </AdminLayout>
  );
}
