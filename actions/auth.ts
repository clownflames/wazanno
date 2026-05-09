import { cookies } from "next/headers"
import * as jwt from 'jsonwebtoken'

export async function GetId() {
     // Get token
        const token = (await cookies())
            .get("token")
            ?.value
    
        if (!token) {
            throw new Error("Unauthorized")
        }
    
        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {
            id: number
        }
        return decoded.id
}