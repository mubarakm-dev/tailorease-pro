"use server"

import { requireActiveStaff } from "@/app/libs/auth";
import { prisma } from "@/app/libs/prisma";
import { createOrderSchema } from "@/app/libs/schemas/orderSchema";
import { logActivity } from "@/app/libs/activity";
import { revalidatePath } from "next/cache";


export type OrderCreateState = { success: boolean; error: string | null; message?: string }

export const createOrder = async (prevState: OrderCreateState, formData: FormData): Promise<OrderCreateState> => {
    const session = await requireActiveStaff()
    const customerId = formData.get("customerId")?.toString() ?? ""

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

    const customer = await prisma.customer.findFirst({
        where: { id: customerId, companyId: session.companyId },
        select: { id: true },
    })
    if (!customer) return { error: "Customer not found", success: false }

    const { title, amount, notes } = validation.data

    let orderId: string
    try {
        orderId = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    customerId,
                    companyId: session.companyId,
                    staffId: session.staffId,
                    title,
                    amount: amount ?? null,
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

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "order.create",
        entityType: "Order",
        entityId: orderId,
        summary: `created order "${title}"`,
    })

    revalidatePath(`/dashboard/customers/${customerId}`)
    return { success: true, error: null, message: "Order Created Successfully" }

}

