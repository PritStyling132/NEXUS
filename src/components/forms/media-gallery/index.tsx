"use client"

import { FormGenerator } from "@/components/global/form-generator"
import { Input } from "@/components/ui/input"
import { ErrorMessage } from "@hookform/error-message"
import { Label } from "@/components/ui/label"
import { BadgePlus, X, Image as ImageIcon, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import Loader from "@/components/global/loader"
import { useMediaGallery } from "@/hooks/groups"
import { useState, useEffect } from "react"
import { useWatch } from "react-hook-form"

type Props = {
    groupid: string
}

const MediaGalleryForm = ({ groupid }: Props) => {
    const { errors, register, onUpdateGallery, isPending, control } =
        useMediaGallery(groupid)

    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Watch for file changes
    const imageFiles = useWatch({ control, name: "image" })

    // Update preview when files change
    useEffect(() => {
        if (imageFiles && imageFiles.length > 0) {
            const file = imageFiles[0]
            const previewUrl = URL.createObjectURL(file)
            setImagePreview(previewUrl)

            // Cleanup
            return () => URL.revokeObjectURL(previewUrl)
        } else {
            setImagePreview(null)
        }
    }, [imageFiles])

    const clearImagePreview = () => {
        setImagePreview(null)
    }

    return (
        <form onSubmit={onUpdateGallery} className="flex flex-col gap-y-4">
            {/* Video URL Section */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                    <Youtube className="h-4 w-4 text-red-500" />
                    YouTube or Loom Video Link
                </Label>
                <FormGenerator
                    register={register}
                    errors={errors}
                    name="videourl"
                    label=""
                    placeholder="https://www.youtube.com/watch?v=... or https://www.loom.com/share/..."
                    inputType="input"
                    type="text"
                />
                <p className="text-xs text-muted-foreground">
                    Paste a YouTube or Loom video URL to embed it in your
                    gallery
                </p>
            </div>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or
                    </span>
                </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Upload Image
                </Label>

                {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full aspect-video object-cover"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                            onClick={clearImagePreview}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="text-white text-sm font-medium">
                                Image ready to upload
                            </p>
                        </div>
                    </div>
                ) : (
                    <Label htmlFor="media-gallery" className="cursor-pointer">
                        <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg flex flex-col justify-center items-center py-10 transition-colors bg-muted/30 hover:bg-muted/50">
                            <Input
                                type="file"
                                className="hidden"
                                id="media-gallery"
                                accept="image/*"
                                {...register("image")}
                            />
                            <div className="p-3 rounded-full bg-primary/10 mb-3">
                                <BadgePlus className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                Click to upload an image
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG, GIF up to 10MB
                            </p>
                        </div>
                    </Label>
                )}

                <ErrorMessage
                    errors={errors}
                    name="image"
                    render={({ message }) => (
                        <p className="text-red-400 text-sm">
                            {message === "Required" ? "" : message}
                        </p>
                    )}
                />
            </div>

            <Button className="w-full mt-2" disabled={isPending} type="submit">
                <Loader loading={isPending}>Upload to Gallery</Loader>
            </Button>
        </form>
    )
}

export default MediaGalleryForm
