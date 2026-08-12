"use client"

import { useActionState, useEffect, useState } from "react"
import { updateMeasurement, UpdateMeasurementState } from "./updateMeasurementAction"

const initialState: UpdateMeasurementState = {
  success: false,
  error: null,
}

export default function MeasurementEditForm({
  orderId,
  measurementId,
  templateName,
  unit,
  values,
  isNew = false,
}: {
  orderId: string
  measurementId: string
  templateName: string
  unit: string
  values: Record<string, any>
  isNew?: boolean
}) {
  const [state, formAction, isPending] = useActionState(
    (prev: UpdateMeasurementState, data: FormData) => updateMeasurement(orderId, measurementId, prev, data),
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-sm text-gray-900">Edit Measurements</h2>
        <p className="text-xs text-gray-500 mt-1">{templateName} ({unit})</p>
      </div>

      {state.error && (
        <p className="text-red-600 text-base mb-4">
          {state.error}
        </p>
      )}

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4 text-sm animate-in fade-in duration-300">
          Measurements updated successfully
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(values).map(([key, value]: any) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-900 mb-1 capitalize">
                {key.replace(/_/g, " ")} ({unit})
              </label>
              <input
                type="number"
                name={key}
                step="0.1"
                defaultValue={value}
                disabled={isPending}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34] disabled:bg-gray-50"
                placeholder={key}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-2.5 bg-[#b07c34] text-white rounded-lg font-semibold hover:bg-[#9a6a2a] disabled:opacity-60 transition"
        >
          {isPending ? "Saving..." : "Update Measurements"}
        </button>
      </form>
    </div>
  )
}
