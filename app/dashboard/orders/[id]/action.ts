"use server"
import { requireActiveStaff } from "@/app/libs/auth"
import { sendOrderReadyEmail } from "@/app/libs/email"
import { logActivity } from "@/app/libs/activity"
import { prisma } from "@/app/libs/prisma"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { nextStatus, prevStatus, STATUS_LABELS } from "./flow"


export const advanceOrderStatus = async (orderId: string) => {
    const session = await requireActiveStaff()

    const order = await prisma.order.findFirst({
        where: { id: orderId, companyId: session.companyId },
        select: {
            id: true,
            title: true,
            amount: true,
            status: true,
            customer: {
                select: {
                    fullName: true,
                    email: true
                }
            }

        }
    })

    if (!order) {
        return
    }

    const next = nextStatus(order.status)
    if (!next) return

    if (next === "COMPLETED" && session.role !== "SUPER_ADMIN") return

    await prisma.$transaction([
        prisma.order.update({ where: { id: orderId }, data: { status: next } }),
        prisma.statusHistory.create({
            data: { orderId, updatedById: session.staffId, status: next, note: `Moved to ${next}` },
        }),
    ])

    const email = order.customer.email
    if (next === "COMPLETED" && email) {
        after(() => sendOrderReadyEmail(email, order.customer.fullName, order.title))
    }

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "order.advance",
        entityType: "Order",
        entityId: orderId,
        summary: `advanced "${order.title}" to ${STATUS_LABELS[next]}`,
    })

    revalidatePath(`/dashboard/orders/${orderId}`)


}

export const prevOrderStatus = async (orderId: string) => {
    const session = await requireActiveStaff()

    const order = await prisma.order.findFirst({
        where: { id: orderId, companyId: session.companyId },
        select: {
            id: true,
            title: true,
            status: true,
        }
    })

    if (!order) {
        return
    }
    const prev = prevStatus(order.status)
    if (!prev) return

    if (order.status === "COMPLETED" && session.role !== "SUPER_ADMIN") return
    await prisma.$transaction([
        prisma.order.update({ where: { id: orderId }, data: { status: prev } }),
        prisma.statusHistory.create({
            data: { orderId, updatedById: session.staffId, status: prev, note: `Reverted to ${STATUS_LABELS[prev]}` },
        })
    ])

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "order.revert",
        entityType: "Order",
        entityId: orderId,
        summary: `moved "${order.title}" back to ${STATUS_LABELS[prev]}`,
    })

    revalidatePath(`/dashboard/orders/${orderId}`)


}