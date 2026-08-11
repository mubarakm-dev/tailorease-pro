type OrderStatus = "RECEIVED" | "CUT_IN_PROGRESS" | "SEWING_IN_PROGRESS" | "FINISHING" | "COMPLETED"

export const FLOW: OrderStatus[] = ["RECEIVED", "CUT_IN_PROGRESS", "SEWING_IN_PROGRESS", "FINISHING", "COMPLETED"]

export const STATUS_LABELS: Record<OrderStatus, string> = {
    RECEIVED: "Received",
    CUT_IN_PROGRESS: "Cutting",
    SEWING_IN_PROGRESS: "Sewing",
    FINISHING: "Finishing",
    COMPLETED: "Completed",
}


export function nextStatus(current: OrderStatus): OrderStatus | null {
    const i = FLOW.indexOf(current)
    return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null
}



export function prevStatus(current: OrderStatus): OrderStatus | null {
    const i = FLOW.indexOf(current)
    return i > 0 ? FLOW[i - 1] : null   
}