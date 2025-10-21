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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("deviceId")

    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 })
    }

    const controlRef = db.ref(`controls/${deviceId}`)
    const snapshot = await controlRef.once("value")
    const data = snapshot.val()

    return NextResponse.json({ control: data || null })
  } catch (error) {
    console.error("Error getting control:", error)
    return NextResponse.json({ error: "Failed to get control" }, { status: 500 })
  }
}
