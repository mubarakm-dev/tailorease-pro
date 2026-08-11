"use client"

import { useActionState } from "react"
import { recordPayment, PaymentState } from "./paymentAction"
import FormMessage from "@/app/components/FormMessage"
import SubmitButton from "@/app/components/SubmitButton"

const initialState: PaymentState = { success: false, error: null }

export function PaymentSection({
  orderId,
  orderAmount,
  payments
}: {
  orderId: string
  orderAmount: number | null
  payments: Array<{ id: string; amount: number; paymentMethod?: string | null; notes?: string | null; createdAt: Date }>
}) {
  const [state, formAction, isPending] = useActionState(recordPayment, initialState)

  if (!orderAmount) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <p className="text-sm text-gray-400">No amount set for this order</p>
      </div>
    )
  }

  const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0)
  const remaining = orderAmount - totalPaid
  const paidPercentage = (totalPaid / orderAmount) * 100

  const paymentStatusColor =
    totalPaid === orderAmount
      ? "bg-green-100 text-green-700"
      : totalPaid > 0
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700"

  const paymentStatusLabel =
    totalPaid === orderAmount ? "Fully Paid" : totalPaid > 0 ? "Partially Paid" : "Unpaid"

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="font-semibold text-sm mb-4">Payment Tracking</h2>

        {/* Payment Summary */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColor}`}>
              {paymentStatusLabel}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">₦{totalPaid.toLocaleString()} / ₦{orderAmount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#b07c34] h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(paidPercentage, 100)}%` }}
              />
            </div>
          </div>

          {remaining > 0 && (
            <div className="flex justify-between text-sm bg-amber-50 p-3 rounded-lg">
              <span className="text-amber-900">Balance Due</span>
              <span className="font-semibold text-amber-900">₦{remaining.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Form */}
      <div className="border-t pt-6">
        <h3 className="font-semibold text-sm mb-4">Record Payment</h3>

        <FormMessage state={state} />

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="orderId" value={orderId} />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Amount</label>
              <input
                type="number"
                name="amount"
                required
                min="1"
                max={remaining}
                placeholder={`Max: ₦${remaining.toLocaleString()}`}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Method <span className="text-gray-400">(optional)</span>
              </label>
              <select
                name="paymentMethod"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34]"
              >
                <option value="">Select method</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Mobile Money">Mobile Money</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g., Partial payment, Balance due on delivery..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#b07c34] focus:ring-1 focus:ring-[#b07c34] resize-none"
            />
          </div>

          <SubmitButton
            className="bg-[#b07c34] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#9a6a2a] disabled:opacity-60 w-full"
            pendingText="Recording..."
          >
            Record Payment
          </SubmitButton>
        </form>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-sm mb-4">Payment History</h3>
          <div className="space-y-2">
            {payments.map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    ₦{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {payment.paymentMethod ? `${payment.paymentMethod} • ` : ""}
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                  {payment.notes && <p className="text-xs text-gray-600 mt-1">{payment.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
