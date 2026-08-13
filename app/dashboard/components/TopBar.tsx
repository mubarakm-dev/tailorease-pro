"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const SECTIONS: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/customers": "Customers",
    "/dashboard/orders": "Orders",
    "/dashboard/measurements": "Measurements",
    "/dashboard/activity": "Activity Log",
    "/dashboard/staff": "Staff Management",
    "/dashboard/company": "Company Management",
    "/dashboard/profile": "My Profile",
}

export default function TopBar({ companyName, onMenu }: { companyName: string; onMenu?: () => void }) {
    const pathname = usePathname()
    const section = SECTIONS[pathname] ?? "Overview"

    return (
        <header className="sticky top-0 z-30 flex items-center gap-4 sm:gap-6 px-4 md:px-6 py-3 bg-white/80 backdrop-blur border-b border-gray-200">

            <button
                type="button"
                onClick={onMenu}
                aria-label="Open menu"
                className="md:hidden w-9 h-9 grid place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-[#b07c34] transition-all duration-300 shrink-0"
            >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <div className="text-sm shrink-0 text-gray-700 whitespace-nowrap">
                <span className="hidden sm:inline">{companyName} <span className="opacity-50">›</span> </span>
                <span className="font-semibold text-gray-800">{section}</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
                <Link
                    href="/dashboard/orders/new"
                    className="inline-flex items-center gap-2 bg-[#b07c34] text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-300 hover:bg-[#9a6a2a] hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(176,124,52,0.15)]"
                >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span className="hidden sm:inline">New order</span>
                </Link>

                <Link
                    href="/dashboard/activity"
                    aria-label="Activity log"
                    className="w-9 h-9 grid place-items-center rounded-lg border border-gray-200 text-gray-700 transition-all duration-300 hover:border-[#b07c34] hover:shadow-[0_8px_16px_rgba(176,124,52,0.15)] hover:-translate-y-0.5 hover:text-[#b07c34]"
                >
                    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                    </svg>
                </Link>
            </div>
        </header>
    )
}
