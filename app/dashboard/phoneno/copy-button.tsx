"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import {
    Copy,
    Check
} from "lucide-react"

export default function CopyButton({
    text
}: {
    text: string
}) {

    const [copied, setCopied] =
        useState(false)

    async function handleCopy() {

        await navigator.clipboard
            .writeText(text)

        setCopied(true)

        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    return (
        <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={handleCopy}
        >

            {copied ? (
                <Check className="h-4 w-4" />
            ) : (
                <Copy className="h-4 w-4" />
            )}

        </Button>
    )
}