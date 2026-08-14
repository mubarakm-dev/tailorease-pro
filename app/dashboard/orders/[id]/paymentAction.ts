"use server"

import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { logActivity } from "@/app/libs/activity"
import { revalidatePath } from "next/cache"

export type PaymentState = {
  success: boolean
  error?: string | null
  message?: string
}

export const recordPayment = async (
  _state: PaymentState,
  formData: FormData
): Promise<PaymentState> => {
  const session = await isAuth()
  const orderId = formData.get("orderId")?.toString()
  const amount = formData.get("amount")?.toString()
  const paymentMethod = formData.get("paymentMethod")?.toString()
  const notes = formData.get("notes")?.toString()

  if (!orderId || !amount) {
    return { success: false, error: "Order ID and amount are required" }
  }

  const num = Number(amount)
  if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0) {
    return { success: false, error: "Amount must be a positive number" }
  }
  const paymentAmount = num

  try {
   
    const order = await prisma.order.findFirst({
      where: { id: orderId, companyId: session.companyId },
      select: {
        id: true,
        title: true,
        amount: true,
        customer: { select: { fullName: true } },
        payments: { select: { amount: true } }
      }
    })

    if (!order) {
      return { success: false, error: "Order not found" }
    }

    if (!order.amount) {
      return { success: false, error: "Order has no amount set" }
    }

    const currentPaid = order.payments.reduce((sum: number, p: any) => sum + p.amount, 0)
    const remainingAmount = order.amount - currentPaid

    if (paymentAmount > remainingAmount) {
      return {
        success: false,
        error: `Payment exceeds remaining balance. Remaining: ₦${remainingAmount.toLocaleString()}`
      }
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: paymentAmount,
        paymentMethod: paymentMethod || null,
        notes: notes || null
      }
    })

    const newTotalPaid = currentPaid + paymentAmount
    let newPaymentStatus: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID"
    if (newTotalPaid === order.amount) {
      newPaymentStatus = "PAID"
    } else if (newTotalPaid > 0) {
      newPaymentStatus = "PARTIAL"
    }

    
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: newPaymentStatus }
    })

    
    logActivity({
      companyId: session.companyId,
      staffId: session.staffId,
      action: "payment.create",
      entityType: "Payment",
      entityId: payment.id,
      summary: `Recorded ₦${paymentAmount.toLocaleString()} payment for "${order.title}"`
    })

    revalidatePath(`/dashboard/orders/${orderId}`)

    return {
      success: true,
      message: `Payment of ₦${paymentAmount.toLocaleString()} recorded successfully!`
    }
  } catch (error) {
    console.error("Payment record error:", error)
    return { success: false, error: "Failed to record payment" }
  }
}
