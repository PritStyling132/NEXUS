"use client"
import { useSideBar } from "@/hooks/navigation"
import { DropDown } from "../drop-down"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Group, Plus, Sparkles, ChevronDown } from "lucide-react"
import { v4 } from "uuid"
import SideBarMenu from "./menu"
import { getGroupIconUrl } from "@/lib/default-group-assets"

type Props = {
    groupid: string
    userid: string
    mobile?: boolean
}

export interface IChannels {
    id: string
    name: string
    icon: string | null
    createdAt: Date
    groupId: string | null
}

export interface IGroups {
    status: number
    groups:
        | {
              icon: string | null
              id: string
              name: string
          }[]
        | undefined
}

export interface IGroupInfo {
    status: number
    group:
        | ({
              icon: string | null
              name: string
              category: string
              userId: string
              id: string
          } & Record<string, any>)
        | undefined
    groupOwner: boolean
}

const SideBar = ({ groupid, userid, mobile }: Props) => {
    const { groupInfo, groups, mutate, variables, isPending, channels } =
        useSideBar(groupid)

    return (
        <div
            className={cn(
                "h-screen flex-col gap-y-6 md:gap-y-8 px-3 sm:px-4 py-4",
                !mobile
                    ? "hidden bg-gradient-to-b from-background via-background to-background/95 dark:from-[#0a0a0b] dark:via-[#0d0d0f] dark:to-[#101012] md:w-[300px] fixed md:flex border-r border-border/50 dark:border-white/[0.05]"
                    : "w-full flex bg-gradient-to-b from-background to-background/95 dark:from-[#0a0a0b] dark:to-[#101012]",
            )}
        >
            {/* Group Selector with gradient border */}
            {groups?.groups && groups.groups.length > 0 && (
                <DropDown
                    title="Groups"
                    trigger={
                        <div className="relative group w-full">
                            {/* Gradient border effect */}
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-purple-500/50 to-cyan-500/50 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300" />
                            <div className="relative w-full flex items-center justify-between text-foreground dark:text-white/90 bg-card/80 dark:bg-white/[0.03] border border-border/50 dark:border-white/[0.05] p-3 rounded-xl hover:bg-accent/50 dark:hover:bg-white/[0.05] transition-all duration-300 backdrop-blur-sm">
                                <div className="flex gap-x-3 items-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <img
                                            src={getGroupIconUrl(
                                                groupInfo?.group?.icon,
                                                groupInfo?.group?.category,
                                            )}
                                            alt="icon"
                                            className="relative w-10 h-10 object-cover rounded-lg ring-2 ring-white/10 dark:ring-white/5"
                                        />
                                    </div>
                                    <p className="text-sm font-semibold truncate max-w-[140px]">
                                        {groupInfo?.group?.name}
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    }
                >
                    {groups?.groups?.map(
                        (item) =>
                            item.id !== groupid && (
                                <Link key={item.id} href={`/group/${item.id}`}>
                                    <Button
                                        variant="ghost"
                                        className="flex gap-2 w-full justify-start hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent dark:hover:from-white/[0.05] items-center transition-all duration-200"
                                    >
                                        <Group className="w-4 h-4 text-primary" />
                                        <span className="truncate">
                                            {item.name}
                                        </span>
                                    </Button>
                                </Link>
                            ),
                    )}
                </DropDown>
            )}

            {/* Channels Section */}
            <div className="flex flex-col gap-y-4">
                <div className="flex justify-between items-center px-2">
                    <p className="text-xs font-bold text-muted-foreground dark:text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-primary" />
                        Channels
                    </p>
                    {userid === groupInfo?.group?.userId && (
                        <div className="relative group">
                            {/* Glow effect on hover */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 rounded-lg opacity-0 group-hover:opacity-50 blur-md transition-all duration-300" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "relative h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 border border-primary/30 dark:border-primary/20 hover:from-primary/30 hover:to-purple-500/30 dark:hover:from-primary/40 dark:hover:to-purple-500/40 transition-all duration-300",
                                    isPending && "opacity-50 cursor-not-allowed",
                                )}
                                disabled={isPending}
                                onClick={() =>
                                    !isPending &&
                                    mutate({
                                        id: v4(),
                                        icon: "general",
                                        name: "unnamed",
                                        createdAt: new Date(),
                                        groupId: groupid,
                                    })
                                }
                            >
                                <Plus
                                    size={14}
                                    className="text-primary dark:text-primary"
                                />
                            </Button>
                        </div>
                    )}
                </div>

                <SideBarMenu
                    channels={channels?.channels ?? []}
                    optimisticChannel={variables}
                    loading={isPending}
                    groupid={groupid}
                    groupUserId={groupInfo?.group?.userId ?? ""}
                    userId={userid}
                />
            </div>
        </div>
    )
}

export default SideBar
