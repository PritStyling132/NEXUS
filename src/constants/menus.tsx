import { Compass, CreditCard, Home, icons, Target,Zap,Globe,Layers,Settings } from "lucide-react"

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
        section: true,
    },
    {
        id: 1,
        label: "Pricing",
        icon: <CreditCard />,
        path: "#pricing",
        section: true,
    },
    {
        id: 2,
        label: "Explore",
        icon: <Compass />,
        path: "/explore",
    },
    {
        id: 3,
        label: "Marketing",
        icon: <Target />,
        path: "/marketing",
        section: true,
    },
]

export const SIDEBAR_SETTINGS_MENU: MenuProps[] = [
    {
        id: 0,
        label: "General",
        icon: <Settings />,
        path: "",
    },
    {
        id: 1,
        label: "Subscriptions",
        icon: <CreditCard />,
        path: "subscriptions",
    },
    {
        id: 2,
        label: "Affiliates",
        icon: <Layers />,
        path: "affiliates",
    },
    {
        id: 3,
        label: "Domain Config",
        icon: <Globe />,
        path: "domains",
    },
    {
        id: 4,
        label: "Integration",
        icon: <Zap />,
        path: "integrations",
        integration: true,
    },
]