"use server"

import { requireActiveStaff } from "@/app/libs/auth"
import { prisma } from "@/app/libs/prisma"
import { logActivity } from "@/app/libs/activity"
import { revalidatePath } from "next/cache"
import { createCustomerSchema } from "@/app/libs/schemas/authSchema"
import { redirect } from "next/navigation"


export type MeasurementCreateState = { success: boolean; error: string | null; message?: string }

export const createMeasurement = async (
    prevState: MeasurementCreateState,
    formData: FormData,
): Promise<MeasurementCreateState> => {
    const session = await requireActiveStaff()

    const customerId = formData.get("customerId")?.toString() ?? ""
    const templateId = formData.get("templateId")?.toString() ?? ""
    const unit = formData.get("unit")?.toString() || "cm"

    if (!templateId) return { error: "Choose a template", success: false }


    const [customer, template] = await Promise.all([
        prisma.customer.findFirst({ where: { id: customerId, companyId: session.companyId }, select: { id: true, fullName: true } }),
        prisma.measurementTemplate.findFirst({
            where: { id: templateId, companyId: session.companyId },
            select: { fieldDefinitions: true, name: true },
        }),
    ])
    if (!customer) return { error: "Customer not found", success: false }
    if (!template) return { error: "Template not found", success: false }

    const fields = template.fieldDefinitions as string[]
    const values: Record<string, string> = {}
    for (const field of fields) {
        const v = formData.get(`v_${field}`)?.toString().trim()
        if (v) {
            const num = Number(v)
            if (!Number.isFinite(num) || num <= 0) {
                return { success: false, error: `${field} must be a positive number` }
            }
            values[field] = v
        }
    }

    let measurementId: string
    try {
        const measurement = await prisma.measurement.create({
            data: {
                customerId,
                templateId,
                unit,
                values,
                snapshot: fields,
                createdBy: session.staffId,
            },
        })
        measurementId = measurement.id
    } catch (error) {
        return { success: false, error: "Something went wrong" }
    }

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "measurement.create",
        entityType: "Measurement",
        entityId: measurementId,
        summary: `recorded a ${template.name} measurement for ${customer.fullName}`,
    })

    revalidatePath(`/dashboard/customers/${customerId}`)
    return { success: true, error: null, message: "Measurement saved" }
}


const updateCustomerSchema = createCustomerSchema

export type UpdateCustomerState = {
    success: boolean,
    error: string | null,
    message?: string
}

export const updateCustomer = async (prevState: UpdateCustomerState, formData: FormData): Promise<UpdateCustomerState> => {
    const session = await requireActiveStaff()
    const id = formData.get("id")?.toString() ?? ""

    const validation = updateCustomerSchema.safeParse({
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone"),

    })

    if (!validation.success) {
        return {
            error: validation.error.issues[0].message,
            success: false
        }
    }

    const { fullName, email, phone } = validation.data

    try {
        const result = await prisma.customer.updateMany({
            where: { id, companyId: session.companyId },
            data: { fullName, phone, email: email || null },
        })
        if (result.count === 0) return { success: false, error: "Customer not found" }
    } catch (error) {
        return { success: false, error: "Something went wrong" }
    }

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "customer.update",
        entityType: "Customer",
        entityId: id,
        summary: `updated customer "${fullName}"`,
    })

    revalidatePath(`/dashboard/customers/${id}`)
    return { success: true, error: null, message: "Customer updated" }

}

export const deleteCustomer = async (customerId: string) => {
    const session = await requireActiveStaff()
    if (session.role !== "SUPER_ADMIN") return

    const customer = await prisma.customer.findFirst({
        where: { id: customerId, companyId: session.companyId },
        select: {
            fullName: true,
            phone: true,
            email: true,
            _count: {
                select: {
                    orders: true
                }
            }
        }

    })

    if (!customer) return

    if (customer._count.orders > 0) return

    try {


        await prisma.$transaction([
            prisma.measurement.deleteMany({ where: { customerId } }),                       // FK children first
            prisma.customer.deleteMany({ where: { id: customerId, companyId: session.companyId } }),
        ])
    } catch (error) {
        return
    }

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "customer.delete",
        entityType: "Customer",
        entityId: customerId,
        summary: `deleted customer "${customer.fullName}"`,
    })

    revalidatePath("/dashboard/customers")
    redirect("/dashboard/customers")


}


export type MeasurementUpdateState = {
    success: boolean,
    error: string | null,
    message?: string
}
export const updateMeasurement = async (prevState: MeasurementUpdateState, formData: FormData): Promise<MeasurementUpdateState> => {
    const session = await requireActiveStaff()
    const id = formData.get("id")?.toString() ?? ""
    const unit = formData.get("unit")?.toString() || "cm"

  
    const measurement = await prisma.measurement.findFirst({
        where: { id, customer: { companyId: session.companyId } },
        select: {
            snapshot: true,
            customerId: true,
            customer: { select: { fullName: true } },
            template: { select: { name: true, fieldDefinitions: true } },
        },
    })
    if (!measurement) return { success: false, error: "Measurement not found" }

 
    const snapshotFields = measurement.snapshot as string[]
    const templateFields = measurement.template.fieldDefinitions as string[]
    const union = Array.from(new Set([...snapshotFields, ...templateFields]))  

    
    const values: Record<string, string> = {}
    for (const field of union) {
        const v = formData.get(`v_${field}`)?.toString().trim()
        if (!v) return { success: false, error: `${field} is required` }
        const num = Number(v)
        if (!Number.isFinite(num) || num <= 0) return { success: false, error: `${field} must be a positive number` }
        values[field] = v
    }

    try {
        await prisma.measurement.update({          
            where: { id },
            data: { unit, values, snapshot: union, updatedBy: session.staffId },  
        })
    } catch { return { success: false, error: "Something went wrong" } }

    logActivity({
        companyId: session.companyId, 
        staffId: session.staffId, 
        action: "measurement.update",
        entityType: "Measurement", entityId: id,
        summary: `updated ${measurement.customer.fullName}'s ${measurement.template.name} measurement`
    })

    revalidatePath(`/dashboard/customers/${measurement.customerId}`)
    return { success: true, error: null, message: "Measurement updated" }
}

export const deleteMeasurement = async (measurementId: string) => {
    const session = await requireActiveStaff()

    const measurement = await prisma.measurement.findFirst({
        where: { id: measurementId, customer: { companyId: session.companyId } },
        select: { id: true, customerId: true, customer: { select: { fullName: true } }, template: { select: { name: true } } },
    })
    if (!measurement) return

    try {
        await prisma.measurement.delete({ where: { id: measurementId } })
    } catch {
        return
    }

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "measurement.delete",
        entityType: "Measurement",
        entityId: measurementId,
        summary: `deleted ${measurement.customer.fullName}'s ${measurement.template.name} measurement`,
    })

    revalidatePath(`/dashboard/customers/${measurement.customerId}`)
}

