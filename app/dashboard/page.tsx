import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { logout } from "./action"

export default async function DashboardPage() {
    const session = await isAuth()

    const staff = await prisma.staff.findUnique({
        where: { id: session.staffId },
        include: { company: true },
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">{staff?.company.companyName}</h1>
                    <form action={logout}>
                        <button type="submit" className="text-sm text-red-600 underline">
                            Log out
                        </button>
                    </form>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10">
                <h2 className="text-2xl font-semibold mb-2">Welcome, {staff?.fullName}</h2>
                <p className="text-gray-600">
                    Role: <strong>{session.role}</strong>
                </p>
            </main>
        </div>
    )
}
