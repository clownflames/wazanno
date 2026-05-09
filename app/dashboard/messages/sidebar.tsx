"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
    Avatar,
    AvatarFallback
} from "@/components/ui/avatar"
import {
    Search,
    MessageCircle
} from "lucide-react"
import { useState } from "react"

export default function MessagesSidebar({
    messages,
    accounts
}: any) {

    const pathname = usePathname()
    const [searchQuery, setSearchQuery] = useState("")

    // Get current user's WhatsApp numbers (sender numbers)
    const userPhoneNumbers = accounts?.map((acc: any) => acc.phone_no) || []

    // Create unique chats based on BOTH sender and receiver
    const getChatPartner = (message: any) => {
        // If message is sent by user, chat partner is receiver_no
        if (userPhoneNumbers.includes(message.sender_no)) {
            return message.receiver_no
        }
        // If message is received by user, chat partner is sender_no
        return message.sender_no
    }

    // Create a map of unique chat partners
    const chatMap = new Map()

    messages.forEach((message: any) => {
        const chatPartner = getChatPartner(message)
        
        if (!chatMap.has(chatPartner)) {
            chatMap.set(chatPartner, {
                phoneNumber: chatPartner,
                lastMessage: message.content,
                lastMessageTime: message.created_at,
                lastMessageType: message.message_type,
                lastMessageStatus: message.status
            })
        } else {
            // Update last message if this is newer
            const existing = chatMap.get(chatPartner)
            if (new Date(message.created_at) > new Date(existing.lastMessageTime)) {
                existing.lastMessage = message.content
                existing.lastMessageTime = message.created_at
                existing.lastMessageType = message.message_type
                existing.lastMessageStatus = message.status
            }
        }
    })

    // Convert to array and sort by last message time
    let uniqueChats = Array.from(chatMap.values())
        .sort((a, b) => 
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        )

    // Filter chats based on search
    if (searchQuery) {
        uniqueChats = uniqueChats.filter(chat =>
            chat.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }

    return (
        <div className="
            w-[340px]
            border-r
            bg-card
            flex
            flex-col
        ">

            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <h1 className="text-xl font-bold">
                        Messages
                    </h1>
                </div>

                {/* Search */}
                <div className="relative mt-4">
                    <Search className="
                        absolute
                        left-3
                        top-3
                        h-4
                        w-4
                        text-muted-foreground
                    " />
                    <Input
                        placeholder="Search chats..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Chats */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {uniqueChats.length > 0 ? (
                        uniqueChats.map((chat: any) => {
                            const active = pathname === `/dashboard/messages/${chat.phoneNumber}`

                            return (
                                <Link
                                    key={chat.phoneNumber}
                                    href={`/dashboard/messages/${chat.phoneNumber}`}
                                    className={`
                                        w-full
                                        flex
                                        items-center
                                        gap-3
                                        p-3
                                        rounded-xl
                                        transition
                                        mb-1

                                        ${
                                            active
                                                ? `
                                                    bg-primary
                                                    text-primary-foreground
                                                    shadow-sm
                                                  `
                                                : `
                                                    hover:bg-muted/50
                                                    border
                                                    border-transparent
                                                  `
                                        }
                                    `}
                                >
                                    {/* Avatar */}
                                    <Avatar className={active ? "border-2 border-primary-foreground/20" : ""}>
                                        <AvatarFallback className={active ? "bg-primary-foreground/10" : "bg-muted"}>
                                            {chat.phoneNumber.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Chat Info */}
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <div className="font-medium truncate text-sm">
                                                {chat.phoneNumber}
                                            </div>
                                            <div className="text-xs opacity-70">
                                                {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>

                                        <div className={`
                                            text-xs
                                            truncate
                                            flex
                                            items-center
                                            gap-1
                                            mt-0.5

                                            ${
                                                active
                                                    ? "text-primary-foreground/70"
                                                    : "text-muted-foreground"
                                            }
                                        `}>
                                            {!active && chat.lastMessageStatus === "sent" && (
                                                <span className="text-xs">✓</span>
                                            )}
                                            <span>
                                                {chat.lastMessageType === "text" 
                                                    ? chat.lastMessage 
                                                    : `📎 ${chat.lastMessageType}`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })
                    ) : (
                        <div className="
                            h-[300px]
                            flex
                            items-center
                            justify-center
                            text-sm
                            text-muted-foreground
                        ">
                            {searchQuery ? "No chats found" : "No messages yet"}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}