"use server"

import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { logActivity } from "@/app/libs/activity"
import { revalidatePath } from "next/cache"

export type UpdateMeasurementState = {
  success: boolean
  error: string | null
}

export const updateMeasurement = async (orderId: string, measurementId: string, prevState: UpdateMeasurementState, formData: FormData): Promise<UpdateMeasurementState> => {
  const session = await isAuth()

  const order = await prisma.order.findFirst({
    where: { id: orderId, companyId: session.companyId },
    select: { id: true, title: true }
  })

  if (!order) {
    return { success: false, error: "Order not found" }
  }

  try {
    const measurement = await prisma.measurement.findFirst({
      where: { id: measurementId },
      select: { values: true }
    })

    if (!measurement) {
      return { success: false, error: "Measurement not found" }
    }

    const values = { ...(measurement.values as Record<string, any>) }

    for (const [key, _] of Object.entries(values)) {
      const value = formData.get(key)?.toString()
      if (value) {
        values[key] = parseFloat(value)
      }
    }

    await prisma.measurement.update({
      where: { id: measurementId },
      data: {
        values,
        updatedBy: session.staffId
      }
    })

    logActivity({
      companyId: session.companyId,
      staffId: session.staffId,
      action: "measurement.update",
      entityType: "Measurement",
      entityId: measurementId,
      summary: `Updated measurements for "${order.title}"`
    })

    revalidatePath(`/dashboard/orders/${orderId}`)
    return { success: true, error: null }
  } catch (error) {
    console.error("Update measurement error:", error)
    return { success: false, error: "Failed to update measurements" }
  }
}
