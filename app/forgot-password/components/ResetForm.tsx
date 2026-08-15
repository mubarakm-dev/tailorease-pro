"use client"

import { useActionState, useState } from "react"
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
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)

  const passwordError = passwordTouched && password.length > 0 && password.length < 8
  const passwordMismatch = confirmTouched && confirmPassword.length > 0 && confirmPassword !== password
  const hasValidationError = passwordError || passwordMismatch

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1B2233] mb-2">Create new password</h1>
        <p className="text-gray-600">Enter a new password for your account.</p>
      </div>

      {state.error && (
        <p className="text-red-600 text-base mb-6">
          {state.error}
        </p>
      )}

      <form action={formAction} className="space-y-5 bg-white border border-black/8 rounded-lg p-8">
        <div>
          <label className="block text-sm font-medium text-[#1B2233] mb-2">New Password</label>
          <input
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isPending}
          />
          <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
          {passwordError && (
            <p className="text-red-600 text-xs mt-1">Password must be at least 8 characters</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B2233] mb-2">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setConfirmTouched(true)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isPending}
          />
          {passwordMismatch && (
            <p className="text-red-600 text-xs mt-1">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || hasValidationError}
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
