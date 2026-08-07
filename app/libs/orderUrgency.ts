export type Urgency = "overdue" | "urgent" | "normal" | "none"

export function getOrderUrgency(dueDate: Date | null): Urgency {
  if (!dueDate) return "none"

  const now = new Date()
  const timeUntilDue = dueDate.getTime() - now.getTime()
  const hoursUntilDue = timeUntilDue / (1000 * 60 * 60)

  if (timeUntilDue < 0) return "overdue"
  if (hoursUntilDue <= 72) return "urgent" // 3 days
  return "normal"
}

export function getUrgencyColor(urgency: Urgency): string {
  switch (urgency) {
    case "overdue":
      return "bg-red-100 text-red-700 border-red-300"
    case "urgent":
      return "bg-amber-100 text-amber-700 border-amber-300"
    case "normal":
      return "bg-gray-100 text-gray-600 border-gray-300"
    default:
      return ""
  }
}

export function getUrgencyLabel(urgency: Urgency): string {
  switch (urgency) {
    case "overdue":
      return "Overdue"
    case "urgent":
      return "Due soon"
    case "normal":
      return "On track"
    default:
      return "No due date"
  }
}
