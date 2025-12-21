import GradientText from "@/components/global/gradient-text"
import { Button } from "@/components/ui/button"
import { BadgePlus, Play } from "lucide-react"
import Link from "next/link"

const CallToAction = () => {
    return (
        <div className="flex flex-col items-start md:items-center gap-y-6 md:gap-y-8">
            <GradientText
                className="text-[32px] sm:text-[40px] md:text-[50px] lg:text-[60px] xl:text-[70px] 2xl:text-[80px]
                leading-tight font-semibold text-left md:text-center"
                element="H1"
            >
                Bringing Communities <br className="md:hidden" /> Together
            </GradientText>
            <p className="text-sm sm:text-base md:text-lg text-left md:text-center text-muted-foreground max-w-2xl px-2">
                Nexus is a vibrant online platform that empowers communities to{" "}
                <br className="hidden md:block" />
                collaborate, and cultivate meaningful relationships
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full sm:w-auto mt-4">
                <Link href="/sign-in" className="w-full sm:w-auto">
                    <Button
                        size="lg"
                        className="rounded-xl text-base flex gap-2 w-full sm:w-auto justify-center
                        bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                    >
                        <BadgePlus className="w-5 h-5" /> Get Started
                    </Button>
                </Link>
                <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl text-base flex gap-2 w-full sm:w-auto justify-center
                    bg-transparent hover:bg-accent/10 transition-all"
                >
                    <Play className="w-5 h-5" /> Watch Demo
                </Button>
            </div>
        </div>
    )
}
export default CallToAction
