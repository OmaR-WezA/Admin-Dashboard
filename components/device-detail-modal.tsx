"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeviceControls } from "./device-controls"

interface DeviceDetailModalProps {
  device: any
  onClose: () => void
  onRefresh: () => void
}

export function DeviceDetailModal({ device, onClose, onRefresh }: DeviceDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{device.deviceName}</CardTitle>
            <CardDescription>Device Management</CardDescription>
          </div>
          <Button onClick={onClose} variant="outline" className="border-border bg-transparent">
            Close
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <DeviceControls device={device} onRefresh={onRefresh} />

          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle className="text-sm">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted">Total Messages</p>
                <p className="text-2xl font-bold text-primary">{device.totalMessages || 0}</p>
              </div>
              <div>
                <p className="text-muted">Failed Messages</p>
                <p className="text-2xl font-bold text-error">{device.failedMessages || 0}</p>
              </div>
              <div>
                <p className="text-muted">Success Rate</p>
                <p className="text-2xl font-bold text-success">
                  {device.totalMessages
                    ? Math.round(((device.totalMessages - device.failedMessages) / device.totalMessages) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-muted">Uptime</p>
                <p className="text-sm">
                  {device.createdAt ? new Date(device.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
