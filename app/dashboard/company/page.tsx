import { isAuth } from "@/app/libs/session"
import { redirect } from "next/navigation"
import ComingSoon from "../components/ComingSoon"

export default async function CompanyManagementPage() {
    const session = await isAuth()
    if (session.role !== "SUPER_ADMIN") redirect("/dashboard")

    return <ComingSoon title="Company Management" description="Edit your company name and logo here — coming soon." />
}
