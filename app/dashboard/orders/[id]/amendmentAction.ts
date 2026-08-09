"use server"

import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { logActivity } from "@/app/libs/activity"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export const createAmendment = async (orderId: string) => {
    const session = await isAuth()

    const originalOrder = await prisma.order.findFirst({
        where: { id: orderId, companyId: session.companyId },
        select: {
            id: true,
            title: true,
            status: true,
            customerId: true,
            companyId: true,
            staffId: true,
            measurementId: true,
            amount: true,
            dueDate: true,
            notes: true,
        },
    })

    if (!originalOrder) {
        throw new Error("Order not found")
    }

    if (originalOrder.status !== "COMPLETED") {
        throw new Error("Only completed orders can be amended")
    }

    const amendment = await prisma.order.create({
        data: {
            title: `${originalOrder.title} (Amendment)`,
            customerId: originalOrder.customerId,
            companyId: originalOrder.companyId,
            staffId: originalOrder.staffId,
            measurementId: originalOrder.measurementId,
            amount: originalOrder.amount,
            dueDate: originalOrder.dueDate,
            notes: originalOrder.notes || { text: "" },
            type: "AMENDMENT",
            parentOrderId: originalOrder.id,
        },
    })

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "order.amend",
        entityType: "Order",
        entityId: amendment.id,
        summary: `Created amendment for "${originalOrder.title}"`,
    })

    revalidatePath(`/dashboard/orders/${orderId}`)
    redirect(`/dashboard/orders/${amendment.id}`)
}
