"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface DeviceControlsProps {
  device: any
  onRefresh: () => void
}

export function DeviceControls({ device, onRefresh }: DeviceControlsProps) {
  const [loading, setLoading] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [updateVersion, setUpdateVersion] = useState("")
  const [updateUrl, setUpdateUrl] = useState("")

  const handleDisableDevice = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/devices/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: device.id,
          action: "disable",
        }),
      })

      if (response.ok) {
        alert("Device disabled successfully")
        onRefresh()
      }
    } catch (error) {
      console.error("Error disabling device:", error)
      alert("Failed to disable device")
    } finally {
      setLoading(false)
    }
  }

  const handleEnableDevice = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/devices/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: device.id,
          action: "enable",
        }),
      })

      if (response.ok) {
        alert("Device enabled successfully")
        onRefresh()
      }
    } catch (error) {
      console.error("Error enabling device:", error)
      alert("Failed to enable device")
    } finally {
      setLoading(false)
    }
  }

  const handleSendUpdate = async () => {
    if (!updateVersion || !updateUrl) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/devices/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: device.id,
          action: "update",
          data: {
            version: updateVersion,
            downloadUrl: updateUrl,
          },
        }),
      })

      if (response.ok) {
        alert("Update sent to device")
        setShowUpdateForm(false)
        setUpdateVersion("")
        setUpdateUrl("")
      }
    } catch (error) {
      console.error("Error sending update:", error)
      alert("Failed to send update")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Device Controls</CardTitle>
          <CardDescription>Manage {device.deviceName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {device.status === "active" ? (
              <Button
                onClick={handleDisableDevice}
                disabled={loading}
                className="bg-error hover:bg-red-600 text-background"
              >
                {loading ? "Disabling..." : "Disable Device"}
              </Button>
            ) : (
              <Button
                onClick={handleEnableDevice}
                disabled={loading}
                className="bg-success hover:bg-green-600 text-background"
              >
                {loading ? "Enabling..." : "Enable Device"}
              </Button>
            )}

            <Button
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              variant="outline"
              className="border-border bg-transparent"
            >
              {showUpdateForm ? "Cancel" : "Send Update"}
            </Button>
          </div>

          {showUpdateForm && (
            <div className="space-y-3 pt-4 border-t border-border">
              <div>
                <label className="text-sm font-medium">Version</label>
                <Input
                  placeholder="1.2.0"
                  value={updateVersion}
                  onChange={(e) => setUpdateVersion(e.target.value)}
                  className="mt-1 bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Download URL</label>
                <Input
                  placeholder="https://example.com/app-1.2.0.exe"
                  value={updateUrl}
                  onChange={(e) => setUpdateUrl(e.target.value)}
                  className="mt-1 bg-background border-border"
                />
              </div>
              <Button
                onClick={handleSendUpdate}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-background"
              >
                {loading ? "Sending..." : "Send Update to Device"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm">Device Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Device ID:</span>
            <span className="font-mono text-xs">{device.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Status:</span>
            <Badge className={device.status === "active" ? "bg-success text-background" : "bg-muted text-background"}>
              {device.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Version:</span>
            <span>{device.version || "Unknown"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Created:</span>
            <span>{device.createdAt ? new Date(device.createdAt).toLocaleDateString() : "Unknown"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Last Seen:</span>
            <span>{device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "Never"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
