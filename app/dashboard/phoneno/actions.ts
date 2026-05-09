"use server"

import { db } from "@/db"

import {
    whatsappaccounttable
} from "@/db/schema"

import { eq } from "drizzle-orm"

import jwt from "jsonwebtoken"

import { cookies } from "next/headers"

import { revalidatePath } from "next/cache"





/* =========================
   ADD PHONE NUMBER
========================= */

export async function addPhoneNumber(
    formData: FormData
) {

    // Get JWT token
    const token = (await cookies())
        .get("token")
        ?.value

    if (!token) {
        throw new Error("Unauthorized")
    }

    // Verify token
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as {
        id: number
    }

    // Form fields
    const account_name =
        formData.get(
            "account_name"
        ) as string

    const phone_no =
        formData.get(
            "phone_no"
        ) as string

    const phone_id =
        formData.get(
            "phone_id"
        ) as string

    const whatsapp_token =
        formData.get(
            "whatsapp_token"
        ) as string

    const webhook_verify_token =
        formData.get(
            "webhook_verify_token"
        ) as string

    const meta_app_secret =
        formData.get(
            "meta_app_secret"
        ) as string

    // Validation
    if (
        !phone_no ||
        !phone_id ||
        !whatsapp_token ||
        !webhook_verify_token ||
        !meta_app_secret
    ) {
        throw new Error(
            "All fields are required"
        )
    }

    // Insert
    await db
        .insert(whatsappaccounttable)
        .values({

            userid: decoded.id,

            account_name,

            phone_no,

            phone_id,

            whatsapp_token,

            webhook_verify_token,

            meta_app_secret
        })

    // Refresh page
    revalidatePath(
        "/dashboard/phoneno"
    )
}





/* =========================
   UPDATE PHONE NUMBER
========================= */

export async function updatePhoneNumber(
    formData: FormData
) {

    // Get JWT token
    const token = (await cookies())
        .get("token")
        ?.value

    if (!token) {
        throw new Error("Unauthorized")
    }

    // Verify token
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as {
        id: number
    }

    // Form values
    const id =
        Number(
            formData.get("id")
        )

    const account_name =
        formData.get(
            "account_name"
        ) as string

    const phone_no =
        formData.get(
            "phone_no"
        ) as string

    const phone_id =
        formData.get(
            "phone_id"
        ) as string

    const webhook_verify_token =
        formData.get(
            "webhook_verify_token"
        ) as string

    const meta_app_secret =
        formData.get(
            "meta_app_secret"
        ) as string

    const whatsapp_token =
        formData.get(
            "whatsapp_token"
        ) as string

    // Check ownership
    const existing =
        await db
            .select()
            .from(
                whatsappaccounttable
            )
            .where(
                eq(
                    whatsappaccounttable.id,
                    id
                )
            )
            .limit(1)

    if (
        existing.length === 0
    ) {
        throw new Error(
            "Account not found"
        )
    }

    // Prevent editing others accounts
    if (
        existing[0].userid !==
        decoded.id
    ) {
        throw new Error(
            "Unauthorized"
        )
    }

    // Update
    await db
        .update(
            whatsappaccounttable
        )
        .set({

            account_name,

            phone_no,

            phone_id,

            webhook_verify_token,

            meta_app_secret,

            whatsapp_token
        })
        .where(
            eq(
                whatsappaccounttable.id,
                id
            )
        )

    // Refresh page
    revalidatePath(
        "/dashboard/phoneno"
    )
}