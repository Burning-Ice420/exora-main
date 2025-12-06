"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, AlertCircle } from "lucide-react"

export default function ActivityForm({ activity, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    time: "00:00",
    status: "published",
    cost: {
      estimated: 0,
      currency: "USD",
      perPerson: false
    },
    location: {
      name: "",
      address: "",
      city: "",
      country: "",
      coordinates: {
        latitude: null,
        longitude: null
      }
    },
    categoryDetails: {
      activity: {
        activityType: "",
        difficulty: "",
        instructor: "",
        equipment: [],
        weatherDependent: false,
        indoor: false
      }
    },
    tags: [],
    details: {
      title: "",
      description: "",
      cost: 0,
      location: "",
      duration: "",
      activityType: "",
      difficulty: ""
    }
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [tagsInput, setTagsInput] = useState("")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const adminToken = localStorage.getItem('adminToken')

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || "",
        destination: activity.destination || "",
        description: activity.description || "",
        date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: activity.time || "00:00",
        status: activity.status || "published",
        cost: activity.cost || { estimated: 0, currency: "USD", perPerson: false },
        location: activity.location || { name: "", address: "", city: "", country: "", coordinates: { latitude: null, longitude: null } },
        categoryDetails: activity.categoryDetails || {
          activity: {
            activityType: "",
            difficulty: "",
            instructor: "",
            equipment: [],
            weatherDependent: false,
            indoor: false
          }
        },
        tags: activity.tags || [],
        details: activity.details || {
          title: activity.title || "",
          description: "",
          cost: activity.cost?.estimated || 0,
          location: "",
          duration: "",
          activityType: "",
          difficulty: ""
        }
      })
      setTagsInput(activity.tags?.join(", ") || "")
    }
  }, [activity])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Process tags
      const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t)

      // Prepare data
      const submitData = {
        ...formData,
        tags,
        details: {
          ...formData.details,
          title: formData.title,
          description: formData.description,
          cost: formData.cost.estimated
        }
      }

      const url = activity
        ? `${API_BASE_URL}/api/admin/activities/${activity._id}`
        : `${API_BASE_URL}/api/admin/activities`

      const response = await fetch(url, {
        method: activity ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.message || 'Failed to save activity')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{activity ? 'Edit Activity' : 'Add New Activity'}</CardTitle>
            <CardDescription>Fill in the details for the activity</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost (USD)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost.estimated}
                  onChange={(e) => setFormData({
                    ...formData,
                    cost: { ...formData.cost, estimated: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type</Label>
                <Input
                  id="activityType"
                  value={formData.categoryDetails?.activity?.activityType || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    categoryDetails: {
                      ...formData.categoryDetails,
                      activity: {
                        ...formData.categoryDetails?.activity,
                        activityType: e.target.value
                      }
                    }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={formData.categoryDetails?.activity?.difficulty || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    categoryDetails: {
                      ...formData.categoryDetails,
                      activity: {
                        ...formData.categoryDetails?.activity,
                        difficulty: e.target.value
                      }
                    }
                  })}
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Challenging">Challenging</option>
                  <option value="Extreme">Extreme</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2 hours"
                  value={formData.details.duration || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    details: { ...formData.details, duration: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., adventure, outdoor, family-friendly"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : activity ? 'Update Activity' : 'Create Activity'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

