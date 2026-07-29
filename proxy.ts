import { NextRequest, NextResponse, ProxyConfig } from "next/server"
import { decrypt } from "@/app/libs/session"
import { decryptAdmin } from "./app/libs/adminSession"

export const proxy = async (request: NextRequest) => {
    const { pathname } = request.nextUrl


    if (pathname.startsWith("/admin")) {
        if (pathname === "/admin/login") {
            return NextResponse.next()
        }

        const adminToken = request.cookies.get("adminToken")?.value
        const adminLoginUrl = new URL("/admin/login", request.url)

        if (!adminToken) {
            return NextResponse.redirect(adminLoginUrl)
        }

        const authAdmin = await decryptAdmin(adminToken)
        if (authAdmin.status !== 200) {
            return NextResponse.redirect(adminLoginUrl)
        }

        return NextResponse.next()
    }

    
    const token: string | undefined = request.cookies.get("token")?.value


    const loginUrl = new URL("/login", request.url)

    if (!token) {
        return NextResponse.redirect(loginUrl)
    }

    const auth = await decrypt(token)

    if (auth.status !== 200) {
        return NextResponse.redirect(loginUrl)
    }



    return NextResponse.next()
}

export const config: ProxyConfig = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
}

