import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getDatabase } from "firebase-admin/database"
import { type NextRequest, NextResponse } from "next/server"

// Initialize Firebase Admin
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
    const { deviceId, deviceName, version } = body

    if (!deviceId || !deviceName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const deviceRef = db.ref(`devices/${deviceId}`)
    await deviceRef.set({
      deviceName,
      version,
      status: "active",
      lastSeen: new Date().toISOString(),
      totalMessages: 0,
      failedMessages: 0,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, deviceId })
  } catch (error) {
    console.error("Error registering device:", error)
    return NextResponse.json({ error: "Failed to register device" }, { status: 500 })
  }
}
