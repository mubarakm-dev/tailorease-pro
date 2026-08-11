"use server"

import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { logActivity } from "@/app/libs/activity"
import { redirect } from "next/navigation"

export const duplicateOrder = async (orderId: string) => {
    const session = await isAuth()

    const originalOrder = await prisma.order.findFirst({
        where: { id: orderId, companyId: session.companyId },
        select: {
            id: true,
            title: true,
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

    const newOrder = await prisma.order.create({
        data: {
            title: `${originalOrder.title} (Copy)`,
            customerId: originalOrder.customerId,
            companyId: originalOrder.companyId,
            staffId: originalOrder.staffId,
            measurementId: originalOrder.measurementId,
            amount: null,
            dueDate: null,
            notes: originalOrder.notes || { text: "" },
            type: "NEW",
            status: "RECEIVED",
        },
    })

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "order.duplicate",
        entityType: "Order",
        entityId: newOrder.id,
        summary: `Created order duplicate from "${originalOrder.title}"`,
    })

    redirect(`/dashboard/orders/${newOrder.id}`)
}
