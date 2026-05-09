// app/dashboard/messages/[number]/actions.ts

"use server"

import { db } from "@/db"
import {
    messagesTable,
    whatsappaccounttable
} from "@/db/schema"
import { eq } from "drizzle-orm"
import {
    WhatsAppClient
} from "@kapso/whatsapp-cloud-api"
import { revalidatePath } from "next/cache"

export async function sendMessage(
    formData: FormData
) {
    try {
        // Form data
        const number = formData.get("number") as string
        const message = formData.get("message") as string
        const whatsapp_account_id = Number(
            formData.get("whatsapp_account_id")
        )

        // Validation
        if (!number || !message || !whatsapp_account_id) {
            return { 
                error: "Missing required fields: number, message, or account ID" 
            }
        }

        // Validate phone number format (remove any + or spaces)
        const cleanNumber = number.replace(/[+\s]/g, "")
        
        if (!cleanNumber.match(/^\d{10,15}$/)) {
            return {
                error: "Invalid phone number format. Please use international format without + or spaces (e.g., 919876543210)"
            }
        }

        // Find account
        const accounts = await db
            .select()
            .from(whatsappaccounttable)
            .where(eq(whatsappaccounttable.id, whatsapp_account_id))
            .limit(1)

        if (accounts.length === 0) {
            return { error: "WhatsApp account not found" }
        }

        const account = accounts[0]

        // Validate account credentials
        if (!account.whatsapp_token || !account.phone_id) {
            return { 
                error: "WhatsApp account is not properly configured. Missing token or phone ID." 
            }
        }

        /* =========================
           DEBUG LOGS
        ========================= */
        console.log("📱 Sending WhatsApp message:", {
            phone_id: account.phone_id,
            token_preview: account.whatsapp_token.substring(0, 20) + "...",
            to: cleanNumber,
            message_preview: message.substring(0, 50)
        })

        /* =========================
           WHATSAPP CLIENT
        ========================= */

        console.log(account)
        console.log("\n\n\n\n\n\n...............................................................")

        // Initialize client with access token
        const client = new WhatsAppClient({
            accessToken: account.whatsapp_token.trim()
        })

        /* =========================
           SEND MESSAGE
        ========================= */
        // Using sendText method as per docs
        const response = await client.messages.sendText({
            phoneNumberId: account.phone_id.trim(),
            to: cleanNumber, // Should be in international format without +
            body: message
        })

        console.log("✅ WhatsApp Response:", response)

        /* =========================
           SAVE MESSAGE TO DATABASE
        ========================= */
        const [savedMessage] = await db
            .insert(messagesTable)
            .values({
                whatsapp_account_id: account.id,
                sender_no: account.phone_no,
                receiver_no: cleanNumber,
                meta_message_id: response.messages?.[0]?.id || null,
                message_type: "text",
                content: message,
                status: "sent"
            })
            .returning()

        /* =========================
           REFRESH PAGE
        ========================= */
        revalidatePath(`/dashboard/messages/${cleanNumber}`)

        return {
            success: true,
            messageId: response.messages?.[0]?.id,
            data: savedMessage
        }

    } catch (error: any) {
        console.error("❌ SEND MESSAGE ERROR:", error)

        // Handle different types of errors
        if (error.response?.data?.error) {
            const metaError = error.response.data.error
            console.error("Meta API Error:", metaError)
            
            // Specific error messages
            if (metaError.code === 190) {
                return { error: "Access token expired or invalid. Please update your WhatsApp token." }
            }
            if (metaError.code === 100) {
                return { error: "Invalid phone number ID or number format. Please check your configuration." }
            }
            if (metaError.code === 131026) {
                return { error: "The recipient is not opted in to receive messages from this business." }
            }
            return { error: metaError.message || "WhatsApp API error" }
        }

        // Network or other errors
        return { 
            error: error.message || "Failed to send message. Please check your network connection." 
        }
    }
}