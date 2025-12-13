import React from "react"
import LandingPageNavbar from "./_components/navbar"
import Footer from "@/components/global/footer"

type Props = {
    children: React.ReactNode
}

const LandingPageLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <LandingPageNavbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}

export default LandingPageLayout
