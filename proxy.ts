import {
    NextRequest,
    NextResponse
} from "next/server"

import jwt from "jsonwebtoken"





/* =========================
   PUBLIC ROUTES
========================= */

const PUBLIC_ROUTES = [
    "/login",
    "/register"
]





/* =========================
   PUBLIC PREFIXES
========================= */

const PUBLIC_PREFIXES = [

    // Meta webhooks
    "/webhook",

    // Public APIs if needed
    "/api/public"
]





/* =========================
   MIDDLEWARE
========================= */

export async function proxy(
    req: NextRequest
) {

    try {

        const pathname =
            req.nextUrl.pathname

        const token =
            req.cookies.get("token")
                ?.value

        // Check public route
        const isPublicRoute =

            PUBLIC_ROUTES.includes(
                pathname
            ) ||

            PUBLIC_PREFIXES.some(
                (route) =>
                    pathname.startsWith(
                        route
                    )
            )





        /* =========================
           NO TOKEN
        ========================= */

        if (!token) {

            // Allow public routes
            if (isPublicRoute) {
                return NextResponse.next()
            }

            // Redirect protected routes
            return NextResponse.redirect(
                new URL(
                    "/login",
                    req.url
                )
            )
        }





        /* =========================
           VERIFY JWT
        ========================= */

        jwt.verify(
            token,
            process.env.JWT_SECRET!
        )





        /* =========================
           BLOCK LOGIN/REGISTER
           WHEN ALREADY LOGGED IN
        ========================= */

        if (
            pathname === "/login" ||
            pathname === "/register"
        ) {

            return NextResponse.redirect(
                new URL(
                    "/dashboard",
                    req.url
                )
            )
        }





        /* =========================
           ALLOW REQUEST
        ========================= */

        return NextResponse.next()

    } catch (error) {

        console.error(
            "MIDDLEWARE ERROR:",
            error
        )

        // Remove invalid token
        const response =
            NextResponse.redirect(
                new URL(
                    "/login",
                    req.url
                )
            )

        response.cookies.delete(
            "token"
        )

        return response
    }
}





/* =========================
   MATCHER
========================= */

export const config = {
    matcher: [

        /*
         * Ignore:
         * - api
         * - static files
         * - next internals
         * - favicon
         */

        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}