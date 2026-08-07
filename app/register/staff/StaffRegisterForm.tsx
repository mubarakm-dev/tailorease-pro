"use client"

import { useActionState } from "react"
import Link from "next/link"
import { registerStaff, StaffRegistrationState } from "./action"
import FormMessage from "@/app/components/FormMessage"

const initialState: StaffRegistrationState = {
    success: false,
    error: null,
}

export default function StaffRegisterForm() {
    const [state, formAction, isPending] = useActionState(registerStaff, initialState)

    return (
        <div className="min-h-screen bg-[#F1EFE9] flex flex-col">
            {/* Header */}
            <div className="border-b border-black/8 px-6 py-4">
                <Link href="/" className="inline-block text-2xl font-semibold text-[#1B2233] font-serif">
                    TailorEase
                </Link>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h1 className="text-3xl font-serif font-bold text-[#1B2233] mb-2">Join the workshop</h1>
                        <p className="text-gray-600">Register as a staff member with your company code.</p>
                    </div>

                    <FormMessage state={state} />

                    {!state.success && (
                        <form action={formAction} className="space-y-5 bg-white border border-black/8 rounded-lg p-8">
                            <div>
                                <label className="block text-sm font-medium text-[#1B2233] mb-2">Company Code</label>
                                <input type="text" name="companyCode" required placeholder="TSE-XXXXXX"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34] uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1B2233] mb-2">Full Name</label>
                                <input type="text" name="fullName" required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1B2233] mb-2">Email</label>
                                <input type="email" name="email" required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1B2233] mb-2">Password</label>
                                <input type="password" name="password" required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1B2233] mb-2">Confirm Password</label>
                                <input type="password" name="confirmPassword" required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1B2233] mb-2">Phone (optional)</label>
                                <input type="text" name="phone"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
                                    placeholder="+234 800 000 0000"
                                />
                            </div>

                            <button type="submit" disabled={isPending}
                                className="w-full bg-[#B07C34] text-white py-2.5 rounded-lg font-semibold hover:bg-[#9a6a2a] disabled:opacity-60 transition mt-6">
                                {isPending ? "Registering..." : "Create Account"}
                            </button>

                            <p className="text-center text-sm text-gray-600 mt-4">
                                Already registered? <Link href="/login" className="text-[#B07C34] font-semibold hover:underline">Sign in</Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black/8 px-6 py-4 text-center text-sm text-gray-600">
                <p>Ask your shop owner for the company code.</p>
            </div>
        </div>
    )
}