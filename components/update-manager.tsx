"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { ref, set, onValue } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Update {
  version: string
  downloadUrl: string
  changelog: string
  publishedAt: string
}

export function UpdateManager() {
  const [version, setVersion] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [changelog, setChangelog] = useState("")
  const [loading, setLoading] = useState(false)
  const [updates, setUpdates] = useState<Update[]>([])

  useEffect(() => {
    const updatesRef = ref(db, "updates")
    const unsubscribe = onValue(updatesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const updateList = Array.isArray(data) ? data : Object.values(data)
        setUpdates(updateList as Update[])
      }
    })

    return () => unsubscribe()
  }, [])

  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!version || !downloadUrl) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const updateRef = ref(db, `updates/${Date.now()}`)
      await set(updateRef, {
        version,
        downloadUrl,
        changelog,
        publishedAt: new Date().toISOString(),
      })

      // Also set as latest update for quick access
      await set(ref(db, "latestUpdate"), {
        version,
        downloadUrl,
        changelog,
        publishedAt: new Date().toISOString(),
      })

      alert("Update published successfully!")
      setVersion("")
      setDownloadUrl("")
      setChangelog("")
    } catch (error) {
      console.error("Error publishing update:", error)
      alert("Failed to publish update")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Publish New Update</CardTitle>
          <CardDescription className="text-muted-foreground">
            Distribute new versions to all connected devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePublishUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Version Number</label>
              <Input
                placeholder="1.2.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Download URL</label>
              <Input
                placeholder="https://example.com/app-1.2.0.exe"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Changelog</label>
              <textarea
                placeholder="What's new in this version?"
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                className="mt-1 w-full p-2 bg-background border border-border rounded text-foreground placeholder:text-muted-foreground"
                rows={4}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary text-primary-foreground"
            >
              {loading ? "Publishing..." : "Publish Update"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Update History</CardTitle>
          <CardDescription className="text-muted-foreground">All published versions</CardDescription>
        </CardHeader>
        <CardContent>
          {updates.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No updates published yet</div>
          ) : (
            <div className="space-y-4">
              {updates.map((update, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">Version {update.version}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(update.publishedAt).toLocaleString()}</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Latest</Badge>
                  </div>
                  <p className="text-sm text-foreground mb-2">{update.changelog}</p>
                  <a
                    href={update.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
