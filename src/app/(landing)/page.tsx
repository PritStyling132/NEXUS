import dynamic from "next/dynamic"
import CallToAction from "./_components/call-to-action"
import DashboardSinppet from "./_components/dashboard-snippet"

const PricingSection = dynamic(
    () =>
        import("./_components/pricing").then(
            (component) => component.PricingSection,
        ),
    { ssr: true },
)
export default function Home() {
    return (
        <main className="px-4 sm:px-6 md:px-10 lg:px-12 py-12 sm:py-16 md:py-20 flex flex-col gap-20 sm:gap-28 md:gap-36">
            <div>
                <CallToAction />
                <div className="mt-6 sm:mt-8 md:mt-10">
                    <DashboardSinppet />
                </div>
            </div>
            <PricingSection />
        </main>
    )
}
