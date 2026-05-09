// app/dashboard/messages/window.tsx

"use client"

import {
    Avatar,
    AvatarFallback
} from "@/components/ui/avatar"

import { Input } from "@/components/ui/input"

import { Button } from "@/components/ui/button"

import { Send } from "lucide-react"

export default function ChatWindow() {

    return (
        <div className="flex-1 flex flex-col bg-background">

            {/* Top */}
            <div className="h-16 border-b px-6 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <Avatar>

                        <AvatarFallback>
                            U
                        </AvatarFallback>

                    </Avatar>

                    <div>

                        <div className="font-medium">
                            Select a chat
                        </div>

                        <div className="text-xs text-muted-foreground">
                            WhatsApp Messages
                        </div>

                    </div>

                </div>

            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

                <div className="flex justify-start">

                    <div className="
                        bg-muted
                        rounded-2xl
                        px-4
                        py-3
                        max-w-[70%]
                    ">
                        No chat selected
                    </div>

                </div>

            </div>

            {/* Input */}
            <div className="border-t p-4">

                <form className="flex items-center gap-3">

                    <Input
                        placeholder="Type a message..."
                    />

                    <Button
                        type="submit"
                        size="icon"
                    >

                        <Send className="h-4 w-4" />

                    </Button>

                </form>

            </div>

        </div>
    )
}