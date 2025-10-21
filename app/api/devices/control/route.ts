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
    const { deviceId, action, data } = body

    if (!deviceId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const controlRef = db.ref(`controls/${deviceId}`)

    switch (action) {
      case "enable":
        await controlRef.set({ status: "active", timestamp: new Date().toISOString() })
        break
      case "disable":
        await controlRef.set({ status: "inactive", timestamp: new Date().toISOString() })
        break
      case "update":
        await controlRef.set({
          action: "update",
          version: data?.version,
          downloadUrl: data?.downloadUrl,
          timestamp: new Date().toISOString(),
        })
        break
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error controlling device:", error)
    return NextResponse.json({ error: "Failed to control device" }, { status: 500 })
  }
}
