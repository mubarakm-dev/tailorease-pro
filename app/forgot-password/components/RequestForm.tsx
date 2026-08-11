"use client"

import { useActionState } from "react"
import Link from "next/link"
import { requestPasswordReset, ForgotPasswordState } from "../actions"

const initialState: ForgotPasswordState = {
  success: false,
  error: null,
}

export default function RequestForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState)

  return (
    <div className="w-full">
      {!(state.success && !state.error) && (
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1B2233] mb-2">Reset your password</h1>
          <p className="text-gray-600">Enter your email and we'll send you a link to reset it.</p>
        </div>
      )}

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {state.error}
        </div>
      )}

      {state.success && !state.error ? (
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-[#1B2233] mb-3">Check your email</h2>
          <p className="text-gray-600 mb-2">We've sent a password reset link.</p>
          <p className="text-sm text-gray-500 mb-8">It expires in 1 hour.</p>
          <p className="text-xs text-gray-400 mb-8">Didn't receive it? Check your spam folder or try again.</p>
          <Link href="/login" className="inline-block px-6 py-2.5 bg-[#B07C34] text-white rounded-lg font-semibold hover:bg-[#9a6a2a] transition">
            Back to login
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-5 bg-white border border-black/8 rounded-lg p-8">
          <div>
            <label className="block text-sm font-medium text-[#1B2233] mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#B07C34] text-white py-2.5 rounded-lg font-semibold hover:bg-[#9a6a2a] disabled:opacity-60 transition mt-6"
          >
            {isPending ? "Sending..." : "Send reset link"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Remember your password? <Link href="/login" className="text-[#B07C34] font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      )}
    </div>
  )
}
