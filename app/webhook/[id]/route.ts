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
   WEBHOOK VERIFICATION
========================= */

export async function GET(
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string
        }
    }
) {

    try {

        const accountId =
            Number(params.id)

        // Find WhatsApp account
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

        // Meta params
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

        // Verify token
        if (
            mode === "subscribe" &&
            token ===
            account.webhook_verify_token
        ) {

            return new NextResponse(
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

        console.error(error)

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
   RECEIVE WEBHOOK EVENTS
========================= */

export async function POST(
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string
        }
    }
) {

    try {

        const accountId =
            Number(params.id)

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
                        "WhatsApp account not found"
                },
                {
                    status: 404
                }
            )
        }

        const account =
            accounts[0]

        // Raw body
        const rawBody =
            await req.text()

        // Verify signature
        const isValid =
            verifySignature({

                // Secret from DB
                appSecret:
                    account.meta_app_secret,

                rawBody,

                signatureHeader:
                    req.headers.get(
                        "x-hub-signature-256"
                    ) || ""
            })

        if (!isValid) {

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

        // Parse payload
        const payload =
            JSON.parse(rawBody)

        // Normalize webhook
        const events =
            normalizeWebhook(
                payload
            )





        /* =========================
           SAVE MESSAGES
        ========================= */

        for (
            const message of
            events.messages
        ) {

            // Only text messages
            if (
                !message.text?.body
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
                        message.text.body,

                    status:
                        "received"
                })
        }





        /* =========================
           MESSAGE STATUS
        ========================= */

        for (
            const status of
            events.statuses
        ) {

            if (
                !status.id
            ) {
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





        /* =========================
           CALL EVENTS
        ========================= */

        for (
            const call of
            events.calls
        ) {

            console.log(
                "CALL EVENT:",
                call
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

        console.error(error)

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