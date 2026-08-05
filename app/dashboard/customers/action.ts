"use server"
import { requireActiveStaff } from "@/app/libs/auth"
import { prisma } from "@/app/libs/prisma"
import { createCustomerSchema } from "@/app/libs/schemas/authSchema"
import { logActivity } from "@/app/libs/activity"
import { revalidatePath } from "next/cache"


export type CustomerCreateState ={
    success: boolean,
    error: string | null,
    message?: string
}

export const createCustomer = async(prevState:CustomerCreateState, formData:FormData):Promise<CustomerCreateState>=>{
    const session = await requireActiveStaff()
    

    const validation = createCustomerSchema.safeParse({
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone:formData.get("phone")
    })

    if(!validation.success){
         return {
            error: validation.error.issues[0].message,
            success: false
        }
    }

    const {fullName, email, phone} = validation.data
    let customerId: string
    try {
        const customer = await prisma.customer.create({
            data: {
                companyId: session.companyId,
                createdBy: session.staffId,
                fullName,
                phone,
                email: email || null,
            },
        })
        customerId = customer.id
    } catch (error) {
        return { success: false, error: "Something went wrong" }
    }

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "customer.create",
        entityType: "Customer",
        entityId: customerId,
        summary: `added customer "${fullName}"`,
    })

    revalidatePath("/dashboard/customers")
    return { success: true, error: null, message: "Customer added" }
}