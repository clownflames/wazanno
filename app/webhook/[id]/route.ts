// app/api/whatsapp/webhook/[id]/route.ts

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
   TYPES FOR DIFFERENT MESSAGES
========================= */









interface WhatsAppMessage {
    from: string
    id: string
    type: string
    text?: {
        body: string
    }
    image?: {
        id: string
        mime_type?: string
        caption?: string
    }
    video?: {
        id: string
        mime_type?: string
        caption?: string
    }
    audio?: {
        id: string
        mime_type?: string
    }
    voice?: {
        id: string
        mime_type?: string
    }
    document?: {
        id: string
        mime_type?: string
        filename?: string
        caption?: string
    }
    sticker?: {
        id: string
        mime_type?: string
    }
    location?: {
        latitude: number
        longitude: number
        name?: string
        address?: string
    }
    contacts?: Array<{
        name: {
            formatted_name: string
            first_name?: string
            last_name?: string
        }
        phones?: Array<{
            phone: string
            type?: string
        }>
    }>
    interactive?: {
        type: "button_reply" | "list_reply"
        button_reply?: {
            id: string
            title: string
        }
        list_reply?: {
            id: string
            title: string
            description?: string
        }
    }
    reaction?: {
        message_id: string
        emoji: string
    }
    order?: {
        catalog_id: string
    }
    system?: {
        body: string
    }
}

interface WhatsAppStatus {
    id: string
    status: string
}

interface WebhookEvent {
    messages: WhatsAppMessage[]
    statuses: WhatsAppStatus[]
}

interface Account {
    id: number
    phone_no: string
    whatsapp_token: string
    meta_app_secret: string
    webhook_verify_token: string
}

interface MediaMetadata {
    media_type: string
    media_id?: string
    media_url?: string
    mime_type?: string
    caption?: string
    filename?: string
    latitude?: number
    longitude?: number
    location_name?: string
    location_address?: string
    contact_name?: string
    contact_phone?: string
    interactive_data?: string
    reaction_emoji?: string
    reacts_to_message_id?: string
    order_data?: string
    system_data?: string
}

/* =========================
   HELPER: FORMAT MESSAGE CONTENT
========================= */

function formatMessageContent(
    message: WhatsAppMessage,
    type: string
): string {
    switch (type) {
        case "text":
            return message.text?.body || ""

        case "image":
            return message.image?.caption || "📷 Image"

        case "video":
            return message.video?.caption || "🎥 Video"

        case "audio":
            return "🎵 Audio message"

        case "voice":
            return "🎙️ Voice message"

        case "document":
            return `📄 ${message.document?.filename || "Document"}`

        case "sticker":
            return "🏷️ Sticker"

        case "location":
            return `📍 ${message.location?.name || "Location"}`

        case "contact":
            return `👤 ${message.contacts?.[0]?.name?.formatted_name || "Contact"}`

        case "interactive":
            if (message.interactive?.type === "button_reply") {
                return `🔘 ${message.interactive.button_reply?.title || "Button clicked"}`
            } else if (message.interactive?.type === "list_reply") {
                return `📋 ${message.interactive.list_reply?.title || "Option selected"}`
            }
            return "🔄 Interactive message"

        case "reaction":
            return `😊 ${message.reaction?.emoji || "Reaction"}`

        case "order":
            return "🛒 Order received"

        case "system":
            return `⚙️ ${message.system?.body || "System message"}`

        default:
            return `📨 New message`
    }
}

/* =========================
   HELPER: GET MEDIA URL
========================= */

async function getMediaUrl(
    mediaId: string,
    accessToken: string
): Promise<string | null> {
    if (!mediaId) return null

    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${mediaId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )

        if (!response.ok) {
            console.error(`Failed to fetch media ${mediaId}:`, response.status)
            return null
        }

        const data = await response.json() as { url?: string }
        return data.url || null
    } catch (error) {
        console.error("Error fetching media URL:", error)
        return null
    }
}

/* =========================
   HELPER: EXTRACT MEDIA METADATA
========================= */

