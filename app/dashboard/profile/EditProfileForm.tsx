"use client"

import { useActionState } from "react"
import FormMessage from "@/app/components/FormMessage"
import { updateStaffProfile, type ProfileState } from "./actions"

const initialState: ProfileState = {
  success: false,
  error: null,
}

export function EditProfileForm({ initialName, initialPhone }: { initialName: string; initialPhone: string }) {
  const [state, formAction, isPending] = useActionState(updateStaffProfile, initialState)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h2>

      <FormMessage state={state} />

      <form action={formAction} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 text-gray-900 mb-2">Full Name</label>
          <input
            type="text"
            name="fullName"
            defaultValue={initialName}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
            placeholder="Your full name"
          />
          <p className="text-xs text-gray-900 mt-1">Minimum 3 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 text-gray-900 mb-2">Phone Number</label>
          <input
            type="text"
            name="phone"
            defaultValue={initialPhone}
            required
            maxLength={11}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#B07C34] focus:ring-1 focus:ring-[#B07C34]"
            placeholder="11-digit phone number"
          />
          <p className="text-xs text-gray-900 mt-1">Exactly 11 characters (e.g., 08012345678)</p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-[#B07C34] text-white rounded-lg font-medium hover:bg-[#9a6a2a] disabled:opacity-60 transition-all duration-300"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
