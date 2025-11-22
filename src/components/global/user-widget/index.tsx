


import Link from "next/link"
import { Notification } from "./notification"
import { UserAvatar } from "./user"
import { MessageCircle } from "lucide-react"

type UserWidgetProps = {
  image: string
  groupid: string
  userid?: string
}

export const UserWidget = ({ image, groupid, userid }: UserWidgetProps) => {
  return (
    <div className="gap-5 items-center hidden md:flex">
      <Notification />
      <Link href={`/group/${groupid}/messages`}>  {/* ✅ Fixed: use backticks for template literal */}
        <MessageCircle className="h-5 w-5 cursor-pointer hover:text-themeTextGray" />
      </Link>
      <UserAvatar userid={userid} image={image} groupid={groupid} />
    </div>
  )
}