"use server"

import { requireActiveStaff } from "@/app/libs/auth"
import { logActivity } from "@/app/libs/activity"
import { prisma } from "@/app/libs/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type CreateOrderState = {
  success?: boolean
  error?: string | null
}

export async function createOrder(
  _state: CreateOrderState,
  formData: FormData
): Promise<CreateOrderState> {
  const session = await requireActiveStaff()

  const customerId = formData.get("customerId")?.toString()
  const measurementId = formData.get("measurementId")?.toString()
  const title = formData.get("title")?.toString()?.trim()
  const amount = formData.get("amount")?.toString()
  const notes = formData.get("notes")?.toString()?.trim()

  if (!customerId || !title) {
    return { error: "Customer and order title are required" }
  }

  // Verify customer exists and belongs to company
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, companyId: session.companyId },
    select: { id: true, fullName: true }
  })

  if (!customer) {
    return { error: "Customer not found" }
  }

  // Verify measurement exists and belongs to customer (if provided)
  if (measurementId) {
    const measurement = await prisma.measurement.findFirst({
      where: { id: measurementId, customerId }
    })
    if (!measurement) {
      return { error: "Measurement not found" }
    }
  }

  try {
    const order = await prisma.order.create({
      data: {
        customerId,
        companyId: session.companyId,
        staffId: session.staffId,
        measurementId: measurementId || null,
        title,
        amount: amount ? Math.max(0, parseInt(amount, 10)) : null,
        type: "NEW",
        status: "RECEIVED",
        notes: notes ? { text: notes } : {}
      }
    })

    logActivity({
      companyId: session.companyId,
      staffId: session.staffId,
      action: "order.create",
      entityType: "Order",
      entityId: order.id,
      summary: `created order "${title}" for ${customer.fullName}`
    })

    revalidatePath("/dashboard/orders")
    redirect(`/dashboard/orders/${order.id}`)
  } catch (err) {
    console.error("Create order error:", err)
    return { error: "Failed to create order" }
  }
}
