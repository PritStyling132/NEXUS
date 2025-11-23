"use client"
import { useSideBar } from "@/hooks/navigation"
import { DropDown } from "../drop-down"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Group, Plus } from "lucide-react"
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
    icon: string
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
                "h-screen flex-col gap-y-6 md:gap-y-10 px-3 sm:px-5",
                !mobile
                    ? "hidden bg-background dark:bg-black md:w-[300px] fixed md:flex border-r border-border dark:border-themeGray"
                    : "w-full flex bg-background dark:bg-black",
            )}
        >
            {groups?.groups && groups.groups.length > 0 && (
                <DropDown
                    title="Groups"
                    trigger={
                        <div className="w-full flex items-center justify-between text-foreground dark:text-themeTextGray border border-border dark:border-themeGray p-3 rounded-xl hover:bg-accent/50 dark:hover:bg-themeGray/50 transition-colors">
                            <div className="flex gap-x-3 items-center">
                                <img
                                    src={getGroupIconUrl(
                                        groupInfo?.group?.icon,
                                        groupInfo?.group?.category
                                    )}
                                    alt="icon"
                                    className="w-10 h-10 object-cover rounded-lg"
                                />
                                <p className="text-sm font-medium truncate max-w-[150px]">
                                    {groupInfo?.group?.name}
                                </p>
                            </div>
                            <span>{/* <CarotSort /> */}</span>
                        </div>
                    }
                >
                    {groups?.groups?.map(
                        (item) =>
                            item.id !== groupid && (
                                <Link
                                    key={item.id}
                                    href={`/group/${item.id}`}
                                >
                                    <Button
                                        variant="ghost"
                                        className="flex gap-2 w-full justify-start hover:bg-accent dark:hover:bg-themeGray items-center transition-colors"
                                    >
                                        <Group className="w-4 h-4" />
                                        <span className="truncate">{item.name}</span>
                                    </Button>
                                </Link>
                            ),
                    )}
                </DropDown>
            )}

            {/* ✅ Add Channels section here */}
            <div className="flex flex-col gap-y-4">
                <div className="flex justify-between items-center px-1">
                    <p className="text-xs font-semibold text-muted-foreground dark:text-[#F7ECE9] uppercase tracking-wider">
                        Channels
                    </p>
                    {userid === groupInfo?.group?.userId && (
                        <Plus
                            size={16}
                            className={cn(
                                "text-muted-foreground dark:text-themeTextGray cursor-pointer hover:text-foreground dark:hover:text-white transition-colors",
                                isPending && "opacity-70 cursor-not-allowed",
                            )}
                            {...(!isPending && {
                                onClick: () =>
                                    mutate({
                                        id: v4(),
                                        icon: "general",
                                        name: "unnamed",
                                        createdAt: new Date(),
                                        groupId: groupid,
                                    }),
                            })}
                        />
                    )}
                </div>

                <SideBarMenu
                    channels={channels?.channels ?? []}
                    optimisticChannel={variables}
                    loading={isPending}
                    groupid={groupid}
                    groupUserId={groupInfo.group?.userId ?? ""}
                    userId={userid}
                />
            </div>
        </div>
    )
}

export default SideBar
