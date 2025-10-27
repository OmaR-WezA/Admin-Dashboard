"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { ref, onValue, remove, update } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Update {
  id?: string
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    const updatesRef = ref(db, "updates")
    const unsubscribe = onValue(updatesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const updateList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }))
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
      const response = await fetch("/api/devices/publish-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          downloadUrl,
          changelog,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to publish update")
      }

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

  const handleEditUpdate = (update: Update) => {
    setEditingId(update.id || "")
    setVersion(update.version)
    setDownloadUrl(update.downloadUrl)
    setChangelog(update.changelog)
    setShowEditDialog(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId || !version || !downloadUrl) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await update(ref(db, `updates/${editingId}`), {
        version,
        downloadUrl,
        changelog,
      })
      alert("Update edited successfully!")
      setEditingId(null)
      setShowEditDialog(false)
      setVersion("")
      setDownloadUrl("")
      setChangelog("")
    } catch (error) {
      console.error("Error editing update:", error)
      alert("Failed to edit update")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm("Are you sure you want to delete this update?")) return

    try {
      await remove(ref(db, `updates/${updateId}`))
      alert("Update deleted successfully!")
    } catch (error) {
      console.error("Error deleting update:", error)
      alert("Failed to delete update")
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
              {updates.map((update) => (
                <div key={update.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">Version {update.version}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(update.publishedAt).toLocaleString()}</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Latest</Badge>
                  </div>
                  <p className="text-sm text-foreground mb-3">{update.changelog}</p>
                  <div className="flex gap-2">
                    <a
                      href={update.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Download
                    </a>
                    <button onClick={() => handleEditUpdate(update)} className="text-sm text-blue-500 hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUpdate(update.id || "")}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Update</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Version Number</label>
              <Input
                placeholder="1.2.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="mt-1 bg-background border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Download URL</label>
              <Input
                placeholder="https://example.com/app-1.2.0.exe"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="mt-1 bg-background border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Changelog</label>
              <textarea
                placeholder="What's new in this version?"
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                className="mt-1 w-full p-2 bg-background border border-border rounded text-foreground"
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="border-border"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
