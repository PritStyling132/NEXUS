"use client"
import { usePathname } from "next/navigation"
import { IChannels } from ".";
import { useChannelInfo } from "@/hooks/channels"
import Link from "next/link"
import { SIDEBAR_SETTINGS_MENU } from "@/constants/menus"
import { Button } from "@/components/ui/button"

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

  // Combine channels with optimistic channel if it exists
  const displayChannels = optimisticChannel 
    ? [optimisticChannel, ...channels]
    : channels

  // Combine loading states
  const isLoading = loading || isPending || isDeleting

  return (
    <div className="flex flex-col space-y-6">
      {/* Channels Section */}
      <div className="flex flex-col space-y-2">
        {isLoading && (
          <div className="text-sm text-gray-500">Loading...</div>
        )}
        
        {displayChannels.map((channel) => (
          <Link
            key={channel.id}
            href={`/group/${groupid}/channel/${channel.id}`}
          >
            <div 
              ref={current === channel.id ? channelRef : null}
              className={`
                flex items-center justify-between p-3 rounded-lg
                ${currentPage === channel.id ? 'bg-themeGray' : 'hover:bg-themeGray/50'}
                transition-colors cursor-pointer
              `}
            >
              <div className="flex items-center gap-2">
                {/* Channel icon */}
                <span className="text-themeTextGray">#</span>
                
                {/* Channel name - editable if in edit mode */}
                {edit && current === channel.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    defaultValue={channel.name}
                    className="border rounded px-2 py-1 bg-transparent"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm text-themeTextGray">{channel.name}</span>
                )}
              </div>
              
              {/* Edit/Delete actions - only show if user owns the group */}
              {userId === groupUserId && (
                <div className="flex gap-2">
                  <button 
                    ref={current === channel.id ? triggerRef : null}
                    onClick={(e) => {
                      e.preventDefault()
                      onEditChannel(channel.id)
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      onChannelDelete(channel.id)
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Settings Menu Section */}
      <div className="flex flex-col space-y-2">
        <p className="text-xs text-[#F7ECE9] px-3">SETTINGS</p>
        {SIDEBAR_SETTINGS_MENU.map((item) => (
          <Link
            key={item.id}
            href={`/group/${groupid}/settings/${item.path}`}
          >
            <Button
              variant="ghost"
              className="flex gap-2 w-full justify-start hover:bg-themeGray items-center text-themeTextGray"
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SideBarMenu