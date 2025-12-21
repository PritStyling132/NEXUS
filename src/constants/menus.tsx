import {
    Compass,
    CreditCard,
    Home,
    Target,
    Zap,
    Globe,
    Layers,
    Settings,
    BookOpen,
    Film,
    Video,
} from "lucide-react"

export type MenuProps = {
    id: number
    label: string
    icon: JSX.Element
    path: string
    section?: boolean
    integration?: boolean
}

export const LANDING_PAGE_MENU: MenuProps[] = [
    {
        id: 0,
        label: "Home",
        icon: <Home />,
        path: "/",
    },
    {
        id: 1,
        label: "Explore",
        icon: <Compass />,
        path: "/explore",
    },
    {
        id: 2,
        label: "Pricing",
        icon: <CreditCard />,
        path: "/pricing",
    },
    {
        id: 3,
        label: "Marketing",
        icon: <Target />,
        path: "/marketing",
    },
]

export const SIDEBAR_SETTINGS_MENU: MenuProps[] = [
    {
        id: 0,
        label: "General Settings",
        icon: <Settings />,
        path: "general-settings",
    },
    {
        id: 1,
        label: "Courses",
        icon: <BookOpen />,
        path: "courses",
    },
    {
        id: 2,
        label: "Live Sessions",
        icon: <Video />,
        path: "live-sessions",
    },
    {
        id: 3,
        label: "Marketing Reels",
        icon: <Film />,
        path: "reels",
    },
    {
        id: 4,
        label: "Subscriptions",
        icon: <CreditCard />,
        path: "subscriptions",
    },
    {
        id: 5,
        label: "Affiliates",
        icon: <Layers />,
        path: "affiliates",
    },
    {
        id: 6,
        label: "Domain Config",
        icon: <Globe />,
        path: "domains",
    },
    {
        id: 7,
        label: "Integration",
        icon: <Zap />,
        path: "integrations",
        integration: true,
    },
]
