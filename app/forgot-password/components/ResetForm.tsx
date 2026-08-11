"use client"

import { useActionState } from "react"
import Link from "next/link"
import { resetPassword, ResetPasswordState } from "../actions"

const initialState: ResetPasswordState = {
  success: false,
  error: null,
}

export default function ResetForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    (prev: ResetPasswordState, data: FormData) => resetPassword(token, prev, data),
    initialState
  )

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1B2233] mb-2">Create new password</h1>
        <p className="text-gray-600">Enter a new password for your account.</p>
      </div>

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5 bg-white border border-black/8 rounded-lg p-8">
        <div>
          <label className="block text-sm font-medium text-[#1B2233] mb-2">New Password</label>
          <input
            type="password"
            name="password"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isPending}
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B2233] mb-2">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isPending}
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#B07C34] text-white py-2.5 rounded-lg font-semibold hover:bg-[#9a6a2a] disabled:opacity-60 transition mt-6"
        >
          {isPending ? "Resetting..." : "Reset password"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          <Link href="/login" className="text-[#B07C34] font-semibold hover:underline">Back to login</Link>
        </p>
      </form>
    </div>
  )
}
