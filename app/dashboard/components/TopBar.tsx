"use client"

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

export default function TopBar({ companyName }: { companyName: string }) {
    const pathname = usePathname()
    const section = SECTIONS[pathname] ?? "Overview"

    return (
        <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur border-b border-gray-200">
           
            <div className="text-sm shrink-0 text-gray-400 whitespace-nowrap">
                {companyName} <span className="opacity-50">›</span>{" "}
                <span className="font-semibold text-gray-800">{section}</span>
            </div>

            <div className="ml-2 flex-1 max-w-md hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400">
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
                </svg>
                <span className="flex-1">Search customers, orders, staff…</span>
                <span className="text-xs border border-gray-300 rounded px-1.5 text-gray-400">⌘K</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 bg-[#b07c34] text-white text-sm font-medium px-3.5 py-2 rounded-lg hover:brightness-105"
                >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    New order
                </button>

                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative w-9 h-9 grid place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                    </svg>
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500"></span>
                </button>
            </div>
        </header>
    )
}
