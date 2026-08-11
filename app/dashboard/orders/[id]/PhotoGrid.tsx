"use client"

import { useState } from "react"
import { deletePhoto } from "./action"
import ConfirmButton from "@/app/components/ConfirmButton"

type Photo = {
    id: string
    url: string
    caption: string | null
    uploadedAt: Date
    uploadedByStaff: { fullName: string }
}

type Props = {
    photos: Photo[]
    orderId: string
}

export default function PhotoGrid({ photos, orderId }: Props) {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

    if (photos.length === 0) return null

    return (
        <>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-sm">Photos ({photos.length})</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-5">
                {photos.map((photo: any) => (
                    <div key={photo.id} className="group relative rounded-lg overflow-hidden bg-gray-100">
                        <div className="aspect-square relative w-full cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                            <img
                                src={photo.url}
                                alt={photo.caption || "Order photo"}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                                <span className="text-white text-sm font-medium">Click to view</span>
                                <ConfirmButton
                                    action={deletePhoto.bind(null, photo.id, orderId)}
                                    className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                                    title="Delete this photo?"
                                    message={`Uploaded by ${photo.uploadedByStaff.fullName}`}
                                    confirmText="Delete"
                                    pendingText="Deleting…"
                                    danger
                                >
                                    Delete
                                </ConfirmButton>
                            </div>
                        </div>

                        {photo.caption && (
                            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 truncate">
                                {photo.caption}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>

        {selectedPhoto && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
                onClick={() => setSelectedPhoto(null)}
            >
                <div
                    className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-sm text-gray-800">Photo preview</h3>
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 p-6">
                        <img
                            src={selectedPhoto.url}
                            alt={selectedPhoto.caption || "Order photo"}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>

                    {(selectedPhoto.caption || selectedPhoto.uploadedByStaff) && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 space-y-1">
                            {selectedPhoto.caption && <p><span className="font-medium">Caption:</span> {selectedPhoto.caption}</p>}
                            <p><span className="font-medium">Uploaded by:</span> {selectedPhoto.uploadedByStaff.fullName} · {new Date(selectedPhoto.uploadedAt).toLocaleDateString()}</p>
                        </div>
                    )}

                    <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                        >
                            Close
                        </button>
                        <ConfirmButton
                            action={deletePhoto.bind(null, selectedPhoto.id, orderId)}
                            className="text-xs text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                            title="Delete this photo?"
                            message={`Uploaded by ${selectedPhoto.uploadedByStaff.fullName}`}
                            confirmText="Delete"
                            pendingText="Deleting…"
                            danger
                        >
                            Delete photo
                        </ConfirmButton>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}
