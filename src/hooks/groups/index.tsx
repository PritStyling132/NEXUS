// "use client"

// import { useEffect, useState } from "react"
// import { useDispatch } from "react-redux"
// import { useMutation, useQuery } from "@tanstack/react-query"
// import { onSearchGroups, onUpdateGroupSettings } from "@/actions/groups"
// import { onGetGroupInfo } from "@/actions/groups"
// import { JSONContent } from "novel"
// import type { AppDispatch } from "@/redux/store"
// import { onClearSearch, onSearch } from "@/redux/slices/search-slice"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { GroupSettingsSchema } from "@/components/forms/group-settings/schema"
// import { z } from "zod"
// import { upload } from "@/lib/cloudinary"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"  // ✅ Fixed import

// export const useSearch = (search: "GROUPS" | "POSTS") => {
//   const [query, setQuery] = useState<string>("")
//   const [debounce, setDebounce] = useState<string>("")

//   const dispatch: AppDispatch = useDispatch()

//   const onSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setQuery(e.target.value)
//   }

//   useEffect(() => {
//     const delayInputTimeoutId = setTimeout(() => {
//       setDebounce(query)
//     }, 1000)

//     return () => clearTimeout(delayInputTimeoutId)
//   }, [query])

//   const { refetch, data, isFetched, isFetching } = useQuery({
//     queryKey: ["search-data", debounce],
//     queryFn: async ({ queryKey }) => {
//       if (search === "GROUPS") {
//         const groups = await onSearchGroups(search, queryKey[1] as string)
//         return groups
//       }
//       return null
//     },
//     enabled: false,
//   })

//   useEffect(() => {
//     if (isFetching) {
//       dispatch(
//         onSearch({
//           isSearching: true,
//           data: [],
//         })
//       )
//     }

//     if (isFetched) {
//       dispatch(
//         onSearch({
//           isSearching: false,
//           status: data?.status as number,
//           data: data?.groups || [],
//           debounce,
//         })
//       )
//     }
//   }, [isFetching, isFetched, data, dispatch, debounce])

//   useEffect(() => {
//     if (debounce) refetch()
//     if (!debounce) dispatch(onClearSearch())
//   }, [debounce, refetch, dispatch])

//   return { query, onSearchQuery }
// }

// export const useGroupSettings = (groupid: string) => {
//   const router = useRouter()

//   const { data } = useQuery({
//     queryKey: ["group-info"],
//     queryFn: () => onGetGroupInfo(groupid),
//   })

//   const jsonContent =
//     data?.group?.jsonDescription !== null
//       ? JSON.parse(data?.group?.jsonDescription as string)
//       : undefined

//   const [onJsonDescription, setJsonDescription] = useState<JSONContent | undefined>(jsonContent)
//   const [onDescription, setOnDescription] = useState<string | undefined>(
//     data?.group?.description || undefined
//   )

//   const {
//     register,
//     formState: { errors },
//     reset,
//     handleSubmit,
//     watch,
//     setValue,
//   } = useForm<z.infer<typeof GroupSettingsSchema>>({
//     resolver: zodResolver(GroupSettingsSchema),
//     mode: "onChange",
//   })

//   const [previewIcon, setPreviewIcon] = useState<string | undefined>(undefined)
//   const [previewThumbnail, setPreviewThumbnail] = useState<string | undefined>(undefined)

//   useEffect(() => {
//     const previews = watch(({ thumbnail, icon }) => {
//       if (icon && icon[0]) {
//         setPreviewIcon(URL.createObjectURL(icon[0]))
//       }
//       if (thumbnail && thumbnail[0]) {
//         setPreviewThumbnail(URL.createObjectURL(thumbnail[0]))
//       }
//     })
//     return () => previews.unsubscribe()
//   }, [watch])

//   const onSetDescriptions = () => {
//     const JsonContent = JSON.stringify(onJsonDescription)
//     setValue("jsondescription", JsonContent)
//     setValue("description", onDescription)
//   }

//   useEffect(() => {
//     onSetDescriptions()
//   }, [onJsonDescription, onDescription])

//   const { mutate: update, isPending } = useMutation({
//     mutationKey: ["group-settings"],
//     mutationFn: async (values: z.infer<typeof GroupSettingsSchema>) => {
//       if (values.thumbnail && values.thumbnail.length > 0) {
//         const uploaded = await upload.uploadFile(values.thumbnail[0])
//         const updated = await onUpdateGroupSettings(
//           groupid,
//           "IMAGE",
//           uploaded.uuid,
//           `/group/${groupid}/settings`  // ✅ Fixed: added backticks
//         )
//         if (updated.status !== 200) {
//           return toast("Error", {
//             description: "Oops! looks like your form is empty",
//           })
//         }
//       }

