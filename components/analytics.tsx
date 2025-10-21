"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

export function Analytics({ devices }: { devices: any[] }) {
  const deviceData = devices.map((device) => ({
    name: device.deviceName || "Unknown",
    sent: device.totalMessages || 0,
    failed: device.failedMessages || 0,
  }))

  const successRate = devices.map((device) => {
    const total = (device.totalMessages || 0) + (device.failedMessages || 0)
    const rate = total > 0 ? ((device.totalMessages || 0) / total) * 100 : 0
    return {
      name: device.deviceName || "Unknown",
      rate: Math.round(rate),
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Messages by Device</CardTitle>
            <CardDescription className="text-muted-foreground">Sent vs Failed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <Legend />
                <Bar dataKey="sent" fill="var(--chart-4)" />
                <Bar dataKey="failed" fill="var(--chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Success Rate</CardTitle>
            <CardDescription className="text-muted-foreground">Percentage of successful messages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={successRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <Line type="monotone" dataKey="rate" stroke="var(--chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 text-muted-foreground">Device</th>
                  <th className="text-right py-2 px-4 text-muted-foreground">Sent</th>
                  <th className="text-right py-2 px-4 text-muted-foreground">Failed</th>
                  <th className="text-right py-2 px-4 text-muted-foreground">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => {
                  const total = (device.totalMessages || 0) + (device.failedMessages || 0)
                  const rate = total > 0 ? ((device.totalMessages || 0) / total) * 100 : 0
                  return (
                    <tr key={device.id} className="border-b border-border hover:bg-background">
                      <td className="py-3 px-4 text-foreground">{device.deviceName || "Unknown"}</td>
                      <td className="text-right py-3 px-4 text-accent">{device.totalMessages || 0}</td>
                      <td className="text-right py-3 px-4 text-destructive">{device.failedMessages || 0}</td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={rate > 80 ? "text-accent" : rate > 50 ? "text-yellow-500" : "text-destructive"}
                        >
                          {Math.round(rate)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
