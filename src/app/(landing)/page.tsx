import dynamic from "next/dynamic";
import CallToAction from "./_components/call-to-action";
import DashboardSinppet from "./_components/dashboard-snippet";

const PricingSection = dynamic(() =>
    import("./_components/pricing").then((component) => component.PricingSection,), { ssr: true },)
export default function Home() {
    return (
        <main className="md:px-10 py-20 flex flex-col gap-36">
            <div>
                <CallToAction />
                <div className="mt-3">
                    <DashboardSinppet />
                </div>
            </div>
            <PricingSection />
        </main>
    )
}
