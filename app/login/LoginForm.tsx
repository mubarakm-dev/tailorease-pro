"use client"

import { useActionState } from "react"
import { login, LoginState, } from "./actions"

const initialState: LoginState = {
    success: false,
    error: null,
}

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6">Login</h1>

                {state.error && (
                    <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{state.error}</p>
                )}

                {state.needsVerification && (
                    <a
                        href={`/verify?email=${encodeURIComponent(state.email ?? "")}&fresh=1`}
                        className="inline-block mb-4 text-blue-600 underline"
                    >
                        Verify your account
                    </a>
                )}

                {!state.success && (
                    <form action={formAction} className="space-y-4">


                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" name="email" required
                                className="w-full border border-gray-300 rounded px-3 py-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input type="password" name="password" required
                                className="w-full border border-gray-300 rounded px-3 py-2" />
                        </div>


                        <button type="submit" disabled={isPending}
                            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400">
                            {isPending ? "Login in...." : "Login"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}