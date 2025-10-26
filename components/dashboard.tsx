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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function Dashboard() {
  const [devices, setDevices] = useState<any[]>([])
  const [stats, setStats] = useState({ totalMessages: 0, failedMessages: 0, activeDevices: 0 })
  const [activeTab, setActiveTab] = useState("overview")
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const devicesRef = ref(db, "devices")
    const unsubscribe = onValue(
      devicesRef,
      (snapshot) => {
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
        } else {
          setDevices([])
          setStats({ totalMessages: 0, failedMessages: 0, activeDevices: 0 })
        }
      },
      (error) => {
        console.error("[v0] Firebase error:", error)
      },
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const logsRef = ref(db, "logs")
    const unsubscribe = onValue(logsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const logList = Array.isArray(data) ? data : Object.values(data)
        setLogs(logList as string[])
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
  }

  const handleBroadcastMessage = async () => {
    if (!broadcastMessage.trim()) {
      alert("Please enter a message")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/devices/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: broadcastMessage,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        alert("Message broadcasted to all devices!")
        setBroadcastMessage("")
        setShowBroadcast(false)
      } else {
        alert("Failed to broadcast message")
      }
    } catch (error) {
      console.error("Error broadcasting:", error)
      alert("Error broadcasting message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">WhatsApp Sender Admin</h1>
            <p className="text-sm text-muted-foreground">Manage all instances</p>
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
              className={`py-4 px-2 border-b-2 transition-colors ${activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.totalMessages}</div>
                  <p className="text-xs text-muted-foreground mt-1">All devices combined</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Failed Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{stats.failedMessages}</div>
                  <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">{stats.activeDevices}</div>
                  <p className="text-xs text-muted-foreground mt-1">Currently running</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button
                  onClick={() => setShowBroadcast(true)}
                  className="bg-primary hover:bg-primary text-primary-foreground"
                >
                  Broadcast Message
                </Button>
                <Button onClick={() => setShowLogs(true)} variant="outline" className="border-border">
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

      {/* Broadcast Message Dialog */}
      <Dialog open={showBroadcast} onOpenChange={setShowBroadcast}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Broadcast Message to All Devices</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter message to send to all connected devices..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="bg-background border-border text-foreground"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowBroadcast(false)} className="border-border">
                Cancel
              </Button>
              <Button
                onClick={handleBroadcastMessage}
                disabled={loading}
                className="bg-primary text-primary-foreground"
              >
                {loading ? "Sending..." : "Send to All"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Logs Dialog */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">System Logs</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 bg-background p-4 rounded border border-border">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No logs available</p>
            ) : (
              logs.map((log, idx) => (
                <p key={idx} className="text-xs text-muted-foreground font-mono">
                  {log}
                </p>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
