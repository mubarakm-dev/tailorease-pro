import { prisma } from "@/app/libs/prisma"
import { isAuth } from "@/app/libs/session"
import { notFound } from "next/navigation"
import Link from "next/link"
import AddMeasurement from "./AddMeasurement"
import NewOrder from "./NewOrder"
import EditCustomer from "./EditCustomer"
import OrderStatusBadge from "../../components/OrderStatusBadge"
import ConfirmButton from "@/app/components/ConfirmButton"
import { deleteCustomer } from "./action"
import EditMeasurement from "./EditMeasurement"

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await isAuth()

    const [customer, templatesRaw, allMeasurements] = await Promise.all([
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
                    take: 5,
                    select: {
                        id: true,
                        createdAt: true,
                        unit: true,
                        values: true,
                        snapshot: true,
                        templateId: true,
                        template: { select: { name: true } },
                    },
                },
                orders: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    select: { id: true, title: true, status: true, amount: true, createdAt: true },
                },
                _count: { select: { measurements: true, orders: true } },
            },
        }),
        prisma.measurementTemplate.findMany({
            where: { companyId: session.companyId },
            select: { id: true, name: true, fieldDefinitions: true },
        }),
        prisma.measurement.findMany({
            where: { customerId: id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                createdAt: true,
                template: { select: { name: true } },
            },
        }),
    ])

    if (!customer) notFound()

    const isAdmin = session.role === "SUPER_ADMIN"
    const templates = templatesRaw.map((t: any) => ({ ...t, fieldDefinitions: t.fieldDefinitions as string[] }))

    return (
        <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <Link href="/dashboard/customers" className="text-sm text-[#b07c34]">← Customers</Link>
                    <EditCustomer id={customer.id} fullName={customer.fullName} phone={customer.phone} email={customer.email} />
                </div>

                {isAdmin &&
                    (customer._count.orders === 0 ? (
                        <ConfirmButton
                            action={deleteCustomer.bind(null, customer.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 whitespace-nowrap"
                            title="Delete this customer?"
                            message={`This permanently deletes ${customer.fullName}${customer._count.measurements > 0 ? " and their measurements" : ""}. This can't be undone.`}
                            confirmText="Delete"
                            pendingText="Deleting…"
                            danger
                        >
                            Delete
                        </ConfirmButton>
                    ) : (
                        <button
                            type="button"
                            disabled
                            title="Customers with orders can't be deleted"
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed whitespace-nowrap"
                        >
                            Delete
                        </button>
                    ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-sm text-gray-500">
                Added by <span className="text-gray-800 font-medium">{customer.createdByStaff.fullName}</span>{" "}
                on {customer.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </div>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-sm">Measurements</h2>
                    {customer._count.measurements > 5 && (
                        <span className="text-xs text-gray-400">Showing latest 5 of {customer._count.measurements}</span>
                    )}
                </div>

                {customer.measurements.length === 0 ? (
                    <p className="text-sm text-gray-400 px-5 py-6 text-center">No measurements yet.</p>
                ) : (
                    customer.measurements.map((m: any) => (
                        <EditMeasurement
                            key={m.id}
                            id={m.id}
                            templateName={m.template.name}
                            unit={m.unit}
                            createdAt={m.createdAt}
                            values={m.values as Record<string, string>}
                            snapshotFields={m.snapshot as string[]}
                            templateFields={templates.find((t) => t.id === m.templateId)?.fieldDefinitions ?? []}
                        />
                    ))
                )}

                <AddMeasurement customerId={customer.id} templates={templates} />
            </section>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-sm">Orders</h2>
                    <span className="text-xs text-gray-400">{customer._count.orders} total</span>
                </div>
                {customer.orders.length === 0 ? (
                    <p className="text-sm text-gray-400 px-5 py-6 text-center">No orders yet.</p>
                ) : (
                    customer.orders.map((o: any) => (
                        <Link key={o.id} href={`/dashboard/orders/${o.id}`} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{o.title}</p>
                                <p className="text-xs text-gray-400">
                                    {o.createdAt.toLocaleDateString()}{o.amount != null ? ` · ₦${o.amount.toLocaleString()}` : ""}
                                </p>
                            </div>
                            <OrderStatusBadge status={o.status} />
                        </Link>
                    ))
                )}
                {customer._count.orders > 5 && (
                    <Link
                        href={`/dashboard/orders?customer=${customer.id}`}
                        className="block px-5 py-3 text-sm text-[#b07c34] hover:bg-gray-50 border-b border-gray-100"
                    >
                        View all {customer._count.orders} orders →
                    </Link>
                )}
                <NewOrder customerId={customer.id} measurements={allMeasurements} />
            </section>
        </div>
    )
}
