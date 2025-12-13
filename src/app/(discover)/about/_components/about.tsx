"use client"

import { useGroupAbout, useGroupInfo } from "@/hooks/groups"
import { MediaGallery } from "./galary"
import BlockTextEditor from "@/components/global/rich-text-editor"
import { Button } from "@/components/ui/button"
import Loader from "@/components/global/loader"
import { Card } from "@/components/ui/card"
import { Users, Hash, BookOpen, CheckCircle, Star, Zap, FileText } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { onGetGroupPublicStats } from "@/actions/groups"
import { getYouTubeEmbedUrl, getLoomEmbedUrl } from "@/lib/utils"

type Props = { userid?: string; groupid: string }

const AboutGroup = ({ groupid, userid }: Props) => {
    const { group } = useGroupInfo()

    // Fetch public stats
    const { data: statsData } = useQuery({
        queryKey: ["group-public-stats", groupid],
        queryFn: () => onGetGroupPublicStats(groupid),
    })

    const stats = statsData?.data || { memberCount: 0, channelCount: 0, courseCount: 0 }

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
        description: group?.description || null,
        jsonDescription: group?.jsonDescription || null,
        htmlDescription: group?.htmlDescription || null,
        currentMedia: group?.gallery?.[0] || null,
        groupId: groupid,
    })

    // Get proper embed URL for active media
    const getActiveMediaUrl = () => {
        if (!activeMedia?.url) return undefined
        if (activeMedia.type === "YOUTUBE") {
            return getYouTubeEmbedUrl(activeMedia.url)
        }
        if (activeMedia.type === "LOOM") {
            return getLoomEmbedUrl(activeMedia.url)
        }
        return activeMedia.url
    }

    const isOwner = userid === group?.userId

    // Show loading state if group data isn't available yet
    if (!group || !group.name) {
        return (
            <div className="flex flex-col gap-y-10 animate-pulse">
                <div>
                    <div className="h-14 bg-themeGray/30 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-themeGray/30 rounded w-full" />
                </div>
                <div className="aspect-video bg-themeGray/30 rounded-xl" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-10">
            <div>
                <h2 className="font-bold text-4xl md:text-[56px] leading-tight md:leading-normal text-foreground">
                    {group.name}
                </h2>
                <p className="text-muted-foreground leading-relaxed md:mt-2 mt-5">
                    {group.description}
                </p>
            </div>

            {/* Group Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-card/50 border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Hash className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.channelCount}</p>
                            <p className="text-sm text-muted-foreground">Channels</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-card/50 border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.courseCount}</p>
                            <p className="text-sm text-muted-foreground">Courses</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-card/50 border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.memberCount}</p>
                            <p className="text-sm text-muted-foreground">Members</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Why Join Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Why Join This Group?</h3>
                <div className="grid gap-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-foreground">Access Exclusive Content</p>
                            <p className="text-sm text-muted-foreground">Get access to premium courses and learning materials</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border">
                        <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-foreground">Community Interaction</p>
                            <p className="text-sm text-muted-foreground">Connect with like-minded learners in channels</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border">
                        <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-foreground">Learn at Your Pace</p>
                            <p className="text-sm text-muted-foreground">Flexible learning with courses you can take anytime</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Media Preview */}
            {group.gallery && group.gallery.length > 0 && activeMedia && (
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-border">
                    {activeMedia.type === "IMAGE" ? (
                        <img
                            src={activeMedia.url}
                            alt="group-img"
                            className="w-full aspect-video object-cover"
                        />
                    ) : activeMedia.type === "LOOM" ? (
                        <div className="w-full aspect-video relative bg-black">
                            <iframe
                                src={getActiveMediaUrl()}
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    ) : activeMedia.type === "YOUTUBE" ? (
                        <div className="w-full aspect-video relative bg-black">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src={getActiveMediaUrl()}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    ) : null}
                </div>
            )}

            {/* Media Gallery */}
            <MediaGallery
                gallery={group.gallery || []}
                groupid={groupid}
                onActive={onSetActiveMedia}
                userid={userid}
                groupUserid={group.userId}
            />

            {/* Description Section */}
            {userid !== group.userId ? (
                // Read-Only View (Non-Owner)
                group.htmlDescription && (
                    <Card className="p-6 bg-card/50 border-border">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-semibold text-foreground">About This Group</h3>
                        </div>
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none text-foreground"
                            dangerouslySetInnerHTML={{
                                __html: group.htmlDescription,
                            }}
                        />
                    </Card>
                )
            ) : (
                // Editable Form View (Group Owner)
                <Card className="p-6 bg-card/50 border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-semibold text-foreground">Group Description</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Write a detailed description about your group. This will be visible to all visitors.
                    </p>
                    <form
                        ref={editor}
                        onSubmit={onUpdateDescription}
                        className="flex flex-col gap-4"
                    >
                        <div className="border border-border rounded-lg overflow-hidden bg-background">
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
                        </div>

                        {/* Save Button - Always visible for owner */}
                        <div className="flex justify-end">
                            <Button
                                className="px-8"
                                disabled={isPending}
                                type="submit"
                            >
                                <Loader loading={isPending}>Save Changes</Loader>
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    )
}

export default AboutGroup
