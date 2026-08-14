"use client"

import { useActionState, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createOrder } from "./action"
import FormMessage from "@/app/components/FormMessage"

type Props = {
  customers: Array<{ id: string; fullName: string }>
  measurements: Array<{
    id: string
    customerId: string
    snapshot: Record<string, any>
    createdAt: Date
    template: { name: string }
  }>
}

const initialState = {
  success: false,
  error: null,
}

export default function NewOrderForm({ customers, measurements }: Props) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createOrder, initialState)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")

  useEffect(() => {
    if (state.success && state.orderId) {
      router.push(`/dashboard/orders/${state.orderId}`)
    }
  }, [state.success, state.orderId, router])

  const customerMeasurements = selectedCustomerId
    ? measurements.filter((m: any) => m.customerId === selectedCustomerId)
    : []

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <Link href="/dashboard/orders" className="text-[#b07c34] text-sm hover:underline mb-4 inline-block">
          ← Back to orders
        </Link>
        <h1 className="text-2xl font-semibold text-[#1b2233]">Create new order</h1>
        <p className="text-gray-500 text-sm mt-1">Start tracking a new order from your customer</p>
      </div>

      <form action={formAction} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <FormMessage state={state} />

        <div>
          <label htmlFor="customerId" className="block text-sm font-medium text-[#1b2233] mb-2">
            Customer
          </label>
          <select
            id="customerId"
            name="customerId"
            required
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34]"
          >
            <option value="">Select a customer...</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>

        {selectedCustomerId && customerMeasurements.length > 0 && (
          <div>
            <label htmlFor="measurementId" className="block text-sm font-medium text-[#1b2233] mb-2">
              Measurement to use for this order
            </label>
            <select
              id="measurementId"
              name="measurementId"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34]"
            >
              <option value="">No specific measurement</option>
              {customerMeasurements.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.template.name} — {new Date(m.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Select which measurement to use for cutting and sewing</p>
          </div>
        )}

        {selectedCustomerId && customerMeasurements.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              No measurements on file for this customer yet. <Link href={`/dashboard/customers/${selectedCustomerId}`} className="text-[#b07c34] hover:underline">Add one first</Link>
            </p>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#1b2233] mb-2">
            Order title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="e.g., Traditional Aso-Oke Set"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34]"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-[#1b2233] mb-2">
            Amount (₦)
          </label>
          <input
            id="amount"
            type="number"
            name="amount"
            min="0"
            placeholder="e.g., 25000"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34]"
          />
          <p className="text-xs text-gray-500 mt-1">Optional - leave blank if price not finalized</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-[#1b2233] mb-2">
              Due date
            </label>
            <input
              id="dueDate"
              type="date"
              name="dueDate"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34]"
            />
            <p className="text-xs text-gray-500 mt-1">Optional - when order should be ready</p>
          </div>

          <div>
            <label htmlFor="dueTime" className="block text-sm font-medium text-[#1b2233] mb-2">
              Due time
            </label>
            <input
              id="dueTime"
              type="time"
              name="dueTime"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34]"
            />
            <p className="text-xs text-gray-500 mt-1">Optional - what time it's due</p>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-[#1b2233] mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            placeholder="Special instructions or details about this order..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34] resize-none"
          />
        </div>

        <div>
          <label htmlFor="fabric" className="block text-sm font-medium text-[#1b2233] mb-2">
            Fabric/Material photo
          </label>
          <input
            id="fabric"
            type="file"
            name="fabric"
            accept="image/*"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34]"
          />
          <p className="text-xs text-gray-500 mt-1">Optional - upload a photo of the customer's fabric/materials</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-[#b07c34] text-white py-2.5 rounded-lg font-semibold hover:bg-[#9a6a2a] disabled:opacity-60 transition"
          >
            {isPending ? "Creating..." : "Create order"}
          </button>
          <Link
            href="/dashboard/orders"
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-900 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
