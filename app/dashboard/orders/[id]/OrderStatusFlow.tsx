"use client"

import { useState, useEffect } from "react"
import { advanceOrderStatus } from "./action"

type OrderStatus = "RECEIVED" | "CUT_IN_PROGRESS" | "SEWING_IN_PROGRESS" | "FINISHING" | "COMPLETED"

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

            <h2 className="font-semibold text-sm mb-2 text-gray-900 placeholder:text-gray-500">Order Progress</h2>
            <p className="text-xs text-gray-500 mb-6">Click any stage above or use buttons below to change status</p>

            <div className="flex items-center gap-3 mb-8">
                {STAGES.map((stage: any, idx: number) => {
                    const isCompleted = idx < currentIdx
                    const isCurrent = idx === currentIdx
                    const isClickable = stage.key !== currentStatus

                    return (
                        <div key={stage.key} className="flex items-center flex-1">
                          
                            <button
                                onClick={() => handleStageClick(stage.key)}
                                disabled={loading || !isClickable}

                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs
                                    transition-all duration-300 cursor-pointer shrink-0
                                    ${isCurrent
                                        ? "bg-[#b07c34] text-white shadow-md ring-2 ring-[#b07c34] ring-offset-2"
                                        : isCompleted
                                            ? "bg-green-500 text-white hover:bg-green-600 hover:shadow-md cursor-pointer"
                                            : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:shadow-md cursor-pointer"
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-inherit disabled:hover:shadow-none
                                `}
                                title={isClickable ? `Go to ${stage.label}` : "Current stage"}
                            >
                                {isCompleted ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    idx + 1
                                )}
                            </button>

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

         
            <div className="flex items-center gap-3 mb-8">
                {STAGES.map((stage: any, idx: number) => (
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

          
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Current Status</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{STAGES[currentIdx]?.label}</p>
            </div>

            <div className="flex gap-3">
                {currentIdx > 0 && (
                    <button
                        onClick={() => handleStageClick(STAGES[currentIdx - 1].key)}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
                    >
                        ← Move to {STAGES[currentIdx - 1].label}
                    </button>
                )}

                {currentIdx < STAGES.length - 1 && (
                    <button
                        onClick={() => handleStageClick(STAGES[currentIdx + 1].key)}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-[#b07c34] text-white rounded-lg text-sm font-medium hover:bg-[#9a6a2a] transition disabled:opacity-50"
                    >
                        Advance to {STAGES[currentIdx + 1].label} →
                    </button>
                )}

                {currentIdx === STAGES.length - 1 && (
                    <div className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg text-center border border-green-200 shadow-sm">
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-semibold text-green-700">Order Complete</p>
                        </div>
                        <p className="text-xs text-green-600 mt-0.5">Ready for delivery</p>
                    </div>
                )}
            </div>

      
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
                                className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
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
