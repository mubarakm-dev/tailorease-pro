import 'server-only'
import { JWTPayload, jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'



export interface AdminSession extends JWTPayload {
   email: string,
  role: "PLATFORM_ADMIN"
}


const secretKey = process.env.ADMIN_AUTH_SECRET

const encodedKey = new TextEncoder().encode(secretKey)

export const encryptAdmin = async (payload:AdminSession): Promise<string> => {
    const adminToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7h")
        .sign(encodedKey)

    return adminToken
}



export const decryptAdmin = async (adminToken: string): Promise<{
    status: number
    payload?: AdminSession
    message?: string
}> => {
    try {
        const { payload } = await jwtVerify(adminToken, encodedKey, {
            algorithms: ["HS256"]
        })

        return {
            status: 200,
            payload: payload as AdminSession
        }
    } catch (error) {
        return {
            status: 401,
            message: "Unauthorized"
        }
    }
}


export const setAdminSession = async (payload: AdminSession): Promise<void> => {
     const expiresAt = new Date(Date.now() + 7 * 60 * 60 * 1000)
    const adminToken = await encryptAdmin(payload)
    const cookieStore = await cookies()

  cookieStore.set("adminToken", adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
     path: "/",
  })

}

export const getAdminSession = async (): Promise<AdminSession | null> => {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get("adminToken")

  if (!adminToken) return null

  const result = await decryptAdmin(adminToken.value)

  if (result.status !== 200 || !result.payload) return null

  return result.payload
}

export const isAuthAdmin = async (): Promise<AdminSession> => {
  const adminSession = await getAdminSession()

  if (!adminSession) {
    redirect("/admin/login")
  }

  return adminSession
}

// clear the session by deleting the token from the cookie
export const clearAdminSession = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.delete("adminToken")
}