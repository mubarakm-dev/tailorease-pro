import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import NewOrderForm from "./NewOrderForm"

export const metadata = {
  title: "New Order"
}

export default async function NewOrderPage() {
  const session = await isAuth()

  const [customers, measurements] = await Promise.all([
    prisma.customer.findMany({
      where: { companyId: session.companyId },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" }
    }),
    prisma.measurement.findMany({
      where: { customer: { companyId: session.companyId } },
      select: {
        id: true,
        customerId: true,
        snapshot: true,
        createdAt: true,
        template: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ])

  return <NewOrderForm customers={customers} measurements={measurements.map(m => ({
    ...m,
    snapshot: m.snapshot as Record<string, any>
  }))} />
}
