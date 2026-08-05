import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import Link from "next/link"

const PER_PAGE = 30

// "Today" / "Yesterday" / "Monday, August 4" — used as day-group headers
function dayLabel(date: Date): string {
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000)
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
}

export default async function ActivityPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const session = await isAuth()
    const sp = await searchParams
    const page = Math.max(1, Number(sp.page) || 1)

    const where = { companyId: session.companyId }

    const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PER_PAGE,
            take: PER_PAGE,
            include: { staff: { select: { fullName: true } } },
        }),
        prisma.activityLog.count({ where }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
    const link = (p: number) => `/dashboard/activity${p > 1 ? `?page=${p}` : ""}`

    // group the (already date-desc) rows into Today / Yesterday / date buckets
    const groups: { label: string; items: typeof logs }[] = []
    for (const log of logs) {
        const label = dayLabel(log.createdAt)
        const last = groups[groups.length - 1]
        if (last && last.label === label) last.items.push(log)
        else groups.push({ label, items: [log] })
    }

    return (
        <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold">Activity</h1>
                <p className="text-gray-500 text-sm mt-1">{total} total</p>
            </div>

            {logs.length === 0 ? (
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-400 px-5 py-10 text-center">No activity yet.</p>
                </section>
            ) : (
                groups.map((group) => (
                    <section key={group.label} className="flex flex-col gap-2">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-1">{group.label}</h2>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {group.items.map((log) => {
                                const name = log.staff?.fullName ?? "System"
                                return (
                                    <div key={log.id} className="flex items-start gap-3 px-5 py-3 border-b border-gray-100 last:border-b-0">
                                        <span className="w-8 h-8 rounded-full grid place-items-center bg-slate-500 text-white text-xs font-semibold shrink-0">
                                            {name.charAt(0).toUpperCase()}
                                        </span>
                                        <p className="text-sm flex-1">
                                            <span className="font-semibold">{name}</span> {log.summary}
                                        </p>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {log.createdAt.toLocaleTimeString(undefined, { timeStyle: "short" })}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                ))
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        {page > 1 ? (
                            <Link href={link(page - 1)} className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">← Prev</Link>
                        ) : (
                            <span className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-300">← Prev</span>
                        )}
                        {page < totalPages ? (
                            <Link href={link(page + 1)} className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">Next →</Link>
                        ) : (
                            <span className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-300">Next →</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