async function extractMediaMetadata(
    message: WhatsAppMessage,
    type: string,
    accessToken: string
): Promise<Partial<MediaMetadata>> {
    const metadata: Partial<MediaMetadata> = {
        media_type: type
    }

    try {
        switch (type) {
            case "image":
                if (message.image) {
                    metadata.media_id = message.image.id
                    metadata.mime_type = message.image.mime_type
                    metadata.caption = message.image.caption
                    const imageUrl = await getMediaUrl(message.image.id, accessToken)
                    if (imageUrl) metadata.media_url = imageUrl
                }
                break

            case "video":
                if (message.video) {
                    metadata.media_id = message.video.id
                    metadata.mime_type = message.video.mime_type
                    metadata.caption = message.video.caption
                    const videoUrl = await getMediaUrl(message.video.id, accessToken)
                    if (videoUrl) metadata.media_url = videoUrl
                }
                break

            case "audio":
                if (message.audio) {
                    metadata.media_id = message.audio.id
                    metadata.mime_type = message.audio.mime_type
                    const audioUrl = await getMediaUrl(message.audio.id, accessToken)
                    if (audioUrl) metadata.media_url = audioUrl
                }
                break

            case "voice":
                if (message.voice) {
                    metadata.media_id = message.voice.id
                    metadata.mime_type = message.voice.mime_type
                    const voiceUrl = await getMediaUrl(message.voice.id, accessToken)
                    if (voiceUrl) metadata.media_url = voiceUrl
                }
                break

            case "document":
                if (message.document) {
                    metadata.media_id = message.document.id
                    metadata.mime_type = message.document.mime_type
                    metadata.filename = message.document.filename
                    metadata.caption = message.document.caption
                    const documentUrl = await getMediaUrl(message.document.id, accessToken)
                    if (documentUrl) metadata.media_url = documentUrl
                }
                break

            case "sticker":
                if (message.sticker) {
                    metadata.media_id = message.sticker.id
                    metadata.mime_type = message.sticker.mime_type
                    const stickerUrl = await getMediaUrl(message.sticker.id, accessToken)
                    if (stickerUrl) metadata.media_url = stickerUrl
                }
                break
        }
    } catch (error) {
        console.error(`Error extracting ${type} metadata:`, error)
    }

    return metadata
}

/* =========================
   VERIFY WEBHOOK
========================= */