//       if (values.icon && values.icon.length > 0) {
//         console.log("icon")
//         const uploaded = await upload.uploadFile(values.icon[0])
//         const updated = await onUpdateGroupSettings(
//           groupid,
//           "ICON",
//           uploaded.uuid,
//           `/group/${groupid}/settings`  // ✅ Fixed: added backticks
//         )
//         if (updated.status !== 200) {
//           return toast("Error", {
//             description: "Oops! looks like your form is empty",
//           })
//         }
//       }

//       if (values.name) {
//         const updated = await onUpdateGroupSettings(
//           groupid,
//           "NAME",
//           values.name,
//           `/group/${groupid}/settings`  // ✅ Fixed: added backticks
//         )
//         if (updated.status !== 200) {
//           return toast("Error", {
//             description: "Oops! looks like your form is empty",
//           })
//         }
//       }

//       if (values.description) {
//         const updated = await onUpdateGroupSettings(
//           groupid,
//           "DESCRIPTION",
//           values.description,
//           `/group/${groupid}/settings`  // ✅ Fixed: added backticks
//         )
//         if (updated.status !== 200) {
//           return toast("Error", {
//             description: "Oops! looks like your form is empty",
//           })
//         }
//       }

//       if (values.jsondescription) {
//         const updated = await onUpdateGroupSettings(
//           groupid,
//           "JSONDESCRIPTION",
//           values.jsondescription,
//           `/group/${groupid}/settings`  // ✅ Fixed: added backticks
//         )
//         if (updated.status !== 200) {
//           return toast("Error", {
//             description: "Oops! looks like your form is empty",
//           })
//         }
//       }

//       if (
//         !values.description &&
//         !values.name &&
//         !values.thumbnail?.length &&
//         !values.icon?.length &&
//         !values.jsondescription
//       ) {
//         return toast("Error", {
//           description: "Oops! looks like your form is empty",
//         })
//       }

//       return toast("Success", {
//         description: "Group data updated",
//       })
//     },
//   })

//   const onUpdate = handleSubmit(async (values) => update(values))

//   // ✅ Fixed: Moved redirect to useEffect
//   useEffect(() => {
//     if (data?.status !== 200 && data?.status !== undefined) {
//       router.push('/group/create')
//     }
//   }, [data?.status, router])

//   return {
//     data,
//     register,
//     errors,
//     onUpdate,
//     isPending,
//     previewIcon,
//     previewThumbnail,
//     onJsonDescription,
//     setJsonDescription,
//     setOnDescription,
//     onDescription,
//   }
// }

"use client"

import { useEffect, useState, useRef } from "react"
import { useDispatch } from "react-redux"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    onSearchGroups,
    onUpdateGroupSettings,
    onUpdateGroupGallery,
} from "@/actions/groups"
import { onGetGroupInfo } from "@/actions/groups"
import type { AppDispatch } from "@/redux/store"
import { onClearSearch, onSearch } from "@/redux/slices/search-slice"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { GroupSettingsSchema } from "@/components/forms/group-settings/schema"
import { z } from "zod"
import { uploadFileAndGetPath, upload } from "@/lib/cloudinary"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { validateURLString } from "@/lib/utils"
import { UpdateGallerySchema } from "@/components/forms/media-gallery/schema"
import { JSONContent } from "novel"

export type MediaType = {
    url: string | undefined
    type: "IMAGE" | "YOUTUBE" | "LOOM"
}

export const useSearch = (search: "GROUPS" | "POSTS") => {
    const [query, setQuery] = useState<string>("")
    const [debounce, setDebounce] = useState<string>("")

    const dispatch: AppDispatch = useDispatch()

    const onSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    useEffect(() => {
        const delayInputTimeoutId = setTimeout(() => {
            setDebounce(query)
        }, 1000)

        return () => clearTimeout(delayInputTimeoutId)
    }, [query])

    const { refetch, data, isFetched, isFetching } = useQuery({
        queryKey: ["search-data", debounce],
        queryFn: async ({ queryKey }) => {
            if (search === "GROUPS") {
                const groups = await onSearchGroups(
                    search,
                    queryKey[1] as string,
                )
                return groups
            }
            return null
        },
        enabled: false,
    })

    useEffect(() => {
        if (isFetching) {
            dispatch(
                onSearch({
                    isSearching: true,
                    data: [],
                }),
            )
        }

        if (isFetched) {
            dispatch(
                onSearch({
                    isSearching: false,
                    status: data?.status as number,
                    data: data?.groups || [],
                    debounce,
                }),
            )
        }
    }, [isFetching, isFetched, data, dispatch, debounce])

    useEffect(() => {
        if (debounce) refetch()
        if (!debounce) dispatch(onClearSearch())
    }, [debounce, refetch, dispatch])

    return { query, onSearchQuery }
}

