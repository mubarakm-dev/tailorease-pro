"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"

type Props = {
    companyName: string
    companyImage: string | null
    staffName: string
    role: string
    children: React.ReactNode
}

export default function DashboardShell({ companyName, companyImage, staffName, role, children }: Props) {
    const [navOpen, setNavOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-[#f1efe9]">
            <Sidebar
                companyName={companyName}
                companyImage={companyImage}
                staffName={staffName}
                role={role}
                mobileOpen={navOpen}
                onClose={() => setNavOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar companyName={companyName} onMenu={() => setNavOpen(true)} />
                <main className="flex-1">{children}</main>
                <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
                    Powered by <span className="text-[#b07c34] font-semibold">TailorEase</span>
                </footer>
            </div>
        </div>
    )
}
