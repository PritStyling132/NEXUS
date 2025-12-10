import { onUpdateChannelInfo, onDeleteChannel } from "@/actions/groups"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { toast } from "sonner"

export const useChannelInfo = () => {
    const channelRef = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const triggerRef = useRef<HTMLButtonElement | null>(null)

    const [channel, setChannel] = useState<string | undefined>(undefined)
    const [edit, setEdit] = useState<boolean>(false)
    const [icon, setIcon] = useState<string | undefined>(undefined)

    const client = useQueryClient()

    const onEditChannel = (id: string | undefined) => {
        if (id === undefined) {
            // Save the channel edit
            if (channel && inputRef.current) {
                const newName = inputRef.current.value.trim()
                if (newName && newName.length > 0) {
                    mutate({ name: newName })
                } else {
                    setEdit(false)
                    setChannel(undefined)
                }
            } else {
                setEdit(false)
                setChannel(undefined)
            }
        } else {
            // Start editing
            setChannel(id)
            setEdit(true)
        }
    }

    const onSetIcon = (icon: string | undefined) => setIcon(icon)

    // Update channel mutation
    const { isPending, mutate, variables } = useMutation({
        mutationFn: (data: { name?: string; icon?: string }) => {
            if (!channel) {
                throw new Error("No channel selected")
            }
            // Fixed parameter order: channelId, icon, name
            return onUpdateChannelInfo(channel, data.icon, data.name)
        },

        onMutate: () => {
            setEdit(false)
            onSetIcon(undefined)
        },

        onSuccess: (data) => {
            toast(data.status !== 200 ? "Error" : "Success", {
                description: data.message,
            })
            // Reset channel state after successful update
            setChannel(undefined)
        },

        onError: (error) => {
            toast("Error", {
                description: "Failed to update channel",
            })
            console.error(error)
        },

        onSettled: async () => {
            return await client.invalidateQueries({
                queryKey: ["group-channels"],
            })
        },
    })

    // Delete channel mutation
    const {
        isPending: isDeleting,
        mutate: deleteChannel,
        variables: deleteVariables,
    } = useMutation({
        mutationFn: (channelId: string) => {
            return onDeleteChannel(channelId)
        },

        onSuccess: (data) => {
            toast(data.status !== 200 ? "Error" : "Success", {
                description: data.message,
            })
        },

        onError: (error) => {
            toast("Error", {
                description: "Failed to delete channel",
            })
            console.error(error)
        },

        onSettled: async () => {
            return await client.invalidateQueries({
                queryKey: ["group-channels"],
            })
        },
    })

    const onChannelDelete = (id: string) => {
        deleteChannel(id)
    }

    return {
        channelRef,
        inputRef,
        triggerRef,

        channel,
        edit,
        icon,

        onEditChannel,
        onSetIcon,
        mutate,
        isPending,
        variables,

        // Delete functionality
        onChannelDelete,
        deleteVariables,
        isDeleting,
    }
}
