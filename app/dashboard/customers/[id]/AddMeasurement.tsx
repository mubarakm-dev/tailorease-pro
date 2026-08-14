"use client"

import { useActionState, useState } from "react"
import { createMeasurement, MeasurementCreateState } from "./action"
import SubmitButton from "@/app/components/SubmitButton"
import FormMessage from "@/app/components/FormMessage"

type Template = { id: string; name: string; fieldDefinitions: string[] }

const initialState: MeasurementCreateState = { success: false, error: null }

export default function AddMeasurement({ customerId, templates }: { customerId: string; templates: Template[] }) {
    const [state, formAction] = useActionState(createMeasurement, initialState)
    const [selectedId, setSelectedId] = useState("")

    const selected = templates.find((t: any) => t.id === selectedId)

    if (templates.length === 0) {
        return (
            <p className="text-sm text-gray-400 px-5 py-6 text-center border-t border-gray-100">
                No templates yet — an admin must create one before you can record measurements.
            </p>
        )
    }

    return (
        <form action={formAction} className="p-5 flex flex-col gap-4 border-t border-gray-100 bg-gray-50/50">
            <input type="hidden" name="customerId" value={customerId} />
            <h3 className="font-semibold text-sm text-gray-900">Add a measurement</h3>

            <FormMessage state={state} />

            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="block text-xs font-medium mb-1 text-gray-900">Template</label>
                    <select
                        name="templateId"
                        required
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
                    >
                        <option value="">Choose a template…</option>
                        {templates.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-28">
                    <label className="block text-xs font-medium mb-1 text-gray-900">Unit</label>
                    <select name="unit" className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900">
                        <option value="cm">cm</option>
                        <option value="inch">inch</option>
                    </select>
                </div>
            </div>

            {/* fields appear once a template is chosen */}
            {selected && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selected.fieldDefinitions.map((field: any) => (
                            <div key={field}>
                                <label className="block text-xs font-medium mb-1 text-gray-900">{field}</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name={`v_${field}`}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-500"
                                />
                            </div>
                        ))}
                    </div>
                    <div>
                        <SubmitButton className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800" pendingText="Saving…">
                            Save measurement
                        </SubmitButton>
                    </div>
                </>
            )}
        </form>
    )
}
