import { onSignUpUser } from "@/actions/auth"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const result = await onSignUpUser(body)
        return Response.json(result)
    } catch (error: any) {
        console.error("API Sign-up Error:", error)
        return new Response(
            JSON.stringify({ status: 500, message: "Internal Server Error" }),
            { status: 500 },
        )
    }
}
