"use client"

import { useState } from "react"
import { logout } from "../action"
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
    const [logoutConfirm, setLogoutConfirm] = useState(false)

    return (
        <div className="flex min-h-screen bg-[#f1efe9]">
            <Sidebar
                companyName={companyName}
                companyImage={companyImage}
                staffName={staffName}
                role={role}
                mobileOpen={navOpen}
                onClose={() => setNavOpen(false)}
                onLogoutClick={() => setLogoutConfirm(true)}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar companyName={companyName} onMenu={() => setNavOpen(true)} />
                <main className="flex-1">{children}</main>
                <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
                    Powered by <span className="text-[#b07c34] font-semibold">TailorEase</span>
                </footer>
            </div>

            {/* Logout Confirmation Modal */}
            {logoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold text-[#1b2233] mb-2">Sign out?</h3>
                        <p className="text-gray-600 text-sm mb-6">You'll be signed out and redirected to the login page.</p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setLogoutConfirm(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <form action={logout} className="flex-1">
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                                >
                                    Sign out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
