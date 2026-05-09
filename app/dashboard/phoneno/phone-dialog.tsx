"use client"

import { useState } from "react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"

import { Button } from "@/components/ui/button"

import { addPhoneNumber } from "./actions"

export default function AddPhoneNoDialog() {

    const [open, setOpen] =
        useState(false)

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >

            <DialogTrigger asChild>

                <Button>
                    Add Phone No
                </Button>

            </DialogTrigger>

            <DialogContent>

                <DialogHeader>

                    <DialogTitle>
                        Add WhatsApp Account
                    </DialogTitle>

                </DialogHeader>

                <form
                    action={async (
                        formData
                    ) => {

                        await addPhoneNumber(
                            formData
                        )

                        setOpen(false)
                    }}
                    className="space-y-4 mt-4"
                >

                    {/* Account Name */}
                    <Input
                        name="account_name"
                        placeholder="Account Name"
                    />

                    {/* Phone Number */}
                    <Input
                        name="phone_no"
                        placeholder="Phone Number"
                    />

                    {/* Phone ID */}
                    <Input
                        name="phone_id"
                        placeholder="Phone Number ID"
                    />

                    {/* WhatsApp Token */}
                    <Input
                        name="whatsapp_token"
                        placeholder="Permanent Access Token"
                    />

                    {/* Webhook Verify Token */}
                    <Input
                        name="webhook_verify_token"
                        placeholder="Webhook Verify Token"
                    />

                    {/* Meta App Secret */}
                    <Input
                        name="meta_app_secret"
                        placeholder="Meta App Secret"
                    />

                    <Button
                        type="submit"
                        className="w-full"
                    >
                        Add Account
                    </Button>

                </form>

            </DialogContent>

        </Dialog>
    )
}