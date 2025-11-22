

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
// import { upload } from "@/lib/uploadcare"
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

import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useMutation, useQuery } from "@tanstack/react-query"
import { onSearchGroups, onUpdateGroupSettings } from "@/actions/groups"
import { onGetGroupInfo } from "@/actions/groups"
import { JSONContent } from "novel"
import type { AppDispatch } from "@/redux/store"
import { onClearSearch, onSearch } from "@/redux/slices/search-slice"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { GroupSettingsSchema } from "@/components/forms/group-settings/schema"
import { z } from "zod"
import { upload } from "@/lib/uploadcare"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
        const groups = await onSearchGroups(search, queryKey[1] as string)
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
        })
      )
    }

    if (isFetched) {
      dispatch(
        onSearch({
          isSearching: false,
          status: data?.status as number,
          data: data?.groups || [],
          debounce,
        })
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
  
  const { data } = useQuery({
    queryKey: ["group-info"],
    queryFn: () => onGetGroupInfo(groupid),
  })

  const jsonContent =
    data?.group?.jsonDescription !== null && data?.group?.jsonDescription
      ? JSON.parse(data.group.jsonDescription)
      : undefined

  const [onJsonDescription, setJsonDescription] = useState<JSONContent | undefined>(jsonContent)
  const [onDescription, setOnDescription] = useState<string | undefined>(
    data?.group?.description || undefined
  )

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm<z.infer<typeof GroupSettingsSchema>>({
    resolver: zodResolver(GroupSettingsSchema),
    mode: "onChange",
  })

  const [previewIcon, setPreviewIcon] = useState<string | undefined>(undefined)
  const [previewThumbnail, setPreviewThumbnail] = useState<string | undefined>(undefined)

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

  // ✅ Fixed: Added setValue to dependencies
  useEffect(() => {
    const JsonContent = JSON.stringify(onJsonDescription)
    setValue("jsondescription", JsonContent)
    setValue("description", onDescription)
  }, [onJsonDescription, onDescription, setValue])

  const { mutate: update, isPending } = useMutation({
    mutationKey: ["group-settings"],
    mutationFn: async (values: z.infer<typeof GroupSettingsSchema>) => {
      if (values.thumbnail && values.thumbnail.length > 0) {
        const uploaded = await upload.uploadFile(values.thumbnail[0])
        const updated = await onUpdateGroupSettings(
          groupid,
          "IMAGE",
          uploaded.uuid,
          `/group/${groupid}/settings`
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Failed to update thumbnail",
          })
        }
      }

      if (values.icon && values.icon.length > 0) {
        const uploaded = await upload.uploadFile(values.icon[0])
        const updated = await onUpdateGroupSettings(
          groupid,
          "ICON",
          uploaded.uuid,
          `/group/${groupid}/settings`
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Failed to update icon",
          })
        }
      }

      if (values.name) {
        const updated = await onUpdateGroupSettings(
          groupid,
          "NAME",
          values.name,
          `/group/${groupid}/settings`
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Failed to update name",
          })
        }
      }

      if (values.description) {
        const updated = await onUpdateGroupSettings(
          groupid,
          "DESCRIPTION",
          values.description,
          `/group/${groupid}/settings`
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Failed to update description",
          })
        }
      }

      if (values.jsondescription) {
        const updated = await onUpdateGroupSettings(
          groupid,
          "JSONDESCRIPTION",
          values.jsondescription,
          `/group/${groupid}/settings`
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Failed to update JSON description",
          })
        }
      }

      if (
        !values.description &&
        !values.name &&
        !values.thumbnail?.length &&
        !values.icon?.length &&
        !values.jsondescription
      ) {
        return toast("Error", {
          description: "Oops! looks like your form is empty",
        })
      }
      
      return toast("Success", {
        description: "Group data updated",
      })
    },
  })

  const onUpdate = handleSubmit(async (values) => update(values))

  useEffect(() => {
    if (data?.status !== 200 && data?.status !== undefined) {
      router.push('/group/create')
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
    onJsonDescription,
    setJsonDescription,
    setOnDescription,
    onDescription,
  }
}