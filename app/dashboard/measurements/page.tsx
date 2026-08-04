import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import TemplateForm from "./TemplateForm"

export default async function MeasurementsPage() {
    const session = await isAuth()
    const isAdmin = session.role === "SUPER_ADMIN"

    const templates = await prisma.measurementTemplate.findMany({
        where: { companyId: session.companyId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            fieldDefinitions: true,
            _count: { select: { measurements: true } },
        },
    })

    return (
        <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold">Measurement templates</h1>
                <p className="text-gray-500 text-sm mt-1">Define the fields your team measures against.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-fit min-w-35">
                <p className="text-sm text-gray-500">Templates</p>
                <p className="text-3xl font-semibold mt-1 tabular-nums">{templates.length}</p>
            </div>

            {isAdmin && <TemplateForm />}

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-sm">Templates</h2>
                </div>
                {templates.length === 0 ? (
                    <p className="text-sm text-gray-400 px-5 py-8 text-center">
                        No templates yet{isAdmin ? " — create one to start recording measurements." : "."}
                    </p>
                ) : (
                    templates.map((t) => (
                        <div key={t.id} className="px-5 py-4 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">{t.name}</p>
                                <span className="text-xs text-gray-400">{t._count.measurements} measurements</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {(t.fieldDefinitions as string[]).map((field, i) => (
                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5">
                                        {field}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    )
}
