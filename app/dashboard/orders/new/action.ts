"use server"

import { requireActiveStaff } from "@/app/libs/auth"
import { logActivity } from "@/app/libs/activity"
import { prisma } from "@/app/libs/prisma"
import { supabase } from "@/app/libs/supabase"
import { revalidatePath } from "next/cache"

export type CreateOrderState = {
  success?: boolean
  error?: string | null
  message?: string
  orderId?: string
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
  const dueDate = formData.get("dueDate")?.toString()
  const dueTime = formData.get("dueTime")?.toString()
  const fabricFile = formData.get("fabric") as File | null

  if (!customerId || !title) {
    return { success: false, error: "Customer and order title are required" }
  }


  let dueDatetime: Date | null = null
  if (dueDate || dueTime) {
    if (!dueDate || !dueTime) {
      return { success: false, error: "Both due date and time must be provided together" }
    }
    const combined = `${dueDate}T${dueTime}`
    dueDatetime = new Date(combined)
    if (isNaN(dueDatetime.getTime())) {
      return { success: false, error: "Invalid due date or time" }
    }
  }


  const customer = await prisma.customer.findFirst({
    where: { id: customerId, companyId: session.companyId },
    select: { id: true, fullName: true }
  })

  if (!customer) {
    return { success: false, error: "Customer not found" }
  }


  if (measurementId) {
    const measurement = await prisma.measurement.findFirst({
      where: { id: measurementId, customerId }
    })
    if (!measurement) {
      return { success: false, error: "Measurement not found" }
    }
  }

  if (fabricFile && fabricFile.size > 0) {
    if (fabricFile.size > 10 * 1024 * 1024) {
      return { success: false, error: "Photo must be under 10MB" }
    }
    if (!fabricFile.type.startsWith("image/")) {
      return { success: false, error: "Must be an image file" }
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
        dueDate: dueDatetime,
        notes: notes ? { text: notes } : {}
      }
    })


    if (fabricFile && fabricFile.size > 0) {
      try {
        const fileName = `orders/${order.id}/${Date.now()}-${fabricFile.name}`
        const buffer = await fabricFile.arrayBuffer()

        const { error: uploadError } = await supabase.storage
          .from("orders")
          .upload(fileName, buffer, { contentType: fabricFile.type })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("orders")
          .getPublicUrl(fileName)

        await prisma.orderPhoto.create({
          data: {
            orderId: order.id,
            uploadedBy: session.staffId,
            url: publicUrl,
            caption: "Fabric/Material"
          }
        })
      } catch (uploadErr) {
        console.error("Photo upload error:", uploadErr)
        // Don't fail the order creation if photo upload fails
      }
    }

    logActivity({
      companyId: session.companyId,
      staffId: session.staffId,
      action: "order.create",
      entityType: "Order",
      entityId: order.id,
      summary: `created order "${title}" for ${customer.fullName}`
    })

    revalidatePath("/dashboard/orders")

    return { success: true, message: "Order created successfully!", orderId: order.id }
  } catch (err) {
    console.error("Create order error:", err)
    return { success: false, error: "Failed to create order" }
  }
}
