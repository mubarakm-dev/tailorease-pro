 "use client"
import { startTransition, useEffect, useState } from "react";
import { logout } from "../action";


export default function AccessRevoked({ message }: { message: string }) {
    const [seconds, setseconds] = useState(10)

    useEffect(() => {
        if (seconds <= 0) {
            startTransition(() => {
                logout()
            })

            return
        }

        const timer = setTimeout(() => setseconds((s) => s - 1), 1000)
        return () => clearTimeout(timer)
    }, [seconds])


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow p-8 text-center">
                <h1 className="text-xl font-bold text-red-600 mb-2">Access revoked</h1>
                <p className="text-gray-900 placeholder:text-gray-500">{message}</p>
                <p className="text-sm text-gray-900 mt-4">Returning to login in {seconds}s…</p>
                <form action={logout} className="mt-6">
                    <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
                        Log out now
                    </button>
                </form>
            </div>
        </div>
    )


}