// "use client"

// import { onGetGroupChannels } from "@/actions/groups"
// import { IGroupInfo, IGroups } from "@/components/global/sidebar"
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
// import { channel } from "diagnostics_channel"
// import { usePathname } from "next/navigation"
// import { useState } from "react"
// import { toast } from "sonner"
// import client from "@/lib/prisma";

// export const useNavigation = () => {
//     const pathName = usePathname()
//     const [section, setSection] = useState<string>(pathName)

//     const onSetSection = (page: string) => {
//         setSection(page)
//     }

//     return {
//         section,
//         onSetSection,
//     }
// }

// export const useSideBar = (groupid: string) => {
//     const { data: groups } = useQuery({
//         queryKey: ["user-groups"],
//     }) as { data: IGroups }

//     const { data: groupInfo } = useQuery({
//         queryKey: ["group-info"],
//     }) as { data: IGroupInfo }

//     const { data: channels } = useQuery({
//         queryKey: ["group-channels"],
//         queryFn: () => onGetGroupChannels(groupid),
//     })

//     const client = useQueryClient()

//     const { isPending, mutate, isError, variables } = useMutation({
//         mutationFn: (data: {
//             id: string
//             name: string
//             icon: string
//             createdAt: Date
//             groupId: string | null
//         }) =>
//             onCreateNewChannels(groupid, {
//                 id: data.id,
//                 name: data.name.toLowerCase(),
//                 icon: data.icon,
//             }),
//         onSettled: async () => {
//             return await client.invalidateQueries({
//                 queryKey: ["group-channels"],
//             })
//         },
//     })

//     if (isPending)
//         toast("Success", {
//             description: "Channel created",
//         })

//     if (isError)
//         toast("Error", {
//             description: "Oops! something went wrong",
//         })

//     return { groupInfo, groups, mutate, variables, isPending, channels }
// }

// export const onCreateNewChannels =async(
//     groupid:string ,
//     data:{
//         id:string
//         name:string,
//         icon:string
//     },

// )=>{
//     try{
//         const Channel =await client.group.update({
//             where:{
//                 id:groupid,
//             },
//             data:{
//                 channel:{
//                     create:{
//                       ...data,
//                     },
//                 },
//             },
//             select:{
//                 channel:true ,
//             },
//         })
//         if(channel){
//             return{status:200,channel:channel.channel}
//         }
//         return{
//             status:404,
//             message: "Channel could not be created",
//         }

//         }catch(error){
//             return{
//                 status:400,
//                 message:"Oops! something went wrong"
//             }
//         }
//     }

"use client"

import { onGetGroupChannels } from "@/actions/groups"
import { IGroupInfo, IGroups } from "@/components/global/sidebar"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export const useNavigation = () => {
    const pathName = usePathname()
    const [section, setSection] = useState<string>(pathName)

    const onSetSection = (page: string) => {
        setSection(page)
    }

    return {
        section,
        onSetSection,
    }
}

export const useSideBar = (groupid: string) => {
    const { data: groups } = useQuery({
        queryKey: ["user-groups"],
        queryFn: async () => {
            // This data is prefetched in the layout, so we just return undefined
            // The data will be available from the cache
            return undefined
        },
        staleTime: Infinity,
    }) as { data: IGroups }

    const { data: groupInfo } = useQuery({
        queryKey: ["group-info"],
        queryFn: async () => {
            // This data is prefetched in the layout, so we just return undefined
            // The data will be available from the cache
            return undefined
        },
        staleTime: Infinity,
    }) as { data: IGroupInfo }

    const { data: channels } = useQuery({
        queryKey: ["group-channels"],
        queryFn: () => onGetGroupChannels(groupid),
    })

    const queryClient = useQueryClient()

    const { isPending, mutate, isError, variables } = useMutation({
        mutationFn: async (data: {
            id: string
            name: string
            icon: string
            createdAt: Date
            groupId: string | null
        }) => {
            // Call the server action (imported from actions file)
            const { onCreateNewChannels } = await import("@/actions/groups")
            return onCreateNewChannels(groupid, {
                id: data.id,
                name: data.name.toLowerCase(),
                icon: data.icon,
            })
        },
        onSuccess: () => {
            // Invalidate queries to refetch the latest channels
            queryClient.invalidateQueries({
                queryKey: ["group-channels"],
            })
            toast("Success", {
                description: "Channel created",
            })
        },
        onError: () => {
            toast("Error", {
                description: "Oops! something went wrong",
            })
        },
    })

    return { groupInfo, groups, mutate, variables, isPending, channels }
}
