"use client"

import { useActionState, useState, useEffect } from "react"
import FormMessage from "@/app/components/FormMessage"
import { requestPasswordChangeOTP, verifyOTPAndChangePassword, type ProfileState } from "./actions"

const initialState: ProfileState = {
  success: false,
  error: null,
}

export function ChangePasswordForm({ email }: { email: string }) {
  const [step, setStep] = useState<"request" | "verify">("request")
  const [requestState, requestAction, isRequesting] = useActionState(requestPasswordChangeOTP, initialState)
  const [verifyState, verifyAction, isVerifying] = useActionState(verifyOTPAndChangePassword, initialState)

  useEffect(() => {
    if (requestState.success && step === "request") {
      setStep("verify")
    }
  }, [requestState.success, step])

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>

      {step === "request" ? (
        <>
          <FormMessage state={requestState} />

          <form action={requestAction} className="space-y-6">
            <input type="hidden" name="email" value={email} />

            <div>
              <p className="text-sm text-gray-600 mb-4">
                We'll send a verification code to <strong>{email}</strong>
              </p>
              <button
                type="submit"
                disabled={isRequesting}
                className="px-6 py-2.5 bg-[#B07C34] text-white rounded-lg font-medium hover:bg-[#9a6a2a] disabled:opacity-60 transition-all duration-300"
              >
                {isRequesting ? "Sending..." : "Send Verification Code"}
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <FormMessage state={verifyState} />

          <form action={verifyAction} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 text-gray-900 mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 text-gray-900 mb-2">Verification Code</label>
              <input
                type="text"
                name="otp"
                required
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-center text-2xl tracking-[0.25em] font-mono focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
                placeholder="000000"
              />
              <p className="text-xs text-gray-900 mt-1">6-digit code sent to your email</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 text-gray-900 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
                placeholder="Enter new password"
              />
              <p className="text-xs text-gray-900 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 text-gray-900 mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isVerifying}
                className="px-6 py-2.5 bg-[#B07C34] text-white rounded-lg font-medium hover:bg-[#9a6a2a] disabled:opacity-60 transition-all duration-300"
              >
                {isVerifying ? "Changing..." : "Change Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("request")
                }}
                className="px-6 py-2.5 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
              >
                Back
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
