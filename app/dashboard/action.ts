"use server"

import { clearSession } from "@/app/libs/session"
import { redirect } from "next/navigation"

export const logout = async () => {
    await clearSession()
    redirect("/login")
}
