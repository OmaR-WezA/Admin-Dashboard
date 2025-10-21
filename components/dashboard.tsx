"use client"

import { useState, useEffect } from "react"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeviceList } from "./device-list"
import { Analytics } from "./analytics"
import { UpdateManager } from "./update-manager"

export function Dashboard() {
  const [devices, setDevices] = useState<any[]>([])
  const [stats, setStats] = useState({ totalMessages: 0, failedMessages: 0, activeDevices: 0 })
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const devicesRef = ref(db, "devices")
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const deviceList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }))
        setDevices(deviceList)

        let totalMessages = 0
        let failedMessages = 0
        let activeCount = 0
        deviceList.forEach((device) => {
          totalMessages += device.totalMessages || 0
          failedMessages += device.failedMessages || 0
          if (device.status === "active") activeCount += 1
        })

        setStats({
          totalMessages,
          failedMessages,
          activeDevices: activeCount,
        })
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">WhatsApp Sender Admin</h1>
            <p className="text-sm text-muted">Manage all instances</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-border bg-transparent">
            Logout
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "devices", label: "Devices" },
            { id: "analytics", label: "Analytics" },
            { id: "updates", label: "Updates" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted">Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.totalMessages}</div>
                  <p className="text-xs text-muted mt-1">All devices combined</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted">Failed Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-error">{stats.failedMessages}</div>
                  <p className="text-xs text-muted mt-1">Requires attention</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted">Active Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">{stats.activeDevices}</div>
                  <p className="text-xs text-muted mt-1">Currently running</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button className="bg-primary hover:bg-primary-dark text-background">Broadcast Message</Button>
                <Button variant="outline" className="border-border bg-transparent">
                  View Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "devices" && <DeviceList devices={devices} />}
        {activeTab === "analytics" && <Analytics devices={devices} />}
        {activeTab === "updates" && <UpdateManager />}
      </main>
    </div>
  )
}
