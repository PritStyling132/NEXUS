"use client"
import { usePathname } from "next/navigation"
import { IChannels } from "."
import { useChannelInfo } from "@/hooks/channels"
import Link from "next/link"
import { SIDEBAR_SETTINGS_MENU } from "@/constants/menus"
import { Button } from "@/components/ui/button"
import { Hash, MoreVertical, Edit2, Trash2, Check, X, Settings2, Loader2 } from "lucide-react"
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-white/40 px-3 py-3">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading channels...
                    </div>
                )}

                {displayChannels.length === 0 && !isLoading && (
                    <div className="text-xs text-muted-foreground dark:text-white/40 px-3 py-3 bg-muted/30 dark:bg-white/[0.02] rounded-lg border border-dashed border-border/50 dark:border-white/[0.05] text-center">
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
                            className="relative"
                        >
                            {/* Active indicator glow */}
                            {isActive && (
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/60 via-purple-500/60 to-cyan-500/60 rounded-xl blur-sm opacity-70" />
                            )}
                            <div
                                className={cn(
                                    "relative group flex items-center justify-between rounded-xl transition-all duration-300",
                                    isActive
                                        ? "bg-gradient-to-r from-primary/15 via-purple-500/10 to-cyan-500/15 dark:from-primary/20 dark:via-purple-500/15 dark:to-cyan-500/20 border border-primary/30 dark:border-primary/20 shadow-lg shadow-primary/10"
                                        : "hover:bg-gradient-to-r hover:from-muted/50 hover:to-transparent dark:hover:from-white/[0.03] border border-transparent",
                                )}
                            >
                                <Link
                                    href={`/group/${groupid}/channel/${channel.id}`}
                                    className="flex-1 flex items-center gap-3 px-3 py-2.5"
                                >
                                    {/* Hash icon with gradient background when active */}
                                    <div
                                        className={cn(
                                            "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0",
                                            isActive
                                                ? "bg-gradient-to-br from-primary to-purple-500 shadow-md shadow-primary/25"
                                                : "bg-muted/50 dark:bg-white/[0.03] group-hover:bg-muted dark:group-hover:bg-white/[0.05]",
                                        )}
                                    >
                                        <Hash
                                            className={cn(
                                                "w-3.5 h-3.5",
                                                isActive
                                                    ? "text-white"
                                                    : "text-muted-foreground dark:text-white/40 group-hover:text-foreground dark:group-hover:text-white/60",
                                            )}
                                        />
                                    </div>

                                    {isEditing ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                defaultValue={channel.name}
                                                placeholder="Channel name"
                                                aria-label="Channel name"
                                                className="flex-1 bg-background dark:bg-[#0d0d0f] border border-primary/30 dark:border-primary/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                                                    className="h-7 w-7 rounded-lg bg-green-500/10 hover:bg-green-500/20"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        handleEditSave()
                                                    }}
                                                >
                                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 rounded-lg bg-red-500/10 hover:bg-red-500/20"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        onEditChannel(undefined)
                                                    }}
                                                >
                                                    <X className="h-3.5 w-3.5 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <span
                                            className={cn(
                                                "text-sm font-medium truncate transition-colors",
                                                isActive
                                                    ? "text-foreground dark:text-white font-semibold"
                                                    : "text-muted-foreground dark:text-white/50 group-hover:text-foreground dark:group-hover:text-white/80",
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
                                                className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all mr-2 hover:bg-white/10"
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-48 bg-card/95 dark:bg-[#1a1a1d]/95 backdrop-blur-xl border-border/50 dark:border-white/10"
                                        >
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    onEditChannel(channel.id)
                                                }}
                                                className="cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20"
                                            >
                                                <Edit2 className="mr-2 h-4 w-4 text-primary" />
                                                <span>Edit Channel</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-border/50 dark:bg-white/5" />
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleDeleteClick(channel.id)
                                                }}
                                                className="cursor-pointer text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20"
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete Channel</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Manage Group Section */}
            <div className="flex flex-col space-y-2">
                <p className="text-xs font-bold text-muted-foreground dark:text-white/50 px-2 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Settings2 className="w-3 h-3 text-primary" />
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
                            className="relative"
                        >
                            {/* Active indicator glow */}
                            {isActive && (
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/60 via-purple-500/60 to-cyan-500/60 rounded-xl blur-sm opacity-70" />
                            )}
                            <Button
                                variant="ghost"
                                className={cn(
                                    "relative flex gap-3 w-full justify-start items-center transition-all duration-300 rounded-xl h-10",
                                    isActive
                                        ? "bg-gradient-to-r from-primary/15 via-purple-500/10 to-cyan-500/15 dark:from-primary/20 dark:via-purple-500/15 dark:to-cyan-500/20 border border-primary/30 dark:border-primary/20 text-foreground dark:text-white shadow-lg shadow-primary/10"
                                        : "text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white/80 hover:bg-gradient-to-r hover:from-muted/50 hover:to-transparent dark:hover:from-white/[0.03] border border-transparent",
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300",
                                        isActive
                                            ? "bg-gradient-to-br from-primary to-purple-500 shadow-md shadow-primary/25"
                                            : "bg-muted/50 dark:bg-white/[0.03] group-hover:bg-muted dark:group-hover:bg-white/[0.05]",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-4 h-4 flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5",
                                            isActive
                                                ? "[&>svg]:text-white"
                                                : "[&>svg]:text-muted-foreground dark:[&>svg]:text-white/40",
                                        )}
                                    >
                                        {item.icon}
                                    </div>
                                </div>
                                <span
                                    className={cn(
                                        "text-sm font-medium",
                                        isActive && "font-semibold",
                                    )}
                                >
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
                <AlertDialogContent className="bg-card/95 dark:bg-[#1a1a1d]/95 backdrop-blur-xl border-border/50 dark:border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground dark:text-white">Delete Channel</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground dark:text-white/60">
                            Are you sure you want to delete this channel? This
                            action cannot be undone and all messages in this
                            channel will be permanently lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border/50 dark:border-white/10 hover:bg-muted dark:hover:bg-white/[0.05]">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 text-white shadow-lg shadow-red-500/25"
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
