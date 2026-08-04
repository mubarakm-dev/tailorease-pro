"use server"
import { requireActiveStaff } from "@/app/libs/auth"
import { sendOrderReadyEmail } from "@/app/libs/email"
import { prisma } from "@/app/libs/prisma"
import { OrderStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { after } from "next/server"


const FLOW: OrderStatus[] = ["RECEIVED", "CUT_IN_PROGRESS", "SEWING_IN_PROGRESS", "FINISHING", "COMPLETED"]



function nextStatus(current: OrderStatus): OrderStatus | null {
    const i = FLOW.indexOf(current)
    return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null
}


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


    revalidatePath(`/dashboard/orders/${orderId}`)


}