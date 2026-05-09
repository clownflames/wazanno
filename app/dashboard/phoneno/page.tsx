import { db } from "@/db"
import { whatsappaccounttable } from "@/db/schema"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"

import AddPhoneNoDialog from "./phone-dialog"

import EditPhoneDialog from "./edit-phone-dialog"

import CopyButton from "./copy-button"

import { eq } from "drizzle-orm"

import { cookies } from "next/headers"

import jwt from "jsonwebtoken"

export default async function PhoneNoPage() {

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

    const phones = await db
        .select()
        .from(whatsappaccounttable)
        .where(
            eq(
                whatsappaccounttable.userid,
                decoded.id
            )
        )

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold tracking-tight">
                        Phone Numbers
                    </h1>

                    <p className="text-muted-foreground mt-1">
                        Manage your WhatsApp accounts
                    </p>

                </div>

                <AddPhoneNoDialog />

            </div>

            <Card>

                <CardHeader>

                    <CardTitle>
                        WhatsApp Accounts
                    </CardTitle>

                    <CardDescription>
                        All connected phone numbers
                    </CardDescription>

                </CardHeader>

                <CardContent>

                    <div className="rounded-xl border overflow-hidden">

                        <Table>

                            <TableHeader>

                                <TableRow>

                                    <TableHead>ID</TableHead>

                                    <TableHead>
                                        Phone Number
                                    </TableHead>

                                    <TableHead>
                                        Phone ID
                                    </TableHead>

                                    <TableHead>
                                        Verify Token
                                    </TableHead>

                                    <TableHead>
                                        Webhook URL
                                    </TableHead>

                                    <TableHead>
                                        Actions
                                    </TableHead>

                                </TableRow>

                            </TableHeader>

                            <TableBody>

                                {phones.length > 0 ? (

                                    phones.map((phone) => {

                                        const webhookUrl =
`${process.env.NEXT_PUBLIC_APP_URL}/webhook/${phone.id}`

                                        return (

                                            <TableRow
                                                key={phone.id}
                                            >

                                                <TableCell className="font-medium">
                                                    #{phone.id}
                                                </TableCell>

                                                <TableCell>
                                                    {phone.phone_no}
                                                </TableCell>

                                                <TableCell>
                                                    {phone.phone_id}
                                                </TableCell>

                                                <TableCell className="max-w-[200px] truncate">
                                                    {phone.webhook_verify_token}
                                                </TableCell>

                                                <TableCell>

                                                    <div className="flex items-center gap-2">

                                                        <div className="max-w-[220px] truncate text-sm text-muted-foreground">
                                                            {webhookUrl}
                                                        </div>

                                                        <CopyButton
                                                            text={webhookUrl}
                                                        />

                                                    </div>

                                                </TableCell>

                                                <TableCell>

                                                    <EditPhoneDialog
                                                        phone={phone}
                                                    />

                                                </TableCell>

                                            </TableRow>

                                        )
                                    })

                                ) : (

                                    <TableRow>

                                        <TableCell
                                            colSpan={6}
                                            className="text-center h-24 text-muted-foreground"
                                        >
                                            No phone numbers added
                                        </TableCell>

                                    </TableRow>

                                )}

                            </TableBody>

                        </Table>

                    </div>

                </CardContent>

            </Card>

        </div>
    )
}