
"use client"

import { useActionState, useState, useEffect, useRef, startTransition } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyCode, resendCode, VerifyState } from "./actions"

const initialState: VerifyState = {
  success: false,
  error: null,
}

export default function VerifyForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") || ""
  const fresh = searchParams.get("fresh") === "1"

  const [state, formAction, isPending] = useActionState(verifyCode, initialState)
  const [resendState, resendAction, isResending] = useActionState(resendCode, initialState)

  const [lastAction, setLastAction] = useState<"verify" | "resend" | null>(null)

  const autoSent = useRef(false)
  useEffect(() => {
    if (fresh && email && !autoSent.current) {
      autoSent.current = true
      const formData = new FormData()
      formData.append("email", email)
      startTransition(() => {
        setLastAction("resend")
        resendAction(formData)
      })
      router.replace(`/verify?email=${encodeURIComponent(email)}`)
    }
  }, [fresh, email, resendAction, router])

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
            <h1 className="text-3xl font-serif font-bold text-[#1B2233] mb-2">Verify your email</h1>
            {!state.success && (
              <p className="text-gray-600">
                Enter the 6-digit code we sent to <strong>{email}</strong>
              </p>
            )}
          </div>

          {lastAction === "verify" && !isPending && state.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              {state.error}
            </div>
          )}

          {lastAction === "resend" && !isResending && resendState.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              {resendState.error}
            </div>
          )}

          {lastAction === "resend" && !isResending && resendState.message && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
              {resendState.message}
            </div>
          )}

          {state.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">✓</div>
              <p className="text-green-900 font-semibold mb-2">{state.message}</p>
              <p className="text-green-700 text-sm mb-6">Your account is verified and ready to use.</p>
              <Link href="/login" className="inline-block w-full text-center bg-[#B07C34] text-white py-2.5 rounded-lg font-semibold hover:bg-[#9a6a2a] transition">
                Sign in now
              </Link>
            </div>
          )}

          {!state.success && (
            <div className="bg-white border border-black/8 rounded-lg p-8 space-y-6">
              <form action={formAction} className="space-y-5">
                <input type="hidden" name="email" value={email} />

                <div>
                  <label className="block text-sm font-medium text-[#1B2233] mb-2">Verification Code</label>
                  <input
                    type="text"
                    name="code"
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
                  />
                </div>

                <button
                  type="submit"
                  onClick={() => setLastAction("verify")}
                  disabled={isPending}
                  className="w-full bg-[#B07C34] text-white py-2.5 rounded-lg font-semibold hover:bg-[#9a6a2a] disabled:opacity-60 transition"
                >
                  {isPending ? "Verifying..." : "Verify Email"}
                </button>
              </form>

              <div className="border-t border-gray-200 pt-6 text-center">
                <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
                <form action={resendAction} className="flex flex-col gap-2">
                  <input type="hidden" name="email" value={email} />
                  <button
                    type="submit"
                    onClick={() => setLastAction("resend")}
                    disabled={isResending}
                    className="text-[#B07C34] font-semibold hover:underline disabled:opacity-60 transition"
                  >
                    {isResending ? "Sending..." : "Resend Code"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-black/8 px-6 py-6 text-center text-sm text-gray-600 space-y-3">
        <p className="text-[#B07C34] font-semibold uppercase tracking-wider">Manage. Measure. Master.</p>
        <p>Check your spam folder if you don't see the code.</p>
      </div>
    </div>
  )
}