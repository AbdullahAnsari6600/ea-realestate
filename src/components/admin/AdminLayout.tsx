import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Contact,
  BriefcaseBusiness,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import {
  adminLogout,
  type Admin,
} from "@/services/adminAuthService";

interface AdminLayoutProps {
  admin: Admin;
  title: string;
  children: ReactNode;
}

export default function AdminLayout({
  admin,
  title,
  children,
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await adminLogout();
      window.location.replace("/admin/login");
    } catch (err) {
      setLogoutError(
        err instanceof Error ? err.message : "Unable to log out."
      );
      setLoggingOut(false);
    }
  }

  const navigation = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      to: "/admin/" as const,
    },
    {
      label: "Properties",
      icon: Building2,
      to: "/admin/properties" as const,
    },
    {
      label: "Enquiries",
      icon: MessageSquare,
      to: "/admin/enquiries" as const,
    },
    {
      label: "Contacts",
      icon: Contact,
      to: "/admin/contacts" as const,
    },
    {
      label: "Careers",
      icon: BriefcaseBusiness,
      to: "/admin/careers" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[#080D17] text-white">
      {mobileMenuOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#0D1422] transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-7">
          <div>
            <p className="text-lg font-semibold tracking-[0.12em]">
              EA <span className="text-[#C5A46D]">REAL ESTATE</span>
            </p>
            <p className="mt-1 text-[10px] tracking-[0.25em] text-white/40">
              ADMINISTRATION
            </p>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-white/60 lg:hidden"
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className="px-5 py-7">
          <p className="mb-4 px-3 text-[10px] font-semibold tracking-[0.2em] text-white/35">
            WORKSPACE
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  activeOptions={{ exact: true }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white [&.active]:border [&.active]:border-[#C5A46D]/20 [&.active]:bg-[#C5A46D]/10 [&.active]:text-[#D8BB8B]"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-5">
          {logoutError && (
            <p className="mb-3 text-xs text-red-300">{logoutError}</p>
          )}

          <div className="mb-5 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C5A46D]/15 text-sm font-semibold text-[#D8BB8B]">
              {admin.email.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-white">
                Administrator
              </p>
              <p className="truncate text-[11px] text-white/40">
                {admin.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <LogOut size={17} />
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-72">
        <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-white/70 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-sm font-medium text-white">{title}</p>
              <p className="mt-1 text-[11px] text-white/40">
                EA Real Estate Group™ / Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#C5A46D]/20 bg-[#C5A46D]/5 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-medium tracking-wide text-[#D8BB8B]">
              SECURE SESSION
            </span>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}