export const useGroupSettings = (groupid: string) => {
    const router = useRouter()
    const queryClient = useQueryClient()

    const { data } = useQuery({
        queryKey: ["group-info", groupid],
        queryFn: () => onGetGroupInfo(groupid),
    })

    const {
        register,
        formState: { errors },
        handleSubmit,
        watch,
        setValue,
        reset,
    } = useForm<z.infer<typeof GroupSettingsSchema>>({
        resolver: zodResolver(GroupSettingsSchema),
        mode: "onChange",
    })

    // Initialize form with data when it loads
    useEffect(() => {
        if (data?.group) {
            console.log("📊 Group data loaded:", {
                name: data.group.name,
                description: data.group.description,
                icon: data.group.icon,
                thumbnail: data.group.thumbnail,
                iconType: typeof data.group.icon,
                thumbnailType: typeof data.group.thumbnail,
            })

            // Reset form with the loaded data
            reset({
                name: data.group.name || "",
                description: data.group.description || "",
            })

            // Log the URLs for debugging (now stored as full URLs)
            console.log("🖼️ Image URLs that will be used:", {
                iconUrl: data.group.icon || "default",
                thumbnailUrl: data.group.thumbnail || "default",
            })

            // Test the URLs
            if (data.group.icon) {
                console.log(`🌐 Testing icon URL: ${data.group.icon}`)
            }
            if (data.group.thumbnail) {
                console.log(`🌐 Testing thumbnail URL: ${data.group.thumbnail}`)
            }
        }
    }, [data?.group, reset])

    const [previewIcon, setPreviewIcon] = useState<string | undefined>(
        undefined,
    )
    const [previewThumbnail, setPreviewThumbnail] = useState<
        string | undefined
    >(undefined)

    useEffect(() => {
        const subscription = watch(({ thumbnail, icon }) => {
            if (icon && icon[0]) {
                setPreviewIcon(URL.createObjectURL(icon[0]))
            }
            if (thumbnail && thumbnail[0]) {
                setPreviewThumbnail(URL.createObjectURL(thumbnail[0]))
            }
        })
        return () => subscription.unsubscribe()
    }, [watch])

    const { mutate: update, isPending } = useMutation({
        mutationKey: ["group-settings"],
        mutationFn: async (values: z.infer<typeof GroupSettingsSchema>) => {
            console.log("💾 Saving group settings:", values)
            let hasUpdates = false

            if (values.thumbnail && values.thumbnail.length > 0) {
                console.log("📤 Uploading thumbnail...")
                const uploadedPath = await uploadFileAndGetPath(
                    values.thumbnail[0],
                )
                console.log(
                    "📦 Cloudinary thumbnail URL to save:",
                    uploadedPath,
                )
                const updated = await onUpdateGroupSettings(
                    groupid,
                    "IMAGE",
                    uploadedPath,
                    `/group/${groupid}/settings`,
                )
                console.log("✅ Thumbnail update result:", updated)
                if (updated.status !== 200) {
                    throw new Error("Failed to update thumbnail")
                }
                hasUpdates = true
            }

            if (values.icon && values.icon.length > 0) {
                console.log("📤 Uploading icon...")
                const uploadedPath = await uploadFileAndGetPath(values.icon[0])
                console.log("📦 Cloudinary icon URL to save:", uploadedPath)
                const updated = await onUpdateGroupSettings(
                    groupid,
                    "ICON",
                    uploadedPath,
                    `/group/${groupid}/settings`,
                )
                console.log("✅ Icon update result:", updated)
                if (updated.status !== 200) {
                    throw new Error("Failed to update icon")
                }
                hasUpdates = true
            }

            if (values.name) {
                console.log("📝 Updating name to:", values.name)
                const updated = await onUpdateGroupSettings(
                    groupid,
                    "NAME",
                    values.name,
                    `/group/${groupid}/settings`,
                )
                console.log("✅ Name update result:", updated)
                if (updated.status !== 200) {
                    throw new Error("Failed to update name")
                }
                hasUpdates = true
            }

            if (values.description) {
                console.log("📝 Updating description to:", values.description)
                const updated = await onUpdateGroupSettings(
                    groupid,
                    "DESCRIPTION",
                    values.description,
                    `/group/${groupid}/settings`,
                )
                console.log("✅ Description update result:", updated)
                if (updated.status !== 200) {
                    throw new Error("Failed to update description")
                }
                hasUpdates = true
            }

            if (!hasUpdates) {
                console.log("⚠️ No changes detected")
                throw new Error("No changes to save")
            }

            console.log("✅ All updates completed successfully")
            return { success: true }
        },
        onSuccess: async () => {
            console.log("🔄 Refetching group data...")

            // Refetch the group data after successful update FIRST
            await queryClient.invalidateQueries({ queryKey: ["group-info", groupid] })

            // Then clear preview states after the new data has been fetched
            setPreviewIcon(undefined)
            setPreviewThumbnail(undefined)

            // Only reset file inputs, keep the text fields
            setValue("icon", undefined)
            setValue("thumbnail", undefined)

            toast("Success", {
                description: "Group settings updated successfully",
            })
        },
        onError: (error: Error) => {
            console.error("❌ Error saving group settings:", error)
            toast("Error", {
                description: error.message || "Failed to update group settings",
                duration: 5000,
            })
        },
    })

    const onUpdate = handleSubmit(async (values) => update(values))

    useEffect(() => {
        if (data?.status !== 200 && data?.status !== undefined) {
            router.push("/group/create")
        }
    }, [data?.status, router])

    return {
        data,
        register,
        errors,
        onUpdate,
        isPending,
        previewIcon,
        previewThumbnail,
    }
}

