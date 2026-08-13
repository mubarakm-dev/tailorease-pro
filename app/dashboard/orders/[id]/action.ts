"use server"
import { requireActiveStaff } from "@/app/libs/auth"
import { sendOrderReadyEmail } from "@/app/libs/email"
import { logActivity } from "@/app/libs/activity"
import { prisma } from "@/app/libs/prisma"
import { supabase } from "@/app/libs/supabase"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { nextStatus, prevStatus, STATUS_LABELS } from "./flow"


export const advanceOrderStatus = async (orderId: string, formData?: FormData) => {
    try {
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
            return { success: false, error: "Order not found" }
        }

        // If targetStatus is provided in formData, use that. Otherwise, use next status.
        let targetStatus = nextStatus(order.status)
        if (formData) {
            const target = formData.get("targetStatus")?.toString()
            if (target) targetStatus = target as any
        }

        if (!targetStatus) return { success: false, error: "Cannot advance order" }

        if (targetStatus === "COMPLETED" && session.role !== "SUPER_ADMIN") {
            return { success: false, error: "Only admins can mark orders as complete" }
        }

        await prisma.$transaction([
            prisma.order.update({ where: { id: orderId }, data: { status: targetStatus } }),
            prisma.statusHistory.create({
                data: { orderId, updatedById: session.staffId, status: targetStatus, note: `Moved to ${targetStatus}` },
            }),
        ])

        const email = order.customer.email
        if (targetStatus === "COMPLETED" && email) {
            after(() => sendOrderReadyEmail(email, order.customer.fullName, order.title))
        }

        logActivity({
            companyId: session.companyId,
            staffId: session.staffId,
            action: "order.advance",
            entityType: "Order",
            entityId: orderId,
            summary: `moved "${order.title}" to ${STATUS_LABELS[targetStatus]}`,
        })

        revalidatePath(`/dashboard/orders/${orderId}`)

        return { success: true, error: null }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update order status"
        return { success: false, error: message }
    }
}

export const prevOrderStatus = async (orderId: string) => {
    try {
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
            return { success: false, error: "Order not found" }
        }
        const prev = prevStatus(order.status)
        if (!prev) return { success: false, error: "Cannot revert this status" }

        if (order.status === "COMPLETED" && session.role !== "SUPER_ADMIN") {
            return { success: false, error: "Only admins can revert completed orders" }
        }

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
        return { success: true, error: null }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to revert order status"
        return { success: false, error: message }
    }
}

export const uploadPhoto = async (orderId: string, formData: FormData) => {
    const session = await requireActiveStaff()

    const order = await prisma.order.findFirst({
        where: { id: orderId, companyId: session.companyId },
        select: { id: true, title: true }
    })
    if (!order) return { error: "Order not found", success: false }

    const file = formData.get("file") as File
    const caption = formData.get("caption")?.toString() ?? ""

    if (!file || file.size === 0) return { error: "No file selected", success: false }
    if (file.size > 5 * 1024 * 1024) return { error: "File must be under 5MB", success: false }
    if (!file.type.startsWith("image/")) return { error: "Must be an image", success: false }

    const fileName = `${orderId}/${Date.now()}-${file.name}`
    const buffer = await file.arrayBuffer()

    try {
        const { error } = await supabase.storage
            .from("orders")
            .upload(fileName, buffer, { contentType: file.type })

        if (error) {
            console.error("Supabase upload error:", error)
            throw error
        }

        const { data: { publicUrl } } = supabase.storage
            .from("orders")
            .getPublicUrl(fileName)

        await prisma.orderPhoto.create({
            data: {
                orderId,
                uploadedBy: session.staffId,
                url: publicUrl,
                caption: caption || null
            }
        })

        logActivity({
            companyId: session.companyId,
            staffId: session.staffId,
            action: "order.photo",
            entityType: "Order",
            entityId: orderId,
            summary: `uploaded photo for "${order.title}"`
        })

        revalidatePath(`/dashboard/orders/${orderId}`)
        return { success: true, error: null, message: "Photo uploaded" }
    } catch (err) {
        console.error("Photo upload error:", err)
        return { success: false, error: "Upload failed" }
    }
}

export const deletePhoto = async (photoId: string, orderId: string) => {
    try {
        const session = await requireActiveStaff()

        const photo = await prisma.orderPhoto.findFirst({
            where: { id: photoId, order: { companyId: session.companyId } },
            select: { url: true }
        })
        if (!photo) {
            return { success: false, error: "Photo not found" }
        }

        const fileName = photo.url.split("/").slice(-2).join("/")

        await supabase.storage.from("orders").remove([fileName])
        await prisma.orderPhoto.delete({ where: { id: photoId } })

        logActivity({
            companyId: session.companyId,
            staffId: session.staffId,
            action: "order.photo.delete",
            entityType: "OrderPhoto",
            entityId: photoId,
            summary: `removed photo from order`
        })

        revalidatePath(`/dashboard/orders/${orderId}`)
        return { success: true, error: null }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete photo"
        return { success: false, error: message }
    }
}
