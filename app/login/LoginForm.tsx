"use client"

import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { login, LoginState } from "./actions"

const initialState: LoginState = {
    success: false,
    error: null,
}

export default function LoginForm({ resetSuccess }: { resetSuccess?: boolean }) {
    const [showResetMessage, setShowResetMessage] = useState(resetSuccess)
    const [state, formAction, isPending] = useActionState(login, initialState)

    useEffect(() => {
        if (showResetMessage) {
            const timer = setTimeout(() => setShowResetMessage(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [showResetMessage])

    useEffect(() => {
        if (state.error) {
            setShowResetMessage(false)
        }
    }, [state.error])

    return (
        <div className="min-h-screen bg-[#F1EFE9] flex flex-col">
            {/* Header */}
            <div className="border-b border-black/8 px-6 py-4">
                <Link href="/" className="inline-flex items-center gap-1">
                    <img src="/images/logo.png" alt="TailorEase" className="h-12 w-auto" />
                    <span className="font-serif text-xl font-semibold">
                        <span className="text-[#1B2233]">Tailor</span><span className="text-[#B07C34]">Ease</span>
                    </span>
                </Link>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h1 className="text-3xl font-serif font-bold text-[#1B2233] mb-2">Sign in to your workshop</h1>
                        <p className="text-gray-600">Access your dashboard and manage orders.</p>
                    </div>

                    {showResetMessage && (
                        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm animate-in fade-in duration-300">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-900">Password reset successfully</p>
                                    <p className="text-xs text-emerald-700 mt-1">Sign in with your new password.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {state.error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                            {state.error}
                        </div>
                    )}

                    {state.needsVerification && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                            <p className="text-amber-900 text-sm mb-3">Your email needs verification.</p>
                            <a
                                href={`/verify?email=${encodeURIComponent(state.email ?? "")}&fresh=1`}
                                className="inline-block w-full text-center bg-[#B07C34] text-white py-2 rounded font-semibold hover:bg-[#9a6a2a] transition"
                            >
                                Verify your account
                            </a>
                        </div>
                    )}

                    {!state.success && (
                        <form action={formAction} className="space-y-5 bg-white border border-black/8 rounded-lg p-8">
                            <div>
                                <label className="block text-sm font-medium text-[#1B2233] mb-2">Email</label>
                                <input type="email" name="email" required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34] placeholder:text-gray-500"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1B2233] mb-2">Password</label>
                                <input type="password" name="password" required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34] placeholder:text-gray-500"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>

                            <button type="submit" disabled={isPending}
                                className="w-full bg-[#B07C34] text-white py-2.5 rounded-lg font-semibold hover:bg-[#9a6a2a] disabled:opacity-60 transition mt-6">
                                {isPending ? "Signing in..." : "Sign in"}
                            </button>

                            <div className="flex items-center justify-between text-sm mt-4">
                                <Link href="/forgot-password" className="text-[#B07C34] hover:underline">Forgot password?</Link>
                                <span className="text-gray-400">·</span>
                                <Link href="/register/staff" className="text-[#B07C34] hover:underline">Register as staff</Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black/8 px-6 py-6 text-center text-sm text-gray-600 space-y-3">
                <p className="text-[#B07C34] font-semibold uppercase tracking-wider">Manage. Measure. Master.</p>
                <p><Link href="/admin/login" className="text-[#B07C34] hover:underline">Admin login</Link></p>
            </div>
        </div>
    )
}