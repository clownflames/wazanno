import {
    normalizeWebhook,
    verifySignature
} from "@kapso/whatsapp-cloud-api/server"

import {
    NextRequest,
    NextResponse
} from "next/server"

import { db } from "@/db"

import {
    messagesTable,
    whatsappaccounttable
} from "@/db/schema"

import { eq } from "drizzle-orm"





/* =========================
   VERIFY WEBHOOK
========================= */

export async function GET(
    req: NextRequest,
    {
        params
    }: {
        params: Promise<{
            id: string
        }>
    }
) {

    try {

        const { id } =
            await params

        const accountId =
            Number(id)

        // Find account
        const accounts =
            await db
                .select()
                .from(
                    whatsappaccounttable
                )
                .where(
                    eq(
                        whatsappaccounttable.id,
                        accountId
                    )
                )
                .limit(1)

        if (
            accounts.length === 0
        ) {

            return NextResponse.json(
                {
                    error:
                        "Webhook not found"
                },
                {
                    status: 404
                }
            )
        }

        const account =
            accounts[0]

        const searchParams =
            req.nextUrl.searchParams

        const mode =
            searchParams.get(
                "hub.mode"
            )

        const token =
            searchParams.get(
                "hub.verify_token"
            )

        const challenge =
            searchParams.get(
                "hub.challenge"
            )

        console.log({
            mode,
            token,
            challenge
        })

        // Verify
        if (
            mode === "subscribe" &&
            token ===
            account.webhook_verify_token
        ) {

            return new Response(
                challenge,
                {
                    status: 200
                }
            )
        }

        return NextResponse.json(
            {
                error:
                    "Verification failed"
            },
            {
                status: 403
            }
        )

    } catch (error) {

        console.error(
            "GET WEBHOOK ERROR:",
            error
        )

        return NextResponse.json(
            {
                error:
                    "Webhook verification failed"
            },
            {
                status: 500
            }
        )
    }
}





/* =========================
   RECEIVE EVENTS
========================= */

export async function POST(
    req: NextRequest,
    {
        params
    }: {
        params: Promise<{
            id: string
        }>
    }
) {

    try {

        const { id } =
            await params

        const accountId =
            Number(id)

        // Find account
        const accounts =
            await db
                .select()
                .from(
                    whatsappaccounttable
                )
                .where(
                    eq(
                        whatsappaccounttable.id,
                        accountId
                    )
                )
                .limit(1)

        if (
            accounts.length === 0
        ) {

            return NextResponse.json(
                {
                    error:
                        "Account not found"
                },
                {
                    status: 404
                }
            )
        }

        const account =
            accounts[0]





        /* =========================
           RAW BODY
        ========================= */

        const rawBody =
            await req.text()

        console.log(
            "RAW BODY:",
            rawBody
        )





        /* =========================
           SIGNATURE VERIFY
        ========================= */

        const signature =
            req.headers.get(
                "x-hub-signature-256"
            ) || ""

        console.log(
            "SIGNATURE:",
            signature
        )

        // Skip verification in development
        let isValid = true

        if (
            process.env.NODE_ENV ===
            "production"
        ) {

            isValid =
                verifySignature({

                    appSecret:
                        account.meta_app_secret,

                    rawBody,

                    signatureHeader:
                        signature
                })
        }

        if (!isValid) {

            console.log(
                "INVALID SIGNATURE"
            )

            return NextResponse.json(
                {
                    error:
                        "Invalid signature"
                },
                {
                    status: 401
                }
            )
        }





        /* =========================
           PARSE PAYLOAD
        ========================= */

        const payload =
            JSON.parse(rawBody)

        console.log(
            "PAYLOAD:",
            payload
        )

        const events =
            normalizeWebhook(
                payload
            )

        console.log(
            "EVENTS:",
            events
        )





        /* =========================
           SAVE MESSAGES
        ========================= */

        for (
            const message of
            events.messages
        ) {

            console.log(
                "MESSAGE:",
                message
            )

            // Save text messages only
            if (
                message.type !==
                "text"
            ) {
                continue
            }

            await db
                .insert(
                    messagesTable
                )
                .values({

                    whatsapp_account_id:
                        account.id,

                    sender_no:
                        String(
                            message.from
                        ),

                    receiver_no:
                        account.phone_no,

                    meta_message_id:
                        message.id,

                    message_type:
                        message.type,

                    content:
                        message.text?.body ||
                        "",

                    status:
                        "received"
                })
        }





        /* =========================
           STATUS UPDATES
        ========================= */

        for (
            const status of
            events.statuses
        ) {

            console.log(
                "STATUS:",
                status
            )

            if (!status.id) {
                continue
            }

            await db
                .update(
                    messagesTable
                )
                .set({
                    status:
                        status.status
                })
                .where(
                    eq(
                        messagesTable.meta_message_id,
                        status.id
                    )
                )
        }

        return NextResponse.json(
            {
                success: true
            },
            {
                status: 200
            }
        )

    } catch (error) {

        console.error(
            "POST WEBHOOK ERROR:",
            error
        )

        return NextResponse.json(
            {
                error:
                    "Webhook failed"
            },
            {
                status: 500
            }
        )
    }
}