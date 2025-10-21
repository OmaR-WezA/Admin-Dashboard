import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getDatabase } from "firebase-admin/database"
import { type NextRequest, NextResponse } from "next/server"

const apps = getApps()
let db: any

if (apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}")
    initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })
}

db = getDatabase()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { message, timestamp } = body

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        const broadcastRef = db.ref(`broadcasts/${Date.now()}`)
        await broadcastRef.set({
            message,
            timestamp,
            createdAt: new Date().toISOString(),
        })

        const logsRef = db.ref(`logs/${Date.now()}`)
        await logsRef.set(`[${new Date().toLocaleString()}] Broadcast: ${message}`)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error broadcasting:", error)
        return NextResponse.json({ error: "Failed to broadcast message" }, { status: 500 })
    }
}