export const useGroupInfo = () => {
    const router = useRouter()

    const { data, isLoading } = useQuery({
        queryKey: ["about-group-info"],
        // This hook relies on prefetched data from HydrationBoundary
        // The queryFn is a fallback in case data isn't prefetched
        queryFn: async () => {
            // Return cached/prefetched data if available - this shouldn't normally run
            // as data is prefetched on the server
            return null
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Check if data is missing/falsy
    if (!data && !isLoading) {
        // Only redirect if we're sure there's no data (not just loading)
        return { group: null, status: null }
    }

    if (!data) {
        // Still loading or no data - return empty group to prevent errors
        return {
            group: {
                name: "",
                description: "",
                thumbnail: null,
                category: "Other",
                gallery: [],
                userId: "",
                htmlDescription: "",
                jsonDescription: "",
            }
        }
    }

    // Type assertion/destructuring: Assuming 'data' contains 'status' (number) and 'group' (GroupStateProps)
    const { group, status } = data as any

    // Check if the status is not successful (not 200)
    if (status !== 200) {
        router.push("/explore")
    }

    // Return the group object if data is present and status is 200
    return {
        group,
    }
}

// NOTE: You would need to define or import 'useRouter', 'data', and 'GroupStateProps'
// for this code to run correctly in your environment.
export const useGroupAbout = ({
    description,
    jsonDescription,
    htmlDescription,
    currentMedia,
    groupId,
}: {
    description: string | null
    jsonDescription: string | null
    htmlDescription: string | null
    currentMedia: string
    groupId: string
}) => {
    const editor = useRef<HTMLFormElement | null>(null)
    const mediaType = validateURLString(currentMedia)
    const [activeMedia, setActiveMedia] = useState<MediaType | undefined>(
        mediaType.type === "IMAGE"
            ? {
                  url: currentMedia,
                  type: mediaType.type,
              }
            : { ...mediaType },
    )

    const jsonContent =
        jsonDescription !== null
            ? JSON.parse(jsonDescription as string)
            : undefined

    const [onJsonDescription, setOnJsonDescription] = useState<
        JSONContent | undefined
    >(jsonContent)

    const [onDescription, setOnDescription] = useState<string | undefined>(
        description || undefined,
    )

    const [onHtmlDescription, setOnHtmlDescription] = useState<
        string | undefined
    >(htmlDescription || undefined)

    const [onEditDescription, setOnEditDescription] = useState<boolean>(false)

    const {
        setValue,
        formState: { errors },
        handleSubmit,
    } = useForm<z.infer<typeof GroupSettingsSchema>>({
        resolver: zodResolver(GroupSettingsSchema),
    })

    const onSetDescriptions = () => {
        const jsonContent = JSON.stringify(onJsonDescription)
        setValue("jsondescription", jsonContent)
        setValue("description", onDescription)
        setValue("htmldescription", onHtmlDescription)
    }

    useEffect(() => {
        onSetDescriptions()
        return () => {
            onSetDescriptions()
        }
    }, [onJsonDescription, onDescription, onHtmlDescription])

    const onEditTextEditor = (event: Event) => {
        if (editor.current) {
            !editor.current.contains(event.target as Node | null)
                ? setOnEditDescription(false)
                : setOnEditDescription(true)
        }
    }

    useEffect(() => {
        document.addEventListener("click", onEditTextEditor, false)
        return () => {
            document.removeEventListener("click", onEditTextEditor, false)
        }
    }, [])

    // Add mutation for updating descriptions
    const { mutate, isPending } = useMutation({
        mutationKey: ["about-description"],
        mutationFn: async (values: z.infer<typeof GroupSettingsSchema>) => {
            if (values.description) {
                const updated = await onUpdateGroupSettings(
                    groupId,
                    "DESCRIPTION",
                    values.description,
                    `/about/${groupId}`,
                )
                if (updated.status !== 200) {
                    return toast("Error", {
                        description: "Failed to update description",
                    })
                }
            }

            if (values.jsondescription) {
                const updated = await onUpdateGroupSettings(
                    groupId,
                    "JSONDESCRIPTION",
                    values.jsondescription,
                    `/about/${groupId}`,
                )
                if (updated.status !== 200) {
                    return toast("Error", {
                        description: "Failed to update JSON description",
                    })
                }
            }

            if (values.htmldescription) {
                const updated = await onUpdateGroupSettings(
                    groupId,
                    "HTMLDESCRIPTION",
                    values.htmldescription,
                    `/about/${groupId}`,
                )
                if (updated.status !== 200) {
                    return toast("Error", {
                        description: "Failed to update HTML description",
                    })
                }
            }

            if (
                !values.description &&
                !values.jsondescription &&
                !values.htmldescription
            ) {
                return toast("Error", {
                    description: "No changes to save",
                })
            }

            return toast("Success", {
                description: "Group description updated",
            })
        },
    })

    const onSetActiveMedia = (media: MediaType) => {
        setActiveMedia(media)
    }

    const onUpdateDescription = async (e: React.FormEvent) => {
        e.preventDefault()
        // Directly use the current state values instead of form validation
        // This bypasses the 100-char description validation which doesn't apply here
        const values = {
            description: onDescription,
            jsondescription: JSON.stringify(onJsonDescription),
            htmldescription: onHtmlDescription,
        }
        mutate(values as z.infer<typeof GroupSettingsSchema>)
    }

    return {
        setOnDescription,
        onDescription,
        setJsonDescription: setOnJsonDescription,
        onJsonDescription,
        errors,
        onEditDescription,
        editor,
        activeMedia,
        onSetActiveMedia,
        setOnHtmlDescription,
        onUpdateDescription,
        isPending,
    }
}

export const useMediaGallery = (groupid: string) => {
    // 1. Form Initialization (using React Hook Form and Zod)
    const {
        register,
        formState: { errors },
        handleSubmit,
        control,
    } = useForm<z.infer<typeof UpdateGallerySchema>>({
        resolver: zodResolver(UpdateGallerySchema),
    })

    const { mutate, isPending } = useMutation({
        mutationKey: ["update-gallery"],
        mutationFn: async (values: z.infer<typeof UpdateGallerySchema>) => {
            // --- A. Handle Video URL Update ---
            if (values.videourl) {
                const update = await onUpdateGroupGallery(
                    groupid,
                    values.videourl,
                )

                if (update && update.status !== 200) {
                    return toast("Error", {
                        description: update.message,
                    })
                }
            }

            // --- B. Handle Image Uploads ---
            if (values.image && values.image.length) {
                let count = 0
                while (count < values.image.length) {
                    // Upload the file
                    const uploaded = await upload.uploadFile(
                        values.image[count],
                    )

                    if (uploaded) {
                        // Update the gallery with the uploaded URL
                        const update = await onUpdateGroupGallery(
                            groupid,
                            uploaded.url,
                        )

                        if (update?.status !== 200) {
                            toast("Error", {
                                description: update?.message,
                            })
                            break // Stop uploading more images on failure
                        }
                    } else {
                        toast("Error", {
                            description: "Looks like something went wrong!",
                        })
                        break // Stop uploading more images on failure
                    }

                    console.log("increment")
                    count++
                }
            }

            // --- C. Success Notification ---
            return toast("Success", {
                description: "Group gallery updated",
            })
        },
    })

    // 3. Submission Handler
    // This function connects the form submission data to the mutation
    const onUpdateGallery = handleSubmit(async (values) => mutate(values))

    // 4. Return Values
    return {
        register,
        errors,
        onUpdateGallery,
        isPending,
        control,
    }
}
