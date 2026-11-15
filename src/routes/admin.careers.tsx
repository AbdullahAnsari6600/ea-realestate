
import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  Users,
  FileText,
  Clock,
  RefreshCw,
  Search,
  Download,
  Eye,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Save,
} from "lucide-react";

import {
  getCurrentAdmin,
  AdminAuthError,
  type Admin,
} from "@/services/adminAuthService";

import {
  getCareerApplications,
  getCareerStats,
  getCareerApplication,
  updateCareerApplication,
  deleteCareerApplication,
  downloadCareerCv,
  CareerAdminError,
  type CareerApplication,
  type CareerStats,
  type CareerStatus,
} from "@/services/careerAdminService";

import AdminLayout from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/careers")({
  head: () => ({
    meta: [
      { title: "Careers | EA Real Estate Administration" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCareersPage,
});

const statusOptions: CareerStatus[] = [
  "NEW",
  "REVIEWING",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
];

const statusStyles: Record<CareerStatus, string> = {
  NEW: "bg-blue-400/10 text-blue-300 border-blue-400/20",
  REVIEWING: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  SHORTLISTED: "bg-purple-400/10 text-purple-300 border-purple-400/20",
  REJECTED: "bg-red-400/10 text-red-300 border-red-400/20",
  HIRED: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
};

function formatStatus(status: CareerStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminCareersPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [stats, setStats] = useState<CareerStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CareerStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);

  const [selectedApplication, setSelectedApplication] =
    useState<CareerApplication | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const [editedStatus, setEditedStatus] = useState<CareerStatus>("NEW");
  const [editedNotes, setEditedNotes] = useState("");

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

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setActionError("");

    try {
      const [applicationsResult, statsResult] = await Promise.all([
        getCareerApplications({
          page,
          limit: 10,
          search: search.trim(),
          status: statusFilter,
        }),
        getCareerStats(),
      ]);

      setApplications(applicationsResult.applications);
      setTotalPages(Math.max(1, applicationsResult.pagination.totalPages));
      setTotalApplications(applicationsResult.pagination.total);
      setStats(statsResult.stats);
    } catch (err) {
      if (err instanceof CareerAdminError && err.status === 401) {
        window.location.replace("/admin/login");
        return;
      }

      setActionError(
        err instanceof Error ? err.message : "Unable to load applications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    if (admin) void loadData();
  }, [admin, loadData]);

  async function openApplication(id: string) {
    setDetailsLoading(true);
    setSelectedApplication(null);
    setActionError("");

    try {
      const result = await getCareerApplication(id);
      setSelectedApplication(result.application);
      setEditedStatus(result.application.status);
      setEditedNotes(result.application.adminNotes || "");
    } catch (err) {
      if (err instanceof CareerAdminError && err.status === 401) {
        window.location.replace("/admin/login");
        return;
      }

      setActionError(
        err instanceof Error ? err.message : "Unable to load application."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  async function saveApplication() {
    if (!selectedApplication) return;

    setSaving(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const result = await updateCareerApplication(selectedApplication.id, {
        status: editedStatus,
        adminNotes: editedNotes,
      });

      setSelectedApplication(result.application);
      setEditedStatus(result.application.status);
      setEditedNotes(result.application.adminNotes || "");

      setSuccessMessage("Application updated successfully.");
      await loadData(true);
    } catch (err) {
      if (err instanceof CareerAdminError && err.status === 401) {
        window.location.replace("/admin/login");
        return;
      }

      setActionError(
        err instanceof Error ? err.message : "Unable to update application."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload(id: string) {
    setDownloadingId(id);
    setActionError("");

    try {
      await downloadCareerCv(id);
    } catch (err) {
      if (err instanceof CareerAdminError && err.status === 401) {
        window.location.replace("/admin/login");
        return;
      }

      setActionError(
        err instanceof Error ? err.message : "Unable to download CV."
      );
    } finally {
      setDownloadingId("");
    }
  }

  async function handleDelete(application: CareerApplication) {
    const confirmed = window.confirm(
      `Delete the application from ${application.fullName}? This will also delete the uploaded CV. This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(application.id);
    setActionError("");
    setSuccessMessage("");

    try {
      await deleteCareerApplication(application.id);

      if (selectedApplication?.id === application.id) {
        setSelectedApplication(null);
      }

      setSuccessMessage("Application deleted successfully.");
      await loadData(true);
    } catch (err) {
      if (err instanceof CareerAdminError && err.status === 401) {
        window.location.replace("/admin/login");
        return;
      }

      setActionError(
        err instanceof Error ? err.message : "Unable to delete application."
      );
    } finally {
      setDeletingId("");
    }
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
          <h1 className="text-xl font-semibold">Unable to verify session</h1>
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
      label: "Total Applications",
      value: stats?.total ?? 0,
      icon: Users,
    },
    {
      label: "New Applications",
      value: stats?.new ?? 0,
      icon: BriefcaseBusiness,
    },
    {
      label: "Under Review",
      value: stats?.reviewing ?? 0,
      icon: Clock,
    },
    {
      label: "CVs Received",
      value: stats?.total ?? 0,
      icon: FileText,
    },
  ];

  return (
    <AdminLayout admin={admin} title="Careers">
      <div className="px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-[#C5A46D]">
                RECRUITMENT MANAGEMENT
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Career Applications
              </h1>
              <p className="mt-2 text-sm text-white/45">
                Review and manage applications submitted through your
                company's Careers page.
              </p>
            </div>

            <button
              onClick={() => void loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {actionError && (
            <div className="mb-5 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {actionError}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
              {successMessage}
            </div>
          )}

          <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-xl border border-white/10 bg-[#111827] p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/45">{card.label}</p>
                    <Icon size={19} className="text-[#C5A46D]" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold">
                    {loading ? "—" : card.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mb-7 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Shortlisted", value: stats?.shortlisted ?? 0 },
              { label: "Hired", value: stats?.hired ?? 0 },
              { label: "Rejected", value: stats?.rejected ?? 0 },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-[#111827] px-5 py-4"
              >
                <p className="text-xs text-white/45">{item.label}</p>
                <p className="mt-2 text-xl font-semibold">
                  {loading ? "—" : item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-5">
              <div>
                <h2 className="font-semibold">All Applications</h2>
                <p className="mt-1 text-xs text-white/40">
                  {totalApplications} application(s) found
                </p>
              </div>

              <BriefcaseBusiness size={21} className="text-[#C5A46D]" />
            </div>

            <div className="grid gap-3 border-b border-white/10 p-5 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, email, phone or position..."
                  className="w-full rounded-lg border border-white/10 bg-[#080D17] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#C5A46D]/60"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as CareerStatus | "");
                  setPage(1);
                }}
                className="rounded-lg border border-white/10 bg-[#080D17] px-4 py-3 text-sm text-white outline-none focus:border-[#C5A46D]/60"
              >
                <option value="">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 px-5 py-20 text-sm text-white/50">
                <RefreshCw size={17} className="animate-spin text-[#C5A46D]" />
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="px-5 py-20 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C5A46D]/20 bg-[#C5A46D]/5">
                  <FileText size={30} className="text-[#C5A46D]" />
                </div>

                <h3 className="text-lg font-semibold">
                  {search || statusFilter
                    ? "No matching applications"
                    : "No applications available"}
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">
                  {search || statusFilter
                    ? "Try changing your search or status filter."
                    : "Applications submitted through the Careers page will appear here."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="border-b border-white/10 bg-white/[0.02]">
                      <tr className="text-[11px] uppercase tracking-wider text-white/40">
                        <th className="px-5 py-4 font-medium">Applicant</th>
                        <th className="px-5 py-4 font-medium">Position</th>
                        <th className="px-5 py-4 font-medium">Submitted</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                        <th className="px-5 py-4 text-right font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.06]">
                      {applications.map((application) => (
                        <tr
                          key={application.id}
                          className="transition hover:bg-white/[0.025]"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-white">
                              {application.fullName}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                              {application.email}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                              {application.phone}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-white/70">
                            {application.position}
                          </td>

                          <td className="px-5 py-4 text-sm text-white/55">
                            {formatDate(application.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${statusStyles[application.status]}`}
                            >
                              {formatStatus(application.status)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  void openApplication(application.id)
                                }
                                title="View application"
                                className="rounded-lg border border-white/10 p-2 text-white/65 transition hover:border-[#C5A46D]/40 hover:text-[#C5A46D]"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  void handleDownload(application.id)
                                }
                                disabled={downloadingId === application.id}
                                title="Download CV"
                                className="rounded-lg border border-white/10 p-2 text-white/65 transition hover:border-[#C5A46D]/40 hover:text-[#C5A46D] disabled:opacity-40"
                              >
                                <Download size={16} />
                              </button>

                              <button
                                onClick={() => void handleDelete(application)}
                                disabled={deletingId === application.id}
                                title="Delete application"
                                className="rounded-lg border border-white/10 p-2 text-white/65 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-40"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                  <p className="text-xs text-white/40">
                    Page {page} of {totalPages}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page <= 1}
                      className="rounded-lg border border-white/10 p-2 text-white/65 hover:bg-white/5 disabled:opacity-30"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    <button
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                      disabled={page >= totalPages}
                      className="rounded-lg border border-white/10 p-2 text-white/65 hover:bg-white/5 disabled:opacity-30"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="mt-8 text-center text-[10px] tracking-wide text-white/25">
            © {new Date().getFullYear()} EA Real Estate Group™. All rights
            reserved.
          </p>
        </div>
      </div>

      {(detailsLoading || selectedApplication) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111827] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#111827] px-6 py-5">
              <div>
                <h2 className="font-semibold">Application Details</h2>
                <p className="mt-1 text-xs text-white/40">
                  Review applicant information and manage their application.
                </p>
              </div>

              <button
                onClick={() => setSelectedApplication(null)}
                className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex justify-center py-20">
                <RefreshCw size={22} className="animate-spin text-[#C5A46D]" />
              </div>
            ) : selectedApplication ? (
              <div className="space-y-6 p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  {[
                    ["Full Name", selectedApplication.fullName],
                    ["Email", selectedApplication.email],
                    ["Phone", selectedApplication.phone],
                    ["Position", selectedApplication.position],
                    ["Submitted", formatDate(selectedApplication.createdAt)],
                    ["Experience", selectedApplication.experience != null
                      ? `${selectedApplication.experience} years`
                      : "Not provided"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-white/40">{label}</p>
                      <p className="mt-1 break-words text-sm text-white/85">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedApplication.linkedin && (
                  <div>
                    <p className="text-xs text-white/40">LinkedIn</p>
                    <a
                      href={selectedApplication.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-2 break-all text-sm text-[#C5A46D] hover:underline"
                    >
                      {selectedApplication.linkedin}
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs text-white/40">Cover Letter</p>
                  <div className="whitespace-pre-wrap rounded-lg border border-white/10 bg-[#080D17] p-4 text-sm leading-6 text-white/75">
                    {selectedApplication.coverLetter || "No cover letter provided."}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-white/40">Application CV</p>
                  <button
                    onClick={() =>
                      void handleDownload(selectedApplication.id)
                    }
                    disabled={downloadingId === selectedApplication.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#C5A46D]/30 bg-[#C5A46D]/10 px-4 py-3 text-sm text-[#D9BD91] transition hover:bg-[#C5A46D]/20 disabled:opacity-50"
                  >
                    <Download size={16} />
                    {downloadingId === selectedApplication.id
                      ? "Downloading..."
                      : "Download CV"}
                  </button>
                </div>

                <div className="border-t border-white/10 pt-5">
                  <h3 className="mb-4 text-sm font-semibold">
                    Manage Application
                  </h3>

                  <label className="mb-2 block text-xs text-white/45">
                    Application Status
                  </label>
                  <select
                    value={editedStatus}
                    onChange={(event) =>
                      setEditedStatus(event.target.value as CareerStatus)
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#080D17] px-4 py-3 text-sm text-white outline-none focus:border-[#C5A46D]/60"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>

                  <label className="mb-2 mt-5 block text-xs text-white/45">
                    Private Admin Notes
                  </label>
                  <textarea
                    value={editedNotes}
                    onChange={(event) => setEditedNotes(event.target.value)}
                    rows={4}
                    maxLength={5000}
                    placeholder="Add internal notes about this applicant..."
                    className="w-full resize-y rounded-lg border border-white/10 bg-[#080D17] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#C5A46D]/60"
                  />

                  <button
                    onClick={() => void saveApplication()}
                    disabled={saving}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#C5A46D] px-5 py-3 text-sm font-semibold text-[#080D17] transition hover:bg-[#D6B982] disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
