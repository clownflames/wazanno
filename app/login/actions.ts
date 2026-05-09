'use server'

import { db } from "@/db"
import { usersTable } from "@/db/schema"

import { eq } from "drizzle-orm"

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(
    email: string,
    password: string
): Promise<void> {

    // Find user
    const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)

    if (user.length === 0) {
        throw new Error("User not found")
    }

    const foundUser = user[0]

    // Compare password
    const isPasswordValid = await bcrypt.compare(
        password,
        foundUser.password
    )

    if (!isPasswordValid) {
        throw new Error("Invalid password")
    }

    // Generate JWT
    const token = jwt.sign(
        {
            id: foundUser.id,
            email: foundUser.email
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: "7d"
        }
    )

    // Save token in cookies
    ;(await cookies()).set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7
    })

    // Redirect after login
    redirect("/dashboard")
}