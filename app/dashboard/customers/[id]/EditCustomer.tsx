"use client"

import { useActionState, useEffect, useState } from "react"
import { updateCustomer, UpdateCustomerState } from "./action"
import SubmitButton from "@/app/components/SubmitButton"
import FormMessage from "@/app/components/FormMessage"

const initialState: UpdateCustomerState = { success: false, error: null }

type Props = { id: string; fullName: string; phone: string; email: string | null }

export default function EditCustomer({ id, fullName, phone, email }: Props) {
    const [state, formAction] = useActionState(updateCustomer, initialState)
    const [editing, setEditing] = useState(false)

  
    useEffect(() => {
        if (state.success) setEditing(false)
    }, [state])

    if (!editing) {
        return (
            <div className="mt-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">{fullName}</h1>
                    <button type="button" onClick={() => setEditing(true)} className="text-xs text-[#b07c34] hover:underline">
                        Edit
                    </button>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                    {phone}{email ? ` · ${email}` : ""}
                </p>
                <FormMessage state={state} />
            </div>
        )
    }

    return (
        <form action={formAction} className="mt-2 flex flex-col gap-3 max-w-md">
            <input type="hidden" name="id" value={id} />
            <FormMessage state={state} />

            <div>
                <label className="block text-xs font-medium mb-1 text-gray-500">Full name</label>
                <input name="fullName" defaultValue={fullName} required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500" />
            </div>
            <div>
                <label className="block text-xs font-medium mb-1 text-gray-500">Phone</label>
                <input name="phone" defaultValue={phone} required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500" />
            </div>
            <div>
                <label className="block text-xs font-medium mb-1 text-gray-500">
                    Email <span className="text-gray-400">(optional)</span>
                </label>
                <input type="email" name="email" defaultValue={email ?? ""}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500" />
            </div>

            <div className="flex items-center gap-2">
                <SubmitButton className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800" pendingText="Saving…">
                    Save
                </SubmitButton>
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50">
                    Cancel
                </button>
            </div>
        </form>
    )
}
