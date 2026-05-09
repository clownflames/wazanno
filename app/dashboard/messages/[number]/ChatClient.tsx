// app/dashboard/messages/[number]/ChatClient.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import MessagesSidebar from "../sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Send, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { sendMessage } from "./actions"
import { useRouter } from "next/navigation"

interface ChatClientProps {
    initialMessages: any[]
    accounts: any[]
    defaultAccount: any
    chatNumber: string
}

export default function ChatClient({
    initialMessages,
    accounts,
    defaultAccount,
    chatNumber
}: ChatClientProps) {
    const [messages, setMessages] = useState(initialMessages)
    const [isSending, setIsSending] = useState(false)
    const [messageText, setMessageText] = useState("")
    const [countdown, setCountdown] = useState(5)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [selectedAccount, setSelectedAccount] = useState(defaultAccount)
    
    const router = useRouter()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const countdownRef = useRef<NodeJS.Timeout | null>(null)

    // Auto-refresh every 5 seconds
    useEffect(() => {
        if (autoRefresh && chatNumber && selectedAccount) {
            startAutoRefresh()
        }
        
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (countdownRef.current) clearInterval(countdownRef.current)
        }
    }, [autoRefresh, chatNumber, selectedAccount])

    const startAutoRefresh = () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (countdownRef.current) clearInterval(countdownRef.current)
        
        setCountdown(5)
        
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    return 5
                }
                return prev - 1
            })
        }, 1000)
        
        intervalRef.current = setInterval(async () => {
            if (chatNumber && selectedAccount && !isRefreshing) {
                await refreshMessages()
            }
        }, 5000)
    }

    const refreshMessages = async () => {
        if (!chatNumber || !selectedAccount) return
        
        setIsRefreshing(true)
        try {
            const response = await fetch(`/api/chat/messages?number=${encodeURIComponent(chatNumber)}`)
            if (response.ok) {
                const data = await response.json()
                setMessages(data.messages)
                setCountdown(5)
                scrollToBottom()
            }
        } catch (error) {
            console.error("Refresh error:", error)
        } finally {
            setIsRefreshing(false)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!messageText.trim() || isSending || !selectedAccount) return
        
        setIsSending(true)
        
        const formData = new FormData()
        formData.append("whatsapp_account_id", selectedAccount.id.toString())
        formData.append("number", chatNumber)
        formData.append("message", messageText)
        
        try {
            const result = await sendMessage(formData)
            
            if (result.success) {
                setMessageText("")
                if (textareaRef.current) {
                    textareaRef.current.style.height = "auto"
                }
                await refreshMessages()
                router.refresh()
            } else {
                alert(result.error || "Failed to send message")
            }
        } catch (error) {
            console.error("Send error:", error)
            alert("Failed to send message")
        } finally {
            setIsSending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage(e)
        }
    }

    const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageText(e.target.value)
        e.target.style.height = "auto"
        e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`
    }

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    if (!selectedAccount) {
        return (
            <div className="h-screen/2 flex items-center justify-center bg-background">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading chat...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex bg-background" style={{boxSizing:"border-box"}}> 
            {/* Sidebar */}
            <div className="w-80 border-r bg-card flex flex-col">
                <MessagesSidebar
                    accounts={accounts}
                    messages={messages}
                />
            </div>

            {/* Chat Window - Full remaining width */}
            <div className="flex-1 flex flex-col h-full bg-background">
                {/* Header */}
                <div className="h-16 border-b px-6 flex items-center justify-between bg-card shrink-0">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {chatNumber.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-semibold">
                                {chatNumber}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                WhatsApp Chat
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Auto-refresh toggle */}
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`text-xs px-3 py-1.5 rounded-full transition font-medium ${
                                autoRefresh 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            Auto {autoRefresh ? "ON" : "OFF"}
                        </button>
                        
                        {/* Timer Display */}
                        {autoRefresh && (
                            <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-full">
                                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                                <span className="font-mono text-xs font-medium">
                                    {countdown}s
                                </span>
                            </div>
                        )}
                        
                        {/* Manual refresh button */}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={refreshMessages}
                            disabled={isRefreshing}
                            className="h-8 w-8 p-0"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        </Button>

                        {/* Account selector */}
                        {accounts.length > 1 && (
                            <select 
                                className="text-sm border rounded-lg px-3 py-1.5 bg-background"
                                value={selectedAccount.id}
                                onChange={(e) => {
                                    const selected = accounts.find(a => a.id === parseInt(e.target.value))
                                    setSelectedAccount(selected)
                                }}
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.account_name || acc.phone_no}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Messages - Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background to-muted/5">
                    {messages.length > 0 ? (
                        <>
                            {messages.map((message, index) => {
                                const isIncoming = 
                                    message.sender_no === chatNumber && 
                                    message.receiver_no === selectedAccount?.phone_no

                                return (
                                    <div
                                        key={message.id}
                                        className={`flex ${isIncoming ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className={`flex max-w-[70%] ${isIncoming ? "flex-row" : "flex-row-reverse"} gap-2`}>
                                            {isIncoming && (
                                                <Avatar className="h-8 w-8 mt-1">
                                                    <AvatarFallback className="text-xs">
                                                        {chatNumber.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <Card
                                                className={`
                                                    px-4 py-2.5 rounded-2xl shadow-sm
                                                    ${isIncoming
                                                        ? "bg-muted/80 border-muted"
                                                        : "bg-primary text-primary-foreground border-primary/80"
                                                    }
                                                `}
                                            >
                                                <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                                                    {message.content}
                                                </p>
                                                <div className={`
                                                    text-xs mt-1.5 flex items-center gap-2
                                                    ${isIncoming ? "text-muted-foreground" : "text-primary-foreground/80"}
                                                `}>
                                                    <span className="font-mono">
                                                        {new Date(message.created_at!).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    {!isIncoming && message.status && (
                                                        <span className="text-xs">
                                                            {message.status === "sent" && "✓"}
                                                            {message.status === "delivered" && "✓✓"}
                                                            {message.status === "read" && "✓✓"}
                                                            {message.status === "failed" && "⚠️"}
                                                        </span>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">
                                    No messages yet with {chatNumber}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Send a message to start the conversation
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input - Fixed at bottom */}
                <div className="border-t bg-card p-4 shrink-0">
                    <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
                                className="
                                    w-full 
                                    min-h-[44px] 
                                    max-h-[100px] 
                                    p-3 
                                    rounded-xl 
                                    border 
                                    bg-background 
                                    resize-none
                                    focus:outline-none 
                                    focus:ring-2 
                                    focus:ring-primary/20
                                    focus:border-primary
                                    transition-all
                                    text-sm
                                    leading-relaxed
                                "
                                value={messageText}
                                onChange={autoResizeTextarea}
                                onKeyDown={handleKeyDown}
                                disabled={isSending}
                                rows={1}
                                style={{
                                    scrollbarWidth: 'thin'
                                }}
                            />
                        </div>
                        
                        <Button
                            type="submit"
                            size="icon"
                            className="h-11 w-11 shrink-0 rounded-xl"
                            disabled={isSending || !messageText.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

// Import MessageCircle for empty state
import { MessageCircle } from "lucide-react"