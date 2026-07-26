"use client"

import { useActionState, useEffect } from "react"
import { registerCompany, RegisterCompanyState } from "./actions"
import { useRouter } from "next/navigation"


const initialState: RegisterCompanyState = {
    success: false,
    error: null,
}


// Inside the component, after useActionState

export default function RegisterCompanyForm() {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(registerCompany, initialState)
    useEffect(() => {
        if (state.success && state.email) {
            router.push(`/verify?email=${encodeURIComponent(state.email)}`)
        }
    }, [state.success, state.email, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6">Register Your Company</h1>

                {state.error && (
                    <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{state.error}</p>
                )}

                {state.success && (
                    <div className="bg-green-100 text-green-700 p-4 rounded">
                        <p className="font-bold">{state.message}</p>
                        <p className="mt-2">Your company code: <strong>{state.companyCode}</strong></p>
                        <p className="text-sm mt-1">Share this code with your staff to register</p>
                        <a href="/verify" className="inline-block mt-4 text-blue-600 underline">Go to verify</a>
                    </div>
                )}

                {!state.success && (
                    <form action={formAction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Company Name</label>
                            <input type="text" name="companyName" required
                                className="w-full border border-gray-300 rounded px-3 py-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Company Email</label>
                            <input type="email" name="email" required
                                className="w-full border border-gray-300 rounded px-3 py-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input type="password" name="password" required
                                className="w-full border border-gray-300 rounded px-3 py-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                            <input type="password" name="confirmPassword" required
                                className="w-full border border-gray-300 rounded px-3 py-2" />
                        </div>


                        <div>
                            <label className="block text-sm font-medium mb-1">Owner Full Name</label>
                            <input type="text" name="ownerFullname" required
                                className="w-full border border-gray-300 rounded px-3 py-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Owner Email</label>
                            <input type="email" name="ownerEmail" required
                                className="w-full border border-gray-300 rounded px-3 py-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Owner Phone</label>
                            <input type="text" name="ownerPhone" required
                                className="w-full border border-gray-300 rounded px-3 py-2" />
                        </div>

                        <button type="submit" disabled={isPending}
                            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400">
                            {isPending ? "Registering..." : "Register Company"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}