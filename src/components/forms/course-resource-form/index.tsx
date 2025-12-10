"use client"

import { useCreateCourseResource } from "@/hooks/courses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Link2, Youtube, FileText, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Controller } from "react-hook-form"

type CourseResourceFormProps = {
    courseId: string
    onSuccess?: () => void
}

export default function CourseResourceForm({
    courseId,
    onSuccess,
}: CourseResourceFormProps) {
    const { register, errors, onSubmit, isPending, watch } =
        useCreateCourseResource(courseId, onSuccess)

    const resourceType = watch("type")

    const getIcon = () => {
        switch (resourceType) {
            case "YOUTUBE":
                return <Youtube className="h-4 w-4" />
            case "DOCUMENT":
                return <FileText className="h-4 w-4" />
            default:
                return <Link2 className="h-4 w-4" />
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Resource Type */}
            <div className="space-y-2">
                <Label htmlFor="type" className="text-base font-semibold">
                    Resource Type *
                </Label>
                <Select
                    defaultValue="YOUTUBE"
                    disabled={isPending}
                    onValueChange={(value) => {
                        // This is handled by the form
                    }}
                >
                    <SelectTrigger
                        className={cn(errors.type && "border-destructive")}
                    >
                        <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="YOUTUBE">
                            <div className="flex items-center gap-2">
                                <Youtube className="h-4 w-4" />
                                <span>YouTube Video</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="LINK">
                            <div className="flex items-center gap-2">
                                <Link2 className="h-4 w-4" />
                                <span>External Link</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="DOCUMENT">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>Document</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
                <input type="hidden" {...register("type")} value="YOUTUBE" />
                {errors.type && (
                    <p className="text-sm text-destructive">
                        {errors.type.message?.toString()}
                    </p>
                )}
            </div>

            {/* Resource Title */}
            <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                    Resource Title *
                </Label>
                <Input
                    id="title"
                    placeholder="e.g., React Official Documentation"
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

            {/* Resource URL */}
            <div className="space-y-2">
                <Label htmlFor="url" className="text-base font-semibold">
                    Resource URL *
                </Label>
                <div className="relative">
                    <Input
                        id="url"
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        {...register("url")}
                        disabled={isPending}
                        className={cn(
                            "pl-10",
                            errors.url && "border-destructive",
                        )}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {getIcon()}
                    </div>
                </div>
                {errors.url && (
                    <p className="text-sm text-destructive">
                        {errors.url.message?.toString()}
                    </p>
                )}
                <p className="text-xs text-muted-foreground">
                    {resourceType === "YOUTUBE" && "Paste a YouTube video URL"}
                    {resourceType === "LINK" &&
                        "Paste any external learning resource URL"}
                    {resourceType === "DOCUMENT" &&
                        "Paste a Google Drive or Dropbox document link"}
                </p>
            </div>

            {/* Resource Description */}
            <div className="space-y-2">
                <Label
                    htmlFor="description"
                    className="text-base font-semibold"
                >
                    Description (Optional)
                </Label>
                <Textarea
                    id="description"
                    placeholder="Why is this resource helpful?..."
                    className="min-h-[100px] resize-none"
                    {...register("description")}
                    disabled={isPending}
                />
                {errors.description && (
                    <p className="text-sm text-destructive">
                        {errors.description.message?.toString()}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        <Plus className="mr-2 h-4 w-4 animate-pulse" />
                        Adding Resource...
                    </>
                ) : (
                    <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Resource
                    </>
                )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
                * Required fields
            </p>
        </form>
    )
}
