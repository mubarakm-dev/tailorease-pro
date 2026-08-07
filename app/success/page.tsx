import Link from "next/link"
import { Suspense } from "react"

export default function SuccessPage() {
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
                <div className="w-full max-w-md text-center">
                    {/* Success Icon */}
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-[#1B2233] mb-2">You're all set!</h1>
                        <p className="text-gray-600">Your account has been created and verified.</p>
                    </div>

                    {/* Success Card */}
                    <div className="bg-white border border-black/8 rounded-lg p-8 mb-6 space-y-6">
                        <div className="text-left space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="text-[#B07C34] font-bold mt-1">✓</span>
                                <div>
                                    <p className="font-semibold text-[#1B2233]">Account created</p>
                                    <p className="text-sm text-gray-600">Your workshop is ready to go</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-[#B07C34] font-bold mt-1">✓</span>
                                <div>
                                    <p className="font-semibold text-[#1B2233]">Email verified</p>
                                    <p className="text-sm text-gray-600">You can now sign in anytime</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-[#B07C34] font-bold mt-1">✓</span>
                                <div>
                                    <p className="font-semibold text-[#1B2233]">Approval pending</p>
                                    <p className="text-sm text-gray-600">We'll review and approve soon</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <p className="text-sm text-gray-600 mb-4">Next step: You'll receive an email when your account is approved. This usually takes 24 hours.</p>
                            <Link href="/login" className="inline-block w-full text-center bg-[#B07C34] text-white py-2.5 rounded-lg font-semibold hover:bg-[#9a6a2a] transition">
                                Go to sign in
                            </Link>
                        </div>
                    </div>

                    {/* Alternative Actions */}
                    <p className="text-sm text-gray-600">
                        Or <Link href="/" className="text-[#B07C34] font-semibold hover:underline">return to home</Link>
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black/8 px-6 py-6 text-center text-sm text-gray-600 space-y-3">
                <p className="text-[#B07C34] font-semibold uppercase tracking-wider">Manage. Measure. Master.</p>
                <p>Questions? <Link href="/" className="text-[#B07C34] hover:underline">Contact support</Link></p>
            </div>
        </div>
    )
}
