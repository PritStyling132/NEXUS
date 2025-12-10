"use client"

import { useCreateCourseVideo } from "@/hooks/courses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Video, Image as ImageIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

type CourseVideoFormProps = {
    courseId: string
    onSuccess?: () => void
}

export default function CourseVideoForm({
    courseId,
    onSuccess,
}: CourseVideoFormProps) {
    const {
        register,
        errors,
        onSubmit,
        isPending,
        uploadProgress,
        previewVideo,
        previewThumbnail,
    } = useCreateCourseVideo(courseId, onSuccess)

    const totalProgress = (uploadProgress.thumbnail + uploadProgress.video) / 2

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Video Title */}
            <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                    Video Title *
                </Label>
                <Input
                    id="title"
                    placeholder="e.g., Introduction to React Hooks"
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

            {/* Video Upload Section */}
            <div className="space-y-2">
                <Label htmlFor="video" className="text-base font-semibold">
                    Video File *
                </Label>
                <Card
                    className={cn(
                        "border-2 border-dashed transition-colors",
                        errors.video
                            ? "border-destructive"
                            : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    )}
                >
                    <CardContent className="p-6">
                        {previewVideo ? (
                            <div className="space-y-4">
                                <video
                                    src={previewVideo}
                                    controls
                                    className="w-full rounded-lg max-h-[400px]"
                                />
                                <div className="flex justify-center">
                                    <Label
                                        htmlFor="video"
                                        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Click to change video
                                    </Label>
                                </div>
                            </div>
                        ) : (
                            <Label
                                htmlFor="video"
                                className="flex flex-col items-center justify-center py-12 cursor-pointer"
                            >
                                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                                <span className="text-sm font-medium mb-1">
                                    Click to upload or drag and drop
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    MP4, WebM or MOV (max. 500MB)
                                </span>
                            </Label>
                        )}
                        <Input
                            id="video"
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            className="hidden"
                            {...register("video")}
                            disabled={isPending}
                        />
                    </CardContent>
                </Card>
                {errors.video && (
                    <p className="text-sm text-destructive">
                        {errors.video.message?.toString()}
                    </p>
                )}
            </div>

            {/* Thumbnail Upload Section */}
            <div className="space-y-2">
                <Label htmlFor="thumbnail" className="text-base font-semibold">
                    Thumbnail Image *
                </Label>
                <Card
                    className={cn(
                        "border-2 border-dashed transition-colors",
                        errors.thumbnail
                            ? "border-destructive"
                            : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    )}
                >
                    <CardContent className="p-6">
                        {previewThumbnail ? (
                            <div className="space-y-4">
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                                    <img
                                        src={previewThumbnail}
                                        alt="Thumbnail preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <Label
                                        htmlFor="thumbnail"
                                        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Click to change thumbnail
                                    </Label>
                                </div>
                            </div>
                        ) : (
                            <Label
                                htmlFor="thumbnail"
                                className="flex flex-col items-center justify-center py-12 cursor-pointer"
                            >
                                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                <span className="text-sm font-medium mb-1">
                                    Click to upload or drag and drop
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    PNG, JPG, JPEG or WebP (max. 5MB)
                                </span>
                            </Label>
                        )}
                        <Input
                            id="thumbnail"
                            type="file"
                            accept="image/png,image/jpg,image/jpeg,image/webp"
                            className="hidden"
                            {...register("thumbnail")}
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

            {/* Caption Section */}
            <div className="space-y-2">
                <Label htmlFor="caption" className="text-base font-semibold">
                    Caption / Description
                </Label>
                <Textarea
                    id="caption"
                    placeholder="Describe what this video covers..."
                    className="min-h-[120px] resize-none"
                    {...register("caption")}
                    disabled={isPending}
                />
                {errors.caption && (
                    <p className="text-sm text-destructive">
                        {errors.caption.message?.toString()}
                    </p>
                )}
            </div>

            {/* Upload Progress */}
            {isPending && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Uploading...
                        </span>
                        <span className="font-medium">
                            {Math.round(totalProgress)}%
                        </span>
                    </div>
                    <Progress value={totalProgress} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>Thumbnail: {uploadProgress.thumbnail}%</div>
                        <div>Video: {uploadProgress.video}%</div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        <Upload className="mr-2 h-4 w-4 animate-pulse" />
                        Uploading Video...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Add Video to Course
                    </>
                )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
                * Required fields
            </p>
        </form>
    )
}
