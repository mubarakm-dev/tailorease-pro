"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type SidebarProps = {
  companyName: string
  companyImage: string | null
  staffName: string
  role: string
  mobileOpen: boolean
  onClose: () => void
  onLogoutClick: () => void
}

type NavItem = { href: string; label: string; icon: ReactNode }

const workspace: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[17px] h-[17px]"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  ) },
  { href: "/dashboard/customers", label: "Customers", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[17px] h-[17px]"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>
  ) },
  { href: "/dashboard/orders", label: "Orders", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[17px] h-[17px]"><path d="M6 3h12l-1 7H7z" /><path d="M7 10l-2 11h14L17 10" /></svg>
  ) },
  { href: "/dashboard/measurements", label: "Measurements", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[17px] h-[17px]"><path d="M3 8h18v8H3z" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></svg>
  ) },
  { href: "/dashboard/activity", label: "Activity Log", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[17px] h-[17px]"><path d="M4 5h16M4 12h16M4 19h10" /></svg>
  ) },
]

const administration: NavItem[] = [
  { href: "/dashboard/staff", label: "Staff Management", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[17px] h-[17px]"><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" /><circle cx="18" cy="9" r="2.4" /><path d="M16.5 20c0-2.4 0-3.6 4.5-3.6" /></svg>
  ) },
  { href: "/dashboard/company", label: "Company Management", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[17px] h-[17px]"><path d="M3 21V7l9-4 9 4v14" /><path d="M9 21v-6h6v6" /><path d="M9 11h.01M15 11h.01" /></svg>
  ) },
]


function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter((w: string) => /[a-z0-9]/i.test(w[0] ?? ""))
  const picked = words.slice(0, 2).map((w: string) => w[0]).join("")
  return (picked || name.slice(0, 2)).toUpperCase()
}

function NavLink({ item, active, admin }: { item: NavItem; active: boolean; admin?: boolean }) {
  return (
    <Link
      href={item.href}
      className={`relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? "bg-[#b07c34] text-white shadow-lg" : "text-[#c7cbd8] hover:bg-[#313b58]"
      }`}
    >
      <span className="opacity-90">{item.icon}</span>
      <span>{item.label}</span>
      {admin && (
        <span className={`ml-auto text-[9px] uppercase tracking-wider rounded px-1.5 py-px ${
          active ? "bg-white/20 text-white" : "text-[#b07c34] border border-[#b07c34]/40"
        }`}>
          Admin
        </span>
      )}
    </Link>
  )
}

export default function Sidebar({ companyName, companyImage, staffName, role, mobileOpen, onClose, onLogoutClick }: SidebarProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // close the mobile drawer whenever the route changes
  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)

  const isAdmin = role === "SUPER_ADMIN"

  return (
    <>
      {/* mobile backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/40 md:hidden ${mobileOpen ? "" : "hidden"}`}
      />

    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 h-screen flex flex-col bg-[#1c2439] border-r border-[#313b58] text-[#c7cbd8] p-4 transition-transform duration-200 md:sticky md:top-0 md:z-auto md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Company brand */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-xl bg-[#232c45] border border-[#313b58] p-2 mb-2 hover:bg-[#2a3555] transition-colors shrink-0"
      >
        {companyImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={companyImage} alt={companyName} className="w-9 h-9 rounded-lg object-cover" />
        ) : (
          <span className="w-9 h-9 rounded-lg grid place-items-center bg-gradient-to-br from-[#b07c34] to-[#8a5f26] text-white font-bold text-sm">
            {initialsFrom(companyName)}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{companyName}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#7e879f]">Company</p>
        </div>
      </Link>

      {/* Scrollable nav section */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 min-h-0">
        {/* Workspace */}
        <p className="text-[10px] uppercase tracking-widest text-[#7e879f] px-2 pt-3 pb-1">Workspace</p>
        <nav className="flex flex-col gap-0.5">
          {workspace.map((item: any) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </nav>

        {/* Administration — SUPER_ADMIN only */}
        {isAdmin && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-[#7e879f] px-2 pt-3 pb-1">Administration</p>
            <nav className="flex flex-col gap-0.5">
              {administration.map((item: any) => (
                <NavLink key={item.href} item={item} active={isActive(item.href)} admin />
              ))}
            </nav>
          </>
        )}
      </div>

      {/* User pill + menu - always visible at bottom */}
      <div className="relative shrink-0 mt-auto">
        {menuOpen && (
          <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 bg-white text-[#1b2233] border border-gray-200 rounded-xl shadow-lg p-1.5">
            <Link
              href="/dashboard/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              My profile
            </Link>
            <div className="h-px bg-gray-200 my-1" />
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onLogoutClick()
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-red-600 hover:bg-gray-50 text-left"
            >
              Log out
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-[#232c45] border border-[#313b58] hover:bg-[#2a3555] transition-colors"
        >
          <span className="w-8 h-8 rounded-full grid place-items-center bg-gradient-to-br from-[#4a6da8] to-[#2f4d80] text-white font-semibold text-sm shrink-0">
            {staffName.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 text-left flex-1">
            <span className="block text-white text-sm font-semibold truncate">{staffName}</span>
            <span className="block text-[11px] text-[#7e879f]">{isAdmin ? "Owner · Super admin" : "Staff"}</span>
          </span>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#7e879f]" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 15l6-6 6 6" />
          </svg>
        </button>
      </div>

    </aside>
    </>
  )
}
