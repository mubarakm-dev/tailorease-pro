"use client"

import { useActionState } from "react"
import { createCustomer, CustomerCreateState } from "./action"
import SubmitButton from "@/app/components/SubmitButton"

const initialState: CustomerCreateState = {
    success: false,
    error: null,
}

export default function CustomerForm() {
    const [state, formAction] = useActionState(createCustomer, initialState)

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-sm mb-4">Add a customer</h2>

            {state.error && (
                <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{state.error}</p>
            )}
            {state.success && (
                <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{state.message}</p>
            )}

            <form action={formAction} className="grid sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500">Full name</label>
                    <input type="text" name="fullName" required
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500">Phone</label>
                    <input type="tel" name="phone" required
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500">
                        Email <span className="text-gray-400">(optional)</span>
                    </label>
                    <input type="email" name="email"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                </div>
                <div className="sm:col-span-3">
                    <SubmitButton className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800" pendingText="Adding…">
                        Add customer
                    </SubmitButton>
                </div>
            </form>
        </div>
    )
}
