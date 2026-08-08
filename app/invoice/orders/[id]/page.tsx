import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PrintButton } from "./PrintButton"

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
    <div className="min-h-screen bg-white print:bg-white">
      <div className="max-w-4xl mx-auto p-8 print:p-4" style={{ pageBreakAfter: "avoid" }}>

        <div className="print:hidden mb-6 flex items-center justify-between">
          <Link href={`/dashboard/orders/${id}`} className="text-sm text-[#b07c34] hover:underline">
            ← Back to order
          </Link>
          <PrintButton />
        </div>


        <div className="space-y-2">

          <div className="flex justify-between items-start border-b border-gray-300 pb-2">
            <div>
              <h1 className="text-xl font-bold text-[#1B2233]">INVOICE</h1>
              <p className="text-xs text-gray-600">Invoice #{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right text-xs text-gray-700">
              <p className="font-semibold text-xs">{order.company.companyName}</p>
              <p className="text-xs text-gray-600">Manage. Measure. Master.</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-600 font-medium text-xs">Invoice Date</p>
              <p className="text-gray-900 text-xs">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium text-xs">Invoice ID</p>
              <p className="text-gray-900 font-mono text-xs">{order.id}</p>
            </div>
          </div>


          <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-300">
            <div className="text-xs">
              <p className="text-gray-600 font-medium mb-1">Bill To</p>
              <p className="font-semibold text-gray-900 text-xs">{order.customer.fullName}</p>
              <p className="text-gray-600 text-xs">{order.customer.phone}</p>
              {order.customer.email && <p className="text-gray-600 text-xs">{order.customer.email}</p>}
            </div>
            <div className="text-xs">
              <p className="text-gray-600 font-medium mb-1">Order Details</p>
              <p className="text-gray-900 text-xs"><span className="font-medium">Description:</span> {order.title}</p>
              <p className="text-gray-600 text-xs">Status: {order.status}</p>
            </div>
          </div>


          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-900">
                <th className="text-left py-1 text-gray-900 font-semibold">Description</th>
                <th className="text-right py-1 text-gray-900 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="py-1 text-gray-900 text-xs">{order.title}</td>
                <td className="text-right py-1 text-gray-900 font-medium text-xs">₦{(order.amount ?? 0).toLocaleString()}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-1 text-gray-900 font-semibold text-right pr-2 text-xs">Total Due:</td>
                <td className="text-right py-1 text-gray-900 font-bold text-xs">₦{(order.amount ?? 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="space-y-1 bg-gray-50 p-2 rounded text-xs">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Amount Due:</span>
              <span className="font-semibold text-gray-900">₦{(order.amount ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Amount Paid:</span>
              <span className="font-semibold text-gray-900">₦{totalPaid.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-300 pt-1 flex justify-between">
              <span className="text-gray-900 font-semibold">Balance Due:</span>
              <span className={`font-bold ${remaining === 0 ? "text-green-600" : "text-red-600"}`}>
                ₦{remaining.toLocaleString()}
              </span>
            </div>
          </div>


          {order.payments.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-900">Payment History</p>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border border-gray-300">
                    <th className="px-1 py-1 text-left text-gray-900 text-xs">Date</th>
                    <th className="px-1 py-1 text-left text-gray-900 text-xs">Method</th>
                    <th className="px-1 py-1 text-right text-gray-900 text-xs">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.payments.map((payment) => (
                    <tr key={payment.id} className="border border-gray-300">
                      <td className="px-1 py-1 text-gray-700 text-xs">
                        {new Date(payment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                      </td>
                      <td className="px-1 py-1 text-gray-700 text-xs">{payment.paymentMethod || "—"}</td>
                      <td className="px-1 py-1 text-right text-gray-900 font-medium text-xs">₦{payment.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}


          <div className="pt-2 border-t border-gray-300">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-700 font-medium">Payment Status:</span>
              <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${
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

          <div className="pt-2 border-t border-gray-300 text-center text-xs text-gray-600 space-y-0.5">
            <p className="text-xs">Thank you for your business</p>
            <p className="text-[#b07c34] font-semibold text-xs">Manage. Measure. Master.</p>
            <p className="text-gray-500 print:text-gray-600 text-xs">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

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
