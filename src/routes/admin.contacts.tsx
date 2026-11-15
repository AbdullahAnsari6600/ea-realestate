
import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Contact,
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

export const Route = createFileRoute("/admin/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts | EA Real Estate Administration" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminContactsPage,
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

function ContactDetailsModal({
  contact,
  onClose,
  onUpdated,
  onDeleted,
}: {
  contact: AdminEnquiry;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: (id: string) => void;
}) {
  const [status, setStatus] = useState<EnquiryStatus>(contact.status);
  const [adminNotes, setAdminNotes] = useState(contact.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      await updateAdminEnquiry(contact.id, {
        status,
        adminNotes,
      });

      onUpdated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update contact."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete the contact submission from ${contact.fullName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteAdminEnquiry(contact.id);
      onDeleted(contact.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete contact."
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
              CONTACT SUBMISSION
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {contact.fullName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close contact details"
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-[#C5A46D]/10 px-2.5 py-1 text-[10px] font-semibold text-[#D8BB8B]">
              Contact Us
            </span>

            <StatusBadge value={contact.status} />

            <span className="text-xs text-white/35">
              Received {formatDateTime(contact.createdAt)}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#080D17] p-4">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Mail size={14} />
                Email address
              </div>

              <a
                href={`mailto:${contact.email}`}
                className="mt-2 block break-all text-sm text-[#D8BB8B] hover:underline"
              >
                {contact.email}
              </a>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#080D17] p-4">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Phone size={14} />
                Phone number
              </div>

              <a
                href={`tel:${contact.phone}`}
                className="mt-2 block text-sm text-[#D8BB8B] hover:underline"
              >
                {contact.phone}
              </a>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-white/50">
              CUSTOMER MESSAGE
            </p>

            <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-[#080D17] p-4 text-sm leading-6 text-white/75">
              {contact.message || "No message provided."}
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <h3 className="mb-4 text-sm font-semibold text-white">
              Manage contact
            </h3>

            <label className="mb-2 block text-xs text-white/45">
              Contact status
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
              placeholder="Add internal notes about customer discussions or follow-ups..."
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
            {deleting ? "Deleting..." : "Delete contact"}
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

function AdminContactsPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [contacts, setContacts] = useState<AdminEnquiry[]>([]);

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

  const [selectedContact, setSelectedContact] =
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

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listAdminEnquiries({
        page,
        limit: 10,
        search: search.trim() || undefined,
        type: "CONTACT",
        status,
        sort: "newest",
      });

      setContacts(result.enquiries);
      setPagination(result.pagination);
    } catch (err) {
      setError(
        err instanceof AdminEnquiryError
          ? err.message
          : "Unable to load contact submissions."
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
      console.error("Unable to load contact statistics:", err);
    }
  }, []);

  useEffect(() => {
    if (!admin) return;

    void loadContacts();
    void loadStats();
  }, [admin, loadContacts, loadStats]);

  async function openContact(id: string) {
    setDetailLoading(true);
    setError("");

    try {
      const result = await getAdminEnquiryById(id);
      setSelectedContact(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load contact details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleUpdated() {
    await Promise.all([loadContacts(), loadStats()]);
  }

  async function handleDeleted(id: string) {
    setSelectedContact(null);

    setContacts((current) =>
      current.filter((contact) => contact.id !== id)
    );

    await Promise.all([loadContacts(), loadStats()]);
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
      label: "Total Contacts",
      value: stats?.contactEnquiries,
      description: "All Contact Us submissions",
    },
    {
      label: "New",
      value: stats?.newEnquiries,
      description: "Awaiting follow-up",
    },
    {
      label: "Contacted",
      value: stats?.contactedEnquiries,
      description: "Customers contacted",
    },
    {
      label: "Qualified",
      value: stats?.qualifiedEnquiries,
      description: "Potential customers",
    },
    {
      label: "Closed",
      value: stats?.closedEnquiries,
      description: "Completed conversations",
    },
  ];

  return (
    <AdminLayout admin={admin} title="Contacts">
      <div className="px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-8">
            <p className="text-xs font-medium tracking-[0.2em] text-[#C5A46D]">
              CUSTOMER MANAGEMENT
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Contacts
            </h1>

            <p className="mt-2 text-sm text-white/45">
              Manage messages and contact requests submitted through the Contact Us form.
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
                placeholder="Search customer, email or phone..."
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
                void loadContacts();
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
                onClick={() => void loadContacts()}
                className="text-xs text-[#D8BB8B] hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111827]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <h2 className="font-semibold">Contact Us Submissions</h2>

                <p className="mt-1 text-xs text-white/40">
                  {pagination?.total ?? 0} total records
                </p>
              </div>

              <Contact className="text-[#C5A46D]" size={21} />
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#C5A46D] border-t-transparent" />

                  <p className="text-sm text-white/45">
                    Loading contacts...
                  </p>
                </div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="px-5 py-20 text-center">
                <Contact
                  className="mx-auto mb-4 text-white/20"
                  size={36}
                />

                <h3 className="font-medium">No contacts found</h3>

                <p className="mt-2 text-sm text-white/40">
                  Contact Us submissions will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] lg:flex-row lg:items-center"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#C5A46D]/10 text-sm font-semibold text-[#D8BB8B]">
                      {contact.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {contact.fullName}
                        </h3>

                        <span className="inline-flex rounded-full bg-[#C5A46D]/10 px-2.5 py-1 text-[10px] font-semibold text-[#D8BB8B]">
                          Contact
                        </span>

                        <StatusBadge value={contact.status} />
                      </div>

                      <p className="mt-2 break-all text-xs text-white/45">
                        {contact.email}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/40">
                        <span>{contact.phone}</span>
                        <span>{formatDate(contact.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end">
                      <button
                        type="button"
                        onClick={() => void openContact(contact.id)}
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

      {selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdated={() => void handleUpdated()}
          onDeleted={(id) => void handleDeleted(id)}
        />
      )}
    </AdminLayout>
  );
}
