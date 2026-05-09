// app/api/chat/messages/route.ts

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { messagesTable, whatsappaccounttable } from "@/db/schema"
import { eq, or, and } from "drizzle-orm"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
    try {
        const number = request.nextUrl.searchParams.get("number")
        if (!number) {
            return NextResponse.json({ error: "Number required" }, { status: 400 })
        }

        const token = (await cookies()).get("token")?.value
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }

        const accounts = await db
            .select()
            .from(whatsappaccounttable)
            .where(eq(whatsappaccounttable.userid, decoded.id))

        if (accounts.length === 0) {
            return NextResponse.json({ messages: [] })
        }

        const defaultAccount = accounts[0]
        const cleanNumber = number.replace(/[+\s]/g, "")

        const messages = await db
            .select()
            .from(messagesTable)
            .where(
                or(
                    and(
                        eq(messagesTable.receiver_no, cleanNumber),
                        eq(messagesTable.sender_no, defaultAccount.phone_no)
                    ),
                    and(
                        eq(messagesTable.sender_no, cleanNumber),
                        eq(messagesTable.receiver_no, defaultAccount.phone_no)
                    )
                )
            )
            .orderBy(messagesTable.created_at)

        return NextResponse.json({ messages })
    } catch (error) {
        console.error("API Error:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}