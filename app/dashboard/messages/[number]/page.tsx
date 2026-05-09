// app/dashboard/messages/[number]/page.tsx

import { db } from "@/db"
import {
    messagesTable,
    whatsappaccounttable
} from "@/db/schema"
import { eq, or, and } from "drizzle-orm"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import MessagesSidebar from "../sidebar"
import ChatClient from "./ChatClient"

export default async function ChatPage({
    params
}: {
    params: Promise<{
        number: string
    }>
}) {

    // Dynamic number (receiver number for this chat)
    const { number } = await params
    const cleanNumber = number.replace(/[+\s]/g, "")

    // Auth
    const token = (await cookies())
        .get("token")
        ?.value

    if (!token) {
        throw new Error("Unauthorized")
    }

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as {
        id: number
    }

    // User accounts
    const accounts = await db
        .select()
        .from(whatsappaccounttable)
        .where(
            eq(
                whatsappaccounttable.userid,
                decoded.id
            )
        )

    // Get first account (or let user select which account to use)
    const defaultAccount = accounts[0]

    // All messages for sidebar
    const allMessages = await db
        .select()
        .from(messagesTable)
        .where(
            or(
                // Messages where user's account is sender
                eq(messagesTable.sender_no, defaultAccount?.phone_no || ""),
                // Messages where user's account is receiver
                eq(messagesTable.receiver_no, defaultAccount?.phone_no || "")
            )
        )

    // Current chat messages between the selected number and user's WhatsApp number
    const initialMessages = await db
        .select()
        .from(messagesTable)
        .where(
            or(
                // Messages sent TO the chat number FROM user's WhatsApp
                and(
                    eq(messagesTable.receiver_no, cleanNumber),
                    eq(messagesTable.sender_no, defaultAccount?.phone_no || "")
                ),
                // Messages received FROM the chat number TO user's WhatsApp
                and(
                    eq(messagesTable.sender_no, cleanNumber),
                    eq(messagesTable.receiver_no, defaultAccount?.phone_no || "")
                )
            )
        )
        .orderBy(messagesTable.created_at)

    return (
        <div className="h-[calc(100vh-48px)] flex overflow-hidden rounded-2xl border bg-background">
        <ChatClient 
            initialMessages={initialMessages}
            accounts={accounts}
            defaultAccount={defaultAccount}
            chatNumber={cleanNumber}
            />
            </div>
    )
}