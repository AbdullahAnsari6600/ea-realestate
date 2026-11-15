
import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  MessageSquare,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Trash2,
  Save,
  Mail,
  Phone,
  CalendarDays,
  Building2,
} from "lucide-react";

import {
  getCurrentAdmin,
  AdminAuthError,
  type Admin,
} from "@/services/adminAuthService";

import AdminLayout from "@/components/admin/AdminLayout";

import {
  listAdminEnquiries,
  getAdminEnquiryById,
  updateAdminEnquiry,
  deleteAdminEnquiry,
  getAdminEnquiryStats,
  AdminEnquiryError,
  type AdminEnquiry,
  type EnquiryStatus,
  type EnquiryStats,
} from "@/services/adminEnquiryService";

export const Route = createFileRoute("/admin/enquiries")({
  head: () => ({
    meta: [
      { title: "Enquiries | EA Real Estate Administration" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEnquiriesPage,
});

const statusOptions: {
  label: string;
  value: EnquiryStatus | "ALL";
}[] = [
  { label: "All statuses", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Closed", value: "CLOSED" },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StatusBadge({ value }: { value: EnquiryStatus }) {
  const styles: Record<EnquiryStatus, string> = {
    NEW: "bg-blue-400/10 text-blue-300",
    CONTACTED: "bg-amber-400/10 text-amber-300",
    QUALIFIED: "bg-emerald-400/10 text-emerald-300",
    CLOSED: "bg-white/10 text-white/50",
  };

  const labels: Record<EnquiryStatus, string> = {
    NEW: "New",
    CONTACTED: "Contacted",
    QUALIFIED: "Qualified",
    CLOSED: "Closed",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[value]}`}
    >
      {labels[value]}
    </span>
  );
}

function EnquiryDetailsModal({
  enquiry,
  onClose,
  onUpdated,
  onDeleted,
}: {
  enquiry: AdminEnquiry;
  onClose: () => void;
  onUpdated: (enquiry: AdminEnquiry) => void;
  onDeleted: (id: string) => void;
}) {
  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status);
  const [adminNotes, setAdminNotes] = useState(enquiry.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const updated = await updateAdminEnquiry(enquiry.id, {
        status,
        adminNotes,
      });

      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update enquiry."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete the viewing request from ${enquiry.fullName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteAdminEnquiry(enquiry.id);
      onDeleted(enquiry.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete enquiry."
      );
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#C5A46D]">
              VIEWING REQUEST DETAILS
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {enquiry.fullName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close viewing request details"
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-purple-400/10 px-2.5 py-1 text-[10px] font-semibold text-purple-300">
              Property Viewing
            </span>

            <StatusBadge value={enquiry.status} />

            <span className="text-xs text-white/35">
              Received {formatDateTime(enquiry.createdAt)}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#080D17] p-4">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Mail size={14} />
                Email address
              </div>

              <a
                href={`mailto:${enquiry.email}`}
                className="mt-2 block break-all text-sm text-[#D8BB8B] hover:underline"
              >
                {enquiry.email}
              </a>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#080D17] p-4">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Phone size={14} />
                Phone number
              </div>

              <a
                href={`tel:${enquiry.phone}`}
                className="mt-2 block text-sm text-[#D8BB8B] hover:underline"
              >
                {enquiry.phone}
              </a>
            </div>
          </div>

          {enquiry.property && (
            <div className="rounded-xl border border-white/10 bg-[#080D17] p-4">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Building2 size={14} />
                Requested property
              </div>

              <p className="mt-2 text-sm font-medium text-white">
                {enquiry.property.name}
              </p>

              <p className="mt-1 text-xs text-white/45">
                {enquiry.property.location}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-[#080D17] p-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <CalendarDays size={14} />
              Requested viewing schedule
            </div>

            <p className="mt-2 text-sm text-white">
              {formatDate(enquiry.preferredDate)}
              {enquiry.preferredTime
                ? ` · ${enquiry.preferredTime}`
                : ""}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-white/50">
              CUSTOMER MESSAGE
            </p>

            <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-[#080D17] p-4 text-sm leading-6 text-white/75">
              {enquiry.message || "No message provided."}
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <h3 className="mb-4 text-sm font-semibold text-white">
              Manage viewing request
            </h3>

            <label className="mb-2 block text-xs text-white/45">
              Request status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as EnquiryStatus)
              }
              className="w-full rounded-lg border border-white/10 bg-[#080D17] px-4 py-3 text-sm text-white outline-none focus:border-[#C5A46D]/50"
            >
              {statusOptions
                .filter((item) => item.value !== "ALL")
                .map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
            </select>

            <label className="mb-2 mt-5 block text-xs text-white/45">
              Internal admin notes
            </label>

            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="Add internal notes about follow-ups or customer discussions..."
              className="w-full resize-y rounded-lg border border-white/10 bg-[#080D17] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C5A46D]/50"
            />

            <p className="mt-1 text-right text-[10px] text-white/30">
              {adminNotes.length}/5000
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-5">
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting || saving}
            className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-4 py-2.5 text-xs font-medium text-red-300 transition hover:bg-red-400/10 disabled:opacity-40"
          >
            <Trash2 size={15} />
            {deleting ? "Deleting..." : "Delete request"}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2.5 text-xs text-white/60 transition hover:bg-white/5"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C5A46D] px-5 py-2.5 text-xs font-semibold text-[#080D17] transition hover:bg-[#D8BB8B] disabled:opacity-40"
            >
              <Save size={15} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminEnquiriesPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);

  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const [stats, setStats] = useState<EnquiryStats | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EnquiryStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedEnquiry, setSelectedEnquiry] =
    useState<AdminEnquiry | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        const currentAdmin = await getCurrentAdmin();

        if (active) setAdmin(currentAdmin);
      } catch (err) {
        if (!active) return;

        if (err instanceof AdminAuthError && err.status === 401) {
          window.location.replace("/admin/login");
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify administrator session."
        );
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    void verifySession();

    return () => {
      active = false;
    };
  }, []);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listAdminEnquiries({
        page,
        limit: 10,
        search: search.trim() || undefined,
        type: "VIEWING",
        status,
        sort: "newest",
      });

      setEnquiries(result.enquiries);
      setPagination(result.pagination);
    } catch (err) {
      setError(
        err instanceof AdminEnquiryError
          ? err.message
          : "Unable to load viewing requests."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  const loadStats = useCallback(async () => {
    try {
      const result = await getAdminEnquiryStats();
      setStats(result);
    } catch (err) {
      console.error("Unable to load enquiry statistics:", err);
    }
  }, []);

  useEffect(() => {
    if (!admin) return;

    void loadEnquiries();
    void loadStats();
  }, [admin, loadEnquiries, loadStats]);

  async function openEnquiry(id: string) {
    setDetailLoading(true);
    setError("");

    try {
      const result = await getAdminEnquiryById(id);
      setSelectedEnquiry(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load viewing request details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleUpdated() {
    await Promise.all([loadEnquiries(), loadStats()]);
  }

  async function handleDeleted(id: string) {
    setSelectedEnquiry(null);

    setEnquiries((current) =>
      current.filter((enquiry) => enquiry.id !== id)
    );

    await Promise.all([loadEnquiries(), loadStats()]);
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D17] text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-[#C5A46D] border-t-transparent" />
          <p className="text-sm text-white/55">
            Verifying secure admin session...
          </p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D17] px-5 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">
            Unable to verify session
          </h1>

          <p className="mt-3 text-sm text-white/50">
            {error || "Redirecting to administrator login..."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-[#C5A46D] px-5 py-3 text-sm font-semibold text-[#080D17]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Viewing Requests",
      value: stats?.viewingEnquiries,
      description: "Total property viewing requests",
    },
  ];

  return (
    <AdminLayout admin={admin} title="Enquiries">
      <div className="px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-8">
            <p className="text-xs font-medium tracking-[0.2em] text-[#C5A46D]">
              CUSTOMER MANAGEMENT
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Enquiries
            </h1>

            <p className="mt-2 text-sm text-white/45">
              Review and manage customer property viewing requests.
            </p>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-white/10 bg-[#111827] p-5"
              >
                <p className="text-xs text-white/45">{card.label}</p>

                <p className="mt-3 text-2xl font-semibold">
                  {card.value ?? "—"}
                </p>

                <p className="mt-1 text-[11px] text-white/30">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-white/10 bg-[#111827] p-4 xl:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search customer, email, phone or property..."
                className="w-full rounded-lg border border-white/10 bg-[#080D17] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#C5A46D]/50"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as EnquiryStatus | "ALL");
                setPage(1);
              }}
              className="rounded-lg border border-white/10 bg-[#080D17] px-4 py-3 text-sm text-white outline-none focus:border-[#C5A46D]/50"
            >
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                void loadEnquiries();
                void loadStats();
              }}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-white/65 transition hover:bg-white/5 disabled:opacity-40"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4">
              <p className="text-sm text-red-300">{error}</p>

              <button
                onClick={() => void loadEnquiries()}
                className="text-xs text-[#D8BB8B] hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111827]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <h2 className="font-semibold">
                  Property Viewing Requests
                </h2>

                <p className="mt-1 text-xs text-white/40">
                  {pagination?.total ?? 0} total records
                </p>
              </div>

              <MessageSquare className="text-[#C5A46D]" size={21} />
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#C5A46D] border-t-transparent" />

                  <p className="text-sm text-white/45">
                    Loading viewing requests...
                  </p>
                </div>
              </div>
            ) : enquiries.length === 0 ? (
              <div className="px-5 py-20 text-center">
                <MessageSquare
                  className="mx-auto mb-4 text-white/20"
                  size={36}
                />

                <h3 className="font-medium">
                  No viewing requests found
                </h3>

                <p className="mt-2 text-sm text-white/40">
                  Book a Viewing submissions will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {enquiries.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] lg:flex-row lg:items-center"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#C5A46D]/10 text-sm font-semibold text-[#D8BB8B]">
                      {enquiry.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {enquiry.fullName}
                        </h3>

                        <span className="inline-flex rounded-full bg-purple-400/10 px-2.5 py-1 text-[10px] font-semibold text-purple-300">
                          Viewing
                        </span>

                        <StatusBadge value={enquiry.status} />
                      </div>

                      <p className="mt-2 break-all text-xs text-white/45">
                        {enquiry.email}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/40">
                        <span>{enquiry.phone}</span>

                        {enquiry.property && (
                          <span>{enquiry.property.name}</span>
                        )}

                        {enquiry.preferredDate && (
                          <span>
                            Viewing: {formatDate(enquiry.preferredDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-4 lg:min-w-48 lg:justify-end">
                      <p className="text-[11px] text-white/35">
                        {formatDate(enquiry.createdAt)}
                      </p>

                      <button
                        type="button"
                        onClick={() => void openEnquiry(enquiry.id)}
                        disabled={detailLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#C5A46D]/30 px-4 py-2.5 text-xs font-medium text-[#D8BB8B] transition hover:bg-[#C5A46D]/10 disabled:opacity-40"
                      >
                        <Eye size={14} />
                        View details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
              <p className="text-xs text-white/40">
                Page {pagination?.page ?? page} of{" "}
                {pagination?.totalPages ?? 0}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/65 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <button
                  disabled={
                    !pagination ||
                    page >= pagination.totalPages ||
                    loading
                  }
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/65 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-[10px] tracking-wide text-white/25">
            © {new Date().getFullYear()} EA Real Estate Group™. All rights
            reserved.
          </p>
        </div>
      </div>

      {detailLoading && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C5A46D] border-t-transparent" />
        </div>
      )}

      {selectedEnquiry && (
        <EnquiryDetailsModal
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onUpdated={() => void handleUpdated()}
          onDeleted={(id) => void handleDeleted(id)}
        />
      )}
    </AdminLayout>
  );
}
