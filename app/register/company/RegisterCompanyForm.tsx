"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { registerCompany, RegisterCompanyState } from "./actions"


const initialState: RegisterCompanyState = {
    success: false,
    error: null,
}

export default function RegisterCompanyForm() {
    const [state, formAction, isPending] = useActionState(registerCompany, initialState)
    const [fileError, setFileError] = useState<string | null>(null)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordTouched, setPasswordTouched] = useState(false)
    const [confirmTouched, setConfirmTouched] = useState(false)

    const passwordError = passwordTouched && password.length > 0 && password.length < 6
    const passwordMismatch = confirmTouched && confirmPassword.length > 0 && confirmPassword !== password
    const hasValidationError = passwordError || passwordMismatch

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const maxSize = 2 * 1024 * 1024 // 2MB
            if (file.size > maxSize) {
                setFileError("Image must be smaller than 2MB")
                e.target.value = ""
            } else {
                setFileError(null)
            }
        }
    }

    const handleSubmit = (formData: FormData) => {
        if (fileError) return
        formAction(formData)
    }

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
                        <h1 className="text-3xl font-serif font-bold text-[#1B2233] mb-2">Register your shop</h1>
                        <p className="text-gray-600">Set up your account to start managing orders and measurements.</p>
                    </div>

                    {(state.error || fileError) && (
                        <p className="text-red-600 text-base mb-6">
                            {state.error || fileError}
                        </p>
                    )}

                    {state.success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <p className="text-green-900 font-semibold mb-4">{state.message}</p>
                            <div className="bg-white border border-green-200 rounded p-4 mb-4">
                                <p className="text-sm text-gray-600 mb-1">Your company code:</p>
                                <p className="font-mono text-lg font-bold text-green-700">{state.companyCode}</p>
                                <p className="text-xs text-gray-600 mt-2">Share this with your staff to register</p>
                            </div>
                            <a href={`/verify?email=${encodeURIComponent(state.email ?? "")}`} className="inline-block w-full text-center bg-[#B07C34] text-white py-2 rounded font-semibold hover:bg-[#9a6a2a] transition">
                                Verify email
                            </a>
                        </div>
                    )}

                    {!state.success && (
                        <form action={handleSubmit} className="space-y-5 bg-white border border-black/8 rounded-lg p-8">
                            {/* Company Section */}
                            <div>
                                <p className="text-xs uppercase tracking-widest text-[#B07C34] font-semibold mb-4">Company details</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#1B2233] mb-2">Company Name</label>
                                        <input type="text" name="companyName" required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34] text-gray-900"
                                            placeholder="Your tailoring business name" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#1B2233] mb-2">Company Logo/Image (optional)</label>
                                        <input type="file" name="companyImage" accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]" />
                                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, or WebP (max 2MB)</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#1B2233] mb-2">Company Email</label>
                                        <input type="email" name="email" required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34] text-gray-900"
                                            placeholder="shop@example.com" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#1B2233] mb-2">Password</label>
                                        <input type="password" name="password" required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onBlur={() => setPasswordTouched(true)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34] text-gray-900"
                                            placeholder="••••••••" />
                                        {passwordError && (
                                            <p className="text-red-600 text-xs mt-1">Password must be at least 6 characters</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#1B2233] mb-2">Confirm Password</label>
                                        <input type="password" name="confirmPassword" required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            onBlur={() => setConfirmTouched(true)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34] text-gray-900"
                                            placeholder="••••••••" />
                                        {passwordMismatch && (
                                            <p className="text-red-600 text-xs mt-1">Passwords do not match</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Owner Section */}
                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-xs uppercase tracking-widest text-[#B07C34] font-semibold mb-4">Your details (owner)</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#1B2233] mb-2">Full Name</label>
                                        <input type="text" name="ownerFullname" required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34] text-gray-900"
                                            placeholder="Your full name" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#1B2233] mb-2">Email</label>
                                        <input type="email" name="ownerEmail" required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34] text-gray-900"
                                            placeholder="your@email.com" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#1B2233] mb-2">Phone</label>
                                        <input type="text" name="ownerPhone" required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34] text-gray-900"
                                            placeholder="+234 800 000 0000" />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={isPending || hasValidationError}
                                className="w-full bg-[#B07C34] text-white py-2.5 rounded-lg font-semibold hover:bg-[#9a6a2a] disabled:opacity-60 transition mt-6">
                                {isPending ? "Registering..." : "Create Account"}
                            </button>

                            <div className="space-y-2 text-center text-sm text-gray-600 mt-4">
                                <p>Already have an account? <Link href="/login" className="text-[#B07C34] font-semibold hover:underline">Sign in</Link></p>
                                <p>Joining an existing shop? <Link href="/register/staff" className="text-[#B07C34] font-semibold hover:underline">Register as staff</Link></p>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black/8 px-6 py-6 text-center text-sm text-gray-600 space-y-3">
                <p className="text-[#B07C34] font-semibold uppercase tracking-wider">Manage. Measure. Master.</p>
                <p>Free to start · No card needed · Your shop is approved before it goes live.</p>
            </div>
        </div>
    )
}