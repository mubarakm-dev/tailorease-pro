"use client"

import { useActionState } from "react"
import { createTemplate, MeasurementTemplateCreateState } from "./action"
import SubmitButton from "@/app/components/SubmitButton"
import FormMessage from "@/app/components/FormMessage"

const initialState: MeasurementTemplateCreateState = {
    success: false,
    error: null,
}

export default function TemplateForm() {
    const [state, formAction] = useActionState(createTemplate, initialState)

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-sm mb-4">New measurement template</h2>

            <FormMessage state={state} />

            <form action={formAction} className="flex flex-col gap-3">
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500">Template name</label>
                    <input type="text" name="name" required placeholder="e.g. Kaftan"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500">Fields</label>
                    <textarea name="fields" required rows={4}
                        placeholder={"One field per line — e.g.\nChest\nWaist\nSleeve\nLength"}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                    <p className="text-xs text-gray-400 mt-1">One field per line (or comma-separated).</p>
                </div>
                <div>
                    <SubmitButton className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800" pendingText="Creating…">
                        Create template
                    </SubmitButton>
                </div>
            </form>
        </div>
    )
}
