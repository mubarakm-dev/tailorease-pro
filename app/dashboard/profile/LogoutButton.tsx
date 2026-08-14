"use client"

import { useState } from "react"
import { logoutStaff } from "./actions"

export function LogoutButton() {
  const [showModal, setShowModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logoutStaff()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-300"
      >
        Sign out
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign out?</h2>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to sign out? You'll need to log in again to access your account.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-60 transition-all duration-300"
              >
                Cancel
              </button>
              <form action={handleLogout} className="flex-1">
                <button
                  type="submit"
                  disabled={isLoggingOut}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-60 transition-all duration-300"
                >
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
