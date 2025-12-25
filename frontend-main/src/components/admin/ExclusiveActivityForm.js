"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, AlertCircle, Plus, Trash2, Star } from "lucide-react"

const CATEGORY_OPTIONS = [
  "Adventure",
  "Food",
  "Culture",
  "Wellness",
  "Entertainment",
  "Nature",
  "Sports",
]

const STATUS_OPTIONS = ["active", "upcoming", "sold_out", "cancelled"]

function splitList(value) {
  return value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean)
}

function joinList(arr) {
  return Array.isArray(arr) ? arr.join("\n") : ""
}

export default function ExclusiveActivityForm({ activity, onClose, onSuccess }) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null

  const initial = useMemo(() => {
    const dateIso = activity?.date ? new Date(activity.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
    return {
      name: activity?.name || "",
      slug: activity?.slug || "",
      description: activity?.description || "",
      longDescription: activity?.longDescription || "",
      category: activity?.category || "Adventure",
      status: activity?.status || "active",
      featured: Boolean(activity?.featured),

      price: activity?.price ?? 0,
      originalPrice: activity?.originalPrice ?? "",
      date: dateIso,
      time: activity?.time || "19:00",
      duration: activity?.duration || "2 hours",

      capacity: activity?.capacity ?? "",
      booked: activity?.booked ?? 0,

      location: {
        name: activity?.location?.name || "",
        address: activity?.location?.address || "",
        city: activity?.location?.city || "",
        state: activity?.location?.state || "",
        coordinates: {
          lat: activity?.location?.coordinates?.lat ?? "",
          lng: activity?.location?.coordinates?.lng ?? "",
        },
      },

      host: {
        name: activity?.host?.name || "",
        bio: activity?.host?.bio || "",
        image: activity?.host?.image || "",
      },

      tagsText: joinList(activity?.tags),
      highlightsText: joinList(activity?.highlights),
      includesText: joinList(activity?.includes),
      excludesText: joinList(activity?.excludes),

      requirements: {
        minAge: activity?.requirements?.minAge ?? "",
        maxAge: activity?.requirements?.maxAge ?? "",
        physicalFitness: activity?.requirements?.physicalFitness || "",
        specialRequirementsText: joinList(activity?.requirements?.specialRequirements),
      },

      images: Array.isArray(activity?.images) && activity.images.length > 0
        ? activity.images.map((img) => ({
            url: img?.url || "",
            alt: img?.alt || "",
            order: img?.order ?? 0,
          }))
        : [{ url: "", alt: "", order: 0 }],
    }
  }, [activity])

  const [form, setForm] = useState(initial)

  useEffect(() => setForm(initial), [initial])

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }))
  const setNested = (path, value) => {
    setForm((p) => {
      const next = structuredClone ? structuredClone(p) : JSON.parse(JSON.stringify(p))
      let cur = next
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]]
      cur[path[path.length - 1]] = value
      return next
    })
  }

  const addImageRow = () => setField("images", [...form.images, { url: "", alt: "", order: form.images.length }])
  const removeImageRow = (idx) => setField("images", form.images.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = {
        name: form.name.trim(),
        ...(form.slug.trim() ? { slug: form.slug.trim().toLowerCase() } : {}),
        description: form.description.trim(),
        longDescription: form.longDescription.trim(),
        category: form.category,
        status: form.status,
        featured: Boolean(form.featured),

        price: Number(form.price) || 0,
        originalPrice: form.originalPrice === "" ? null : Number(form.originalPrice),
        date: new Date(`${form.date}T00:00:00.000Z`),
        time: form.time,
        duration: form.duration,

        capacity: form.capacity === "" ? null : Number(form.capacity),
        // booked is managed by purchases; keep as-is only if editing
        ...(activity?.booked !== undefined ? { booked: Number(form.booked) || 0 } : {}),

        location: {
          name: form.location.name,
          address: form.location.address,
          city: form.location.city,
          state: form.location.state,
          coordinates: {
            lat: form.location.coordinates.lat === "" ? undefined : Number(form.location.coordinates.lat),
            lng: form.location.coordinates.lng === "" ? undefined : Number(form.location.coordinates.lng),
          },
        },

        host: {
          name: form.host.name,
          bio: form.host.bio,
          image: form.host.image,
        },

        tags: splitList(form.tagsText),
        highlights: splitList(form.highlightsText),
        includes: splitList(form.includesText),
        excludes: splitList(form.excludesText),

        requirements: {
          minAge: form.requirements.minAge === "" ? undefined : Number(form.requirements.minAge),
          maxAge: form.requirements.maxAge === "" ? undefined : Number(form.requirements.maxAge),
          physicalFitness: form.requirements.physicalFitness || undefined,
          specialRequirements: splitList(form.requirements.specialRequirementsText),
        },

        images: (form.images || [])
          .map((img, idx) => ({
            url: (img.url || "").trim(),
            alt: (img.alt || "").trim(),
            order: Number(img.order ?? idx),
          }))
          .filter((img) => Boolean(img.url)),
      }

      const url = activity
        ? `${API_BASE_URL}/api/admin/exclusive-activities/${activity._id}`
        : `${API_BASE_URL}/api/admin/exclusive-activities`

      const response = await fetch(url, {
        method: activity ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        onSuccess?.(data.activity)
      } else {
        setError(data.message || "Failed to save activity")
      }
    } catch (err) {
      setError(err?.message || "Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              {activity ? "Edit Exclusive Activity" : "Add Exclusive Activity"}
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Star className="h-3.5 w-3.5" />
                Exclusives by Exora
              </span>
            </CardTitle>
            <CardDescription>These activities power `/activities` and `/activity/[slug]`.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input
                  id="slug"
                  placeholder="auto-generated if empty"
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Featured</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setField("featured", e.target.checked)}
                  />
                  Show as featured
                </label>
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <textarea
                id="description"
                className="w-full min-h-[90px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Used in cards and hero.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <textarea
                id="longDescription"
                className="w-full min-h-[140px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={form.longDescription}
                onChange={(e) => setField("longDescription", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Used on the activity detail page.</p>
            </div>

            {/* Schedule & Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (INR) *</Label>
                <Input id="price" type="number" value={form.price} onChange={(e) => setField("price", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={form.originalPrice}
                  onChange={(e) => setField("originalPrice", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input id="time" type="time" value={form.time} onChange={(e) => setField("time", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" value={form.duration} onChange={(e) => setField("duration", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" value={form.capacity} onChange={(e) => setField("capacity", e.target.value)} />
              </div>
              {activity && (
                <div className="space-y-2">
                  <Label htmlFor="booked">Booked</Label>
                  <Input id="booked" type="number" value={form.booked} onChange={(e) => setField("booked", e.target.value)} />
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">Location</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Venue name</Label>
                  <Input value={form.location.name} onChange={(e) => setNested(["location", "name"], e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={form.location.address} onChange={(e) => setNested(["location", "address"], e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>City</Label>
                  <Input value={form.location.city} onChange={(e) => setNested(["location", "city"], e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>State</Label>
                  <Input value={form.location.state} onChange={(e) => setNested(["location", "state"], e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    value={form.location.coordinates.lat}
                    onChange={(e) => setNested(["location", "coordinates", "lat"], e.target.value)}
                    placeholder="e.g. 28.6139"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    value={form.location.coordinates.lng}
                    onChange={(e) => setNested(["location", "coordinates", "lng"], e.target.value)}
                    placeholder="e.g. 77.2090"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Images</div>
                <Button type="button" variant="outline" size="sm" onClick={addImageRow}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add image
                </Button>
              </div>
              <div className="space-y-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="space-y-2 md:col-span-7">
                      <Label>Image URL</Label>
                      <Input
                        value={img.url}
                        onChange={(e) => {
                          const next = [...form.images]
                          next[idx] = { ...next[idx], url: e.target.value }
                          setField("images", next)
                        }}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-4">
                      <Label>Alt text</Label>
                      <Input
                        value={img.alt}
                        onChange={(e) => {
                          const next = [...form.images]
                          next[idx] = { ...next[idx], alt: e.target.value }
                          setField("images", next)
                        }}
                        placeholder="Describe the image"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImageRow(idx)}
                        disabled={form.images.length === 1}
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Paste image URLs (CDN/Cloudinary/S3). File uploads can be added later if you want.
              </p>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tags (one per line)</Label>
                <textarea
                  className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={form.tagsText}
                  onChange={(e) => setField("tagsText", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Highlights (one per line)</Label>
                <textarea
                  className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={form.highlightsText}
                  onChange={(e) => setField("highlightsText", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Includes (one per line)</Label>
                <textarea
                  className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={form.includesText}
                  onChange={(e) => setField("includesText", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Excludes (one per line)</Label>
                <textarea
                  className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={form.excludesText}
                  onChange={(e) => setField("excludesText", e.target.value)}
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">Requirements</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Min age</Label>
                  <Input
                    type="number"
                    value={form.requirements.minAge}
                    onChange={(e) => setNested(["requirements", "minAge"], e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max age</Label>
                  <Input
                    type="number"
                    value={form.requirements.maxAge}
                    onChange={(e) => setNested(["requirements", "maxAge"], e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Physical fitness</Label>
                  <Input
                    value={form.requirements.physicalFitness}
                    onChange={(e) => setNested(["requirements", "physicalFitness"], e.target.value)}
                    placeholder="e.g., Moderate"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Special requirements (one per line)</Label>
                <textarea
                  className="w-full min-h-[110px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={form.requirements.specialRequirementsText}
                  onChange={(e) => setNested(["requirements", "specialRequirementsText"], e.target.value)}
                />
              </div>
            </div>

            {/* Host */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">Host</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Host name</Label>
                  <Input value={form.host.name} onChange={(e) => setNested(["host", "name"], e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Host image URL</Label>
                  <Input value={form.host.image} onChange={(e) => setNested(["host", "image"], e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Host bio</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={form.host.bio}
                  onChange={(e) => setNested(["host", "bio"], e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : activity ? "Update Exclusive Activity" : "Create Exclusive Activity"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


