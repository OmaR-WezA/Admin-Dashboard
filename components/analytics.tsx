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
  // Prepare data for charts
  const deviceData = devices.map((device) => ({
    name: device.deviceName,
    sent: device.messagesSent || 0,
    failed: device.messagesFailed || 0,
  }))

  const successRate = devices.map((device) => {
    const total = (device.messagesSent || 0) + (device.messagesFailed || 0)
    const rate = total > 0 ? ((device.messagesSent || 0) / total) * 100 : 0
    return {
      name: device.deviceName,
      rate: Math.round(rate),
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Messages by Device</CardTitle>
            <CardDescription>Sent vs Failed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#666666" />
                <YAxis stroke="#666666" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }} />
                <Legend />
                <Bar dataKey="sent" fill="#10b981" />
                <Bar dataKey="failed" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
            <CardDescription>Percentage of successful messages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={successRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#666666" />
                <YAxis stroke="#666666" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }} />
                <Line type="monotone" dataKey="rate" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 text-muted">Device</th>
                  <th className="text-right py-2 px-4 text-muted">Sent</th>
                  <th className="text-right py-2 px-4 text-muted">Failed</th>
                  <th className="text-right py-2 px-4 text-muted">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => {
                  const total = (device.messagesSent || 0) + (device.messagesFailed || 0)
                  const rate = total > 0 ? ((device.messagesSent || 0) / total) * 100 : 0
                  return (
                    <tr key={device.id} className="border-b border-border hover:bg-background">
                      <td className="py-3 px-4">{device.deviceName}</td>
                      <td className="text-right py-3 px-4 text-success">{device.messagesSent || 0}</td>
                      <td className="text-right py-3 px-4 text-error">{device.messagesFailed || 0}</td>
                      <td className="text-right py-3 px-4">
                        <span className={rate > 80 ? "text-success" : rate > 50 ? "text-warning" : "text-error"}>
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
