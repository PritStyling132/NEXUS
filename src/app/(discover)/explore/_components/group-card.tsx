import { Card } from "@/components/ui/card"
import Link from "next/link"
import { truncateString } from "@/lib/utils"

type Props = {
  id: string
  userId: string
  thumbnail: string | null
  name: string
  category: string
  description: string | null
  privacy: "PUBLIC" | "PRIVATE"
  preview?: string
}

const GroupCard = ({
  id,
  userId,
  thumbnail,
  name,
  category,
  description,
  privacy,
  preview,
}: Props) => {
  return (
    <Link href={`/about/${id}`}>
      <Card className="bg-themeBlack border-themeGray rounded-xl overflow-hidden">
        <img
          src={preview || `https://ucarecdn.com/${thumbnail}/`}
          alt="thumbnail"
          className="w-full opacity-70 h-56 object-cover" 
        />
        <div className="p-6">
          <h3 className="text-lg text-themeTextGray font-bold">{name}</h3>
          <p className="text-base text-themeTextGray">
            {description && truncateString(description)}
          </p>
        </div>
      </Card>
    </Link>
  )
}

export default GroupCard;