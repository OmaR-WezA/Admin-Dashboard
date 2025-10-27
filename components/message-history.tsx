"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function MessageHistory({ device }: { device: any }) {
    const [showHistory, setShowHistory] = useState(false)
    const history = device.messageHistory || []

    const totalStats = history.reduce(
        (acc, session) => ({
            totalSent: acc.totalSent + (session.total_sent || 0),
            totalFailed: acc.totalFailed + (session.total_failed || 0),
        }),
        { totalSent: 0, totalFailed: 0 },
    )

    const overallSuccessRate =
        totalStats.totalSent + totalStats.totalFailed > 0
            ? ((totalStats.totalSent / (totalStats.totalSent + totalStats.totalFailed)) * 100).toFixed(1)
            : 0

    return (
        <>
            <Button onClick={() => setShowHistory(true)} variant="outline" className="border-border">
                📋 Message History
            </Button>

            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Message History - {device.deviceName}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {history.length > 0 && (
                            <Card className="bg-background border-border border-2 border-primary">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm text-foreground">📊 Overall Statistics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Total Sent</p>
                                            <p className="font-semibold text-primary text-lg">{totalStats.totalSent}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Total Failed</p>
                                            <p className="font-semibold text-destructive text-lg">{totalStats.totalFailed}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Success Rate</p>
                                            <p className="font-semibold text-accent text-lg">{overallSuccessRate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Sessions</p>
                                            <p className="font-semibold text-primary text-lg">{history.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {history.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No message history available</p>
                        ) : (
                            history.map((session: any, idx: number) => (
                                <Card key={idx} className="bg-background border-border">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm text-foreground">
                                            Session {history.length - idx} - {new Date(session.timestamp).toLocaleString()}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Sent</p>
                                                <p className="font-semibold text-primary">{session.total_sent}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Failed</p>
                                                <p className="font-semibold text-destructive">{session.total_failed}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Success Rate</p>
                                                <p className="font-semibold text-accent">{session.success_rate?.toFixed(1)}%</p>
                                            </div>
                                        </div>

                                        {session.messages && session.messages.length > 0 && (
                                            <div className="mt-4 border-t border-border pt-4">
                                                <p className="text-xs font-semibold text-muted-foreground mb-2">Messages:</p>
                                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                                    {session.messages.map((msg: any, msgIdx: number) => (
                                                        <div
                                                            key={msgIdx}
                                                            className="text-xs text-muted-foreground font-mono bg-background p-2 rounded border border-border"
                                                        >
                                                            <span className={msg.status === "success" ? "text-accent" : "text-destructive"}>
                                                                {msg.status === "success" ? "✅" : "❌"}
                                                            </span>{" "}
                                                            {msg.phone} - {msg.message}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
