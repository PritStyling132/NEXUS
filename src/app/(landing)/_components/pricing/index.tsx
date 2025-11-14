import BackdropGradient from "@/components/global/backdrop-gradient"
import GradientText from "@/components/global/gradient-text"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

type Props = {}

export const PricingSection = (props: Props) => {
    return (
        <div className="w-full flex flex-col items-center gap-3" id="pricing">
            <BackdropGradient
                className="w-8/12 h-full opacity-40 flex flex-col 
       item-center"
            >
                <GradientText
                    className="text-4xl font-semibold text-center"
                    element="H2"
                >
                    Pricing Plans That Fit Your Right{" "}
                </GradientText>
                <p className="text-sm md:text-center text-left text-muted-foreground mt-3">
                    {" "}
                    NeXus is a Vibrant online community platform that empowers
                    people to connect,
                    <br className="hidden md:block" /> and cultivate meaningful
                    relationships
                </p>
            </BackdropGradient>
            <Card className="bg-themeBlack border border-themeGray shadow-card hover:shadow-glow transition mt-5 p-5">
                <div className="=flex flex-col gap-3">
                    <CardTitle>99/m</CardTitle>
                    <CardDescription className="text-[#B4B0AE] mt-2 mb-2">
                        Great if you're just getting started
                    </CardDescription>
                    <Link href="#" className="w-full mt-3">
                        <Button
                            variant="default"
                            className="bg-[#333337] w-full rounded-2xl text-white hover:text-[#333337]"
                        >
                            Start for free
                        </Button>
                    </Link>
                </div>
                <div className="flex flex-col gap-2 text-[#B4B0AE] mt-5">
                    <p>Features</p>
                    <span className="flex gap-2 mt-3 item-center">
                        <Check />
                        Feature number 1
                    </span>
                    <span className="flex gap-2 item-center">
                        <Check />
                        Feature number 2
                    </span>
                    <span className="flex gap-2 item-center">
                        <Check />
                        Feature number 3
                    </span>
                    <span className="flex gap-2 item-center">
                        <Check />
                        Feature number 4
                    </span>
                    <span className="flex gap-2 item-center">
                        <Check />
                        Feature number 5
                    </span>
                </div>
            </Card>
        </div>
    )
}
