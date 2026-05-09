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

import { Pencil } from "lucide-react"

import { updatePhoneNumber } from "./actions"

export default function EditPhoneDialog({
    phone
}: any) {

    const [open, setOpen] =
        useState(false)

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >

            <DialogTrigger asChild>

                <Button
                    size="sm"
                    variant="outline"
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                </Button>

            </DialogTrigger>

            <DialogContent>

                <DialogHeader>

                    <DialogTitle>
                        Edit WhatsApp Account
                    </DialogTitle>

                </DialogHeader>

                <form
                    action={async (formData) => {

                        await updatePhoneNumber(
                            formData
                        )

                        setOpen(false)
                    }}
                    className="space-y-4 mt-4"
                >

                    <input
                        type="hidden"
                        name="id"
                        value={phone.id}
                    />

                    <Input
                        name="phone_no"
                        defaultValue={phone.phone_no}
                        placeholder="Phone Number"
                    />

                    <Input
                        name="phone_id"
                        defaultValue={phone.phone_id}
                        placeholder="Phone ID"
                    />

                    <Input
                        name="webhook_verify_token"
                        defaultValue={phone.webhook_verify_token}
                        placeholder="Webhook Verify Token"
                    />

                    <Input
                        name="meta_app_secret"
                        defaultValue={phone.meta_app_secret}
                        placeholder="Meta App Secret"
                    />

                    <Input
                        name="whatsapp_token"
                        defaultValue={phone.whatsapp_token}
                        placeholder="WhatsApp Token"
                    />

                    <Button
                        type="submit"
                        className="w-full"
                    >
                        Update Account
                    </Button>

                </form>

            </DialogContent>

        </Dialog>
    )
}