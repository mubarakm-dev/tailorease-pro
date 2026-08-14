import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import CustomerForm from "./CustomerForm"
import SearchBox from "../components/SearchBox"
import Link from "next/link"

const PER_PAGE = 20

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>
}) {
    const session = await isAuth()
    const sp = await searchParams

    const q = sp.q?.trim() || ""
    const page = Math.max(1, Number(sp.page) || 1)

    const where = {
        companyId: session.companyId,
        ...(q
            ? {
                  OR: [
                      { fullName: { contains: q, mode: "insensitive" as const } },
                      { phone: { contains: q, mode: "insensitive" as const } },
                      { email: { contains: q, mode: "insensitive" as const } },
                  ],
              }
            : {}),
    }

    const [customers, total] = await Promise.all([
        prisma.customer.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PER_PAGE,
            take: PER_PAGE,
            select: { id: true, fullName: true, email: true, phone: true, createdAt: true },
        }),
        prisma.customer.count({ where }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

    const link = (over: Record<string, string | number | undefined>) => {
        const p = new URLSearchParams()
        if (q) p.set("q", q)
        for (const [k, v] of Object.entries(over)) {
            if (v) p.set(k, String(v))
            else p.delete(k)
        }
        const s = p.toString()
        return `/dashboard/customers${s ? `?${s}` : ""}`
    }

    return (
        <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold">Customers</h1>
                <p className="text-gray-900 text-sm mt-1">{total} total</p>
            </div>

            <CustomerForm />

            <SearchBox placeholder="Search customers by name, phone, or email…" />

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-sm text-gray-900">All customers</h2>
                </div>
                {customers.length === 0 ? (
                    <p className="text-sm text-gray-900 px-5 py-8 text-center">
                        {q ? "No customers match your search." : "No customers yet."}
                    </p>
                ) : (
                    customers.map((c: any) => (
                        <Link key={c.id} href={`/dashboard/customers/${c.id}`} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                            <span className="w-9 h-9 rounded-full grid place-items-center bg-slate-600 text-white text-sm font-semibold shrink-0">
                                {c.fullName.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate text-gray-900">{c.fullName}</p>
                                <p className="text-xs text-gray-900 truncate">
                                    {c.phone}{c.email ? ` · ${c.email}` : ""}
                                </p>
                            </div>
                            <span className="text-xs text-gray-900 whitespace-nowrap">{c.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                        </Link>
                    ))
                )}
            </section>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 placeholder:text-gray-500">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        {page > 1 ? (
                            <Link href={link({ page: page - 1 })} className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">← Prev</Link>
                        ) : (
                            <span className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500">← Prev</span>
                        )}
                        {page < totalPages ? (
                            <Link href={link({ page: page + 1 })} className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">Next →</Link>
                        ) : (
                            <span className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500">Next →</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
