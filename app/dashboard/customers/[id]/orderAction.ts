"use server"

import { requireActiveStaff } from "@/app/libs/auth";
import { prisma } from "@/app/libs/prisma";
import { supabase } from "@/app/libs/supabase";
import { createOrderSchema } from "@/app/libs/schemas/orderSchema";
import { logActivity } from "@/app/libs/activity";
import { revalidatePath } from "next/cache";


export type OrderCreateState = { success: boolean; error: string | null; message?: string; orderId?: string }

export const createOrder = async (prevState: OrderCreateState, formData: FormData): Promise<OrderCreateState> => {
    const session = await requireActiveStaff()
    const customerId = formData.get("customerId")?.toString() ?? ""
    const measurementId = formData.get("measurementId")?.toString()
    const dueDate = formData.get("dueDate")?.toString()
    const dueTime = formData.get("dueTime")?.toString()
    const fabricFile = formData.get("fabric") as File | null

    const validation = createOrderSchema.safeParse({
        title: formData.get("title"),
        amount: formData.get("amount"),
        notes: formData.get("notes"),
    })

    if (!validation.success) {
        return {
            error: validation.error.issues[0].message,
            success: false
        }
    }

    // Validate due date and time
    let dueDatetime: Date | null = null
    if (dueDate || dueTime) {
      if (!dueDate || !dueTime) {
        return { error: "Both due date and time must be provided together", success: false }
      }
      const combined = `${dueDate}T${dueTime}`
      dueDatetime = new Date(combined)
      if (isNaN(dueDatetime.getTime())) {
        return { error: "Invalid due date or time", success: false }
      }
    }

    const customer = await prisma.customer.findFirst({
        where: { id: customerId, companyId: session.companyId },
        select: { id: true },
    })
    if (!customer) return { success: false, error: "Customer not found" }

    if (measurementId) {
        const measurement = await prisma.measurement.findFirst({
            where: { id: measurementId, customerId }
        })
        if (!measurement) {
            return { success: false, error: "Measurement not found" }
        }
    }

    // Validate photo BEFORE creating order
    if (fabricFile && fabricFile.size > 0) {
      if (fabricFile.size > 10 * 1024 * 1024) {
        return { success: false, error: "Photo must be under 10MB" }
      }
      if (!fabricFile.type.startsWith("image/")) {
        return { success: false, error: "Must be an image file" }
      }
    }

    const { title, amount, notes } = validation.data

    let orderId: string
    try {
        orderId = await prisma.$transaction(async (tx: any) => {
            const order = await tx.order.create({
                data: {
                    customerId,
                    companyId: session.companyId,
                    staffId: session.staffId,
                    measurementId: measurementId || null,
                    title,
                    amount: amount ?? null,
                    dueDate: dueDatetime,
                    notes: { text: notes ?? "" },
                }

            })

            await tx.statusHistory.create({
                data: {
                    orderId: order.id,
                    updatedById: session.staffId,
                    status: "RECEIVED",
                    note: "Order Received"

                }
            })

            return order.id
        })
    }
    catch {
        return { success: false, error: "Something went wrong" }
    }

    // Upload fabric photo if provided (validation already done before order creation)
    if (fabricFile && fabricFile.size > 0) {
      try {
        const fileName = `orders/${orderId}/${Date.now()}-${fabricFile.name}`
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
            orderId,
            uploadedBy: session.staffId,
            url: publicUrl,
            caption: "Fabric/Material"
          }
        })
      } catch (uploadErr) {
        console.error("Photo upload error:", uploadErr)
      }
    }

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "order.create",
        entityType: "Order",
        entityId: orderId,
        summary: `created order "${title}"`,
    })

    revalidatePath(`/dashboard/customers/${customerId}`)
    return { success: true, error: null, message: "Order created successfully!", orderId }

}

