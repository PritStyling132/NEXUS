import { Card } from "@/components/ui/card"
import Link from "next/link"
import { truncateString } from "@/lib/utils"
import { getGroupThumbnailUrl } from "@/lib/default-group-assets"

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
    thumbnail,
    name,
    category,
    description,
    preview,
}: Props) => {
    return (
        <Link href={`/about/${id}`}>
            <Card className="bg-card border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50">
                <img
                    key={`thumbnail-${thumbnail}-${preview}`}
                    src={preview || getGroupThumbnailUrl(thumbnail, category)}
                    alt="thumbnail"
                    className="w-full opacity-80 h-56 object-cover transition-opacity duration-300 hover:opacity-100"
                    onError={(e) => {
                        console.error(
                            "Failed to load thumbnail:",
                            e.currentTarget.src,
                        )
                    }}
                />
                <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-foreground line-clamp-1">
                            {name}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {category}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {description && truncateString(description)}
                    </p>
                </div>
            </Card>
        </Link>
    )
}

export default GroupCard
