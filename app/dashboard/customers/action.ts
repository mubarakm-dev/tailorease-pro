"use server"
import { requireActiveStaff } from "@/app/libs/auth"
import { prisma } from "@/app/libs/prisma"
import { createCustomerSchema } from "@/app/libs/schemas/authSchema"
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
    try {
        await prisma.customer.create({
            data: {
                companyId: session.companyId,   
                createdBy: session.staffId,     
                fullName,
                phone,
                email: email || null,           
            },
        })
    } catch (error) {
        return { success: false, error: "Something went wrong" }
    }

    revalidatePath("/dashboard/customers")
    return { success: true, error: null, message: "Customer added" }
}