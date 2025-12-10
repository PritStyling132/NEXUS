import { FormGenerator } from "@/components/global/form-generator"
import { Input } from "@/components/ui/input"
import { ErrorMessage } from "@hookform/error-message"
import { Label } from "@/components/ui/label"
import { BadgePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Loader from "@/components/global/loader"
import { useMediaGallery } from "@/hooks/groups"

type Props = {
    groupid: string
}

const MediaGalleryForm = ({ groupid }: Props) => {
    const { errors, register, onUpdateGallery, isPending } =
        useMediaGallery(groupid)

    return (
        <form onSubmit={onUpdateGallery} className="flex flex-col gap-y-3">
            <FormGenerator
                register={register}
                errors={errors}
                name="videourl"
                label="Video Link"
                placeholder="Video link..."
                inputType="input"
                type="text"
            />

            <Label className="mt-2" htmlFor="media-gallery">
                <p>Upload Image</p>

                <span
                    className="border-[1px] border-dashed flex flex-col justify-center items-center py-10 my-2 
                     hover:bg-themeGray/50 cursor-pointer rounded-lg gap-y-2"
                >
                    <Input
                        type="file"
                        className="hidden"
                        id="media-gallery"
                        multiple
                        {...register("image")}
                    />

                    <BadgePlus />
                    <p>Drag and drop an image or click to upload</p>
                </span>

                <ErrorMessage
                    errors={errors}
                    name="image"
                    render={({ message }) => (
                        <p className="text-red-400 mt-2">
                            {message === "Required" ? "" : message}
                        </p>
                    )}
                />
            </Label>
            <Button className="self-end rounded-xl" disabled={isPending}>
                <Loader loading={isPending}>Upload</Loader>
            </Button>
        </form>
    )
}

export default MediaGalleryForm
