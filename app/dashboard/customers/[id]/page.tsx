import { prisma } from "@/app/libs/prisma"
import { isAuth } from "@/app/libs/session"
import { notFound } from "next/navigation"
import Link from "next/link"
import AddMeasurement from "./AddMeasurement"

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await isAuth()

    const [customer, templatesRaw] = await Promise.all([
        prisma.customer.findFirst({
            where: { id, companyId: session.companyId },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                createdAt: true,
                createdByStaff: { select: { fullName: true } },
                measurements: {
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        createdAt: true,
                        unit: true,
                        values: true,
                        template: { select: { name: true } },
                    },
                },
            },
        }),
        prisma.measurementTemplate.findMany({
            where: { companyId: session.companyId },
            select: { id: true, name: true, fieldDefinitions: true },
        }),
    ])

    if (!customer) notFound()

    
    const templates = templatesRaw.map((t) => ({ ...t, fieldDefinitions: t.fieldDefinitions as string[] }))

    return (
        <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
            <div>
                <Link href="/dashboard/customers" className="text-sm text-[#b07c34]">← Customers</Link>
                <h1 className="text-2xl font-semibold mt-2">{customer.fullName}</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {customer.phone}{customer.email ? ` · ${customer.email}` : ""}
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-sm text-gray-500">
                Added by <span className="text-gray-800 font-medium">{customer.createdByStaff.fullName}</span>{" "}
                on {customer.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </div>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-sm">Measurements</h2>
                </div>

                {customer.measurements.length === 0 ? (
                    <p className="text-sm text-gray-400 px-5 py-6 text-center">No measurements yet.</p>
                ) : (
                    customer.measurements.map((m) => {
                        const values = m.values as Record<string, string>
                        return (
                            <div key={m.id} className="px-5 py-4 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">
                                        {m.template.name} <span className="text-xs text-gray-400 font-normal">({m.unit})</span>
                                    </p>
                                    <span className="text-xs text-gray-400">{m.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                                    {Object.entries(values).map(([field, value]) => (
                                        <span key={field}>
                                            <span className="text-gray-400">{field}:</span> {value}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    })
                )}

                <AddMeasurement customerId={customer.id} templates={templates} />
            </section>
        </div>
    )
}
