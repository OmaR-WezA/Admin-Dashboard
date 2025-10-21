"use client"

import { useState } from "react"
import { db } from "@/lib/firebase"
import { ref, update } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeviceDetailModal } from "./device-detail-modal"

export function DeviceList({ devices }: { devices: any[] }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<any>(null)

  const toggleDevice = async (deviceId: string, currentStatus: string) => {
    setLoading(deviceId)
    try {
      const response = await fetch("/api/devices/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          action: currentStatus === "active" ? "disable" : "enable",
        }),
      })

      if (response.ok) {
        await update(ref(db, `devices/${deviceId}`), {
          status: currentStatus === "active" ? "inactive" : "active",
        })
      }
    } catch (error) {
      console.error("Error updating device:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Connected Devices</h2>
            <p className="text-sm text-muted">Total: {devices.length}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {devices.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center text-muted">No devices connected yet</CardContent>
            </Card>
          ) : (
            devices.map((device) => (
              <Card key={device.id} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{device.deviceName}</CardTitle>
                      <CardDescription className="text-xs">ID: {device.id}</CardDescription>
                    </div>
                    <Badge
                      className={device.status === "active" ? "bg-success text-background" : "bg-muted text-background"}
                    >
                      {device.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted">Messages Sent</p>
                      <p className="text-lg font-semibold text-primary">{device.totalMessages || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted">Failed</p>
                      <p className="text-lg font-semibold text-error">{device.failedMessages || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted">Last Active</p>
                      <p className="text-sm">
                        {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "Never"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">Version</p>
                      <p className="text-sm">{device.version || "Unknown"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      onClick={() => toggleDevice(device.id, device.status)}
                      disabled={loading === device.id}
                      className={
                        device.status === "active"
                          ? "bg-error hover:bg-red-600 text-background"
                          : "bg-success hover:bg-green-600 text-background"
                      }
                    >
                      {loading === device.id ? "Updating..." : device.status === "active" ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      onClick={() => setSelectedDevice(device)}
                      variant="outline"
                      className="border-border bg-transparent"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedDevice && (
        <DeviceDetailModal
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
          onRefresh={() => {
            setSelectedDevice(null)
          }}
        />
      )}
    </>
  )
}
