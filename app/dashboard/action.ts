"use server"

import { clearSession } from "@/app/libs/session"
import { requireActiveStaff } from "@/app/libs/auth"
import { redirect } from "next/navigation"

import { prisma } from "../libs/prisma"
import { logActivity } from "../libs/activity"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { sendStaffApprovalEmail, sendStaffReactivateEmail, sendStaffRejectedEmail, sendStaffSuspendedEmail } from "../libs/email"


export const logout = async () => {
    await clearSession()
    redirect("/login")
}

export const approveStaff = async (staffId: string) => {
    const session = await requireActiveStaff()

    if (session.role !== "SUPER_ADMIN") {
        return

    }

    const staff = await prisma.staff.findFirst({
        where: { id: staffId, companyId: session.companyId },
        include: {
            company: {
                select: { companyName: true }
            }
        }

    })

      if (!staff) return
    await prisma.staff.updateMany({
        where: { id: staffId, companyId: session.companyId },
        data: {
            status: "APPROVED"
        }


    })

    after(async () => {
        try {
            await sendStaffApprovalEmail(staff.email, staff.company.companyName, staff.fullName)
        } catch (error) {
            console.error("Staff Approval Email failed", error)
        }
    })

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "staff.approve",
        entityType: "Staff",
        entityId: staffId,
        summary: `approved staff "${staff.fullName}"`,
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/staff")
}


export const rejectStaff = async (staffId: string) => {

    const session = await requireActiveStaff()

    if (session.role !== "SUPER_ADMIN") {
        return

    }
    const staff = await prisma.staff.findFirst({
        where: { id: staffId, companyId: session.companyId },   
        include: { company: { select: { companyName: true } } },
    })
    if (!staff) return


    await prisma.staff.updateMany({
        where: { id: staffId, companyId: session.companyId },
        data: {
            status: "REJECTED"
        }
    })

    after(async () => {
        try {
            await sendStaffRejectedEmail(staff.email, staff.company.companyName, staff.fullName)
        } catch (error) {
            console.error("Staff Rejection Email failed", error)
        }
    })

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "staff.reject",
        entityType: "Staff",
        entityId: staffId,
        summary: `rejected staff "${staff.fullName}"`,
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/staff")
}

export const suspendStaff = async (staffId: string)=>{
    const session = await requireActiveStaff()
    if (session.role !== "SUPER_ADMIN") {
        return
    }
     const staff = await prisma.staff.findFirst({
        where: { id: staffId, companyId: session.companyId },   
        include: { company: { select: { companyName: true } } },
    })
    if (!staff) return
     await prisma.staff.updateMany({
        where: { id: staffId, companyId: session.companyId },
        data: {
            status: "SUSPENDED"
        }
    })

    after(async () => {
        try {
            await sendStaffSuspendedEmail(staff.email, staff.company.companyName, staff.fullName)
        } catch (error) {
            console.error("Staff suspension Email failed", error)
        }
    })

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "staff.suspend",
        entityType: "Staff",
        entityId: staffId,
        summary: `suspended staff "${staff.fullName}"`,
    })

    revalidatePath("/dashboard/staff")
}



export const reactivateStaff = async (staffId: string)=>{
    const session = await requireActiveStaff()
    if (session.role !== "SUPER_ADMIN") {
        return
    }
     const staff = await prisma.staff.findFirst({
        where: { id: staffId, companyId: session.companyId },   
        include: { company: { select: { companyName: true } } },
    })
    if (!staff) return
     await prisma.staff.updateMany({
        where: { id: staffId, companyId: session.companyId },
        data: {
            status: "APPROVED"
        }
    })

    after(async () => {
        try {
            await sendStaffReactivateEmail(staff.email, staff.company.companyName, staff.fullName)
        } catch (error) {
            console.error("Staff Reactivation Email failed", error)
        }
    })

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "staff.reactivate",
        entityType: "Staff",
        entityId: staffId,
        summary: `reactivated staff "${staff.fullName}"`,
    })

    revalidatePath("/dashboard/staff")
}
