// app/dashboard/messages/page.tsx

import { db } from "@/db"

import {
    messagesTable,
    whatsappaccounttable
} from "@/db/schema"

import { eq } from "drizzle-orm"

import { cookies } from "next/headers"

import jwt from "jsonwebtoken"

import MessagesSidebar from "./sidebar"

import ChatWindow from "./window"

export default async function MessagesPage() {

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

    // Messages
    const messages = await db
        .select()
        .from(messagesTable)

    return (
        <div className="h-[calc(100vh-48px)] flex overflow-hidden rounded-2xl border bg-background">

            <MessagesSidebar
                accounts={accounts}
                messages={messages}
            />

            <ChatWindow />

        </div>
    )
}