export async function GET(
    req: NextRequest,
    {
        params
    }: {
        params: Promise<{ id: string }>
    }
) {
    try {
        const { id } = await params
        const accountId = Number(id)

        if (isNaN(accountId)) {
            return NextResponse.json(
                { error: "Invalid account ID" },
                { status: 400 }
            )
        }

        const accounts = await db
            .select()
            .from(whatsappaccounttable)
            .where(eq(whatsappaccounttable.id, accountId))
            .limit(1)

        if (accounts.length === 0) {
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            )
        }

        const account = accounts[0] as Account
        const searchParams = req.nextUrl.searchParams
        const mode = searchParams.get("hub.mode")
        const token = searchParams.get("hub.verify_token")
        const challenge = searchParams.get("hub.challenge")

        console.log("Webhook verification:", { mode, token: token?.substring(0, 10), challenge })

        if (mode === "subscribe" && token === account.webhook_verify_token) {
            return new Response(challenge, {
                status: 200,
                headers: { "Content-Type": "text/plain" }
            })
        }

        return NextResponse.json(
            { error: "Verification failed - Invalid token" },
            { status: 403 }
        )
    } catch (error) {
        console.error("GET WEBHOOK ERROR:", error)
        return NextResponse.json(
            { error: "Webhook verification failed" },
            { status: 500 }
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
        params: Promise<{ id: string }>
    }
) {
    try {
        const { id } = await params
        const accountId = Number(id)

        if (isNaN(accountId)) {
            return NextResponse.json(
                { error: "Invalid account ID" },
                { status: 400 }
            )
        }

        const accounts = await db
            .select()
            .from(whatsappaccounttable)
            .where(eq(whatsappaccounttable.id, accountId))
            .limit(1)

        if (accounts.length === 0) {
            console.error(`Account not found: ${accountId}`)
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            )
        }

        const account = accounts[0] as Account

        /* =========================
           RAW BODY
        ========================= */

        const rawBody = await req.text()

        if (!rawBody) {
            console.error("Empty webhook body")
            return NextResponse.json(
                { error: "Empty body" },
                { status: 400 }
            )
        }

        console.log("Webhook received for account:", account.phone_no)

        /* =========================
           SIGNATURE VERIFY (Optional for development)
        ========================= */

        const signature = req.headers.get("x-hub-signature-256") || ""

        // Only verify signature in production with valid app secret
        if (process.env.NODE_ENV === "production" && account.meta_app_secret) {
            try {
                const isValid = verifySignature({
                    appSecret: account.meta_app_secret,
                    rawBody,
                    signatureHeader: signature
                })

                if (!isValid) {
                    console.error("Invalid signature received")
                    return NextResponse.json(
                        { error: "Invalid signature" },
                        { status: 401 }
                    )
                }
            } catch (sigError) {
                console.error("Signature verification error:", sigError)
                // Continue anyway - don't block messages if signature verification fails
            }
        }

        /* =========================
           PARSE PAYLOAD
        ========================= */

        let payload: { object?: string; entry?: unknown[] }
        try {
            payload = JSON.parse(rawBody)
        } catch (parseError) {
            console.error("Failed to parse JSON payload:", parseError)
            return NextResponse.json(
                { error: "Invalid JSON" },
                { status: 400 }
            )
        }

        // Check if this is a webhook test
        if (payload.object === "whatsapp_business_account" && !payload.entry) {
            console.log("Webhook test received")
            return NextResponse.json({ success: true })
        }

        const events = normalizeWebhook(payload) as WebhookEvent

        if (!events) {
            console.log("No events to process")
            return NextResponse.json({ success: true, message: "No events" })
        }

        console.log(`Processing ${events.messages?.length || 0} messages, ${events.statuses?.length || 0} statuses`)

        /* =========================
           PROCESS MESSAGES
        ========================= */

        if (events.messages && events.messages.length > 0) {
            for (const message of events.messages) {
                try {
                    console.log(`Processing ${message.type} message from ${message.from}`)

                    // Skip if no message content
                    if (!message.from || !message.id) {
                        console.warn("Incomplete message received:", message)
                        continue
                    }

                    // Check for duplicate message
                    const existingMessage = await db
                        .select()
                        .from(messagesTable)
                        .where(eq(messagesTable.meta_message_id, message.id))
                        .limit(1)

                    if (existingMessage.length > 0) {
                        console.log(`Duplicate message ${message.id} - skipping`)
                        continue
                    }

                    const messageType = message.type
                    let content = formatMessageContent(message, message.type)
                    let metadata: Partial<MediaMetadata> = {}

                    // Extract metadata based on message type
                    switch (message.type) {
                        case "text":
                            content = message.text?.body || ""
                            break

                        case "image":
                        case "video":
                        case "audio":
                        case "voice":
                        case "document":
                        case "sticker":
                            metadata = await extractMediaMetadata(message, message.type, account.whatsapp_token)
                            break

                        case "location":
                            if (message.location) {
                                metadata = {
                                    media_type: "location",
                                    latitude: message.location.latitude,
                                    longitude: message.location.longitude,
                                    location_name: message.location.name,
                                    location_address: message.location.address
                                }
                            }
                            break

                        case "contact":
                            if (message.contacts && message.contacts[0]) {
                                const contact = message.contacts[0]
                                metadata = {
                                    media_type: "contact",
                                    contact_name: contact.name?.formatted_name,
                                    contact_phone: contact.phones?.[0]?.phone
                                }
                            }
                            break

                        case "interactive":
                            if (message.interactive) {
                                metadata = {
                                    media_type: "interactive",
                                    interactive_data: JSON.stringify(message.interactive)
                                }
                            }
                            break

                        case "reaction":
                            if (message.reaction) {
                                metadata = {
                                    media_type: "reaction",
                                    reaction_emoji: message.reaction.emoji,
                                    reacts_to_message_id: message.reaction.message_id
                                }
                            }
                            break

                        case "order":
                            if (message.order) {
                                metadata = {
                                    media_type: "order",
                                    order_data: JSON.stringify(message.order)
                                }
                            }
                            break

                        case "system":
                            if (message.system) {
                                metadata = {
                                    media_type: "system",
                                    system_data: JSON.stringify(message.system)
                                }
                            }
                            break
                    }

                    // Prepare message data
                    const messageData: Record<string, unknown> = {
                        whatsapp_account_id: account.id,
                        sender_no: String(message.from),
                        receiver_no: account.phone_no,
                        meta_message_id: message.id,
                        message_type: messageType,
                        content: content,
                        status: "received",
                        created_at: new Date(),
                        updated_at: new Date(),

                        // Media fields - convert undefined to null
                        media_id: metadata.media_id || null,
                        media_url: metadata.media_url || null,
                        mime_type: metadata.mime_type || null,
                        caption: metadata.caption || null,
                        filename: metadata.filename || null,

                        // Location fields
                        latitude: metadata.latitude ? String(metadata.latitude) : null,
                        longitude: metadata.longitude ? String(metadata.longitude) : null,
                        location_name: metadata.location_name || null,
                        location_address: metadata.location_address || null,

                        // Contact fields
                        contact_name: metadata.contact_name || null,
                        contact_phone: metadata.contact_phone || null,
                    }

                    // Add metadata fields if they exist in schema
                    if (metadata.media_id) messageData.media_id = metadata.media_id
                    if (metadata.media_url) messageData.media_url = metadata.media_url
                    if (metadata.mime_type) messageData.mime_type = metadata.mime_type
                    if (metadata.caption) messageData.caption = metadata.caption
                    if (metadata.filename) messageData.filename = metadata.filename
                    if (metadata.latitude) messageData.latitude = String(metadata.latitude)
                    if (metadata.longitude) messageData.longitude = String(metadata.longitude)
                    if (metadata.location_name) messageData.location_name = metadata.location_name
                    if (metadata.location_address) messageData.location_address = metadata.location_address
                    if (metadata.contact_name) messageData.contact_name = metadata.contact_name
                    if (metadata.contact_phone) messageData.contact_phone = metadata.contact_phone

                    // Insert message
                    await db.insert(messagesTable).values(messageData as typeof messagesTable.$inferInsert)

                    console.log(`✅ Saved ${messageType} message from ${message.from}`)

                } catch (messageError) {
                    console.error(`Error processing message:`, messageError)
                    // Continue with next message
                }
            }
        }

        /* =========================
           PROCESS STATUS UPDATES
        ========================= */

        if (events.statuses && events.statuses.length > 0) {
            for (const statusEvent of events.statuses) {
                try {
                    if (!statusEvent.id) continue

                    console.log(`Updating status for message ${statusEvent.id} to ${statusEvent.status}`)

                    await db
                        .update(messagesTable)
                        .set({
                            status: statusEvent.status,
                            updated_at: new Date()
                        })
                        .where(eq(messagesTable.meta_message_id, statusEvent.id))

                    console.log(`✅ Updated status for message ${statusEvent.id}`)

                } catch (statusError) {
                    console.error(`Error updating status:`, statusError)
                }
            }
        }

        // Always return 200 OK to acknowledge receipt
        return NextResponse.json(
            {
                success: true,
                processed: {
                    messages: events.messages?.length || 0,
                    statuses: events.statuses?.length || 0
                }
            },
            { status: 200 }
        )

    } catch (error) {
        console.error("POST WEBHOOK ERROR:", error)

        // Always return 200 to prevent Meta from retrying (prevents duplicate processing)
        return NextResponse.json(
            {
                success: false,
                error: "Webhook processing completed with errors"
            },
            { status: 200 } // Always return 200 to acknowledge receipt
        )
    }
}