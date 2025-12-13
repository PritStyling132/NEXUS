"use client"
import { usePathname } from "next/navigation"
import { IChannels } from "."
import { useChannelInfo } from "@/hooks/channels"
import Link from "next/link"
import { SIDEBAR_SETTINGS_MENU } from "@/constants/menus"
import { Button } from "@/components/ui/button"
import { Hash, MoreVertical, Edit2, Trash2, Check, X } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { cn } from "@/lib/utils"

type Props = {
    channels: IChannels[]
    optimisticChannel:
        | {
              id: string
              name: string
              icon: string
              createdAt: Date
              groupId: string | null
          }
        | undefined
    loading: boolean
    groupid: string
    groupUserId: string
    userId: string
}

const SideBarMenu = ({
    channels,
    groupUserId,
    groupid,
    loading,
    optimisticChannel,
    userId,
}: Props) => {
    const pathname = usePathname()
    const currentPage = pathname.split("/").pop()

    const {
        channel: current,
        onEditChannel,
        channelRef,
        inputRef,
        variables,
        isPending,
        edit,
        triggerRef,
        onSetIcon,
        icon,
        onChannelDelete,
        deleteVariables,
        isDeleting,
    } = useChannelInfo()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [channelToDelete, setChannelToDelete] = useState<string | null>(null)

    // Don't show optimistic channel to avoid duplicates
    // The mutation will invalidate and refetch the channels automatically
    const displayChannels = channels

    // Combine loading states
    const isLoading = loading || isPending || isDeleting

    const handleDeleteClick = (channelId: string) => {
        setChannelToDelete(channelId)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (channelToDelete) {
            onChannelDelete(channelToDelete)
            setDeleteDialogOpen(false)
            setChannelToDelete(null)
        }
    }

    const handleEditSave = () => {
        if (inputRef.current && current) {
            const newName = inputRef.current.value.trim()
            if (newName && newName.length > 0) {
                // Call onEditChannel(undefined) to trigger the save
                // The hook will handle calling the mutation
                onEditChannel(undefined)
            } else {
                // Cancel edit if name is empty
                onEditChannel(undefined)
            }
        }
    }

    return (
        <div className="flex flex-col space-y-6">
            {/* Channels Section */}
            <div className="flex flex-col space-y-1">
                {isLoading && displayChannels.length === 0 && (
                    <div className="text-xs text-muted-foreground dark:text-themeTextGray px-3 py-2">
                        Loading channels...
                    </div>
                )}

                {displayChannels.length === 0 && !isLoading && (
                    <div className="text-xs text-muted-foreground dark:text-themeTextGray px-3 py-2">
                        No channels yet. Create one!
                    </div>
                )}

                {displayChannels.map((channel) => {
                    const isActive = currentPage === channel.id
                    const isEditing = edit && current === channel.id

                    return (
                        <div
                            key={channel.id}
                            ref={current === channel.id ? channelRef : null}
                            className={cn(
                                "group relative flex items-center justify-between rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-accent dark:bg-themeGray"
                                    : "hover:bg-accent/50 dark:hover:bg-themeGray/50",
                            )}
                        >
                            <Link
                                href={`/group/${groupid}/channel/${channel.id}`}
                                className="flex-1 flex items-center gap-2 px-3 py-2.5"
                            >
                                <Hash
                                    className={cn(
                                        "w-4 h-4 flex-shrink-0",
                                        isActive
                                            ? "text-primary"
                                            : "text-muted-foreground dark:text-themeTextGray",
                                    )}
                                />

                                {isEditing ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            defaultValue={channel.name}
                                            className="flex-1 bg-background dark:bg-themeBlack border border-border dark:border-themeGray rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleEditSave()
                                                } else if (e.key === "Escape") {
                                                    onEditChannel(undefined)
                                                }
                                            }}
                                        />
                                        <div className="flex gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleEditSave()
                                                }}
                                            >
                                                <Check className="h-3 w-3 text-green-500" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    onEditChannel(undefined)
                                                }}
                                            >
                                                <X className="h-3 w-3 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <span
                                        className={cn(
                                            "text-sm font-medium truncate",
                                            isActive
                                                ? "text-foreground dark:text-themeTextWhite"
                                                : "text-muted-foreground dark:text-themeTextGray",
                                        )}
                                    >
                                        {channel.name}
                                    </span>
                                )}
                            </Link>

                            {/* Edit/Delete actions - only show if user owns the group and not editing */}
                            {userId === groupUserId && !isEditing && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity mr-1"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-48"
                                    >
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.preventDefault()
                                                onEditChannel(channel.id)
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            <span>Edit Channel</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.preventDefault()
                                                handleDeleteClick(channel.id)
                                            }}
                                            className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete Channel</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Manage Group Section */}
            <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold text-muted-foreground dark:text-[#F7ECE9] px-1 uppercase tracking-wider mb-1">
                    Manage Group
                </p>
                {SIDEBAR_SETTINGS_MENU.map((item) => {
                    // Check if current tab is active - but NOT on the default landing page
                    const isActive =
                        pathname.includes(`/${item.path}`) &&
                        pathname !== `/group/${groupid}`

                    return (
                        <Link
                            key={item.id}
                            href={`/group/${groupid}/${item.path}`}
                        >
                            <Button
                                variant="ghost"
                                className={cn(
                                    "flex gap-3 w-full justify-start items-center transition-all duration-200 rounded-lg",
                                    isActive
                                        ? "bg-accent dark:bg-themeGray text-foreground dark:text-themeTextWhite"
                                        : "text-muted-foreground dark:text-themeTextGray hover:bg-accent/50 dark:hover:bg-themeGray/50",
                                )}
                            >
                                <div className="w-4 h-4 flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <span className="text-sm font-medium">
                                    {item.label}
                                </span>
                            </Button>
                        </Link>
                    )
                })}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Channel</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this channel? This
                            action cannot be undone and all messages in this
                            channel will be permanently lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default SideBarMenu
