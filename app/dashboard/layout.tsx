import { prisma } from "../libs/prisma"
import { isAuth } from "../libs/session"
import Sidebar from "./components/Sidebar"
import TopBar from "./components/TopBar"


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {

    const session = await isAuth()

    const staff = await prisma.staff.findUnique({
        where: { id: session.staffId },
        include: {
            company: true
        }
    })
    return (
        <div className="flex min-h-screen bg-[#f1efe9]">
            <Sidebar
                companyName={staff?.company.companyName ?? ""}
                companyImage={staff?.company.companyImage ?? ""}
                staffName={staff?.fullName ?? ""}
                role={session.role}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar companyName={staff?.company.companyName ?? ""} />
                <main className="flex-1">{children}</main>
                <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
                    Powered by <span className="text-[#b07c34] font-semibold">TailorEase</span>
                </footer>
            </div>



        </div>
    )
}