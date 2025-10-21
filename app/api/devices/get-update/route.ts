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
    const latestUpdateRef = db.ref("latestUpdate")
    const snapshot = await latestUpdateRef.once("value")
    const data = snapshot.val()

    return NextResponse.json({ update: data || null })
  } catch (error) {
    console.error("Error getting update:", error)
    return NextResponse.json({ error: "Failed to get update" }, { status: 500 })
  }
}
