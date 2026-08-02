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
    await isAuthAdmin()

    // approve the company AND its owner (SUPER_ADMIN) staff together —
    // login checks both, and the owner has no one above them to approve them.
    const [company] = await prisma.$transaction([
        prisma.company.update({
            where: { id: companyId },
            data: { status: "APPROVED" },
        }),
        prisma.staff.updateMany({
            where: { companyId, role: "SUPER_ADMIN" },
            data: { status: "APPROVED" },
        }),
    ])

    after(async () => {
        try {
            await sendCompanyApprovalEmail(company.ownerEmail, company.companyName, company.ownerFullname, company.companyCode)
        } catch (error) {
            console.error("Company Approval Email failed", error)
        }
    })

    revalidatePath("/admin")
}

export const rejectCompany = async (companyId: string) => {
    await isAuthAdmin()

    const company = await prisma.company.update({
        where: { id: companyId },
        data: { status: "REJECTED" },
    })

    after(async () => {
        try {
            await sendCompanyRejectedEmail(company.ownerEmail, company.companyName, company.ownerFullname)
        } catch (error) {
            console.error("Company Rejection Email failed", error)
        }
    })

    revalidatePath("/admin")
}


export const suspendCompany = async (companyId: string) => {
    await isAuthAdmin()
    const company = await prisma.company.update({
        where: { id: companyId },
        data: { status: "SUSPENDED" }
    })


    after(async () => {
        try {
            await sendCompanySuspendedEmail(company.ownerEmail, company.companyName, company.ownerFullname)
        } catch (error) {
            console.error("Company Suspension Email failed", error)
        }
    })
    revalidatePath("/admin")

}

export const reactivateCompany = async (companyId: string) => {
    await isAuthAdmin()
  const company =  await prisma.company.update({
        where: { id: companyId },
        data: { status: "APPROVED" }
    })

    after(async () => {
        try {
            await sendCompanyReactivatedEmail(company.ownerEmail, company.companyName, company.ownerFullname)
        } catch (error) {
            console.error("Company Reactivation Email failed", error)
        }
    })

    revalidatePath("/admin")

}
