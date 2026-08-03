"use client"

import { useActionState } from "react"
import { updateCompanyDetails, CompanyUpdateState } from "./action"
import SubmitButton from "@/app/components/SubmitButton"

const initialState: CompanyUpdateState = { success: false, error: null }

export default function CompanyForm({
    companyName,
    ownerFullname,
    ownerPhone,
}: {
    companyName: string
    ownerFullname: string
    ownerPhone: string
}) {
    const [state, formAction] = useActionState(updateCompanyDetails, initialState)

    return (
        <form action={formAction} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-sm">Edit details</h2>

            {state.error && <p className="bg-red-100 text-red-700 p-3 rounded text-sm">{state.error}</p>}
            {state.success && <p className="bg-green-100 text-green-700 p-3 rounded text-sm">{state.message}</p>}

            <div>
                <label className="block text-sm font-medium mb-1">Company name</label>
                <input name="companyName" defaultValue={companyName} required
                    className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Owner full name</label>
                <input name="ownerFullname" defaultValue={ownerFullname}
                    className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Owner phone</label>
                <input name="ownerPhone" defaultValue={ownerPhone}
                    className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>

            <SubmitButton className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800" pendingText="Saving…">
                Save changes
            </SubmitButton>
        </form>
    )
}
