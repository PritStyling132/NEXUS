





// // // import { onAuthenticatedUser } from "@/actions/auth";
// // // import { onGetChannelInfo } from "@/actions/channels";
// // // import { onGetGroupInfo } from "@/actions/groups";
// // // import { currentUser } from "@clerk/nextjs/server";
// // // import { QueryClient } from "@tanstack/react-query";

// // // type Props = {};

// // // const GroupChannelPage = async ({params}: Props) => {
// // //   const client = new QueryClient();
// // //   const user = await currentUser();
// // //   const authUser = await onAuthenticatedUser();

// // //   await client.prefetchQuery({
// // //     queryKey: ["channel-info"],
// // //     queryFn: () => onGetChannelInfo(params.channelid),
// // //   });

// // //   await client.prefetchQuery({
// // //     queryKey: ["about-group-info"],
// // //     queryFn: () => onGetGroupInfo(params.groupid),
// // //   });

// // //   return <div>GroupChannelPage</div>;
// // // };



// // import { onAuthenticatedUser } from "@/actions/auth";
// // import { onGetChannelInfo } from "@/actions/channels";
// // import { onGetGroupInfo } from "@/actions/groups";
// // import { currentUser } from "@clerk/nextjs/server";
// // import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

// // type Props = {
// //     params: Promise<{  // ✅ THIS IS MISSING IN YOUR CODE
// //         groupid: string;
// //         channelid: string;
// //     }>;
// // };

// // const GroupChannelPage = async ({ params }: Props) => {
// //     const { groupid, channelid } = await params;  // ✅ Await params
    
// //     const client = new QueryClient();
// //     const user = await currentUser();
// //     const authUser = await onAuthenticatedUser();

// //     await client.prefetchQuery({
// //         queryKey: ["channel-info", channelid],
// //         queryFn: () => onGetChannelInfo(channelid),  // ✅ Use channelid
// //     });

// //     await client.prefetchQuery({
// //         queryKey: ["about-group-info", groupid],
// //         queryFn: () => onGetGroupInfo(groupid),  // ✅ Use groupid
// //     });

// //     return (
// //         <HydrationBoundary state={dehydrate(client)}>
// //             <div>GroupChannelPage</div>
// //         </HydrationBoundary>
// //     );
// // };

// // export default GroupChannelPage;





// // // export default GroupChannelPage;

import { onAuthenticatedUser } from "@/actions/auth";
import { onGetChannelInfo } from "@/actions/channels";
import { onGetGroupInfo } from "@/actions/groups";
import SideBar from "@/components/global/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

type Props = {
    params: Promise<{
        groupid: string;
        channelid: string;
    }>;
};



const GroupChannelPage = async ({ params }: Props) => {
    const { groupid, channelid } = await params;

    const client = new QueryClient();
    const user = await currentUser();
    const authUser = await onAuthenticatedUser();

    await client.prefetchQuery({
        queryKey: ["channel-info", channelid],
        queryFn: () => onGetChannelInfo(channelid),
    });

    await client.prefetchQuery({
        queryKey: ["about-group-info", groupid],
        queryFn: () => onGetGroupInfo(groupid),
    });

    return (
        <HydrationBoundary state={dehydrate(client)}>
            <div>GroupChannelPage</div>
          
        </HydrationBoundary>
    );
};

export default GroupChannelPage;





