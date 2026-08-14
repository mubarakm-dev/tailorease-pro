"use server"

import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { logActivity } from "@/app/libs/activity"
import { revalidatePath } from "next/cache"

export type UpdateOrderState = {
  success: boolean
  error: string | null
}

export const updateOrder = async (orderId: string, prevState: UpdateOrderState, formData: FormData): Promise<UpdateOrderState> => {
  const session = await isAuth()

  const order = await prisma.order.findFirst({
    where: { id: orderId, companyId: session.companyId },
    select: { id: true, title: true }
  })

  if (!order) {
    return { success: false, error: "Order not found" }
  }

  const title = formData.get("title")?.toString().trim()
  const amount = formData.get("amount")?.toString()
  const dueDate = formData.get("dueDate")?.toString()
  const notes = formData.get("notes")?.toString()

  if (!title) {
    return { success: false, error: "Title is required" }
  }

  try {
    const updateData: any = { title }

    if (amount) {
      const num = Number(amount)
      if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0) {
        return { success: false, error: "Amount must be a positive whole number" }
      }
      updateData.amount = num
    }

    if (dueDate) {
      const date = new Date(dueDate)
      if (isNaN(date.getTime())) {
        return { success: false, error: "Invalid due date" }
      }
      updateData.dueDate = date
    }

    if (notes !== undefined) {
      updateData.notes = { text: notes }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData
    })

    logActivity({
      companyId: session.companyId,
      staffId: session.staffId,
      action: "order.update",
      entityType: "Order",
      entityId: orderId,
      summary: `Updated order "${title}"`
    })

    revalidatePath(`/dashboard/orders/${orderId}`)
    return { success: true, error: null }
  } catch (error) {
    console.error("Update order error:", error)
    return { success: false, error: "Failed to update order" }
  }
}
