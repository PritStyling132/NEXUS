"use client"

import { useGroupAbout, useGroupInfo } from "@/hooks/groups"
import { MediaGallery } from "./galary"
import BlockTextEditor from "@/components/global/rich-text-editor"
import { Button } from "@/components/ui/button"
import Loader from "@/components/global/loader"
import VideoGallery from "@/components/global/video-gallery"

type Props = { userid: string; groupid: string }

const AboutGroup = ({ groupid, userid }: Props) => {
    const { group } = useGroupInfo()

    const {
        setJsonDescription,
        setOnDescription,
        onDescription,
        onJsonDescription,
        errors,
        onEditDescription,
        editor,
        activeMedia,
        onSetActiveMedia,
        onUpdateDescription,
        isPending,
        setOnHtmlDescription,
    } = useGroupAbout({
        description: group.description,
        jsonDescription: group.jsonDescription,
        htmlDescription: group.htmlDescription,
        currentMedia: group.gallery[0],
        groupId: groupid,
    })

    if (!group) {
        return (
            <div>
                <p>Group not found</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-10">
            <div>
                <h2 className="font-bold text-[56px] leading-none md:leading-normal">
                    {group.name}
                </h2>
                <p className="text-themeTextGray leading-none md:mt-2 mt-5">
                    {group.description}
                </p>
            </div>

            {group.gallery.length > 0 && (
                <div className="relative rounded-xl">
                    <div className="img-overlay absolute h-2/6 bottom-0 w-full z-50" />
                    {activeMedia?.type === "IMAGE" ? (
                        <img
                            src={`https://ucarecdn.com/${activeMedia.url}/`}
                            alt="group-img"
                            className="w-full aspect-video z-20 rounded-t-xl"
                        />
                    ) : activeMedia?.type === "LOOM" ? (
                        <div className="w-full aspect-video">
                            <iframe
                                src={activeMedia.url}
                                allowFullScreen
                                className="absolute outline-none border-0 top-0 left-0 w-full h-full rounded-t-xl"
                            />
                        </div>
                    ) : (
                        activeMedia?.type === "YOUTUBE" && (
                            <div className="w-full aspect-video relative">
                                <iframe
                                    className="w-full absolute top-0 left-0 h-full rounded-xl"
                                    src={activeMedia.url}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                        )
                    )}
                </div>
            )}

            <MediaGallery
                gallery={group.gallery}
                groupid={groupid}
                onActive={onSetActiveMedia}
                userid={userid}
                groupUserid={group.userId}
            />

            <VideoGallery
                groupId={groupid}
                userId={userid}
                groupOwnerId={group.userId}
            />

            {/* Conditional Rendering of Description: View vs. Edit */}
            {userid !== group.userId ? (
                // Read-Only View (Non-Owner)
                <div
                    dangerouslySetInnerHTML={{
                        __html: group.htmlDescription || "",
                    }}
                />
            ) : (
                // Editable Form View (Group Owner)
                <form
                    ref={editor}
                    onSubmit={onUpdateDescription}
                    className="mt-5 flex flex-col"
                >
                    <BlockTextEditor
                        max={10000}
                        min={100}
                        inline={false}
                        disabled={false}
                        name="jsondescription"
                        errors={errors}
                        setContent={setJsonDescription}
                        content={onJsonDescription}
                        htmlContent={
                            group.htmlDescription as string | undefined
                        }
                        setHtmlContent={setOnHtmlDescription}
                        textContent={onDescription}
                        setTextContent={setOnDescription}
                    />

                    {/* Conditional Save Button */}
                    {onEditDescription && (
                        <Button
                            className="self-end bg-themeBlack border-themeGray px-10"
                            variant="outline"
                            disabled={isPending}
                            type="submit"
                        >
                            <Loader loading={isPending}>Save Changes</Loader>
                        </Button>
                    )}
                </form>
            )}
        </div>
    )
}

export default AboutGroup
