"use client"

import { useActionState, useEffect, useState } from "react"
import { updateOrder, UpdateOrderState } from "./updateAction"

const initialState: UpdateOrderState = {
  success: false,
  error: null,
}

export default function OrderEditForm({
  orderId,
  title,
  amount,
  dueDate,
  notes,
  isNew = false,
}: {
  orderId: string
  title: string
  amount: number | null
  dueDate: Date | null
  notes: any
  isNew?: boolean
}) {
  const [state, formAction, isPending] = useActionState(
    (prev: UpdateOrderState, data: FormData) => updateOrder(orderId, prev, data),
    initialState
  )
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [state.success])

  if (!isNew) return null

  const notesText = notes?.text || ""
  const dueDateStr = dueDate ? new Date(dueDate).toISOString().split("T")[0] : ""

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="font-semibold text-sm mb-4 text-gray-900">Edit Order Details</h2>

      {state.error && (
        <p className="text-red-600 text-base mb-4">
          {state.error}
        </p>
      )}

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4 animate-in fade-in duration-300">
          Order updated successfully
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Order Title</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={title}
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34] disabled:bg-gray-50"
            placeholder="e.g., Blue Shirt"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Amount (₦)</label>
            <input
              type="number"
              name="amount"
              min="0"
              defaultValue={amount ?? ""}
              disabled={isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34] disabled:bg-gray-50"
              placeholder="e.g., 15000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              defaultValue={dueDateStr}
              disabled={isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34] disabled:bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Notes</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={notesText}
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34] disabled:bg-gray-50"
            placeholder="Add any notes about this order..."
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-2.5 bg-[#b07c34] text-white rounded-lg font-semibold hover:bg-[#9a6a2a] disabled:opacity-60 transition"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="flex items-start gap-2 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>To update measurements, go to the Measurements section below</span>
      </div>
    </div>
  )
}
