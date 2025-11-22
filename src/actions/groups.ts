 "use server"
 
 import { prisma } from "@/lib/prisma"
import {  currentUser } from "@clerk/nextjs/server"
import { onAuthenticatedUser } from "./auth"
import client from "@/lib/prisma";

import { revalidatePath } from "next/cache"



// ADD THIS FUNCTION to check payment before group creation
export const createGroupWithSubscription = async (groupData: any) => {
    try {
        const user = await currentUser()
        if (!user) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if user has payment method
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: {
                id: true,
                razorpayCustomerId: true,
                razorpayTokenId: true,
            },
        })

        if (!dbUser?.razorpayCustomerId || !dbUser?.razorpayTokenId) {
            return {
                success: false,
                error: "Payment method required",
                redirectTo: "/payment-setup",
            }
        }

        // Create the group first
        const group = await prisma.group.create({
            data: {
                ...groupData,
                userId: dbUser.id,
            },
        })

        // Then create subscription for the group
        const subscriptionResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/razorpay/create-subscription`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupId: group.id }),
            },
        )

        const subscriptionData = await subscriptionResponse.json()

        if (!subscriptionData.success) {
            // Rollback: delete the group if subscription creation fails
            await prisma.group.delete({ where: { id: group.id } })
            return { success: false, error: subscriptionData.error }
        }

        return {
            success: true,
            group,
            subscription: subscriptionData,
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}


export const onGetGroupInfo = async (groupid: string) => {
  try {
    const user = await onAuthenticatedUser();
    const group = await client.group.findUnique({
      where: {
        id: groupid,
      },
    });

    if (group) {
      return {
        status: 200,
        group,
        groupOwner: user.id === group.userId ? true : false,
      };
    }

    return { status: 404 };
  } catch (error) {
    return { status: 400 };
  }
};



export const onGetUserGroups = async (id: string) => {
  try {
    const result = await client.user.findUnique({
      where: {
        id,
      },
      select: {
        groups: {
          select: {
            id: true,
            name: true,
            icon: true,
            channels: {  
              where: {
                name: "general",
              },
              select: {
                id: true,
              },
            },
          },
        },

        memberships: {  
          select: {
            group: {  
              select: {
                id: true,
                icon: true,
                name: true,
                channels: {  
                  where: {
                    name: "general",
                  },
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    
    if (result && (result.groups.length > 0 || result.memberships.length > 0)) {
      return {
        status: 200,
        groups: result.groups,
        members: result.memberships,
      };
    }
    return {
      status: 404,
    };
  } catch (error) {
    return { status: 400 };
  }
};


export const onGetGroupChannels = async (groupid: string) => {
  try {
    const channels = await client.channel.findMany({
      where: {
        groupId: groupid,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return { status: 200, channels };
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" };
  }
};


export const onGetGroupSubscriptions = async (groupid: string) => {
  try {
    const subscriptions = await client.subscription.findMany({
      where: {
        groupId: groupid,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = await client.members.count({
      where: {
        groupId: groupid,
      },
    });

    if (subscriptions) {
      return {
        status: 200,
        subscriptions,
        count,
      };
    }
  } catch (error) {
    return { status: 400 };
  }
};






export const onCreateNewChannels = async (
    groupid: string,
    data: {
        id: string
        name: string
        icon: string
    }
) => {
    try {
        const group = await client.group.update({
            where: {
                id: groupid,
            },
            data: {
                channels: {
                    create: {
                        ...data,
                    },
                },
            },
            select: {
                channels: true,
            },
        })

        if (group) {
            return { status: 200, channels: group.channels }
        }

        return {
            status: 404,
            message: "Channel could not be created",
        }
    } catch (error) {
        return {
            status: 400,
            message: "Oops! something went wrong",
        }
    }
}


export const onUpdateChannelInfo = async (
  channelId: string,
  icon?: string,
  name?: string
) => {
  try {
    // Build update data dynamically
    const updateData: { icon?: string; name?: string } = {};
    if (icon) updateData.icon = icon;
    if (name) updateData.name = name;

    // Single update call
    const channel = await client.channel.update({
      where: { id: channelId },
      data: updateData,
    });

    if (channel) {
      return {
        status: 200,
        message: "Channel successfully updated",
      };
    }
    
    return {
      status: 404,
      message: "Channel not found! try again later",
    };
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      message: "Oops! something went wrong",
    };
  }
};


export const onDeleteChannel = async (channelId: string) => {
  try {
    const channel = await client.channel.delete({
      where: {
        id: channelId,
      },
    });

    if (channel) {
      return { status: 200, message: "Channel deleted successfully" };
    }

    return { status: 404, message: "Channel not found!" };
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" };
  }
};




 // or wherever your prisma client is defined

export const onSearchGroups = async (
  mode: "GROUPS" | "POSTS",
  query: string,
  paginate?: number
) => {
  try {
    if (mode === "GROUPS") {
      const fetchedGroups = await client.group.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 6,
        skip: paginate || 0,
      })

      if (fetchedGroups) {
        if (fetchedGroups.length > 0) {
          return {
            status: 200,
            groups: fetchedGroups,
          }
        }
      }

      return { status: 404 }
    }

    if (mode === "POSTS") {
      // Logic for posts would go here
    }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}






export const onUpdateGroupSettings = async (
  groupid: string,
  type:
    | "IMAGE"
    | "ICON"
    | "NAME"
    | "DESCRIPTION"
    | "JSONDESCRIPTION"
    | "HTMLDESCRIPTION",
  content: string,
  path: string
) => {
  try {
    if (type === "IMAGE") {
      await client.group.update({
        where: {
          id: groupid,
        },
        data: {
          thumbnail: content,
        },
      })
    }

    if (type === "ICON") {
      await client.group.update({
        where: {
          id: groupid,
        },
        data: {
          icon: content,
        },
      })
    }

    if (type === "NAME") {
      await client.group.update({
        where: {
          id: groupid,
        },
        data: {
          name: content,
        },
      })
    }

    if (type === "DESCRIPTION") {
      await client.group.update({
        where: {
          id: groupid,
        },
        data: {
          description: content,
        },
      })
    }

    if (type === "JSONDESCRIPTION") {
      await client.group.update({
        where: {
          id: groupid,
        },
        data: {
          jsonDescription: content,
        },
      })
    }

    if (type === "HTMLDESCRIPTION") {
      await client.group.update({
        where: {
          id: groupid,
        },
        data: {
          htmlDescription: content,
        },
      })
    }

    revalidatePath(path)
    return { status: 200 }
  } catch (error) {
    console.log(error)
    return { status: 400 }
  }
}