"use client"
import { configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useSelector } from "react-redux"
import searchReducer from "./slices/search-slice"

// Create store with search reducer
export const store = configureStore({
    reducer: {
        search: searchReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
    devTools: process.env.NODE_ENV !== "production",
})

// Export type definitions
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// useAppSelector with type definitions
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
