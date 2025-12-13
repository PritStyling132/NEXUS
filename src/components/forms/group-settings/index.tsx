"use client"
import GroupCard from "@/app/(landing)/explore/_components/group-card"
import { useGroupSettings } from "@/hooks/groups"
import { Label } from "@radix-ui/react-label"
import { Input } from "@/components/ui/input"
import { FormGenerator } from "@/components/global/form-generator"
import {
    getGroupIconUrl,
    getGroupThumbnailUrl,
} from "@/lib/default-group-assets"
import { Textarea } from "@/components/ui/textarea"
import { useMemo } from "react"

type Props = {
    groupId: string
}

const GroupSettingsForm = ({ groupId }: Props) => {
    const {
        data,
        register,
        errors,
        onUpdate,
        isPending,
        previewIcon,
        previewThumbnail,
    } = useGroupSettings(groupId)

    // Memoize URLs to prevent unnecessary re-renders when typing in form fields
    const iconUrl = useMemo(
        () => previewIcon || getGroupIconUrl(data?.group?.icon, data?.group?.category),
        [previewIcon, data?.group?.icon, data?.group?.category]
    )

    const thumbnailUrl = useMemo(
        () => previewThumbnail || getGroupThumbnailUrl(data?.group?.thumbnail, data?.group?.category),
        [previewThumbnail, data?.group?.thumbnail, data?.group?.category]
    )

    return (
        <form
            className="flex flex-col h-full w-full items-start gap-y-6 md:gap-y-8"
            onSubmit={onUpdate}
        >
            <div className="flex flex-col lg:flex-row gap-6 md:gap-10 w-full">
                {/* Group Preview Card */}
                <div className="flex flex-col gap-3 items-start lg:w-auto w-full">
                    <p className="text-sm font-semibold text-foreground dark:text-themeTextWhite">
                        Group Preview
                    </p>
                    <div className="w-full lg:w-auto">
                        <GroupCard
                            id={data?.group?.id!}
                            userId={data?.group?.userId!}
                            category={data?.group?.category!}
                            description={data?.group?.description!}
                            privacy={data?.group?.privacy!}
                            thumbnail={data?.group?.thumbnail!}
                            name={data?.group?.name!}
                            preview={previewThumbnail}
                        />
                    </div>
                </div>

                {/* Icon & Image Upload Section */}
                <div className="flex-1 flex flex-col gap-4 items-start">
                    <p className="text-sm font-semibold text-foreground dark:text-themeTextWhite">
                        Group Icon
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
                        <img
                            key={`icon-${data?.group?.icon}-${previewIcon}`}
                            className="w-24 h-24 rounded-xl object-cover border-2 border-border dark:border-themeGray shadow-md"
                            src={iconUrl}
                            alt="icon"
                            onLoad={() => {
                                console.log(
                                    "✅ Icon loaded successfully:",
                                    iconUrl,
                                )
                            }}
                            onError={(e) => {
                                console.error(
                                    "❌ Failed to load icon:",
                                    e.currentTarget.src,
                                )
                            }}
                        />
                        <div className="flex flex-col gap-3 w-full sm:w-auto">
                            <Label
                                htmlFor="icon-upload"
                                className="border-2 border-border dark:border-themeGray bg-card dark:bg-themeGray/50 px-5 py-3 rounded-xl hover:bg-accent dark:hover:bg-themeBlack cursor-pointer transition-colors text-center sm:text-left font-medium"
                            >
                                <Input
                                    type="file"
                                    id="icon-upload"
                                    className="hidden"
                                    {...register("icon")}
                                    accept="image/*"
                                />
                                Change Icon
                            </Label>
                            <Label
                                htmlFor="thumbnail-upload"
                                className="border-2 border-border dark:border-themeGray bg-card dark:bg-themeGray/50 px-5 py-3 rounded-xl hover:bg-accent dark:hover:bg-themeBlack cursor-pointer transition-colors text-center sm:text-left font-medium"
                            >
                                <Input
                                    type="file"
                                    id="thumbnail-upload"
                                    className="hidden"
                                    {...register("thumbnail")}
                                    accept="image/*"
                                />
                                Change Cover
                            </Label>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground dark:text-themeTextGray">
                        Recommended: Square image, at least 256x256px
                    </p>
                </div>
            </div>

            {/* Group Details Section */}
            <div className="flex flex-col w-full gap-y-6 border-t border-border dark:border-themeGray pt-6">
                <h4 className="text-lg font-semibold text-foreground dark:text-themeTextWhite">
                    Group Details
                </h4>
                <div className="flex flex-col w-full xl:w-10/12 2xl:w-8/12 gap-y-5">
                    <FormGenerator
                        register={register}
                        name="name"
                        placeholder="Enter group name"
                        label="Group Name"
                        errors={errors}
                        inputType="input"
                        type="text"
                    />
                    <Label className="flex flex-col gap-y-3">
                        <p className="text-sm font-semibold text-foreground dark:text-themeTextWhite">
                            Group Description
                        </p>
                        <Textarea
                            {...register("description")}
                            placeholder="Enter a description for your group..."
                            className="min-h-[150px] resize-y border-border dark:border-themeGray bg-background dark:bg-themeBlack text-foreground dark:text-themeTextGray focus:ring-2 focus:ring-primary rounded-xl p-4"
                            rows={6}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.description.message as string}
                            </p>
                        )}
                    </Label>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end w-full border-t border-border dark:border-themeGray pt-6">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    )
}

export default GroupSettingsForm
