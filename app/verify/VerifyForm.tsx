"use client"

import { useActionState, useState } from "react"
import { verifyCode, resendCode, VerifyState } from "./actions"

const initialState: VerifyState = {
  success: false,
  error: null,
}

export default function VerifyForm({ email: initialEmail = "" }: { email?: string }) {
  const [email, setEmail] = useState(initialEmail)
  const [state, formAction, isPending] = useActionState(verifyCode, initialState)
  const [resendState, resendAction, isResending] = useActionState(resendCode, initialState)

  const canResend = state.canResend || resendState.canResend

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Verify Your Email</h1>

        {state.success ? (
          <div className="bg-green-100 text-green-700 p-4 rounded">
            <p className="font-bold">{state.message}</p>
          </div>
        ) : (
          <>
            {state.error && (
              <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{state.error}</p>
            )}

            {resendState.error && (
              <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{resendState.error}</p>
            )}

            {resendState.message && (
              <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{resendState.message}</p>
            )}

            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" name="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Verification Code</label>
                <input type="text" name="code" required inputMode="numeric" maxLength={6}
                  placeholder="123456"
                  className="w-full border border-gray-300 rounded px-3 py-2 tracking-widest" />
              </div>

              <button type="submit" disabled={isPending}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400">
                {isPending ? "Verifying..." : "Verify"}
              </button>
            </form>

            {canResend && (
              <form action={resendAction} className="mt-4 text-center">
                <input type="hidden" name="email" value={email} />
                <button type="submit" disabled={isResending}
                  className="text-blue-600 underline disabled:text-gray-400">
                  {isResending ? "Sending..." : "Resend code"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
