"use server"

import { requireActiveStaff } from "@/app/libs/auth"
import { prisma } from "@/app/libs/prisma"
import { revalidatePath } from "next/cache"

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
        prisma.customer.findFirst({ where: { id: customerId, companyId: session.companyId }, select: { id: true } }),
        prisma.measurementTemplate.findFirst({
            where: { id: templateId, companyId: session.companyId },
            select: { fieldDefinitions: true },
        }),
    ])
    if (!customer) return { error: "Customer not found", success: false }
    if (!template) return { error: "Template not found", success: false }

    const fields = template.fieldDefinitions as string[]
    const values: Record<string, string> = {}
    for (const field of fields) {
        const v = formData.get(`v_${field}`)?.toString().trim()
        if (v) values[field] = v
    }

    try {
        await prisma.measurement.create({
            data: {
                customerId,
                templateId,
                unit,
                values,
                snapshot: fields,        
                createdBy: session.staffId,
            },
        })
    } catch (error) {
        return { success: false, error: "Something went wrong" }
    }

    revalidatePath(`/dashboard/customers/${customerId}`)
    return { success: true, error: null, message: "Measurement saved" }
}
