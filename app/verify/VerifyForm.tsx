
"use client"

import { useActionState, useState } from "react"
import { useSearchParams } from "next/navigation"
import { verifyCode, resendCode, VerifyState } from "./actions"

const initialState: VerifyState = {
  success: false,
  error: null,
}

export default function VerifyForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [state, formAction, isPending] = useActionState(verifyCode, initialState)
  const [resendState, resendAction, isResending] = useActionState(resendCode, initialState)

  // which action the user did last, so only that one's feedback shows
  const [lastAction, setLastAction] = useState<"verify" | "resend" | null>(null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
        <p className="text-gray-600 mb-6">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>

        {lastAction === "verify" && state.error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{state.error}</p>
        )}

        {lastAction === "resend" && resendState.error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{resendState.error}</p>
        )}

        {lastAction === "resend" && resendState.message && (
          <p className="bg-blue-100 text-blue-700 p-3 rounded mb-4">{resendState.message}</p>
        )}

        {state.success && (
          <div className="bg-green-100 text-green-700 p-4 rounded">
            <p className="font-bold">{state.message}</p>
            <a href="/login" className="inline-block mt-4 text-blue-600 underline">Go to Login</a>
          </div>
        )}

        {!state.success && (
          <>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="email" value={email} />

              <div>
                <label className="block text-sm font-medium mb-1">Verification Code</label>
                <input
                  type="text"
                  name="code"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-center text-2xl tracking-widest"
                />
              </div>

              <button
                type="submit"
                onClick={() => setLastAction("verify")}
                disabled={isPending}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
              >
                {isPending ? "Verifying..." : "Verify"}
              </button>
            </form>

            <form action={resendAction} className="mt-4 text-center">
              <input type="hidden" name="email" value={email} />
              <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
              <button
                type="submit"
                onClick={() => setLastAction("resend")}
                disabled={isResending}
                className="text-blue-600 underline text-sm disabled:text-gray-400"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}