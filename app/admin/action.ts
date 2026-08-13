"use server"

import { clearAdminSession, isAuthAdmin } from "@/app/libs/adminSession"
import { prisma } from "@/app/libs/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { sendCompanyApprovalEmail, sendCompanyReactivatedEmail, sendCompanyRejectedEmail, sendCompanySuspendedEmail } from "../libs/email"

export const adminLogout = async () => {
    await clearAdminSession()
    redirect("/admin/login")
}

export const approveCompany = async (companyId: string) => {
    try {
        await isAuthAdmin()

        const [company] = await prisma.$transaction([
            prisma.company.update({
                where: { id: companyId },
                data: { status: "APPROVED" },
                include: { staff: { where: { role: "SUPER_ADMIN" }, select: { email: true, fullName: true } } },
            }),
            prisma.staff.updateMany({
                where: { companyId, role: "SUPER_ADMIN" },
                data: { status: "APPROVED" },
            }),
        ])

        const owner = company.staff[0]
        after(async () => {
            try {
                if (owner) await sendCompanyApprovalEmail(owner.email, company.companyName, owner.fullName, company.companyCode)
            } catch (error) {
                console.error("Company Approval Email failed", error)
            }
        })

        revalidatePath("/admin")
        return { success: true, error: null }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to approve company"
        return { success: false, error: message }
    }
}

export const rejectCompany = async (companyId: string) => {
    try {
        await isAuthAdmin()

        const company = await prisma.company.update({
            where: { id: companyId },
            data: { status: "REJECTED" },
            include: { staff: { where: { role: "SUPER_ADMIN" }, select: { email: true, fullName: true } } },
        })

        const owner = company.staff[0]
        after(async () => {
            try {
                if (owner) await sendCompanyRejectedEmail(owner.email, company.companyName, owner.fullName)
            } catch (error) {
                console.error("Company Rejection Email failed", error)
            }
        })

        revalidatePath("/admin")
        return { success: true, error: null }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to reject company"
        return { success: false, error: message }
    }
}


export const suspendCompany = async (companyId: string) => {
    try {
        await isAuthAdmin()
        const company = await prisma.company.update({
            where: { id: companyId },
            data: { status: "SUSPENDED" },
            include: { staff: { where: { role: "SUPER_ADMIN" }, select: { email: true, fullName: true } } },
        })

        const owner = company.staff[0]
        after(async () => {
            try {
                if (owner) await sendCompanySuspendedEmail(owner.email, company.companyName, owner.fullName)
            } catch (error) {
                console.error("Company Suspension Email failed", error)
            }
        })
        revalidatePath("/admin")
        return { success: true, error: null }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to suspend company"
        return { success: false, error: message }
    }

}

export const reactivateCompany = async (companyId: string) => {
    try {
        await isAuthAdmin()
        const company = await prisma.company.update({
            where: { id: companyId },
            data: { status: "APPROVED" },
            include: { staff: { where: { role: "SUPER_ADMIN" }, select: { email: true, fullName: true } } },
        })

        const owner = company.staff[0]
        after(async () => {
            try {
                if (owner) await sendCompanyReactivatedEmail(owner.email, company.companyName, owner.fullName)
            } catch (error) {
                console.error("Company Reactivation Email failed", error)
            }
        })

        revalidatePath("/admin")
        return { success: true, error: null }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to reactivate company"
        return { success: false, error: message }
    }

}
