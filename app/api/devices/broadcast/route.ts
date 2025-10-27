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
        const { message, timestamp, targetDevices } = body

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        const broadcastId = Date.now()

        const broadcastRef = db.ref(`broadcasts/${broadcastId}`)
        await broadcastRef.set({
            message,
            timestamp: timestamp || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            status: "pending",
            targetDevices: targetDevices || [],
        })

        const pendingRef = db.ref(`pending_broadcasts/${broadcastId}`)
        await pendingRef.set({
            message,
            timestamp: timestamp || new Date().toISOString(),
            createdAt: new Date().toISOString(),
        })

        // Log the broadcast
        const logsRef = db.ref(`logs/${broadcastId}`)
        await logsRef.set(`[${new Date().toLocaleString()}] Broadcast: ${message}`)

        console.log("[v0] Broadcast sent successfully:", { broadcastId, message })

        return NextResponse.json({
            success: true,
            broadcastId,
            message: "Broadcast sent to all devices",
        })
    } catch (error) {
        console.error("[v0] Error broadcasting:", error)
        return NextResponse.json({ error: "Failed to broadcast message" }, { status: 500 })
    }
}
