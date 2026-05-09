import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const PUBLIC_ROUTES = [
    "/login",
    "/register"
]

export async function proxy(req: NextRequest) {

    const token = req.cookies.get("token")?.value

    const pathname = req.nextUrl.pathname

    // Check public routes
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

    // No token
    if (!token) {

        // User trying protected route
        if (!isPublicRoute) {
            return NextResponse.redirect(
                new URL("/login", req.url)
            )
        }

        return NextResponse.next()
    }

    try {

        // Verify JWT
        jwt.verify(
            token,
            process.env.JWT_SECRET!
        )

        // Logged in user opening login/register
        if (isPublicRoute) {
            return NextResponse.redirect(
                new URL("/dashboard", req.url)
            )
        }

        return NextResponse.next()

    } catch (error) {

        // Invalid token
        const response = NextResponse.redirect(
            new URL("/login", req.url)
        )
        // response.headers.set("id")

        response.cookies.delete("token")

        return response
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api
         * - _next/static
         * - _next/image
         * - favicon.ico
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}