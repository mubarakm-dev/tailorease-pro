import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import CustomerForm from "./CustomerForm"
import Link from "next/link"

export default async function CustomersPage() {
    const session = await isAuth()

    const customers = await prisma.customer.findMany({
        where: { companyId: session.companyId },
        orderBy: { createdAt: "desc" },
        select: { id: true, fullName: true, email: true, phone: true, createdAt: true },
    })

    return (
        <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold">Customers</h1>
                <p className="text-gray-500 text-sm mt-1">{customers.length} total</p>
            </div>

            <CustomerForm />

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-sm">All customers</h2>
                </div>
                {customers.length === 0 ? (
                    <p className="text-sm text-gray-400 px-5 py-8 text-center">No customers yet.</p>
                ) : (
                    customers.map((c) => (
                       <Link key={c.id} href={`/dashboard/customers/${c.id}`} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                            <span className="w-9 h-9 rounded-full grid place-items-center bg-slate-600 text-white text-sm font-semibold shrink-0">
                                {c.fullName.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate">{c.fullName}</p>
                                <p className="text-xs text-gray-400 truncate">
                                    {c.phone}{c.email ? ` · ${c.email}` : ""}
                                </p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{c.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                        </Link>

                        

                    ))
                )}
            </section>
        </div>
    )
}
