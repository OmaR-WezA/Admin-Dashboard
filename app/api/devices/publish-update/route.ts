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
        const { version, downloadUrl, changelog } = body

        if (!version || !downloadUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const updateData = {
            version,
            downloadUrl,
            changelog,
            publishedAt: new Date().toISOString(),
        }

        // Save to updates history
        const updateRef = db.ref(`updates/${Date.now()}`)
        await updateRef.set(updateData)

        // Set as latest update for all devices to check
        const latestRef = db.ref("latestUpdate")
        await latestRef.set(updateData)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error publishing update:", error)
        return NextResponse.json({ error: "Failed to publish update" }, { status: 500 })
    }
}
