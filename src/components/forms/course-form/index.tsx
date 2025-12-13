"use client"

import { useCreateCourse } from "@/hooks/courses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Image as ImageIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { useState, useRef } from "react"

type CourseFormProps = {
    groupId: string
    onSuccess?: (courseId?: string) => void
}

export default function CourseForm({ groupId, onSuccess }: CourseFormProps) {
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null,
    )
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { register, errors, onSubmit, isPending, uploadProgress, setValue } =
        useCreateCourse(groupId, onSuccess)

    // Handle thumbnail file selection
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files[0]) {
            // Update form value
            setValue("thumbnail", files, { shouldValidate: true })
            // Create preview URL
            const url = URL.createObjectURL(files[0])
            setThumbnailPreview(url)
        } else {
            setValue("thumbnail", undefined)
            setThumbnailPreview(null)
        }
    }

    // Handle click on the upload area
    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Course Title */}
            <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                    Course Title *
                </Label>
                <Input
                    id="title"
                    placeholder="e.g., Complete Web Development Bootcamp"
                    {...register("title")}
                    disabled={isPending}
                    className={cn(errors.title && "border-destructive")}
                />
                {errors.title && (
                    <p className="text-sm text-destructive">
                        {errors.title.message?.toString()}
                    </p>
                )}
            </div>

            {/* Course Description */}
            <div className="space-y-2">
                <Label
                    htmlFor="description"
                    className="text-base font-semibold"
                >
                    Description
                </Label>
                <Textarea
                    id="description"
                    placeholder="Describe what students will learn in this course..."
                    className="min-h-[120px] resize-none"
                    {...register("description")}
                    disabled={isPending}
                />
                {errors.description && (
                    <p className="text-sm text-destructive">
                        {errors.description.message?.toString()}
                    </p>
                )}
            </div>

            {/* Course Thumbnail */}
            <div className="space-y-2">
                <Label className="text-base font-semibold">
                    Course Thumbnail (Optional)
                </Label>
                <Card
                    className={cn(
                        "border-2 border-dashed transition-colors cursor-pointer",
                        errors.thumbnail
                            ? "border-destructive"
                            : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    )}
                    onClick={handleUploadClick}
                >
                    <CardContent className="p-6">
                        {thumbnailPreview ? (
                            <div className="space-y-4">
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Click to change thumbnail
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                <span className="text-sm font-medium mb-1">
                                    Click to upload or drag and drop
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    PNG, JPG, JPEG or WebP (max. 5MB)
                                </span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/png,image/jpg,image/jpeg,image/webp"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleThumbnailChange}
                            disabled={isPending}
                        />
                    </CardContent>
                </Card>
                {errors.thumbnail && (
                    <p className="text-sm text-destructive">
                        {errors.thumbnail.message?.toString()}
                    </p>
                )}
            </div>

            {/* Upload Progress */}
            {isPending && uploadProgress.thumbnail > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Uploading thumbnail...
                        </span>
                        <span className="font-medium">
                            {uploadProgress.thumbnail}%
                        </span>
                    </div>
                    <Progress
                        value={uploadProgress.thumbnail}
                        className="h-2"
                    />
                </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
                <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Upload className="mr-2 h-4 w-4 animate-pulse" />
                            Creating Course...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Create Course
                        </>
                    )}
                </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
                * Required fields
            </p>
        </form>
    )
}
