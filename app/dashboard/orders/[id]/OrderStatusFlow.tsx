"use client"

import { useState, useEffect } from "react"
import { advanceOrderStatus } from "./action"
import type { OrderStatus } from "@prisma/client"

const STAGES: { key: OrderStatus; label: string }[] = [
    { key: "RECEIVED", label: "Received" },
    { key: "CUT_IN_PROGRESS", label: "Cutting" },
    { key: "SEWING_IN_PROGRESS", label: "Sewing" },
    { key: "FINISHING", label: "Finishing" },
    { key: "COMPLETED", label: "Completed" },
]

const stageIndex = (status: OrderStatus) => STAGES.findIndex(s => s.key === status)

export function OrderStatusFlow({ currentStatus, orderId }: { currentStatus: OrderStatus; orderId: string }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [showConfirm, setShowConfirm] = useState<{ stage: OrderStatus; targetIdx: number } | null>(null)

    const currentIdx = stageIndex(currentStatus)

    // Auto-dismiss success message after 3 seconds
    useEffect(() => {
        if (message?.type === "success") {
            const timer = setTimeout(() => setMessage(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [message])

    const handleStageClick = (stage: OrderStatus) => {
        if (stage === currentStatus) return
        const targetIdx = stageIndex(stage)
        if (targetIdx === -1) return
        setShowConfirm({ stage, targetIdx })
    }

    const handleConfirm = async () => {
        if (!showConfirm) return

        const { stage } = showConfirm
        setShowConfirm(null)
        setLoading(true)
        setMessage(null)

        try {
            const formData = new FormData()
            formData.append("targetStatus", stage)
            const result = await advanceOrderStatus(orderId, formData)

            if (result.success) {
                setMessage({ type: "success", text: "Status updated successfully" })
            } else {
                setMessage({ type: "error", text: result.error || "Failed to update status" })
            }
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {/* Message at top */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg border transition-all duration-300 ${
                    message.type === "success"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                }`}>
                    <p className={`text-sm font-medium ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>
                        {message.text}
                    </p>
                </div>
            )}

            <h2 className="font-semibold text-sm mb-8 text-gray-900">Order Progress</h2>

            {/* Timeline - Clean and minimal */}
            <div className="flex items-center gap-3 mb-8">
                {STAGES.map((stage, idx) => {
                    const isCompleted = idx < currentIdx
                    const isCurrent = idx === currentIdx
                    const isUpcoming = idx > currentIdx

                    return (
                        <div key={stage.key} className="flex items-center flex-1">
                            {/* Stage Circle */}
                            <button
                                onClick={() => handleStageClick(stage.key)}
                                disabled={loading}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs
                                    transition-all duration-300 shrink-0
                                    ${isCurrent
                                        ? "bg-[#b07c34] text-white shadow-md ring-2 ring-[#b07c34] ring-offset-2"
                                        : isCompleted
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-200 text-gray-600"
                                    }
                                    ${isUpcoming && !isCurrent ? "cursor-pointer hover:bg-gray-300" : ""}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {isCompleted ? "✓" : idx + 1}
                            </button>

                            {/* Connector */}
                            {idx < STAGES.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                                        idx < currentIdx ? "bg-green-500" : "bg-gray-300"
                                    }`}
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Labels */}
            <div className="flex items-center gap-3 mb-8">
                {STAGES.map((stage, idx) => (
                    <div key={stage.key} className="flex-1 text-center">
                        <p className={`text-xs font-medium ${
                            idx === currentIdx
                                ? "text-[#b07c34] font-semibold"
                                : idx < currentIdx
                                    ? "text-green-600"
                                    : "text-gray-500"
                        }`}>
                            {stage.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Current Status Card */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Current Status</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{STAGES[currentIdx]?.label}</p>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Update Order Status?
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Move order to <span className="font-medium">{STAGES[showConfirm.targetIdx].label}</span>
                            {showConfirm.targetIdx > currentIdx ? " (advancing)" : " (moving back)"}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(null)}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#b07c34] rounded-lg hover:bg-[#9a6a2a] transition disabled:opacity-50"
                            >
                                {loading ? "Updating…" : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
