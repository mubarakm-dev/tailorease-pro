"use client"

import { useActionState, useEffect, useState } from "react"
import { updateMeasurement, MeasurementUpdateState } from "./action"
import SubmitButton from "@/app/components/SubmitButton"
import FormMessage from "@/app/components/FormMessage"

const initialState: MeasurementUpdateState = { success: false, error: null }

type Props = {
    id: string
    templateName: string
    unit: string
    createdAt: Date
    values: Record<string, string>
    snapshotFields: string[]
    templateFields: string[]
}

export default function EditMeasurement({ id, templateName, unit, createdAt, values, snapshotFields, templateFields }: Props) {
    const [state, formAction] = useActionState(updateMeasurement, initialState)
    const [editing, setEditing] = useState(false)

    
    const union = Array.from(new Set([...snapshotFields, ...templateFields]))

   
    useEffect(() => {
        if (state.success) setEditing(false)
    }, [state])

    if (!editing) {
        return (
            <div className="px-5 py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                        {templateName} <span className="text-xs text-gray-400 font-normal">({unit})</span>
                    </p>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-400">
                            {createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                        <button type="button" onClick={() => setEditing(true)} className="text-xs text-[#b07c34] hover:underline">
                            Edit
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                    {Object.entries(values).map(([field, value]) => (
                        <span key={field}>
                            <span className="text-gray-400">{field}:</span> {value}
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

            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{templateName}</p>
                <select name="unit" defaultValue={unit} className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
                    <option value="cm">cm</option>
                    <option value="inch">inch</option>
                </select>
            </div>

            <FormMessage state={state} />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {union.map((field) => {
                    const isNew = !snapshotFields.includes(field) 
                    return (
                        <div key={field}>
                            <label className="block text-xs font-medium mb-1 text-gray-500">
                                {field}
                                {isNew && <span className="ml-1 text-[10px] uppercase tracking-wide text-[#b07c34]">new</span>}
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name={`v_${field}`}
                                defaultValue={values[field] ?? ""}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                            />
                        </div>
                    )
                })}
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
