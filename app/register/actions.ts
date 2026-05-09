'use server'

import { db } from "@/db"
import { usersTable } from "@/db/schema"

import { eq } from "drizzle-orm"

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {

    const {
        fullName,
        email,
        age,
        password,
        confirmPassword
    } = Object.fromEntries(formData.entries())

    // Validation
    if (
        !fullName ||
        !email ||
        !age ||
        !password ||
        !confirmPassword
    ) {
        throw new Error("All fields are required")
    }

    if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
    }

    // Check existing user
    const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email as string))

    if (existingUser.length > 0) {
        throw new Error("Email already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
        password as string,
        10
    )

    // Insert user
    const insertedUser = await db
        .insert(usersTable)
        .values({
            name: fullName as string,
            email: email as string,
            age: parseInt(age as string),
            password: hashedPassword
        })
        .returning()

    const user = insertedUser[0]

    // Generate JWT
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: "7d"
        }
    )

    // Save token in cookie
    ;(await cookies()).set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7
    })

    // Redirect
    redirect("/dashboard")
}