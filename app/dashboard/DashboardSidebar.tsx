"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    LayoutDashboard,
    Phone,
    MessageSquare,
    FileText,
    Bot,
    Send,
    LogOut
} from "lucide-react"

const links = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard
    },
    {
        name: "Phone No",
        href: "/dashboard/phoneno",
        icon: Phone
    },
    {
        name: "Messages",
        href: "/dashboard/messages",
        icon: MessageSquare
    },
    {
        name: "Templates",
        href: "/dashboard/templates",
        icon: FileText
    },
    {
        name: "Automations",
        href: "/dashboard/automations",
        icon: Bot
    },
    {
        name: "Bulk Send",
        href: "/dashboard/bulk-send",
        icon: Send
    }
]

export default function DashboardSidebar() {

    const pathname = usePathname()

    return (
        <div className="w-[280px] h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col">

            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-zinc-800">
                <h1 className="text-2xl font-black tracking-tight text-white">
                    WAZANNO
                </h1>
            </div>

            {/* Links */}
            <div className="flex-1 p-4 space-y-2">

                {links.map((link) => {

                    const Icon = link.icon

                    const active = pathname === link.href

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`
                                flex items-center gap-3
                                px-4 py-3
                                rounded-2xl
                                transition-all
                                text-sm font-medium
                                ${active
                                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                }
                            `}
                        >

                            <Icon size={20} />

                            <span>
                                {link.name}
                            </span>

                        </Link>
                    )
                })}

            </div>

            {/* Logout */}
            <div className="p-4 border-t border-zinc-800">

                <button
                    className="
                        w-full
                        flex items-center gap-3
                        px-4 py-3
                        rounded-2xl
                        text-red-400
                        hover:bg-red-500/10
                        transition-all
                    "
                >

                    <LogOut size={20} />

                    <span className="text-sm font-medium">
                        Logout
                    </span>

                </button>

            </div>

        </div>
    )
}