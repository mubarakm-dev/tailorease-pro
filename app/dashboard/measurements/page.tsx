import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import TemplateForm from "./TemplateForm"
import EditTemplate from "./EditTemplate"

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
                <p className="text-gray-900 text-sm mt-1">Define the fields your team measures against.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-fit min-w-35">
                <p className="text-sm text-gray-900 placeholder:text-gray-500">Templates</p>
                <p className="text-3xl font-semibold mt-1 tabular-nums">{templates.length}</p>
            </div>

            {isAdmin && <TemplateForm />}

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-sm">Templates</h2>
                </div>
                {templates.length === 0 ? (
                    <p className="text-sm text-gray-900 px-5 py-8 text-center">
                        No templates yet{isAdmin ? " — create one to start recording measurements." : "."}
                    </p>
                ) : (
                    templates.map((t: any) => (
                        <EditTemplate
                            key={t.id}
                            id={t.id}
                            name={t.name}
                            fields={t.fieldDefinitions as string[]}
                            measurementCount={t._count.measurements}
                        />
                    ))
                )}
            </section>
        </div>
    )
}
