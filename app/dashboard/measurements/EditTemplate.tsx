"use client"

import { useActionState, useEffect, useState } from "react"
import { updateTemplate, MeasurementTemplateUpdateState, deleteTemplate } from "./action"
import SubmitButton from "@/app/components/SubmitButton"
import FormMessage from "@/app/components/FormMessage"
import ConfirmButton from "@/app/components/ConfirmButton"

const initialState: MeasurementTemplateUpdateState = { success: false, error: null }

type Props = {
    id: string
    name: string
    fields: string[]
    measurementCount: number
}

export default function EditTemplate({ id, name, fields, measurementCount }: Props) {
    const [state, formAction] = useActionState(updateTemplate, initialState)
    const [editing, setEditing] = useState(false)

    useEffect(() => {
        if (state.success) setEditing(false)
    }, [state])

    if (!editing) {
        return (
            <div className="px-5 py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm">{name}</p>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-400">{measurementCount} measurements</span>
                        <button type="button" onClick={() => setEditing(true)} className="text-xs text-[#b07c34] hover:underline">
                            Edit
                        </button>
                        {measurementCount === 0 ? (
                            <ConfirmButton
                                action={deleteTemplate.bind(null, id)}
                                className="text-xs text-red-600 hover:underline"
                                title="Delete this template?"
                                message="This removes the template permanently."
                                confirmText="Delete"
                                pendingText="Deleting…"
                                danger
                            >
                                Delete
                            </ConfirmButton>
                        ) : (
                            <span className="text-xs text-gray-300 cursor-not-allowed">Delete</span>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {fields.map((field, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5">
                            {field}
                        </span>
                    ))}
                </div>
                <FormMessage state={state} />
            </div>
        )
    }

    return (
        <form action={formAction} className="px-5 py-4 border-b border-gray-100 last:border-b-0 flex flex-col gap-3 bg-gray-50/50">
            <input type="hidden" name="id" value={id} />

            <div>
                <label className="block text-xs font-medium mb-1 text-gray-500">Template name</label>
                <input type="text" name="name" required defaultValue={name}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white" />
            </div>

            <div>
                <label className="block text-xs font-medium mb-1 text-gray-500">Fields</label>
                <textarea name="fields" required rows={4} defaultValue={fields.join('\n')}
                    placeholder={"One field per line — e.g.\nChest\nWaist\nSleeve\nLength"}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white" />
                <p className="text-xs text-gray-400 mt-1">One field per line (or comma-separated).</p>
            </div>

            <FormMessage state={state} />

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
