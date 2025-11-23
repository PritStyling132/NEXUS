"use server"

import { onAuthenticatedUser } from "./auth"
import client from "@/lib/prisma"

export const onGetChannelInfo = async (channelId: string) => {
    try {
        const user = await onAuthenticatedUser()
        const channel = await client.channel.findUnique({
            where: {
                id: channelId,
            },
            include: {
                messages: {
                    take: 3,
                    orderBy: {
                        createdAt: "desc",
                    },
                    include: {
                        sender: {
                            select: {
                                firstname: true,
                                lastname: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        })
        return channel
    } catch (error) {
        return { status: 400, message: "Oops! something went wrong" }
    }
}
