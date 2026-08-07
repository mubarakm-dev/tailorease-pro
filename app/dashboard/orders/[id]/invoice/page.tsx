import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await isAuth()

  const order = await prisma.order.findFirst({
    where: { id, companyId: session.companyId },
    select: {
      id: true,
      title: true,
      amount: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      customer: { select: { fullName: true, phone: true, email: true } },
      company: { select: { companyName: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          paymentMethod: true,
          createdAt: true
        }
      }
    }
  })

  if (!order) notFound()

  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = (order.amount ?? 0) - totalPaid

  return (
    <div className="min-h-screen bg-white p-8 print:p-0">
      <div className="max-w-4xl mx-auto">
        {/* No-print header with back link and print button */}
        <div className="print:hidden mb-6 flex items-center justify-between">
          <Link href={`/dashboard/orders/${id}`} className="text-sm text-[#b07c34] hover:underline">
            ← Back to order
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#b07c34] text-white rounded-lg text-sm hover:bg-[#9a6a2a] transition"
          >
            Print / Save as PDF
          </button>
        </div>

        {/* Invoice Content - Optimized for single page */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-300 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1B2233]">INVOICE</h1>
              <p className="text-sm text-gray-600 mt-1">Invoice #{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right text-sm text-gray-700">
              <p className="font-semibold">{order.company.companyName}</p>
              <p className="text-xs text-gray-600 mt-1">Manage. Measure. Master.</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="text-gray-600 font-medium">Invoice Date</p>
              <p className="text-gray-900">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Invoice ID</p>
              <p className="text-gray-900 font-mono">{order.id}</p>
            </div>
          </div>

          {/* Customer & Order Details */}
          <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-300">
            <div className="text-sm">
              <p className="text-gray-600 font-medium mb-2">Bill To</p>
              <p className="font-semibold text-gray-900">{order.customer.fullName}</p>
              <p className="text-gray-600">{order.customer.phone}</p>
              {order.customer.email && <p className="text-gray-600">{order.customer.email}</p>}
            </div>
            <div className="text-sm">
              <p className="text-gray-600 font-medium mb-2">Order Details</p>
              <p className="text-gray-900"><span className="font-medium">Description:</span> {order.title}</p>
              <p className="text-gray-600 text-xs mt-1">Status: {order.status}</p>
            </div>
          </div>

          {/* Amount Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left py-2 text-gray-900 font-semibold">Description</th>
                <th className="text-right py-2 text-gray-900 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="py-4 text-gray-900">{order.title}</td>
                <td className="text-right py-4 text-gray-900 font-medium">₦{(order.amount ?? 0).toLocaleString()}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 text-gray-900 font-semibold text-right pr-4">Total Due:</td>
                <td className="text-right py-3 text-gray-900 font-bold text-lg">₦{(order.amount ?? 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Payment Summary */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Total Amount Due:</span>
              <span className="font-semibold text-gray-900">₦{(order.amount ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Amount Paid:</span>
              <span className="font-semibold text-gray-900">₦{totalPaid.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-300 pt-3 flex justify-between">
              <span className="text-gray-900 font-semibold">Balance Due:</span>
              <span className={`font-bold text-lg ${remaining === 0 ? "text-green-600" : "text-red-600"}`}>
                ₦{remaining.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment History */}
          {order.payments.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">Payment History</p>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border border-gray-300">
                    <th className="px-2 py-2 text-left text-gray-900">Date</th>
                    <th className="px-2 py-2 text-left text-gray-900">Method</th>
                    <th className="px-2 py-2 text-right text-gray-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.payments.map((payment) => (
                    <tr key={payment.id} className="border border-gray-300">
                      <td className="px-2 py-2 text-gray-700">
                        {new Date(payment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                      </td>
                      <td className="px-2 py-2 text-gray-700">{payment.paymentMethod || "—"}</td>
                      <td className="px-2 py-2 text-right text-gray-900 font-medium">₦{payment.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payment Status */}
          <div className="pt-4 border-t border-gray-300">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">Payment Status:</span>
              <span className={`px-3 py-1 rounded-full font-medium ${
                remaining === 0
                  ? "bg-green-100 text-green-700"
                  : totalPaid > 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}>
                {remaining === 0 ? "Fully Paid" : totalPaid > 0 ? "Partially Paid" : "Unpaid"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-300 text-center text-xs text-gray-600 space-y-1">
            <p>Thank you for your business</p>
            <p className="text-[#b07c34] font-semibold">Manage. Measure. Master.</p>
            <p className="text-gray-500 print:text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .max-w-4xl {
            max-width: 100%;
          }
          * {
            box-shadow: none !important;
          }
          page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}
