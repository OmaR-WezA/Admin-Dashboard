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
        const { deviceId } = body

        if (!deviceId) {
            return NextResponse.json({ error: "Missing deviceId" }, { status: 400 })
        }

        const deviceRef = db.ref(`devices/${deviceId}`)
        await deviceRef.update({
            lastSeen: new Date().toISOString(),
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error sending heartbeat:", error)
        return NextResponse.json({ error: "Failed to send heartbeat" }, { status: 500 })
    }
}
